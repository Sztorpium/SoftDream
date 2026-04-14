package hu.softdream.config;

import hu.softdream.entity.*;
import hu.softdream.entity.enums.BookingStatus;
import hu.softdream.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Idempotent database seeder that runs on every application startup.
 * Inserts reference data (roles, room statuses, room types, rooms) and the
 * demo authentication accounts only when needed, making it safe for both
 * fresh deployments and repeated restarts.
 *
 * <p>Configure the admin password via the {@code ADMIN_PASSWORD} environment variable.
 * The default value is only for local development and <strong>must be changed</strong>
 * before deploying to any non-development environment.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializerService implements ApplicationRunner {

    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    private final RoleRepository roleRepository;
    private final RoomStatusRepository roomStatusRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    /** Admin password for the seeded admin account. Set ADMIN_PASSWORD env var in production. */
    @Value("${ADMIN_PASSWORD:" + DEFAULT_ADMIN_PASSWORD + "}")
    private String adminPassword;

    /** Mail username – empty means mail is disabled/unconfigured. */
    @Value("${MAIL_USERNAME:}")
    private String mailUsername;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        warnIfDefaultAdminPassword();
        warnIfMailUnconfigured();
        initRoles();
        initRoomStatuses();
        initRoomTypes();
        initRooms();
        initAdminUser();
        initDemoUsers();
        initDemoReviews();
        initDemoBookings();
    }

    private void warnIfDefaultAdminPassword() {
        if (DEFAULT_ADMIN_PASSWORD.equals(adminPassword)) {
            log.warn("*** SECURITY WARNING: Admin password is set to the default value '{}'. " +
                            "Set the ADMIN_PASSWORD environment variable before deploying to production! ***",
                    DEFAULT_ADMIN_PASSWORD);
        }
    }

    private void warnIfMailUnconfigured() {
        if (mailUsername == null || mailUsername.isBlank()) {
            log.warn("Mail credentials not configured (MAIL_USERNAME is empty). " +
                    "Email features will not work. Set MAIL_USERNAME and MAIL_PASSWORD env vars to enable mail.");
        }
    }

    private void initRoles() {
        if (roleRepository.count() > 0) {
            return;
        }
        log.info("Seeding roles...");
        roleRepository.saveAll(List.of(
                Role.builder().name("ADMIN").description("Rendszer adminisztrátor - teljes hozzáférés").build(),
                Role.builder().name("USER").description("Normál felhasználó - szobafoglalás és értékelés").build()
        ));
    }

    private void initRoomStatuses() {
        if (roomStatusRepository.count() > 0) {
            return;
        }
        log.info("Seeding room statuses...");
        roomStatusRepository.saveAll(List.of(
                RoomStatus.builder().name("AVAILABLE").description("Szoba elérhető a foglaláshoz").build(),
                RoomStatus.builder().name("BOOKED").description("Szoba már foglalt").build(),
                RoomStatus.builder().name("MAINTENANCE").description("Szoba karbantartás alatt").build()
        ));
    }

    private void initRoomTypes() {
        if (roomTypeRepository.count() > 0) {
            return;
        }
        log.info("Seeding room types...");
        roomTypeRepository.saveAll(List.of(
                RoomType.builder().name("SINGLE").basePrice(new BigDecimal("45.00")).description("Egyágyas szoba - 1 fő").build(),
                RoomType.builder().name("DOUBLE").basePrice(new BigDecimal("65.00")).description("Dupla szoba - 2 fő").build(),
                RoomType.builder().name("TRIPLE").basePrice(new BigDecimal("85.00")).description("Hármas szoba - 3 fő").build(),
                RoomType.builder().name("SUITE").basePrice(new BigDecimal("150.00")).description("Luxus szobakomplexum - 4 fő").build(),
                RoomType.builder().name("PENTHOUSE").basePrice(new BigDecimal("250.00")).description("Tetőtéri deluxe szoba - 2 fő").build()
        ));
    }

    private void initRooms() {
        if (roomRepository.count() > 0) {
            return;
        }
        log.info("Seeding rooms...");

        RoomStatus available = roomStatusRepository.findByName("AVAILABLE").orElseThrow();
        RoomStatus booked = roomStatusRepository.findByName("BOOKED").orElseThrow();
        RoomType single = roomTypeRepository.findByName("SINGLE").orElseThrow();
        RoomType dbl = roomTypeRepository.findByName("DOUBLE").orElseThrow();
        RoomType triple = roomTypeRepository.findByName("TRIPLE").orElseThrow();
        RoomType suite = roomTypeRepository.findByName("SUITE").orElseThrow();
        RoomType penthouse = roomTypeRepository.findByName("PENTHOUSE").orElseThrow();

        roomRepository.saveAll(List.of(
                // 1. emelet - SINGLE és DOUBLE
                Room.builder().roomNumber("101").floor(1).roomStatus(available).roomType(single).maxGuests(1).build(),
                Room.builder().roomNumber("102").floor(1).roomStatus(available).roomType(single).maxGuests(1).build(),
                Room.builder().roomNumber("103").floor(1).roomStatus(available).roomType(dbl).maxGuests(2).build(),
                Room.builder().roomNumber("104").floor(1).roomStatus(available).roomType(dbl).maxGuests(2).build(),
                Room.builder().roomNumber("105").floor(1).roomStatus(available).roomType(triple).maxGuests(3).build(),
                // 2. emelet - DOUBLE és TRIPLE
                Room.builder().roomNumber("201").floor(2).roomStatus(available).roomType(dbl).maxGuests(2).build(),
                Room.builder().roomNumber("202").floor(2).roomStatus(available).roomType(dbl).maxGuests(2).build(),
                Room.builder().roomNumber("203").floor(2).roomStatus(available).roomType(triple).maxGuests(3).build(),
                Room.builder().roomNumber("204").floor(2).roomStatus(available).roomType(triple).maxGuests(3).build(),
                Room.builder().roomNumber("205").floor(2).roomStatus(booked).roomType(dbl).maxGuests(2).build(),
                // 3. emelet - SUITE
                Room.builder().roomNumber("301").floor(3).roomStatus(available).roomType(suite).maxGuests(4).build(),
                Room.builder().roomNumber("302").floor(3).roomStatus(available).roomType(suite).maxGuests(4).build(),
                Room.builder().roomNumber("303").floor(3).roomStatus(available).roomType(suite).maxGuests(4).build(),
                // 4. emelet - PENTHOUSE
                Room.builder().roomNumber("401").floor(4).roomStatus(available).roomType(penthouse).maxGuests(2).build(),
                Room.builder().roomNumber("402").floor(4).roomStatus(available).roomType(penthouse).maxGuests(2).build()
        ));
    }

    private void initAdminUser() {
        if (userRepository.existsByUsername("admin_user") || userRepository.existsByEmail("admin@softdream.hu")
                || userRepository.existsByPhone("+36201234567")) {
            return;
        }
        log.info("Seeding admin user...");

        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();

        User adminUser = User.builder()
                .username("admin_user")
                .email("admin@softdream.hu")
                .phone("+36201234567")
                .build();
        userRepository.save(adminUser);

        UserAuth adminAuth = UserAuth.builder()
                .user(adminUser)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(adminRole)
                .build();
        userAuthRepository.save(adminAuth);
    }

    private void initDemoUsers() {
        Role userRole = roleRepository.findByName("USER").orElseThrow();

        seedUser("john_doe", "john.doe@gmail.com", "+36301234567", userRole, "user123");
        seedUser("jane_smith", "jane.smith@gmail.com", "+36302234567", userRole, "user123");
        seedUser("peter_kovacs", "peter.kovacs@gmail.com", "+36303234567", userRole, "user123");
        seedUser("maria_szabo", "maria.szabo@gmail.com", "+36304234567", userRole, "user123");
    }

    private void seedUser(String username, String email, String phone, Role role, String rawPassword) {
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)
                || userRepository.existsByPhone(phone)) {
            return;
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .phone(phone)
                .build();
        userRepository.save(user);

        UserAuth userAuth = UserAuth.builder()
                .user(user)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        userAuthRepository.save(userAuth);
    }

    private void initDemoReviews() {
        seedReview("john_doe", "103", 5, "Fantasztikus szoba! Nagyon tiszta és kényelmes. Az ágyon volt egy fürdőköpeny.");
        seedReview("jane_smith", "105", 4, "Jó szoba, kicsit zsúfolt volt, de az ár érte megfelel.");
        seedReview("peter_kovacs", "101", 5, "Egyágyas szobák ritkán ilyen jók. Nagyobb mint vártam!");
        seedReview("john_doe", "105", 4, "Hármas szoba jó áron. Ajánlom!");
    }

    private void seedReview(String username, String roomNumber, int rating, String comment) {
        User user = userRepository.findByUsername(username).orElse(null);
        Room room = roomRepository.findByRoomNumber(roomNumber).orElse(null);
        if (user == null || room == null) {
            return;
        }
        if (reviewRepository.existsByUser_UserIdAndRoom_RoomId(user.getUserId(), room.getRoomId())) {
            return;
        }

        Review review = Review.builder()
                .user(user)
                .room(room)
                .rating(rating)
                .comment(comment)
                .build();
        reviewRepository.save(review);
    }

    private void initDemoBookings() {
        seedBooking("john_doe", "101", LocalDate.of(2026, 3, 25), LocalDate.of(2026, 3, 26), BookingStatus.PENDING);
        seedBooking("john_doe", "103", LocalDate.of(2026, 4, 4), LocalDate.of(2026, 4, 7), BookingStatus.CONFIRMED);
        // john_doe értékeli a 105-ös szobát → szükséges CONFIRMED foglalás
        seedBooking("john_doe", "105", LocalDate.of(2026, 2, 10), LocalDate.of(2026, 2, 13), BookingStatus.CONFIRMED);
        seedBooking("jane_smith", "105", LocalDate.of(2026, 3, 27), LocalDate.of(2026, 3, 29), BookingStatus.CONFIRMED);
        // peter_kovacs értékeli a 101-es szobát → szükséges CONFIRMED foglalás
        seedBooking("peter_kovacs", "101", LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 3), BookingStatus.CONFIRMED);
        seedBooking("peter_kovacs", "102", LocalDate.of(2026, 4, 2), LocalDate.of(2026, 4, 4), BookingStatus.PENDING);
    }

    private void seedBooking(String username, String roomNumber, LocalDate checkIn, LocalDate checkOut, BookingStatus status) {
        User user = userRepository.findByUsername(username).orElse(null);
        Room room = roomRepository.findByRoomNumber(roomNumber).orElse(null);
        if (user == null || room == null) {
            return;
        }
        if (!bookingRepository.findByUser_UserIdAndRoom_RoomId(user.getUserId(), room.getRoomId()).isEmpty()) {
            return;
        }

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(checkIn)
                .checkOut(checkOut)
                .status(status)
                .build();
        bookingRepository.save(booking);
    }
}