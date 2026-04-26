package hu.softdream.service;

import hu.softdream.dto.request.PasswordChangeRequest;
import hu.softdream.dto.request.ProfileUpdateRequest;
import hu.softdream.dto.response.UserResponse;
import hu.softdream.entity.Role;
import hu.softdream.entity.User;
import hu.softdream.entity.UserAuth;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.repository.UserAuthRepository;
import hu.softdream.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserAuthRepository userAuthRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Role userRole;
    private UserAuth testUserAuth;

    @BeforeEach
    void setUp() {
        userRole = Role.builder()
                .roleId(1)
                .name("USER")
                .description("Standard user role")
                .build();

        testUser = User.builder()
                .userId(1)
                .username("testuser")
                .email("test@example.com")
                .phone("1234567890")
                .createdAt(LocalDateTime.now())
                .build();

        testUserAuth = UserAuth.builder()
                .authId(1)
                .user(testUser)
                .passwordHash("encoded_password")
                .role(userRole)
                .build();

        testUser.setUserAuth(testUserAuth);
    }

    // ============ GET ALL USERS TESTS ============

    @Test
    @DisplayName("Összes felhasználó lekérése - eredmény visszaadva")
    void testGetAllUsers_Success() {
        // Given
        List<User> users = List.of(testUser);
        when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(users));

        // When
        Page<UserResponse> result = userService.getAllUsers(Pageable.unpaged());

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("testuser", result.getContent().get(0).getUsername());
    }

    @Test
    @DisplayName("Összes felhasználó lekérése - üres lista")
    void testGetAllUsers_Empty() {
        // Given
        when(userRepository.findAll(any(Pageable.class))).thenReturn(Page.empty());

        // When
        Page<UserResponse> result = userService.getAllUsers(Pageable.unpaged());

        // Then
        assertTrue(result.getContent().isEmpty());
    }

    // ============ GET USER BY ID TESTS ============

    @Test
    @DisplayName("Felhasználó lekérése ID-vel - sikeres")
    void testGetUserById_Success() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));

        // When
        UserResponse response = userService.getUserById(1);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getUserId());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
    }

    @Test
    @DisplayName("Felhasználó lekérése ID-vel - nem található")
    void testGetUserById_NotFound() {
        // Given
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserById(999));
    }

    // ============ GET USER BY USERNAME TESTS ============

    @Test
    @DisplayName("Felhasználó lekérése felhasználónévvel - sikeres")
    void testGetUserByUsername_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When
        UserResponse response = userService.getUserByUsername("testuser");

        // Then
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
    }

    @Test
    @DisplayName("Felhasználó lekérése felhasználónévvel - nem található")
    void testGetUserByUsername_NotFound() {
        // Given
        when(userRepository.findByUsername("notexists")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserByUsername("notexists"));
    }

    // ============ VERIFY CURRENT PASSWORD TESTS ============

    @Test
    @DisplayName("Jelszó ellenőrzés - helyes jelszó")
    void testVerifyCurrentPassword_Success() {
        // Given
        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("rawpassword", "encoded_password")).thenReturn(true);

        // When & Then
        assertDoesNotThrow(() -> userService.verifyCurrentPassword(1, "rawpassword"));
    }

    @Test
    @DisplayName("Jelszó ellenőrzés - helytelen jelszó")
    void testVerifyCurrentPassword_WrongPassword() {
        // Given
        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("wrongpassword", "encoded_password")).thenReturn(false);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.verifyCurrentPassword(1, "wrongpassword"));
    }

    @Test
    @DisplayName("Jelszó ellenőrzés - UserAuth nem található")
    void testVerifyCurrentPassword_UserAuthNotFound() {
        // Given
        when(userAuthRepository.findByUser_UserId(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> userService.verifyCurrentPassword(999, "anypassword"));
    }

    // ============ CHANGE PASSWORD TESTS ============

    @Test
    @DisplayName("Jelszóváltoztatás - sikeres")
    void testChangeCurrentPassword_Success() {
        // Given
        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("oldpassword")
                .newPassword("newpassword123")
                .confirmPassword("newpassword123")
                .build();

        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("oldpassword", "encoded_password")).thenReturn(true);
        when(passwordEncoder.encode("newpassword123")).thenReturn("new_encoded_password");
        when(userAuthRepository.save(any(UserAuth.class))).thenReturn(testUserAuth);

        // When
        assertDoesNotThrow(() -> userService.changeCurrentPassword(1, request));

        // Then
        verify(userAuthRepository, times(1)).save(argThat(ua ->
                ua.getPasswordHash().equals("new_encoded_password")
        ));
    }

    @Test
    @DisplayName("Jelszóváltoztatás - az új jelszavak nem egyeznek")
    void testChangeCurrentPassword_PasswordMismatch() {
        // Given
        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("oldpassword")
                .newPassword("newpassword123")
                .confirmPassword("different")
                .build();

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.changeCurrentPassword(1, request));

        verify(userAuthRepository, never()).save(any(UserAuth.class));
    }

    @Test
    @DisplayName("Jelszóváltoztatás - helytelen jelenlegi jelszó")
    void testChangeCurrentPassword_WrongCurrentPassword() {
        // Given
        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("wrongpassword")
                .newPassword("newpassword123")
                .confirmPassword("newpassword123")
                .build();

        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("wrongpassword", "encoded_password")).thenReturn(false);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.changeCurrentPassword(1, request));

        verify(userAuthRepository, never()).save(any(UserAuth.class));
    }

    // ============ UPDATE PROFILE TESTS ============

    @Test
    @DisplayName("Profil frissítése - sikeres")
    void testUpdateCurrentUserProfile_Success() {
        // Given
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .email("newemail@example.com")
                .phone("0987654321")
                .currentPassword("rawpassword")
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("rawpassword", "encoded_password")).thenReturn(true);
        when(userRepository.existsByEmailAndUserIdNot("newemail@example.com", 1)).thenReturn(false);
        when(userRepository.existsByPhoneAndUserIdNot("0987654321", 1)).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        UserResponse response = userService.updateCurrentUserProfile(1, request);

        // Then
        assertNotNull(response);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Profil frissítése - helytelen jelszó")
    void testUpdateCurrentUserProfile_WrongPassword() {
        // Given
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .email("newemail@example.com")
                .phone("0987654321")
                .currentPassword("wrongpassword")
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("wrongpassword", "encoded_password")).thenReturn(false);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.updateCurrentUserProfile(1, request));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Profil frissítése - email már foglalt")
    void testUpdateCurrentUserProfile_EmailAlreadyTaken() {
        // Given
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .email("taken@example.com")
                .phone("1234567890")
                .currentPassword("rawpassword")
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("rawpassword", "encoded_password")).thenReturn(true);
        when(userRepository.existsByEmailAndUserIdNot("taken@example.com", 1)).thenReturn(true);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.updateCurrentUserProfile(1, request));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Profil frissítése - telefonszám már foglalt")
    void testUpdateCurrentUserProfile_PhoneAlreadyTaken() {
        // Given
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .email("test@example.com")  // same email – no email conflict
                .phone("9999999999")
                .currentPassword("rawpassword")
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(userAuthRepository.findByUser_UserId(1)).thenReturn(Optional.of(testUserAuth));
        when(passwordEncoder.matches("rawpassword", "encoded_password")).thenReturn(true);
        when(userRepository.existsByPhoneAndUserIdNot("9999999999", 1)).thenReturn(true);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.updateCurrentUserProfile(1, request));

        verify(userRepository, never()).save(any(User.class));
    }

    // ============ DELETE USER TESTS ============

    @Test
    @DisplayName("Felhasználó törlése - sikeres")
    void testDeleteUser_Success() {
        // Given
        User otherUser = User.builder()
                .userId(2)
                .username("otheruser")
                .email("other@example.com")
                .phone("0000000000")
                .build();

        UserAuth otherUserAuth = UserAuth.builder()
                .authId(2)
                .user(otherUser)
                .passwordHash("encoded")
                .role(userRole)
                .build();
        otherUser.setUserAuth(otherUserAuth);

        when(userRepository.findById(2)).thenReturn(Optional.of(otherUser));

        // When
        assertDoesNotThrow(() -> userService.deleteUser(2, 1));

        // Then
        verify(userRepository, times(1)).deleteById(2);
    }

    @Test
    @DisplayName("Felhasználó törlése - nem található")
    void testDeleteUser_NotFound() {
        // Given
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> userService.deleteUser(999, 1));

        verify(userRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Felhasználó törlése - saját magát törli")
    void testDeleteUser_SelfDelete() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.deleteUser(1, 1));

        verify(userRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Felhasználó törlése - admin törlési kísérlete")
    void testDeleteUser_CannotDeleteAdmin() {
        // Given
        Role adminRole = Role.builder()
                .roleId(2)
                .name("ADMIN")
                .description("Admin role")
                .build();

        User adminUser = User.builder()
                .userId(2)
                .username("anotheradmin")
                .email("admin2@example.com")
                .phone("9999999999")
                .build();

        UserAuth adminUserAuth = UserAuth.builder()
                .authId(2)
                .user(adminUser)
                .passwordHash("encoded")
                .role(adminRole)
                .build();
        adminUser.setUserAuth(adminUserAuth);

        when(userRepository.findById(2)).thenReturn(Optional.of(adminUser));

        // When & Then
        assertThrows(BadRequestException.class,
                () -> userService.deleteUser(2, 1));

        verify(userRepository, never()).deleteById(any());
    }
}