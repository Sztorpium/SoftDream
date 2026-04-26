package hu.softdream.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.softdream.dto.request.PasswordChangeRequest;
import hu.softdream.dto.request.PasswordVerifyRequest;
import hu.softdream.dto.request.ProfileUpdateRequest;
import hu.softdream.dto.response.UserResponse;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.security.WithMockCustomUser;
import hu.softdream.service.CustomUserDetailsService;
import hu.softdream.service.JwtService;
import hu.softdream.service.TokenBlacklistService;
import org.springframework.context.annotation.Import;
import hu.softdream.config.SecurityConfig;
import hu.softdream.service.UserService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(value = UserController.class, excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class)
@DisplayName("UserController Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private UserResponse userResponse;
    private UserResponse adminResponse;

    @BeforeEach
    void setUp() {
        userResponse = UserResponse.builder()
                .userId(1).username("testuser").email("user@example.com").phone("1234567890")
                .role("USER").createdAt(LocalDateTime.now()).build();

        adminResponse = UserResponse.builder()
                .userId(2).username("admin").email("admin@example.com").phone("9876543210")
                .role("ADMIN").createdAt(LocalDateTime.now()).build();
    }

    // ============ GET /api/users ============

    @Test
    @DisplayName("getAllUsers – admin → 200")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void getAllUsers_AsAdmin_Returns200() throws Exception {
        when(userService.getAllUsers(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(userResponse, adminResponse)));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("testuser"));
    }

    @Test
    @DisplayName("getAllUsers – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getAllUsers_AsUser_Returns403() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("getAllUsers – hitelesítés nélkül → 401")
    void getAllUsers_NoAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    // ============ GET /api/users/me ============

    @Test
    @DisplayName("getCurrentUser – user → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getCurrentUser_AsUser_Returns200() throws Exception {
        when(userService.getUserById(1)).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("getCurrentUser – hitelesítés nélkül → 401")
    void getCurrentUser_NoAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    // ============ GET /api/users/{userId} ============

    @Test
    @DisplayName("getUserById – saját id → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getUserById_OwnId_Returns200() throws Exception {
        when(userService.getUserById(1)).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    @DisplayName("getUserById – más id → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getUserById_OtherId_Returns400() throws Exception {
        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("getUserById – admin bármely id-t lekérheti → 200")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void getUserById_AdminAnyId_Returns200() throws Exception {
        when(userService.getUserById(1)).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getUserById – nem létező user → 404")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void getUserById_NotFound_Returns404() throws Exception {
        when(userService.getUserById(999)).thenThrow(new ResourceNotFoundException("Nem található"));

        mockMvc.perform(get("/api/users/999"))
                .andExpect(status().isNotFound());
    }

    // ============ GET /api/users/username/{username} ============

    @Test
    @DisplayName("getUserByUsername – saját username → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getUserByUsername_Own_Returns200() throws Exception {
        when(userService.getUserByUsername("testuser")).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/username/testuser"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getUserByUsername – más username → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void getUserByUsername_Other_Returns400() throws Exception {
        mockMvc.perform(get("/api/users/username/admin"))
                .andExpect(status().isBadRequest());
    }

    // ============ POST /api/users/me/verify-password ============

    @Test
    @DisplayName("verifyCurrentUserPassword – helyes jelszó → 204")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void verifyCurrentUserPassword_Correct_Returns204() throws Exception {
        PasswordVerifyRequest request = new PasswordVerifyRequest("correctPass");
        doNothing().when(userService).verifyCurrentPassword(eq(1), eq("correctPass"));

        mockMvc.perform(post("/api/users/me/verify-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("verifyCurrentUserPassword – helytelen jelszó → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void verifyCurrentUserPassword_Wrong_Returns400() throws Exception {
        PasswordVerifyRequest request = new PasswordVerifyRequest("wrong");
        doThrow(new BadRequestException("Helytelen jelszó"))
                .when(userService).verifyCurrentPassword(anyInt(), anyString());

        mockMvc.perform(post("/api/users/me/verify-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ============ PUT /api/users/me/password ============

    @Test
    @DisplayName("changeCurrentUserPassword – érvényes kérés → 204")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void changeCurrentUserPassword_Valid_Returns204() throws Exception {
        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("oldPass1").newPassword("newPass123").confirmPassword("newPass123").build();
        doNothing().when(userService).changeCurrentPassword(eq(1), any(PasswordChangeRequest.class));

        mockMvc.perform(put("/api/users/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("changeCurrentUserPassword – üres currentPassword → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void changeCurrentUserPassword_BlankCurrent_Returns400() throws Exception {
        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("").newPassword("newPass123").confirmPassword("newPass123").build();

        mockMvc.perform(put("/api/users/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ============ PUT /api/users/me ============

    @Test
    @DisplayName("updateCurrentUserProfile – érvényes kérés → 200")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void updateCurrentUserProfile_Valid_Returns200() throws Exception {
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .email("updated@example.com").phone("1234567891").currentPassword("currentPass").build();
        UserResponse updated = UserResponse.builder()
                .userId(1).username("testuser").email("updated@example.com").phone("1234567891")
                .role("USER").createdAt(LocalDateTime.now()).build();
        when(userService.updateCurrentUserProfile(eq(1), any(ProfileUpdateRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    @Test
    @DisplayName("updateCurrentUserProfile – érvénytelen email → 400")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void updateCurrentUserProfile_InvalidEmail_Returns400() throws Exception {
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .email("not-an-email").phone("1234567891").currentPassword("currentPass").build();

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ============ DELETE /api/users/{userId} ============

    @Test
    @DisplayName("deleteUser – admin → 204")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteUser_AsAdmin_Returns204() throws Exception {
        doNothing().when(userService).deleteUser(eq(1), eq(2));

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("deleteUser – user → 403")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void deleteUser_AsUser_Returns403() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deleteUser – admin törli saját magát → 400")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteUser_AdminSelfDelete_Returns400() throws Exception {
        doThrow(new BadRequestException("Nem törölheti saját magát"))
                .when(userService).deleteUser(eq(2), eq(2));

        mockMvc.perform(delete("/api/users/2"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("deleteUser – nem létező felhasználó → 404")
    @WithMockCustomUser(userId = 2, username = "admin", role = "ADMIN")
    void deleteUser_NotFound_Returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Nem található"))
                .when(userService).deleteUser(eq(999), anyInt());

        mockMvc.perform(delete("/api/users/999"))
                .andExpect(status().isNotFound());
    }
}