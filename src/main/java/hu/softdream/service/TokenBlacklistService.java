package hu.softdream.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory JWT token blacklist.
 * Revoked token JTIs are kept until they expire, after which
 * they are no longer needed because the token itself would be invalid.
 *
 * <p>Note: This implementation is single-instance only. In a clustered
 * deployment a shared store (e.g. Redis) should be used instead.
 */
@Service
public class TokenBlacklistService {

    /** Maps token JTI → expiration time (epoch millis). */
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    /**
     * Adds a token to the blacklist.
     *
     * @param jti            the JWT ID claim of the token
     * @param expirationMs   the token's expiration time in epoch millis
     */
    public void revoke(String jti, long expirationMs) {
        purgeExpired();
        blacklist.put(jti, expirationMs);
    }

    /**
     * Returns {@code true} if the given JTI has been revoked.
     */
    public boolean isRevoked(String jti) {
        if (jti == null) {
            return false;
        }
        Long expiry = blacklist.get(jti);
        if (expiry == null) {
            return false;
        }
        if (System.currentTimeMillis() > expiry) {
            blacklist.remove(jti);
            return false;
        }
        return true;
    }

    /** Removes all entries whose tokens have already expired. */
    private void purgeExpired() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}
