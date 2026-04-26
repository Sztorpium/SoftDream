package hu.softdream.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.softdream.dto.request.ReviewRequest;
import hu.softdream.dto.response.ReviewResponse;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.security.WithMockCustomUser;
import hu.softdream.service.CustomUserDetailsService;
import hu.softdream.service.JwtService;
import org.springframework.context.annotation.Import;
import hu.softdream.config.SecurityConfig;
import hu.softdream.service.ReviewService;
import hu.softdream.service.TokenBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(value = ReviewController.class, excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class)
@DisplayName("ReviewController Tests")
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewService reviewService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private ReviewResponse reviewResponse;

    @BeforeEach
    void setUp() {
        reviewResponse = ReviewResponse.builder()
                .reviewId(1).userId(1).username("testuser").roomId(1).roomNumber("101")
                .rating(5).comment("Kiváló!")
                .checkIn(LocalDate.of(2026, 5, 1)).checkOut(LocalDate.of(2026, 5, 5))
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ============ GET /api/reviews – publikus ============

    @Test
    @DisplayName("getAllReviews – publikus → 200")
    void getAllReviews_Public_Returns200() throws Exception {
        when(reviewService.getAllReviews()).thenReturn(List.of(reviewResponse));

        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reviewId").value(1));
    }

    // ============ GET /api/reviews/{reviewId} – publikus ============

    @Test
    @DisplayName("getReviewById – létező értékelés → 200")
    void getReviewById_Existing_Returns200() throws Exception {
        when(reviewService.getReviewById(1)).thenReturn(reviewResponse);

        mockMvc.perform(get("/api/reviews/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5));
    }

    @Test
    @DisplayName("getReviewById – nem létező → 404")
    void getReviewById_NotFound_Returns404() throws Exception {
        when(reviewService.getReviewById(999))
                .thenThrow(new ResourceNotFoundException("Nem található"));

        mockMvc.perform(get("/api/reviews/999"))
                .andExpect(status().isNotFound());
    }

    // ============ GET /api/reviews/room/{roomId} – publikus ============

    @Test
    @DisplayName("getReviewsByRoomId – publikus → 200")
    void getReviewsByRoomId_Public_Returns200() throws Exception {
        when(reviewService.getReviewsByRoomId(1)).thenReturn(List.of(reviewResponse));

        mockMvc.perform(get("/api/reviews/room/1"))
                .andExpect(status().isOk());
    }

    // ============ GET /api/reviews/room/{roomId}/average-rating – publikus ============

    @Test
    @DisplayName("getAverageRating – publikus → 200")
    void getAverageRating_Public_Returns200() throws Exception {
        when(reviewService.getAverageRatingByRoomId(1)).thenReturn(4.5);

        mockMvc.perform(get("/api/reviews/room/1/average-rating"))
                .andExpect(status().isOk())
                .andExpect(content().string("4.5"));
    }

    // ============ GET /api/reviews/my-reviews – hitelesítés szükséges ============

    @Test
    @DisplayName("getMyReviews – user → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getMyReviews_AsUser_Returns200() throws Exception {
        when(reviewService.getReviewsByUserId(1)).thenReturn(List.of(reviewResponse));

        mockMvc.perform(get("/api/reviews/my-reviews"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getMyReviews – hitelesítés nélkül → 401")
    void getMyReviews_NoAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/reviews/my-reviews"))
                .andExpect(status().isUnauthorized());
    }

    // ============ GET /api/reviews/user/{userId} – ADMIN ============

    @Test
    @DisplayName("getReviewsByUserId – admin → 200")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void getReviewsByUserId_AsAdmin_Returns200() throws Exception {
        when(reviewService.getReviewsByUserId(1)).thenReturn(List.of(reviewResponse));

        mockMvc.perform(get("/api/reviews/user/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getReviewsByUserId – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getReviewsByUserId_AsUser_Returns403() throws Exception {
        mockMvc.perform(get("/api/reviews/user/1"))
                .andExpect(status().isForbidden());
    }

    // ============ POST /api/reviews ============

    @Test
    @DisplayName("createReview – érvényes kérés → 201")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void createReview_ValidRequest_Returns201() throws Exception {
        ReviewRequest request = ReviewRequest.builder().roomId(1).rating(5).comment("Kiváló!").build();
        when(reviewService.createReview(eq(1), any(ReviewRequest.class))).thenReturn(reviewResponse);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reviewId").value(1));
    }

    @Test
    @DisplayName("createReview – rating > 5 → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void createReview_RatingOutOfRange_Returns400() throws Exception {
        ReviewRequest request = ReviewRequest.builder().roomId(1).rating(6).comment("Jó").build();

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("createReview – null roomId → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void createReview_NullRoomId_Returns400() throws Exception {
        ReviewRequest request = ReviewRequest.builder().roomId(null).rating(5).build();

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("createReview – hitelesítés nélkül → 401")
    void createReview_NoAuth_Returns401() throws Exception {
        ReviewRequest request = ReviewRequest.builder().roomId(1).rating(5).build();

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("createReview – nincs megerősített foglalás → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void createReview_NoConfirmedBooking_Returns400() throws Exception {
        ReviewRequest request = ReviewRequest.builder().roomId(1).rating(5).build();
        when(reviewService.createReview(anyInt(), any()))
                .thenThrow(new BadRequestException("Nincs megerősített foglalása"));

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ============ PUT /api/reviews/{reviewId} ============

    @Test
    @DisplayName("updateReview – tulajdonos → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void updateReview_AsOwner_Returns200() throws Exception {
        ReviewRequest request = ReviewRequest.builder().roomId(1).rating(4).comment("Módosított").build();
        ReviewResponse updated = ReviewResponse.builder()
                .reviewId(1).userId(1).username("testuser").roomId(1).roomNumber("101")
                .rating(4).comment("Módosított")
                .checkIn(LocalDate.of(2026, 5, 1)).checkOut(LocalDate.of(2026, 5, 5))
                .createdAt(LocalDateTime.now()).build();
        when(reviewService.updateReview(eq(1), any(ReviewRequest.class), eq(1))).thenReturn(updated);

        mockMvc.perform(put("/api/reviews/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4));
    }

    @Test
    @DisplayName("updateReview – más felhasználó értékelése → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void updateReview_NotOwner_Returns400() throws Exception {
        ReviewRequest request = ReviewRequest.builder().roomId(1).rating(4).build();
        when(reviewService.updateReview(anyInt(), any(), anyInt()))
                .thenThrow(new BadRequestException("Nincs jogosultsága"));

        mockMvc.perform(put("/api/reviews/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ============ DELETE /api/reviews/{reviewId} ============

    @Test
    @DisplayName("deleteReview – tulajdonos → 204")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void deleteReview_AsOwner_Returns204() throws Exception {
        doNothing().when(reviewService).deleteReview(eq(1), eq(1), eq(false));

        mockMvc.perform(delete("/api/reviews/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("deleteReview – admin → 204")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteReview_AsAdmin_Returns204() throws Exception {
        doNothing().when(reviewService).deleteReview(eq(1), eq(2), eq(true));

        mockMvc.perform(delete("/api/reviews/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("deleteReview – nem létező értékelés → 404")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void deleteReview_NotFound_Returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Nem található"))
                .when(reviewService).deleteReview(anyInt(), anyInt(), anyBoolean());

        mockMvc.perform(delete("/api/reviews/999"))
                .andExpect(status().isNotFound());
    }
}