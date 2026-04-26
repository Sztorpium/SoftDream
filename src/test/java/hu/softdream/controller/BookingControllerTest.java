package hu.softdream.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.softdream.dto.request.BookingRequest;
import hu.softdream.dto.response.BookingResponse;
import hu.softdream.entity.enums.BookingStatus;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.security.WithMockCustomUser;
import org.springframework.context.annotation.Import;
import hu.softdream.config.SecurityConfig;
import hu.softdream.service.BookingService;
import hu.softdream.service.CustomUserDetailsService;
import hu.softdream.service.JwtService;
import hu.softdream.service.TokenBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
@WebMvcTest(value = BookingController.class, excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class)
@DisplayName("BookingController Tests")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        bookingResponse = BookingResponse.builder()
                .bookingId(1).userId(1).username("testuser").roomId(1).roomNumber("101")
                .checkIn(LocalDate.of(2026, 6, 1)).checkOut(LocalDate.of(2026, 6, 5))
                .status(BookingStatus.PENDING.name()).createdAt(LocalDateTime.now())
                .build();
    }

    // ============ GET /api/bookings ============

    @Test
    @DisplayName("getAllBookings – admin → 200")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void getAllBookings_AsAdmin_Returns200() throws Exception {
        when(bookingService.getAllBookings(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(bookingResponse)));

        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].bookingId").value(1));
    }

    @Test
    @DisplayName("getAllBookings – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getAllBookings_AsUser_Returns403() throws Exception {
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("getAllBookings – hitelesítés nélkül → 401")
    void getAllBookings_NoAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isUnauthorized());
    }

    // ============ GET /api/bookings/my-bookings ============

    @Test
    @DisplayName("getMyBookings – user → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getMyBookings_AsUser_Returns200() throws Exception {
        when(bookingService.getBookingsByUserId(1)).thenReturn(List.of(bookingResponse));

        mockMvc.perform(get("/api/bookings/my-bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("testuser"));
    }

    // ============ GET /api/bookings/{bookingId} ============

    @Test
    @DisplayName("getBookingById – tulajdonos → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getBookingById_AsOwner_Returns200() throws Exception {
        when(bookingService.getBookingById(1, 1, false)).thenReturn(bookingResponse);

        mockMvc.perform(get("/api/bookings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(1));
    }

    @Test
    @DisplayName("getBookingById – nem saját foglalás → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getBookingById_NotOwner_Returns400() throws Exception {
        when(bookingService.getBookingById(anyInt(), anyInt(), anyBoolean()))
                .thenThrow(new BadRequestException("Nincs jogosultsága"));

        mockMvc.perform(get("/api/bookings/99"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("getBookingById – nem létező foglalás → 404")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getBookingById_NotFound_Returns404() throws Exception {
        when(bookingService.getBookingById(anyInt(), anyInt(), anyBoolean()))
                .thenThrow(new ResourceNotFoundException("Nem található"));

        mockMvc.perform(get("/api/bookings/999"))
                .andExpect(status().isNotFound());
    }

    // ============ GET /api/bookings/user/{userId} ============

    @Test
    @DisplayName("getBookingsByUserId – admin → 200")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void getBookingsByUserId_AsAdmin_Returns200() throws Exception {
        when(bookingService.getBookingsByUserId(1)).thenReturn(List.of(bookingResponse));

        mockMvc.perform(get("/api/bookings/user/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getBookingsByUserId – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getBookingsByUserId_AsUser_Returns403() throws Exception {
        mockMvc.perform(get("/api/bookings/user/1"))
                .andExpect(status().isForbidden());
    }

    // ============ POST /api/bookings ============

    @Test
    @DisplayName("createBooking – érvényes kérés → 201")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void createBooking_ValidRequest_Returns201() throws Exception {
        BookingRequest request = BookingRequest.builder()
                .roomId(1).checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(5)).build();
        when(bookingService.createBooking(eq(1), any(BookingRequest.class))).thenReturn(bookingResponse);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingId").value(1));
    }

    @Test
    @DisplayName("createBooking – null roomId → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void createBooking_NullRoomId_Returns400() throws Exception {
        BookingRequest request = BookingRequest.builder()
                .roomId(null).checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(5)).build();

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("createBooking – hitelesítés nélkül → 401")
    void createBooking_NoAuth_Returns401() throws Exception {
        BookingRequest request = BookingRequest.builder()
                .roomId(1).checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(5)).build();

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ============ PATCH /api/bookings/{id}/confirm ============

    @Test
    @DisplayName("confirmBooking – admin → 200")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void confirmBooking_AsAdmin_Returns200() throws Exception {
        BookingResponse confirmed = BookingResponse.builder()
                .bookingId(1).userId(1).username("testuser").roomId(1).roomNumber("101")
                .checkIn(LocalDate.of(2026, 6, 1)).checkOut(LocalDate.of(2026, 6, 5))
                .status(BookingStatus.CONFIRMED.name()).createdAt(LocalDateTime.now()).build();
        when(bookingService.confirmBooking(1)).thenReturn(confirmed);

        mockMvc.perform(patch("/api/bookings/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("confirmBooking – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void confirmBooking_AsUser_Returns403() throws Exception {
        mockMvc.perform(patch("/api/bookings/1/confirm"))
                .andExpect(status().isForbidden());
    }

    // ============ PATCH /api/bookings/{id}/cancel ============

    @Test
    @DisplayName("cancelBooking – tulajdonos → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void cancelBooking_AsOwner_Returns200() throws Exception {
        BookingResponse cancelled = BookingResponse.builder()
                .bookingId(1).userId(1).username("testuser").roomId(1).roomNumber("101")
                .checkIn(LocalDate.of(2026, 6, 1)).checkOut(LocalDate.of(2026, 6, 5))
                .status(BookingStatus.CANCELLED.name()).createdAt(LocalDateTime.now()).build();
        when(bookingService.cancelBooking(1, 1, false)).thenReturn(cancelled);

        mockMvc.perform(patch("/api/bookings/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // ============ DELETE /api/bookings/{id} ============

    @Test
    @DisplayName("deleteBooking – admin → 204")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteBooking_AsAdmin_Returns204() throws Exception {
        doNothing().when(bookingService).deleteBooking(1);

        mockMvc.perform(delete("/api/bookings/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("deleteBooking – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void deleteBooking_AsUser_Returns403() throws Exception {
        mockMvc.perform(delete("/api/bookings/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deleteBooking – nem létező → 404")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteBooking_NotFound_Returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Nem található")).when(bookingService).deleteBooking(999);

        mockMvc.perform(delete("/api/bookings/999"))
                .andExpect(status().isNotFound());
    }
}