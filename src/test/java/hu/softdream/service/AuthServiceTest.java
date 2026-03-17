package hu.softdream.service;

import hu.softdream.dto.request.LoginRequest;
import hu.softdream.dto.request.RegisterRequest;
import hu.softdream.dto.response.AuthResponse;
import hu.softdream.entity.Role;
import hu.softdream.entity.User;
import hu.softdream.entity.UserAuth;
import hu.softdream.exception.BadRequestException;
import hu.softdream.repository.RoleRepository;
import hu.softdream.repository.UserAuthRepository;
import hu.softdream.repository.UserRepository;
import hu.softdream.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserAuthRepository userAuthRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;
    private User testUser;
    private Role userRole;
    private UserAuth testUserAuth;

    @BeforeEach
    void setUp() {
        // Érvényes regisztrációs kérés
        validRegisterRequest = RegisterRequest.builder()
                .username("newuser")
                .email("newuser@example.com")
                .password("Password123!")
                .phone("1234567890")
                .build();

        // Érvényes bejelentkezési kérés
        validLoginRequest = LoginRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        // Teszt User
        testUser = User.builder()
                .userId(1)
                .username("testuser")
                .email("test@example.com")
                .phone("1234567890")
                .build();

        // Teszt Role
        userRole = Role.builder()
                .roleId(1)
                .name("USER")
                .description("Standard user role")
                .build();

        // Teszt UserAuth
        testUserAuth = UserAuth.builder()
                .authId(1)
                .user(testUser)
                .passwordHash("encoded_password")
                .role(userRole)
                .build();
    }

    // ============ REGISTER TESTS ============

    @Test
    @DisplayName("Sikeres regisztráció - új felhasználó")
    void testRegister_Success() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("1234567890")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_password");
        when(userAuthRepository.save(any(UserAuth.class))).thenReturn(testUserAuth);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("test_jwt_token");

        // When
        AuthResponse response = authService.register(validRegisterRequest);

        // Then
        assertNotNull(response);
        assertEquals("Bearer", response.getType());
        assertEquals("test_jwt_token", response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
        assertEquals(1, response.getUserId());

        verify(userRepository, times(1)).save(any(User.class));
        verify(userAuthRepository, times(1)).save(any(UserAuth.class));
        verify(jwtService, times(1)).generateToken(any(CustomUserDetails.class));
    }

    @Test
    @DisplayName("Regisztráció - felhasználónév már létezik")
    void testRegister_UsernameAlreadyExists() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> authService.register(validRegisterRequest));

        verify(userRepository, never()).save(any(User.class));
        verify(userAuthRepository, never()).save(any(UserAuth.class));
    }

    @Test
    @DisplayName("Regisztráció - email már létezik")
    void testRegister_EmailAlreadyExists() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(true);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> authService.register(validRegisterRequest));

        verify(userRepository, never()).save(any(User.class));
        verify(userAuthRepository, never()).save(any(UserAuth.class));
    }

    @Test
    @DisplayName("Regisztráció - telefonszám már létezik")
    void testRegister_PhoneAlreadyExists() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("1234567890")).thenReturn(true);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> authService.register(validRegisterRequest));

        verify(userRepository, never()).save(any(User.class));
        verify(userAuthRepository, never()).save(any(UserAuth.class));
    }

    @Test
    @DisplayName("Regisztráció - USER role automatikusan létrehozódik, ha nem létezik")
    void testRegister_CreateRoleIfNotExists() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("1234567890")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Role nem létezik, ezért létrehozódik
        Role newRole = Role.builder()
                .roleId(2)
                .name("USER")
                .description("Standard user role")
                .build();
        when(roleRepository.findByName("USER")).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(newRole);

        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_password");
        when(userAuthRepository.save(any(UserAuth.class))).thenReturn(
                UserAuth.builder()
                        .authId(1)
                        .user(testUser)
                        .passwordHash("encoded_password")
                        .role(newRole)
                        .build()
        );
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("jwt_token");

        // When
        AuthResponse response = authService.register(validRegisterRequest);

        // Then
        assertNotNull(response);
        assertEquals("USER", response.getRole());
        verify(roleRepository, times(1)).save(any(Role.class));
    }

    @Test
    @DisplayName("Regisztráció - jelszó titkosítva kerül tárolásra")
    void testRegister_PasswordIsEncoded() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("1234567890")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_password");
        when(userAuthRepository.save(any(UserAuth.class))).thenReturn(testUserAuth);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("jwt_token");

        // When
        authService.register(validRegisterRequest);

        // Then
        verify(passwordEncoder, times(1)).encode("Password123!");
        verify(userAuthRepository, times(1)).save(argThat(userAuth ->
                userAuth.getPasswordHash().equals("encoded_password")
        ));
    }

    // ============ LOGIN TESTS ============

    @Test
    @DisplayName("Sikeres bejelentkezés")
    void testLogin_Success() {
        // Given
        Authentication mockAuth = mock(Authentication.class);
        CustomUserDetails mockUserDetails = mock(CustomUserDetails.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(mockAuth.getPrincipal()).thenReturn(mockUserDetails);
        when(mockUserDetails.getUserId()).thenReturn(1);
        when(mockUserDetails.getUsername()).thenReturn("testuser");
        when(mockUserDetails.getEmail()).thenReturn("test@example.com");
        when(mockUserDetails.getRole()).thenReturn("USER");
        when(jwtService.generateToken(mockUserDetails)).thenReturn("jwt_token");

        // When
        AuthResponse response = authService.login(validLoginRequest);

        // Then
        assertNotNull(response);
        assertEquals("Bearer", response.getType());
        assertEquals("jwt_token", response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
        assertEquals(1, response.getUserId());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, times(1)).generateToken(mockUserDetails);
    }

    @Test
    @DisplayName("Bejelentkezés - helytelen jelszó")
    void testLogin_InvalidPassword() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Helytelen felhasználónév vagy jelszó"));

        // When & Then
        assertThrows(BadCredentialsException.class,
                () -> authService.login(validLoginRequest));

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Bejelentkezés - felhasználó nem létezik")
    void testLogin_UserNotFound() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Felhasználó nem található"));

        // When & Then
        assertThrows(BadCredentialsException.class,
                () -> authService.login(validLoginRequest));

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Bejelentkezés - üres username")
    void testLogin_EmptyUsername() {
        // Given
        LoginRequest emptyUsernameRequest = LoginRequest.builder()
                .username("")
                .password("password123")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Username nem lehet üres"));

        // When & Then
        assertThrows(BadCredentialsException.class,
                () -> authService.login(emptyUsernameRequest));
    }

    @Test
    @DisplayName("Bejelentkezés - üres jelszó")
    void testLogin_EmptyPassword() {
        // Given
        LoginRequest emptyPasswordRequest = LoginRequest.builder()
                .username("testuser")
                .password("")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Jelszó nem lehet üres"));

        // When & Then
        assertThrows(BadCredentialsException.class,
                () -> authService.login(emptyPasswordRequest));
    }

    // ============ TOKEN GENERATION TESTS ============

    @Test
    @DisplayName("JWT token generálása sikeres regisztráció után")
    void testRegister_TokenGenerated() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("1234567890")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userAuthRepository.save(any(UserAuth.class))).thenReturn(testUserAuth);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("generated_token");

        // When
        AuthResponse response = authService.register(validRegisterRequest);

        // Then
        assertEquals("generated_token", response.getToken());
        assertEquals("Bearer", response.getType());
        verify(jwtService, times(1)).generateToken(any(CustomUserDetails.class));
    }

    @Test
    @DisplayName("JWT token generálása sikeres bejelentkezés után")
    void testLogin_TokenGenerated() {
        // Given
        Authentication mockAuth = mock(Authentication.class);
        CustomUserDetails mockUserDetails = mock(CustomUserDetails.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(mockAuth.getPrincipal()).thenReturn(mockUserDetails);
        when(mockUserDetails.getUserId()).thenReturn(1);
        when(mockUserDetails.getUsername()).thenReturn("testuser");
        when(mockUserDetails.getEmail()).thenReturn("test@example.com");
        when(mockUserDetails.getRole()).thenReturn("USER");
        when(jwtService.generateToken(mockUserDetails)).thenReturn("generated_token");

        // When
        AuthResponse response = authService.login(validLoginRequest);

        // Then
        assertEquals("generated_token", response.getToken());
        assertEquals("Bearer", response.getType());
    }

    // ============ EDGE CASES ============

    @Test
    @DisplayName("Regisztráció - dupla ellenőrzés (egyszerre több hibaüzenet)")
    void testRegister_UsernameAndEmailExists() {
        // Given - Both username és email már létezik
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        // When & Then - Az első hiba (username) dobódik
        assertThrows(BadRequestException.class,
                () -> authService.register(validRegisterRequest));

        // Az email-t nem is ellenőrizzük, mert előbb dobódik az exception
        verify(userRepository, times(1)).existsByUsername("newuser");
    }

    @Test
    @DisplayName("Bejelentkezés - helytelen titkosítási jelszó")
    void testLogin_InvalidPasswordEncoding() {
        // Given
        LoginRequest invalidPasswordRequest = LoginRequest.builder()
                .username("testuser")
                .password("wrongpassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Jelszó nem helyes"));

        // When & Then
        assertThrows(BadCredentialsException.class,
                () -> authService.login(invalidPasswordRequest));
    }

    // ============ RESPONSE VALIDATION ============

    @Test
    @DisplayName("Register válasz teljes és helyes formátumú")
    void testRegister_ResponseFormat() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("1234567890")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userAuthRepository.save(any(UserAuth.class))).thenReturn(testUserAuth);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("token");

        // When
        AuthResponse response = authService.register(validRegisterRequest);

        // Then - Összes mező jelen van
        assertNotNull(response.getToken());
        assertNotNull(response.getType());
        assertNotNull(response.getUserId());
        assertNotNull(response.getUsername());
        assertNotNull(response.getEmail());
        assertNotNull(response.getRole());

        assertEquals("Bearer", response.getType());
    }

    @Test
    @DisplayName("Login válasz teljes és helyes formátumú")
    void testLogin_ResponseFormat() {
        // Given
        Authentication mockAuth = mock(Authentication.class);
        CustomUserDetails mockUserDetails = mock(CustomUserDetails.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(mockAuth.getPrincipal()).thenReturn(mockUserDetails);
        when(mockUserDetails.getUserId()).thenReturn(1);
        when(mockUserDetails.getUsername()).thenReturn("testuser");
        when(mockUserDetails.getEmail()).thenReturn("test@example.com");
        when(mockUserDetails.getRole()).thenReturn("USER");
        when(jwtService.generateToken(mockUserDetails)).thenReturn("token");

        // When
        AuthResponse response = authService.login(validLoginRequest);

        // Then - Összes mező jelen van
        assertNotNull(response.getToken());
        assertNotNull(response.getType());
        assertNotNull(response.getUserId());
        assertNotNull(response.getUsername());
        assertNotNull(response.getEmail());
        assertNotNull(response.getRole());

        assertEquals("Bearer", response.getType());
    }
}