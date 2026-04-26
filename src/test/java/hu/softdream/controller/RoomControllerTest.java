package hu.softdream.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.softdream.dto.request.RoomRequest;
import hu.softdream.dto.request.RoomStatusUpdateRequest;
import hu.softdream.dto.response.BookedDatesResponse;
import hu.softdream.dto.response.RoomResponse;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.security.WithMockCustomUser;
import org.springframework.context.annotation.Import;
import hu.softdream.config.SecurityConfig;
import hu.softdream.service.BookingService;
import hu.softdream.service.CustomUserDetailsService;
import hu.softdream.service.JwtService;
import org.springframework.context.annotation.Import;
import hu.softdream.config.SecurityConfig;
import hu.softdream.service.RoomService;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(value = RoomController.class, excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class)
@DisplayName("RoomController Tests")
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoomService roomService;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private RoomResponse roomResponse;

    @BeforeEach
    void setUp() {
        roomResponse = RoomResponse.builder()
                .roomId(1).roomNumber("101").floor(1).status("AVAILABLE").type("STANDARD")
                .pricePerNight(BigDecimal.valueOf(15000)).basePrice(BigDecimal.valueOf(15000))
                .maxGuests(2).averageRating(4.5)
                .build();
    }

    // ============ GET /api/rooms – publikus ============

    @Test
    @DisplayName("getAllRooms – token nélkül → 200")
    void getAllRooms_Public_Returns200() throws Exception {
        when(roomService.getAllRooms(any(), any(), any(), any())).thenReturn(List.of(roomResponse));

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roomNumber").value("101"));
    }

    @Test
    @DisplayName("getAllRooms – szűrőparaméterekkel → 200")
    void getAllRooms_WithFilters_Returns200() throws Exception {
        when(roomService.getAllRooms(any(), any(), any(), any())).thenReturn(List.of(roomResponse));

        mockMvc.perform(get("/api/rooms")
                        .param("q", "101").param("type", "STANDARD")
                        .param("maxPrice", "20000").param("sort", "PRICE_ASC"))
                .andExpect(status().isOk());
    }

    // ============ GET /api/rooms/{roomId} – publikus ============

    @Test
    @DisplayName("getRoomById – létező szoba → 200")
    void getRoomById_Existing_Returns200() throws Exception {
        when(roomService.getRoomById(1)).thenReturn(roomResponse);

        mockMvc.perform(get("/api/rooms/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomNumber").value("101"));
    }

    @Test
    @DisplayName("getRoomById – nem létező szoba → 404")
    void getRoomById_NotFound_Returns404() throws Exception {
        when(roomService.getRoomById(999)).thenThrow(new ResourceNotFoundException("Nem található"));

        mockMvc.perform(get("/api/rooms/999"))
                .andExpect(status().isNotFound());
    }

    // ============ GET /api/rooms/available – publikus ============

    @Test
    @DisplayName("getAvailableRooms – érvényes dátumokkal → 200")
    void getAvailableRooms_ValidDates_Returns200() throws Exception {
        when(roomService.getAvailableRooms(any(), any())).thenReturn(List.of(roomResponse));

        mockMvc.perform(get("/api/rooms/available")
                        .param("checkIn", LocalDate.now().plusDays(1).toString())
                        .param("checkOut", LocalDate.now().plusDays(5).toString()))
                .andExpect(status().isOk());
    }

    // ============ GET /api/rooms/{roomId}/booked-dates – publikus ============

    @Test
    @DisplayName("getBookedDatesForRoom – publikus → 200")
    void getBookedDatesForRoom_Public_Returns200() throws Exception {
        when(bookingService.getBookedDatesForRoom(1)).thenReturn(
                List.of(BookedDatesResponse.builder()
                        .checkIn(LocalDate.of(2026, 6, 1))
                        .checkOut(LocalDate.of(2026, 6, 5)).build()));

        mockMvc.perform(get("/api/rooms/1/booked-dates"))
                .andExpect(status().isOk());
    }

    // ============ POST /api/rooms – ADMIN ============

    @Test
    @DisplayName("createRoom – admin → 201")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void createRoom_AsAdmin_Returns201() throws Exception {
        RoomRequest request = RoomRequest.builder()
                .roomNumber("102").floor(1).roomTypeId(1).roomStatusId(1).maxGuests(2).build();
        when(roomService.createRoom(anyString(), anyInt(), anyInt(), anyInt(), anyInt()))
                .thenReturn(roomResponse);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("createRoom – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void createRoom_AsUser_Returns403() throws Exception {
        RoomRequest request = RoomRequest.builder()
                .roomNumber("102").floor(1).roomTypeId(1).roomStatusId(1).maxGuests(2).build();

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("createRoom – hitelesítés nélkül → 401")
    void createRoom_NoAuth_Returns401() throws Exception {
        RoomRequest request = RoomRequest.builder()
                .roomNumber("102").floor(1).roomTypeId(1).roomStatusId(1).maxGuests(2).build();

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("createRoom – üres szobaszám → 400")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void createRoom_BlankRoomNumber_Returns400() throws Exception {
        RoomRequest request = RoomRequest.builder()
                .roomNumber("").floor(1).roomTypeId(1).roomStatusId(1).maxGuests(2).build();

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ============ PATCH /api/rooms/{roomId}/status – ADMIN ============

    @Test
    @DisplayName("updateRoomStatus – admin → 200")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void updateRoomStatus_AsAdmin_Returns200() throws Exception {
        RoomStatusUpdateRequest request = new RoomStatusUpdateRequest(2);
        when(roomService.updateRoomStatus(eq(1), eq(2))).thenReturn(roomResponse);

        mockMvc.perform(patch("/api/rooms/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("updateRoomStatus – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void updateRoomStatus_AsUser_Returns403() throws Exception {
        RoomStatusUpdateRequest request = new RoomStatusUpdateRequest(2);

        mockMvc.perform(patch("/api/rooms/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // ============ DELETE /api/rooms/{roomId} – ADMIN ============

    @Test
    @DisplayName("deleteRoom – admin → 204")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteRoom_AsAdmin_Returns204() throws Exception {
        doNothing().when(roomService).deleteRoom(1);

        mockMvc.perform(delete("/api/rooms/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("deleteRoom – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void deleteRoom_AsUser_Returns403() throws Exception {
        mockMvc.perform(delete("/api/rooms/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deleteRoom – nem létező szoba → 404")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteRoom_NotFound_Returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Nem található")).when(roomService).deleteRoom(999);

        mockMvc.perform(delete("/api/rooms/999"))
                .andExpect(status().isNotFound());
    }
}