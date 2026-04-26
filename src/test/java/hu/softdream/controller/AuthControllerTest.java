package hu.softdream.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.softdream.dto.request.LoginRequest;
import hu.softdream.dto.request.RegisterRequest;
import hu.softdream.dto.response.AuthResponse;
import hu.softdream.exception.BadRequestException;
import hu.softdream.security.WithMockCustomUser;
import org.springframework.context.annotation.Import;
import hu.softdream.config.SecurityConfig;
import hu.softdream.service.AuthService;
import hu.softdream.service.CustomUserDetailsService;
import hu.softdream.service.JwtService;
import hu.softdream.service.TokenBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(value = AuthController.class, excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        authResponse = AuthResponse.builder()
                .token("jwt-token").type("Bearer").userId(1)
                .username("testuser").email("test@example.com").role("USER")
                .build();
    }

    // ============ POST /api/auth/register ============

    @Test
    @DisplayName("register – sikeres → 201")
    void register_Success_Returns201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser").email("new@example.com")
                .phone("1234567890").password("password123").build();
        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("register – üres felhasználónév → 400")
    void register_BlankUsername_Returns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("").email("new@example.com")
                .phone("1234567890").password("password123").build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("register – érvénytelen email → 400")
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser").email("not-an-email")
                .phone("1234567890").password("password123").build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("register – rövid jelszó → 400")
    void register_ShortPassword_Returns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser").email("new@example.com")
                .phone("1234567890").password("abc").build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("register – már létező felhasználónév → 400")
    void register_UsernameExists_Returns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("existing").email("new@example.com")
                .phone("1234567890").password("password123").build();
        when(authService.register(any())).thenThrow(new BadRequestException("Felhasználónév foglalt"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Felhasználónév foglalt"));
    }

    // ============ POST /api/auth/login ============

    @Test
    @DisplayName("login – sikeres → 200")
    void login_Success_Returns200() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .username("testuser").password("password123").build();
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("login – helytelen jelszó → 401")
    void login_BadCredentials_Returns401() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .username("testuser").password("wrong").build();
        when(authService.login(any())).thenThrow(new BadCredentialsException("Hibás jelszó"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("login – üres felhasználónév → 400")
    void login_BlankUsername_Returns400() throws Exception {
        LoginRequest request = LoginRequest.builder().username("").password("password123").build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("login – üres jelszó → 400")
    void login_BlankPassword_Returns400() throws Exception {
        LoginRequest request = LoginRequest.builder().username("testuser").password("").build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ============ POST /api/auth/logout ============

    @Test
    @DisplayName("logout – bejelentkezve → 204, token visszavonva")
    @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
    void logout_Authenticated_Returns204AndRevokes() throws Exception {
        when(jwtService.extractJti("test-token")).thenReturn("jti-1");
        when(jwtService.extractExpirationMs("test-token")).thenReturn(System.currentTimeMillis() + 60_000L);
        doNothing().when(tokenBlacklistService).revoke(Mockito.anyString(), Mockito.anyLong());

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNoContent());

        Mockito.verify(tokenBlacklistService).revoke(Mockito.eq("jti-1"), Mockito.anyLong());
    }

    @Test
    @DisplayName("logout – hitelesítés nélkül → 401")
    void logout_NoAuth_Returns401() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized());
    }
}