package hu.softdream.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Memóriában tárolt JWT token tiltólista.
 * A visszavont token JTI-k az elévülésükig maradnak meg, ezután
 * már nincs rájuk szükség, mert maga a token is érvénytelen lenne.
 *
 * <p>Megjegyzés: Ez a megvalósítás csak egy példány esetén működik. Klaszteres
 * környezetben megosztott tárat (pl. Redis) érdemes használni.
 */
@Service
public class TokenBlacklistService {

    /** A token JTI-ket az elévülési időhöz rendeli (epoch milliszekundumban). */
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    /**
     * Hozzáad egy tokent a tiltólistához.
     *
     * @param jti            a token JWT ID claim értéke
     * @param expirationMs   a token lejárati ideje epoch milliszekundumban
     */
    public void revoke(String jti, long expirationMs) {
        purgeExpired();
        blacklist.put(jti, expirationMs);
    }

    /**
     * {@code true}-t ad vissza, ha a megadott JTI vissza lett vonva.
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

    /** Eltávolítja az összes bejegyzést, amelynek tokenje már lejárt. */
    private void purgeExpired() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}