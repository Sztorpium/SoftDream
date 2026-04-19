package hu.softdream.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import hu.softdream.dto.request.BookingRequest;
import hu.softdream.dto.response.BookingResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integrációs tesztek a foglalás végpontokhoz.
 *
 * <p>Lefedett végpontok:
 * <ul>
 *   <li>POST /api/bookings – foglalás létrehozása</li>
 *   <li>GET  /api/bookings/my-bookings – saját foglalások</li>
 *   <li>GET  /api/bookings/{id} – foglalás lekérése</li>
 *   <li>GET  /api/bookings – összes foglalás (admin)</li>
 *   <li>PATCH /api/bookings/{id}/cancel – lemondás</li>
 *   <li>PATCH /api/bookings/{id}/confirm – megerősítés (admin)</li>
 *   <li>DELETE /api/bookings/{id} – törlés (admin)</li>
 * </ul>
 */
@DisplayName("Booking integrációs tesztek")
class BookingIntegrationTest extends AbstractIntegrationTest {

    // ── POST /api/bookings ───────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/bookings – bejelentkezett user → 201, PENDING státusszal")
    void createBooking_asUser_returns201WithPendingStatus() throws Exception {
        String tok = registerAndGetToken("foglalousr", "foglalousr@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();

        BookingRequest req = BookingRequest.builder()
                .roomId(roomId).checkIn(FUTURE_CHECK_IN).checkOut(FUTURE_CHECK_OUT)
                .build();

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingId").isNotEmpty())
                .andExpect(jsonPath("$.roomId").value(roomId))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.checkIn").value(FUTURE_CHECK_IN.toString()))
                .andExpect(jsonPath("$.checkOut").value(FUTURE_CHECK_OUT.toString()));
    }

    @Test
    @DisplayName("POST /api/bookings – ütköző dátumok (átfedő foglalás) → 400")
    void createBooking_conflictingDates_returns400() throws Exception {
        String tok = registerAndGetToken("utkozesusr", "utkozesusr@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();

        // Első foglalás: +30 .. +33
        createBookingAndGetId(tok, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        // Második foglalás – átfedő: +31 .. +35
        BookingRequest overlap = BookingRequest.builder()
                .roomId(roomId)
                .checkIn(FUTURE_CHECK_IN.plusDays(1))
                .checkOut(FUTURE_CHECK_OUT.plusDays(2))
                .build();

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overlap)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/bookings – kijelentkezés bejelentkezés előtt → 400")
    void createBooking_checkOutBeforeCheckIn_returns400() throws Exception {
        String tok = registerAndGetToken("datumhiba", "datumhiba@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();

        // Mindkét dátum a jövőben van, de checkOut < checkIn
        BookingRequest req = BookingRequest.builder()
                .roomId(roomId)
                .checkIn(LocalDate.now().plusDays(10))
                .checkOut(LocalDate.now().plusDays(5))
                .build();

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/bookings – autentikáció nélkül → 401")
    void createBooking_unauthenticated_returns401() throws Exception {
        BookingRequest req = BookingRequest.builder()
                .roomId(1).checkIn(FUTURE_CHECK_IN).checkOut(FUTURE_CHECK_OUT)
                .build();

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── GET /api/bookings/my-bookings ────────────────────────────────────────

    @Test
    @DisplayName("GET /api/bookings/my-bookings – saját foglalásokat adja vissza")
    void getMyBookings_returns200WithOwnBookings() throws Exception {
        String tok = registerAndGetToken("sajatfoglalo", "sajatfoglalo@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();

        // Létrehozunk egy foglalást
        createBookingAndGetId(tok, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        MvcResult result = mockMvc.perform(get("/api/bookings/my-bookings")
                        .header("Authorization", bearer(tok)))
                .andExpect(status().isOk())
                .andReturn();

        List<BookingResponse> bookings = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertEquals(1, bookings.size(), "Pontosan 1 foglalásnak kell lennie");
        assertEquals(roomId, bookings.get(0).getRoomId());
    }

    // ── GET /api/bookings/{id} ───────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/bookings/{id} – tulajdonos lekéri a saját foglalását → 200")
    void getBookingById_asOwner_returns200() throws Exception {
        String tok = registerAndGetToken("tulajdonos", "tulajdonos@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();
        Integer bookingId = createBookingAndGetId(tok, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        mockMvc.perform(get("/api/bookings/{id}", bookingId)
                        .header("Authorization", bearer(tok)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(bookingId));
    }

    @Test
    @DisplayName("GET /api/bookings/{id} – másik felhasználó próbálja lekérni → 400")
    void getBookingById_asDifferentUser_returns400() throws Exception {
        // A foglalást userA hozza létre
        String tokenA = registerAndGetToken("userA_", "userA_@softdream.test",
                uniquePhone(), "password123");
        // userB más felhasználó
        String tokenB = registerAndGetToken("userB_", "userB_@softdream.test",
                uniquePhone(), "password123");

        Integer roomId = anyRoomId();
        Integer bookingId = createBookingAndGetId(tokenA, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        // userB nem láthatja userA foglalását
        mockMvc.perform(get("/api/bookings/{id}", bookingId)
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/bookings (admin) ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/bookings – admin → 200, oldalazott lista")
    void getAllBookings_asAdmin_returns200WithPage() throws Exception {
        String adminTok = adminToken();

        mockMvc.perform(get("/api/bookings")
                        .header("Authorization", bearer(adminTok)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalPages").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/bookings – user jogosultsággal → 403")
    void getAllBookings_asUser_returns403() throws Exception {
        String tok = registerAndGetToken("listuser", "listuser@softdream.test",
                uniquePhone(), "password123");

        mockMvc.perform(get("/api/bookings")
                        .header("Authorization", bearer(tok)))
                .andExpect(status().isForbidden());
    }

    // ── PATCH /api/bookings/{id}/cancel ──────────────────────────────────────

    @Test
    @DisplayName("PATCH /api/bookings/{id}/cancel – tulajdonos mondja le → 200, CANCELLED státusz")
    void cancelBooking_asOwner_returns200() throws Exception {
        String tok = registerAndGetToken("lemondo", "lemondo@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();
        Integer bookingId = createBookingAndGetId(tok, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        mockMvc.perform(patch("/api/bookings/{id}/cancel", bookingId)
                        .header("Authorization", bearer(tok)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("PATCH /api/bookings/{id}/cancel – másik user próbálja lemondani → 400")
    void cancelBooking_asDifferentUser_returns400() throws Exception {
        String tokenA = registerAndGetToken("lemondoA", "lemondoA@softdream.test",
                uniquePhone(), "password123");
        String tokenB = registerAndGetToken("lemondoB", "lemondoB@softdream.test",
                uniquePhone(), "password123");

        Integer roomId = anyRoomId();
        Integer bookingId = createBookingAndGetId(tokenA, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        // userB nem mondhatja le userA foglalását
        mockMvc.perform(patch("/api/bookings/{id}/cancel", bookingId)
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isBadRequest());
    }

    // ── PATCH /api/bookings/{id}/confirm (admin) ──────────────────────────────

    @Test
    @DisplayName("PATCH /api/bookings/{id}/confirm – admin megerősíti → 200, CONFIRMED státusz")
    void confirmBooking_asAdmin_returns200WithConfirmedStatus() throws Exception {
        String userTok = registerAndGetToken("megerositendo", "megerositendo@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();
        Integer bookingId = createBookingAndGetId(userTok, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        String adminTok = adminToken();
        mockMvc.perform(patch("/api/bookings/{id}/confirm", bookingId)
                        .header("Authorization", bearer(adminTok)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    // ── DELETE /api/bookings/{id} (admin) ─────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/bookings/{id} – admin törli → 204, foglalás eltűnik")
    void deleteBooking_asAdmin_returns204() throws Exception {
        String userTok = registerAndGetToken("torlendobooking", "torlendobooking@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();
        Integer bookingId = createBookingAndGetId(userTok, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);

        String adminTok = adminToken();
        mockMvc.perform(delete("/api/bookings/{id}", bookingId)
                        .header("Authorization", bearer(adminTok)))
                .andExpect(status().isNoContent());

        // A foglalás már nem érhető el
        mockMvc.perform(get("/api/bookings/{id}", bookingId)
                        .header("Authorization", bearer(adminTok)))
                .andExpect(status().isNotFound());
    }
}