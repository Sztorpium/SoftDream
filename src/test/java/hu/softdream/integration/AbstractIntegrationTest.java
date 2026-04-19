package hu.softdream.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.softdream.dto.request.BookingRequest;
import hu.softdream.dto.request.LoginRequest;
import hu.softdream.dto.request.RegisterRequest;
import hu.softdream.dto.response.AuthResponse;
import hu.softdream.dto.response.BookingResponse;
import hu.softdream.dto.response.RoomResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Alap osztály az integrációs tesztekhez.
 *
 * <p>A "dev" profil H2 memória-adatbázist és Hibernate create-drop sémát aktivál.
 * Az "integration" profil levelezési adatokat biztosít a property-stub-okhoz.
 * A {@link Transactional} annotáció gondoskodik arról, hogy minden tesztmetódus
 * saját tranzakcióban fusson, amely a teszt végén visszagörget (rollback),
 * így a tesztadatok nem szivárognak át egymás között.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles({"dev", "integration"})
@Transactional
abstract class AbstractIntegrationTest {

    /** A seeded adminisztrátor felhasználóneve (DataInitializerService). */
    protected static final String ADMIN_USERNAME = "admin_user";

    /** A seeded adminisztrátor jelszava (DataInitializerService). */
    protected static final String ADMIN_PASSWORD = "admin123";

    /** Jövőbeli foglalás bejelentkezési dátuma (30 nap múlva). */
    protected static final LocalDate FUTURE_CHECK_IN = LocalDate.now().plusDays(30);

    /** Jövőbeli foglalás kijelentkezési dátuma (33 nap múlva). */
    protected static final LocalDate FUTURE_CHECK_OUT = LocalDate.now().plusDays(33);

    /** Telefonszám-számláló az egyedi telefonszámok generálásához. */
    private static final AtomicLong PHONE_SEQ = new AtomicLong(10_000_001L);

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * A JavaMailSender mock-ja megakadályozza a tényleges e-mail küldést.
     * A confirmBooking és egyéb @Async email-hívások csendben futnak le.
     */
    @MockBean
    protected JavaMailSender javaMailSender;

    // ── Segédmetódusok ───────────────────────────────────────────────────────

    /**
     * Egyedi telefonszámot generál, amely megfelel a {@code ^\\+?[0-9]{10,15}$} mintának.
     * Számlálón alapul, így teszten belüli egyszeri felhasználáskor is egyedi marad.
     */
    protected static String uniquePhone() {
        return "+3630" + String.format("%08d", PHONE_SEQ.getAndIncrement() % 100_000_000L);
    }

    /**
     * Regisztrál egy új felhasználót és visszaadja a JWT tokenjét.
     *
     * @param username a kívánt felhasználónév
     * @param email    a kívánt e-mail cím
     * @param phone    érvényes telefonszám ({@link #uniquePhone()} segítségével)
     * @param password jelszó (legalább 6 karakter)
     * @return a regisztrált felhasználó JWT tokenje
     */
    protected String registerAndGetToken(String username, String email,
                                         String phone, String password) throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .username(username).email(email).phone(phone).password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class).getToken();
    }

    /**
     * Bejelentkeztet egy felhasználót és visszaadja a JWT tokenjét.
     *
     * @param username felhasználónév
     * @param password jelszó
     * @return a felhasználó JWT tokenje
     */
    protected String login(String username, String password) throws Exception {
        LoginRequest req = LoginRequest.builder().username(username).password(password).build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class).getToken();
    }

    /**
     * A seeded adminisztrátor JWT tokenjét adja vissza.
     */
    protected String adminToken() throws Exception {
        return login(ADMIN_USERNAME, ADMIN_PASSWORD);
    }

    /**
     * Bearer Authorization header értékét állítja össze a tokenből.
     *
     * @param token JWT token
     * @return "Bearer &lt;token&gt;" formátumú szöveg
     */
    protected String bearer(String token) {
        return "Bearer " + token;
    }

    /**
     * Az első elérhető szoba azonosítóját adja vissza a publikus API-n keresztül.
     */
    protected Integer anyRoomId() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andReturn();

        List<RoomResponse> rooms = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});
        return rooms.get(0).getRoomId();
    }

    /**
     * Létrehoz egy foglalást egy felhasználó nevében és visszaadja a foglalás azonosítóját.
     *
     * @param userToken   a foglaló felhasználó JWT tokenje
     * @param roomId      a szoba azonosítója
     * @param checkIn     bejelentkezés dátuma
     * @param checkOut    kijelentkezés dátuma
     * @return az elkészült foglalás azonosítója
     */
    protected Integer createBookingAndGetId(String userToken, Integer roomId,
                                            LocalDate checkIn, LocalDate checkOut) throws Exception {
        BookingRequest req = BookingRequest.builder()
                .roomId(roomId).checkIn(checkIn).checkOut(checkOut)
                .build();

        MvcResult result = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(userToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readValue(
                result.getResponse().getContentAsString(), BookingResponse.class).getBookingId();
    }

    /**
     * Az adminisztrátor megerősít egy foglalást.
     *
     * @param bookingId a megerősítendő foglalás azonosítója
     */
    protected void adminConfirmBooking(Integer bookingId) throws Exception {
        String adminTok = adminToken();
        mockMvc.perform(patch("/api/bookings/{id}/confirm", bookingId)
                        .header("Authorization", bearer(adminTok)))
                .andExpect(status().isOk());
    }
}