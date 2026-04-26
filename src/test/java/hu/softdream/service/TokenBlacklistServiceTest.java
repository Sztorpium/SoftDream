package hu.softdream.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("TokenBlacklistService Unit Tests")
class TokenBlacklistServiceTest {

    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistService();
    }

    // ============ isRevoked – alap esetek ============

    @Test
    @DisplayName("isRevoked – nem visszavont JTI esetén false")
    void isRevoked_NotRevoked_ReturnsFalse() {
        assertFalse(tokenBlacklistService.isRevoked("unknown-jti"));
    }

    @Test
    @DisplayName("isRevoked – null JTI esetén false")
    void isRevoked_NullJti_ReturnsFalse() {
        assertFalse(tokenBlacklistService.isRevoked(null));
    }

    @Test
    @DisplayName("isRevoked – visszavont JTI esetén true")
    void isRevoked_AfterRevoke_ReturnsTrue() {
        long futureExpiry = System.currentTimeMillis() + 60_000L;
        tokenBlacklistService.revoke("jti-abc", futureExpiry);
        assertTrue(tokenBlacklistService.isRevoked("jti-abc"));
    }

    @Test
    @DisplayName("isRevoked – visszavont JTI egyszer true, utána is true (idempotens)")
    void isRevoked_CalledTwice_StillTrue() {
        long futureExpiry = System.currentTimeMillis() + 60_000L;
        tokenBlacklistService.revoke("jti-xyz", futureExpiry);
        assertTrue(tokenBlacklistService.isRevoked("jti-xyz"));
        assertTrue(tokenBlacklistService.isRevoked("jti-xyz"));
    }

    // ============ Lejárt token automatikus eltávolítása ============

    @Test
    @DisplayName("isRevoked – már lejárt bejegyzés esetén false (automatikus purge)")
    void isRevoked_ExpiredEntry_ReturnsFalse() {
        // A token lejárt a múltban
        long pastExpiry = System.currentTimeMillis() - 1L;
        tokenBlacklistService.revoke("jti-expired", pastExpiry);
        assertFalse(tokenBlacklistService.isRevoked("jti-expired"));
    }

    // ============ revoke – purge viselkedés ============

    @Test
    @DisplayName("revoke – lejárt bejegyzések törlődnek az újabb revoke híváskor")
    void revoke_PurgesExpiredEntriesOnNextRevoke() {
        long pastExpiry = System.currentTimeMillis() - 1L;
        tokenBlacklistService.revoke("jti-old", pastExpiry);

        // Új revoke hívás: a purgeExpired lefut
        long futureExpiry = System.currentTimeMillis() + 60_000L;
        tokenBlacklistService.revoke("jti-new", futureExpiry);

        // A lejárt bejegyzés már nem érvényes
        assertFalse(tokenBlacklistService.isRevoked("jti-old"));
        // Az új bejegyzés érvényes
        assertTrue(tokenBlacklistService.isRevoked("jti-new"));
    }

    @Test
    @DisplayName("revoke – felülírja a korábbi bejegyzést azonos JTI-vel")
    void revoke_OverwritesSameJti() {
        long futureExpiry = System.currentTimeMillis() + 60_000L;
        tokenBlacklistService.revoke("jti-dup", futureExpiry);
        assertTrue(tokenBlacklistService.isRevoked("jti-dup"));

        // Felülírás jövőbeli lejárattal – még mindig true
        tokenBlacklistService.revoke("jti-dup", futureExpiry + 10_000L);
        assertTrue(tokenBlacklistService.isRevoked("jti-dup"));
    }

    // ============ Több JTI ============

    @Test
    @DisplayName("isRevoked – több visszavont JTI egymástól függetlenül kezelt")
    void isRevoked_MultipleJtis_IndependentlyTracked() {
        long futureExpiry = System.currentTimeMillis() + 60_000L;
        tokenBlacklistService.revoke("jti-1", futureExpiry);
        tokenBlacklistService.revoke("jti-2", futureExpiry);

        assertTrue(tokenBlacklistService.isRevoked("jti-1"));
        assertTrue(tokenBlacklistService.isRevoked("jti-2"));
        assertFalse(tokenBlacklistService.isRevoked("jti-3"));
    }
}