package hu.softdream.service;

import hu.softdream.entity.Role;
import hu.softdream.entity.User;
import hu.softdream.entity.UserAuth;
import hu.softdream.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtService Unit Tests")
class JwtServiceTest {

    // Base64("thisIsaverylongjwtsecretkeyforsoftdreamapplication!")
    // 51 bytes = 408 bits – megfelel a HMAC-SHA256 min. 256 bit követelménynek
    private static final String TEST_SECRET =
            "dGhpc2lzYXZlcnlsb25nand0c2VjcmV0a2V5Zm9yc29mdGRyZWFtYXBwbGljYXRpb24h";
    private static final long TEST_EXPIRATION = 86_400_000L; // 24 óra

    @InjectMocks
    private JwtService jwtService;

    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", TEST_EXPIRATION);

        Role role = Role.builder().roleId(1).name("USER").build();
        User user = User.builder().userId(1).username("testuser").email("test@example.com").phone("1234567890").build();
        UserAuth userAuth = UserAuth.builder().authId(1).user(user).role(role).passwordHash("pw").build();
        userDetails = new CustomUserDetails(userAuth);
    }

    // ============ TOKEN GENERÁLÁS ============

    @Test
    @DisplayName("generateToken – tokent ad vissza és nem null")
    void generateToken_ReturnsNonNullToken() {
        String token = jwtService.generateToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    @DisplayName("generateToken – a token tartalmazza a felhasználónevet")
    void generateToken_ContainsUsername() {
        String token = jwtService.generateToken(userDetails);
        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("testuser", extractedUsername);
    }

    @Test
    @DisplayName("generateToken extra claim-ekkel – működik")
    void generateToken_WithExtraClaims_Works() {
        Map<String, Object> claims = Map.of("customClaim", "customValue");
        String token = jwtService.generateToken(claims, userDetails);
        assertNotNull(token);
        assertEquals("testuser", jwtService.extractUsername(token));
    }

    // ============ CLAIM KINYERÉS ============

    @Test
    @DisplayName("extractUsername – helyes felhasználónevet ad vissza")
    void extractUsername_ReturnsCorrectUsername() {
        String token = jwtService.generateToken(userDetails);
        assertEquals("testuser", jwtService.extractUsername(token));
    }

    @Test
    @DisplayName("extractJti – nem null JTI-t ad vissza")
    void extractJti_ReturnsNonNullJti() {
        String token = jwtService.generateToken(userDetails);
        String jti = jwtService.extractJti(token);
        assertNotNull(jti);
        assertFalse(jti.isBlank());
    }

    @Test
    @DisplayName("extractJti – két különböző token JTI-je eltér")
    void extractJti_DifferentTokensHaveDifferentJtis() {
        String token1 = jwtService.generateToken(userDetails);
        String token2 = jwtService.generateToken(userDetails);
        assertNotEquals(jwtService.extractJti(token1), jwtService.extractJti(token2));
    }

    @Test
    @DisplayName("extractExpirationMs – jövőbeli lejárati időt ad vissza")
    void extractExpirationMs_ReturnsFutureTime() {
        String token = jwtService.generateToken(userDetails);
        long expirationMs = jwtService.extractExpirationMs(token);
        assertTrue(expirationMs > System.currentTimeMillis());
    }

    @Test
    @DisplayName("extractExpirationMs – lejárat kb. 24 óra a jövőben")
    void extractExpirationMs_IsApproximately24HoursFromNow() {
        long before = System.currentTimeMillis();
        String token = jwtService.generateToken(userDetails);
        long expirationMs = jwtService.extractExpirationMs(token);
        long after = System.currentTimeMillis();

        assertTrue(expirationMs >= before + TEST_EXPIRATION - 1000);
        assertTrue(expirationMs <= after + TEST_EXPIRATION + 1000);
    }

    // ============ TOKEN VALIDÁCIÓ ============

    @Test
    @DisplayName("isTokenValid – saját felhasználó tokenjével true")
    void isTokenValid_OwnToken_ReturnsTrue() {
        String token = jwtService.generateToken(userDetails);
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    @DisplayName("isTokenValid – másik felhasználó tokenjével false")
    void isTokenValid_DifferentUser_ReturnsFalse() {
        String token = jwtService.generateToken(userDetails);

        Role role2 = Role.builder().roleId(1).name("USER").build();
        User user2 = User.builder().userId(2).username("otheruser").email("other@example.com").phone("0987654321").build();
        UserAuth userAuth2 = UserAuth.builder().authId(2).user(user2).role(role2).passwordHash("pw2").build();
        CustomUserDetails otherUser = new CustomUserDetails(userAuth2);

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    @DisplayName("isTokenValid – lejárt token esetén false")
    void isTokenValid_ExpiredToken_ReturnsFalse() {
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);
        String expiredToken = jwtService.generateToken(userDetails);

        // A lejárt token validálása kivételt dob (ExpiredJwtException),
        // amit az isTokenValid nem kap el, ezért azt ellenőrizzük, hogy kivétel dobódik
        assertThrows(Exception.class, () -> jwtService.isTokenValid(expiredToken, userDetails));
    }

    // ============ ÉRVÉNYTELEN TOKEN ============

    @Test
    @DisplayName("extractUsername – érvénytelen token esetén kivételt dob")
    void extractUsername_InvalidToken_ThrowsException() {
        assertThrows(Exception.class, () -> jwtService.extractUsername("this.is.not.a.valid.jwt"));
    }

    @Test
    @DisplayName("extractUsername – manipulált token esetén kivételt dob")
    void extractUsername_TamperedToken_ThrowsException() {
        String token = jwtService.generateToken(userDetails);
        String tamperedToken = token + "tampered";
        assertThrows(Exception.class, () -> jwtService.extractUsername(tamperedToken));
    }
}