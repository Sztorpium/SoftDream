package hu.softdream.integration;

import hu.softdream.dto.request.LoginRequest;
import hu.softdream.dto.request.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integrációs tesztek az autentikációs végpontokhoz.
 *
 * <p>Lefedett végpontok:
 * <ul>
 *   <li>POST /api/auth/register</li>
 *   <li>POST /api/auth/login</li>
 *   <li>POST /api/auth/logout</li>
 * </ul>
 */
@DisplayName("Auth integrációs tesztek")
class AuthIntegrationTest extends AbstractIntegrationTest {

    // ── POST /api/auth/register ──────────────────────────────────────────────

    @Test
    @DisplayName("register – érvényes adatok → 201, JWT token és USER szerepkör")
    void register_validRequest_returns201AndToken() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .username("teszt_felhasznalo")
                .email("teszt@softdream.test")
                .phone(uniquePhone())
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.username").value("teszt_felhasznalo"))
                .andExpect(jsonPath("$.email").value("teszt@softdream.test"));
    }

    @Test
    @DisplayName("register – üres felhasználónév → 400")
    void register_blankUsername_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .username("")
                .email("teszt@softdream.test")
                .phone(uniquePhone())
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("register – érvénytelen e-mail formátum → 400")
    void register_invalidEmail_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .username("validuser")
                .email("nem-email-cim")
                .phone(uniquePhone())
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("register – túl rövid jelszó (< 6 karakter) → 400")
    void register_shortPassword_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .username("validuser")
                .email("validemail@softdream.test")
                .phone(uniquePhone())
                .password("abc")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("register – érvénytelen telefonszám formátum → 400")
    void register_invalidPhone_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .username("validuser")
                .email("validemail@softdream.test")
                .phone("nem-telefon")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("register – már foglalt felhasználónév → 400, hibaüzenet visszaadva")
    void register_duplicateUsername_returns400() throws Exception {
        String phone1 = uniquePhone();
        String phone2 = uniquePhone();

        // Első regisztráció – sikeresen lefut (a tranzakció végén visszagörget)
        registerAndGetToken("foglalt_nev", "elso@softdream.test", phone1, "password123");

        // Második regisztráció – ugyanaz a felhasználónév
        RegisterRequest dup = RegisterRequest.builder()
                .username("foglalt_nev")
                .email("masodik@softdream.test")
                .phone(phone2)
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("register – már foglalt e-mail cím → 400, hibaüzenet visszaadva")
    void register_duplicateEmail_returns400() throws Exception {
        String phone1 = uniquePhone();
        String phone2 = uniquePhone();

        // Első regisztráció – sikeresen lefut
        registerAndGetToken("felhasznaloA", "kozos@softdream.test", phone1, "password123");

        // Második regisztráció – ugyanaz az e-mail
        RegisterRequest dup = RegisterRequest.builder()
                .username("felhasznaloB")
                .email("kozos@softdream.test")
                .phone(phone2)
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────

    @Test
    @DisplayName("login – helyes hitelesítő adatok (seeded admin) → 200, JWT token és ADMIN szerepkör")
    void login_correctCredentials_returns200AndToken() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .username(ADMIN_USERNAME).password(ADMIN_PASSWORD)
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.username").value(ADMIN_USERNAME));
    }

    @Test
    @DisplayName("login – helytelen jelszó → 401")
    void login_wrongPassword_returns401() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .username(ADMIN_USERNAME).password("rossz_jelszo")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("login – nem létező felhasználó → 401")
    void login_nonExistentUser_returns401() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .username("nem_letezik_123").password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("login – üres felhasználónév → 400")
    void login_blankUsername_returns400() throws Exception {
        LoginRequest req = LoginRequest.builder().username("").password("password123").build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("login – üres jelszó → 400")
    void login_blankPassword_returns400() throws Exception {
        LoginRequest req = LoginRequest.builder().username(ADMIN_USERNAME).password("").build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ── POST /api/auth/logout ────────────────────────────────────────────────

    @Test
    @DisplayName("logout – érvényes tokennel → 204, token visszavonva")
    void logout_withValidToken_returns204() throws Exception {
        String token = adminToken();

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("logout – Authorization header nélkül → 401")
    void logout_withoutAuth_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("logout – frissen regisztrált felhasználó is sikeresen kijelentkezik → 204")
    void logout_newlyRegisteredUser_returns204() throws Exception {
        String token = registerAndGetToken(
                "kijelentkezo_user", "kijelentkezo@softdream.test",
                uniquePhone(), "password123");

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }
}