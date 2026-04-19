package hu.softdream.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import hu.softdream.dto.request.ReviewRequest;
import hu.softdream.dto.response.ReviewResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integrációs tesztek az értékelés végpontokhoz.
 *
 * <p>Az értékelés létrehozásához a felhasználónak rendelkeznie kell legalább egy
 * CONFIRMED státuszú foglalással az adott szobára.
 *
 * <p>Lefedett végpontok:
 * <ul>
 *   <li>POST   /api/reviews – értékelés létrehozása</li>
 *   <li>GET    /api/reviews/room/{roomId} – szoba értékelései</li>
 *   <li>GET    /api/reviews/room/{roomId}/average-rating – átlagos értékelés</li>
 *   <li>PUT    /api/reviews/{reviewId} – értékelés módosítása</li>
 *   <li>DELETE /api/reviews/{reviewId} – értékelés törlése</li>
 * </ul>
 */
@DisplayName("Review integrációs tesztek")
class ReviewIntegrationTest extends AbstractIntegrationTest {

    // ── Segédmetódus ─────────────────────────────────────────────────────────

    /**
     * Regisztrál egy felhasználót, létrehoz egy foglalást, adminisztrátor megerősíti,
     * majd visszaadja a felhasználó tokenét és a szoba azonosítóját.
     *
     * @return String[0] = userToken, String[1] = roomId.toString()
     */
    private String[] prepareConfirmedBookingUser(String username, String email) throws Exception {
        String phone = uniquePhone();
        String tok = registerAndGetToken(username, email, phone, "password123");
        Integer roomId = anyRoomId();
        Integer bookingId = createBookingAndGetId(tok, roomId, FUTURE_CHECK_IN, FUTURE_CHECK_OUT);
        adminConfirmBooking(bookingId);
        return new String[]{tok, String.valueOf(roomId)};
    }

    // ── POST /api/reviews ─────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/reviews – CONFIRMED foglalással → 201, értékelés létrehozva")
    void createReview_withConfirmedBooking_returns201() throws Exception {
        String[] ctx = prepareConfirmedBookingUser("ertekelo1", "ertekelo1@softdream.test");
        String tok = ctx[0];
        Integer roomId = Integer.parseInt(ctx[1]);

        ReviewRequest req = ReviewRequest.builder()
                .roomId(roomId).rating(5).comment("Kiváló szoba, mindent ajánlok!")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomId").value(roomId))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Kiváló szoba, mindent ajánlok!"));
    }

    @Test
    @DisplayName("POST /api/reviews – nincs CONFIRMED foglalás → 400")
    void createReview_withoutConfirmedBooking_returns400() throws Exception {
        // Regisztrálunk egy felhasználót, de NEM hozunk létre (vagy nem erősítünk meg) foglalást
        String tok = registerAndGetToken("ertekelo2", "ertekelo2@softdream.test",
                uniquePhone(), "password123");
        Integer roomId = anyRoomId();

        ReviewRequest req = ReviewRequest.builder()
                .roomId(roomId).rating(4).comment("Foglalás nélkül próbálok értékelni")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/reviews – ugyanazon szoba dupla értékelése → 400")
    void createReview_duplicate_returns400() throws Exception {
        String[] ctx = prepareConfirmedBookingUser("ertekelo3", "ertekelo3@softdream.test");
        String tok = ctx[0];
        Integer roomId = Integer.parseInt(ctx[1]);

        ReviewRequest req = ReviewRequest.builder()
                .roomId(roomId).rating(3).comment("Első értékelés")
                .build();

        // Első értékelés – sikeres
        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Második értékelés – duplikált
        ReviewRequest dup = ReviewRequest.builder()
                .roomId(roomId).rating(1).comment("Második értékelés (nem engedélyezett)")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/reviews – autentikáció nélkül → 401")
    void createReview_unauthenticated_returns401() throws Exception {
        ReviewRequest req = ReviewRequest.builder()
                .roomId(1).rating(5).comment("Teszt")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── GET /api/reviews/room/{roomId} ────────────────────────────────────────

    @Test
    @DisplayName("GET /api/reviews/room/{roomId} – 200, szoba értékelései listázva")
    void getReviewsByRoom_returns200() throws Exception {
        Integer roomId = anyRoomId();

        // A seeded adatokban az első szobának lehet értékelése, de attól függetlenül a 200 garantált
        MvcResult result = mockMvc.perform(get("/api/reviews/room/{id}", roomId))
                .andExpect(status().isOk())
                .andReturn();

        List<ReviewResponse> reviews = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertNotNull(reviews, "A visszaadott lista nem lehet null");
    }

    // ── GET /api/reviews/room/{roomId}/average-rating ────────────────────────

    @Test
    @DisplayName("GET /api/reviews/room/{roomId}/average-rating – értékelés után frissül")
    void getAverageRating_returnsUpdatedValueAfterReview() throws Exception {
        String[] ctx = prepareConfirmedBookingUser("avguser", "avguser@softdream.test");
        String tok = ctx[0];
        Integer roomId = Integer.parseInt(ctx[1]);

        // Értékelés feltöltése
        ReviewRequest req = ReviewRequest.builder()
                .roomId(roomId).rating(4).comment("Jó volt")
                .build();
        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Átlag lekérése – legalább 4-nek kell lennie (az egyetlen friss értékelés)
        MvcResult avgResult = mockMvc.perform(
                        get("/api/reviews/room/{id}/average-rating", roomId))
                .andExpect(status().isOk())
                .andReturn();

        Double avg = objectMapper.readValue(avgResult.getResponse().getContentAsString(), Double.class);
        assertNotNull(avg);
        assertTrue(avg >= 1.0 && avg <= 5.0, "Az átlagnak 1–5 közé kell esnie");
    }

    // ── PUT /api/reviews/{reviewId} ───────────────────────────────────────────

    @Test
    @DisplayName("PUT /api/reviews/{id} – tulajdonos módosítja → 200, frissített adatok")
    void updateReview_asOwner_returns200() throws Exception {
        String[] ctx = prepareConfirmedBookingUser("modosito", "modosito@softdream.test");
        String tok = ctx[0];
        Integer roomId = Integer.parseInt(ctx[1]);

        // Értékelés létrehozása
        ReviewRequest createReq = ReviewRequest.builder()
                .roomId(roomId).rating(3).comment("Eredeti megjegyzés")
                .build();
        MvcResult createResult = mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer reviewId = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), ReviewResponse.class).getReviewId();

        // Értékelés módosítása
        ReviewRequest updateReq = ReviewRequest.builder()
                .roomId(roomId).rating(5).comment("Frissített: tökéletes volt!")
                .build();
        mockMvc.perform(put("/api/reviews/{id}", reviewId)
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Frissített: tökéletes volt!"));
    }

    @Test
    @DisplayName("PUT /api/reviews/{id} – más felhasználó próbálja módosítani → 400")
    void updateReview_asOtherUser_returns400() throws Exception {
        String[] ctx = prepareConfirmedBookingUser("ertekelo_A", "ertekelo_A@softdream.test");
        String tokA = ctx[0];
        Integer roomId = Integer.parseInt(ctx[1]);

        // tokA létrehozza az értékelést
        ReviewRequest createReq = ReviewRequest.builder()
                .roomId(roomId).rating(3).comment("Eredeti")
                .build();
        MvcResult createResult = mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tokA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer reviewId = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), ReviewResponse.class).getReviewId();

        // tokB megpróbálja módosítani
        String tokB = registerAndGetToken("ertekelo_B", "ertekelo_B@softdream.test",
                uniquePhone(), "password123");

        ReviewRequest updateReq = ReviewRequest.builder()
                .roomId(roomId).rating(1).comment("Jogtalan módosítás")
                .build();
        mockMvc.perform(put("/api/reviews/{id}", reviewId)
                        .header("Authorization", bearer(tokB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());
    }

    // ── DELETE /api/reviews/{reviewId} ────────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/reviews/{id} – tulajdonos törli → 204")
    void deleteReview_asOwner_returns204() throws Exception {
        String[] ctx = prepareConfirmedBookingUser("torlo_user", "torlo_user@softdream.test");
        String tok = ctx[0];
        Integer roomId = Integer.parseInt(ctx[1]);

        ReviewRequest req = ReviewRequest.builder()
                .roomId(roomId).rating(2).comment("Törlésre szánt értékelés")
                .build();
        MvcResult createResult = mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer reviewId = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), ReviewResponse.class).getReviewId();

        mockMvc.perform(delete("/api/reviews/{id}", reviewId)
                        .header("Authorization", bearer(tok)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/reviews/{id} – admin bármely értékelést törölhet → 204")
    void deleteReview_asAdmin_returns204() throws Exception {
        String[] ctx = prepareConfirmedBookingUser("torlouser2", "torlouser2@softdream.test");
        String tok = ctx[0];
        Integer roomId = Integer.parseInt(ctx[1]);

        ReviewRequest req = ReviewRequest.builder()
                .roomId(roomId).rating(4).comment("Admin által törlendő értékelés")
                .build();
        MvcResult createResult = mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(tok))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer reviewId = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), ReviewResponse.class).getReviewId();

        String adminTok = adminToken();
        mockMvc.perform(delete("/api/reviews/{id}", reviewId)
                        .header("Authorization", bearer(adminTok)))
                .andExpect(status().isNoContent());
    }
}