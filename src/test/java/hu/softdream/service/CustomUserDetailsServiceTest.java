package hu.softdream.service;

import hu.softdream.entity.Role;
import hu.softdream.entity.User;
import hu.softdream.entity.UserAuth;
import hu.softdream.repository.UserAuthRepository;
import hu.softdream.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomUserDetailsService Unit Tests")
class CustomUserDetailsServiceTest {

    @Mock
    private UserAuthRepository userAuthRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private UserAuth testUserAuth;

    @BeforeEach
    void setUp() {
        Role role = Role.builder().roleId(1).name("USER").build();
        User user = User.builder()
                .userId(1)
                .username("testuser")
                .email("test@example.com")
                .phone("1234567890")
                .build();
        testUserAuth = UserAuth.builder()
                .authId(1)
                .user(user)
                .role(role)
                .passwordHash("hashedpassword")
                .build();
    }

    @Test
    @DisplayName("loadUserByUsername – létező felhasználó esetén CustomUserDetails-t ad vissza")
    void loadUserByUsername_ExistingUser_ReturnsCustomUserDetails() {
        when(userAuthRepository.findByUser_Username("testuser")).thenReturn(Optional.of(testUserAuth));

        UserDetails result = customUserDetailsService.loadUserByUsername("testuser");

        assertNotNull(result);
        assertInstanceOf(CustomUserDetails.class, result);
        assertEquals("testuser", result.getUsername());
        assertEquals("hashedpassword", result.getPassword());
        assertTrue(result.isEnabled());
        assertTrue(result.isAccountNonExpired());
        assertTrue(result.isAccountNonLocked());
    }

    @Test
    @DisplayName("loadUserByUsername – helyes szerepkör az authoritiesban")
    void loadUserByUsername_ExistingUser_HasCorrectAuthority() {
        when(userAuthRepository.findByUser_Username("testuser")).thenReturn(Optional.of(testUserAuth));

        UserDetails result = customUserDetailsService.loadUserByUsername("testuser");

        assertTrue(result.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    @DisplayName("loadUserByUsername – nem létező felhasználó esetén UsernameNotFoundException")
    void loadUserByUsername_NonExistingUser_ThrowsUsernameNotFoundException() {
        when(userAuthRepository.findByUser_Username("unknown")).thenReturn(Optional.empty());

        UsernameNotFoundException ex = assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername("unknown")
        );

        assertTrue(ex.getMessage().contains("unknown"));
        verify(userAuthRepository, times(1)).findByUser_Username("unknown");
    }

    @Test
    @DisplayName("loadUserByUsername – admin felhasználó esetén ROLE_ADMIN authority")
    void loadUserByUsername_AdminUser_HasAdminAuthority() {
        Role adminRole = Role.builder().roleId(2).name("ADMIN").build();
        User adminUser = User.builder()
                .userId(2)
                .username("admin")
                .email("admin@example.com")
                .phone("9876543210")
                .build();
        UserAuth adminAuth = UserAuth.builder()
                .authId(2)
                .user(adminUser)
                .role(adminRole)
                .passwordHash("adminpw")
                .build();

        when(userAuthRepository.findByUser_Username("admin")).thenReturn(Optional.of(adminAuth));

        UserDetails result = customUserDetailsService.loadUserByUsername("admin");

        assertTrue(result.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("loadUserByUsername – repository pontosan egyszer hívódik")
    void loadUserByUsername_RepositoryCalledOnce() {
        when(userAuthRepository.findByUser_Username("testuser")).thenReturn(Optional.of(testUserAuth));

        customUserDetailsService.loadUserByUsername("testuser");

        verify(userAuthRepository, times(1)).findByUser_Username("testuser");
    }
}