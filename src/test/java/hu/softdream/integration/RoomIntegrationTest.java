package hu.softdream.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import hu.softdream.dto.request.RoomRequest;
import hu.softdream.dto.response.RoomResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integrációs tesztek a szoba-végpontokhoz.
 *
 * <p>A seeded adatok 15 szobát tartalmaznak (101–402).
 * A szobatípusok sorrendben seed-eltek: SINGLE=1, DOUBLE=2, TRIPLE=3, SUITE=4, PENTHOUSE=5.
 * A szobastátuszok: AVAILABLE=1, BOOKED=2, MAINTENANCE=3.
 */
@DisplayName("Room integrációs tesztek")
class RoomIntegrationTest extends AbstractIntegrationTest {

    // ── GET /api/rooms ───────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/rooms – publikus végpont, visszaadja az összes szobát")
    void getAllRooms_returns200WithSeededRooms() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andReturn();

        List<RoomResponse> rooms = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertFalse(rooms.isEmpty(), "Legalább egy szobának lennie kell");
        assertEquals(15, rooms.size(), "A seeded adatokban pontosan 15 szoba van");
    }

    @Test
    @DisplayName("GET /api/rooms?type=SINGLE – csak SINGLE típusú szobák kerülnek vissza")
    void getAllRooms_filterByType_returnsOnlySingleRooms() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/rooms").param("type", "SINGLE"))
                .andExpect(status().isOk())
                .andReturn();

        List<RoomResponse> rooms = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertFalse(rooms.isEmpty(), "SINGLE szobáknak kell lennie");
        assertTrue(rooms.stream().allMatch(r -> "SINGLE".equals(r.getType())),
                "Minden visszaadott szoba SINGLE típusú kell legyen");
        assertEquals(2, rooms.size(), "Pontosan 2 SINGLE szoba van seed-elve (101, 102)");
    }

    @Test
    @DisplayName("GET /api/rooms?maxPrice=30000 – nincs szoba a küszöbár alatt → üres lista")
    void getAllRooms_filterByMaxPrice_returnsEmptyForVeryLowPrice() throws Exception {
        // A legolcsóbb szoba (SINGLE) alapára 35000 Ft, a -10% kedvezménnyel 31 500 Ft.
        // A 30 000 Ft-os felső határ alá egyik szoba sem esik.
        MvcResult result = mockMvc.perform(get("/api/rooms").param("maxPrice", "30000"))
                .andExpect(status().isOk())
                .andReturn();

        List<RoomResponse> rooms = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertTrue(rooms.isEmpty(), "30 000 Ft alatt egyetlen szoba sem lehet");
    }

    @Test
    @DisplayName("GET /api/rooms?maxPrice=60000 – SINGLE és DOUBLE szobák visszaadva, SUITE/PENTHOUSE nem")
    void getAllRooms_filterByMaxPrice_returnsMidRangePriceRooms() throws Exception {
        // SINGLE max ár: 35 000 * 1,15 = 40 250 < 60 000 ✓
        // DOUBLE max ár: 52 000 * 1,15 = 59 800 < 60 000 ✓
        // TRIPLE min ár: 69 000 * 0,90 = 62 100 > 60 000 ✗
        MvcResult result = mockMvc.perform(get("/api/rooms").param("maxPrice", "60000"))
                .andExpect(status().isOk())
                .andReturn();

        List<RoomResponse> rooms = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertFalse(rooms.isEmpty(), "Kell lennie szobának 60 000 Ft alatt");
        assertTrue(rooms.stream().noneMatch(r -> "SUITE".equals(r.getType())),
                "SUITE szoba nem lehet 60 000 Ft alatt");
        assertTrue(rooms.stream().noneMatch(r -> "PENTHOUSE".equals(r.getType())),
                "PENTHOUSE szoba nem lehet 60 000 Ft alatt");
        assertTrue(rooms.stream().noneMatch(r -> "TRIPLE".equals(r.getType())),
                "TRIPLE szoba nem lehet 60 000 Ft alatt");
    }

    // ── GET /api/rooms/{roomId} ──────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/rooms/{id} – létező szoba → 200, szoba adatai visszaadva")
    void getRoomById_existingRoom_returns200() throws Exception {
        Integer roomId = anyRoomId();

        mockMvc.perform(get("/api/rooms/{id}", roomId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(roomId))
                .andExpect(jsonPath("$.roomNumber").isNotEmpty())
                .andExpect(jsonPath("$.type").isNotEmpty())
                .andExpect(jsonPath("$.pricePerNight").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/rooms/{id} – nem létező szoba → 404")
    void getRoomById_nonExistentRoom_returns404() throws Exception {
        mockMvc.perform(get("/api/rooms/{id}", 999_999))
                .andExpect(status().isNotFound());
    }

    // ── GET /api/rooms/available ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/rooms/available – jövőbeli dátumokra elérhető szobák visszaadva")
    void getAvailableRooms_withFutureDates_returns200() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/rooms/available")
                        .param("checkIn", FUTURE_CHECK_IN.toString())
                        .param("checkOut", FUTURE_CHECK_OUT.toString()))
                .andExpect(status().isOk())
                .andReturn();

        List<RoomResponse> rooms = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        // A seeded foglalások mind múlt dátumúak, ezért minden elérhető szoba visszajön
        assertFalse(rooms.isEmpty(), "Jövőbeli dátumokra kell lennie elérhető szobának");
    }

    // ── POST /api/rooms (admin) ──────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/rooms – admin jogosultsággal → 201, új szoba létrehozva")
    void createRoom_asAdmin_returns201() throws Exception {
        String adminTok = adminToken();

        // roomTypeId=1 (SINGLE), roomStatusId=1 (AVAILABLE) – seeded sorrendből determinisztikus
        RoomRequest req = RoomRequest.builder()
                .roomNumber("901")
                .floor(9)
                .roomTypeId(1)
                .roomStatusId(1)
                .maxGuests(1)
                .build();

        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", bearer(adminTok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomNumber").value("901"))
                .andExpect(jsonPath("$.type").value("SINGLE"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    @DisplayName("POST /api/rooms – user jogosultsággal → 403")
    void createRoom_asUser_returns403() throws Exception {
        String userTok = registerAndGetToken("szobauser", "szobauser@softdream.test",
                uniquePhone(), "password123");

        RoomRequest req = RoomRequest.builder()
                .roomNumber("902").floor(9).roomTypeId(1).roomStatusId(1).maxGuests(1)
                .build();

        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", bearer(userTok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/rooms – autentikáció nélkül → 401")
    void createRoom_withoutAuth_returns401() throws Exception {
        RoomRequest req = RoomRequest.builder()
                .roomNumber("903").floor(9).roomTypeId(1).roomStatusId(1).maxGuests(1)
                .build();

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── DELETE /api/rooms/{roomId} (admin) ───────────────────────────────────

    @Test
    @DisplayName("DELETE /api/rooms/{id} – admin jogosultsággal → 204, szoba törölve")
    void deleteRoom_asAdmin_returns204() throws Exception {
        String adminTok = adminToken();

        // Létrehozunk egy teszt szobát, amit majd törölünk
        RoomRequest req = RoomRequest.builder()
                .roomNumber("904").floor(9).roomTypeId(1).roomStatusId(1).maxGuests(1)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", bearer(adminTok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer newRoomId = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), RoomResponse.class).getRoomId();

        // Törlés
        mockMvc.perform(delete("/api/rooms/{id}", newRoomId)
                        .header("Authorization", bearer(adminTok)))
                .andExpect(status().isNoContent());

        // Ellenőrzés: a szoba már nem elérhető
        mockMvc.perform(get("/api/rooms/{id}", newRoomId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/rooms/{id} – user jogosultsággal → 403")
    void deleteRoom_asUser_returns403() throws Exception {
        Integer roomId = anyRoomId();
        String userTok = registerAndGetToken("torlouser", "torlouser@softdream.test",
                uniquePhone(), "password123");

        mockMvc.perform(delete("/api/rooms/{id}", roomId)
                        .header("Authorization", bearer(userTok)))
                .andExpect(status().isForbidden());
    }
}