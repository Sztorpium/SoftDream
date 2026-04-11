package hu.softdream.config;

import hu.softdream.entity.*;
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
import java.util.List;

/**
 * Idempotent database seeder that runs on every application startup.
 * Inserts reference data (roles, room statuses, room types, rooms) and an
 * admin user only when each table is still empty, making it safe for both
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
        if (userRepository.existsByUsername("admin_user") || userRepository.existsByEmail("admin@softdream.hu")) {
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
}
