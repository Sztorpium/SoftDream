package hu.softdream.config;

import hu.softdream.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final Environment environment;

    /** Vesszővel elválasztott engedélyezett CORS originek; éles környezetben állítsd be a CORS_ALLOWED_ORIGINS környezeti változót. */
    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:4200,http://localhost:8080,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:4200}")
    private String allowedOriginsRaw;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isDevProfile = Arrays.asList(environment.getActiveProfiles()).contains("dev");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> {
                    auth
                            // ========================================
                            // PUBLIKUS VÉGPONTOK - Hitelesítés
                            // ========================================
                            .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                            .requestMatchers("/api/auth/logout").authenticated()

                            // ========================================
                            // PUBLIKUS VÉGPONTOK - Szobák (csak lekérdezés/GET)
                            // ========================================
                            .requestMatchers(HttpMethod.GET, "/rooms/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()

                            // ========================================
                            // PUBLIKUS VÉGPONTOK - Értékelések (csak lekérdezés/GET, a my-reviews hitelesítést igényel)
                            // ========================================

                            .requestMatchers(HttpMethod.GET, "/reviews/**").permitAll()
                            // FONTOS: ennek a szabálynak az alábbi általános lekérdezési/GET engedélyezés előtt kell szerepelnie,
                            // így az /api/reviews/my-reviews hitelesítést igényel.
                            .requestMatchers("/api/reviews/my-reviews").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                            // ========================================
                            // PUBLIKUS VÉGPONTOK - Swagger/OpenAPI/Dokumentáció
                            // ========================================
                            .requestMatchers(
                                    "/swagger-ui/**",
                                    "/swagger-ui.html",
                                    "/v3/api-docs/**",
                                    "/api-docs/**",
                                    "/swagger-resources/**",
                                    "/configuration/**",
                                    "/webjars/**"
                            ).permitAll()

                            // ========================================
                            // PUBLIKUS VÉGPONTOK - csak Actuator health ellenőrzés
                            // ========================================
                            .requestMatchers("/actuator/health").permitAll()
                            .requestMatchers("/actuator/**").hasRole("ADMIN");

                    // ========================================
                    // H2 konzol - csak fejlesztői profilban
                    // ========================================
                    if (isDevProfile) {
                        auth.requestMatchers("/h2-console/**").permitAll();
                    }

                    auth
                            // ========================================
                            // VÉDETT VÉGPONTOK - Foglalások (hitelesített felhasználók)
                            // ========================================
                            .requestMatchers("/api/bookings/**").authenticated()
                            .requestMatchers("/api/users/**").authenticated()

                            // ========================================
                            // ADMIN VÉGPONTOK
                            // ========================================
                            .requestMatchers("/api/admin/**").hasRole("ADMIN")

                            // ========================================
                            // MINDEN MÁS VÉGPONT - Hitelesítés szükséges
                            // ========================================
                            .anyRequest().authenticated();
                })
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                // Az X-Frame-Options csak dev környezetben legyen tiltva (szükséges a H2 konzol iframe-hez)
                .headers(headers -> {
                    if (!isDevProfile) {
                        headers.frameOptions(frameOptions -> frameOptions.deny());
                    } else {
                        headers.frameOptions(frameOptions -> frameOptions.disable());
                    }
                });

        return http.build();
    }

    /**
     * CORS konfiguráció - az originek az alkalmazás tulajdonságaiból töltődnek be.
     * Éles környezetben a CORS_ALLOWED_ORIGINS környezeti változóval felülírható.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> allowedOrigins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "X-CSRF-Token"
        ));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Hitelesítési szolgáltató - adatbázis alapú hitelesítés.
     * @Bean-ként van kitéve, hogy mind a HTTP szűrőlánc, mind az
     * explicit AuthenticationManager ugyanazt a singleton példányt használja.
     */

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Hitelesítéskezelő - bejelentkezéshez/hitelesítéshez.
     * Kifejezetten létrehoz egy ProviderManager-t a saját DaoAuthenticationProvider példányunkkal
     * ahelyett, hogy a Spring Security automatikus konfigurációjára hagyatkozna, ami
     * bizonyos Spring Boot 3.x felállásokban nem regisztrálja a szolgáltatót.
     */
    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(authenticationProvider());
    }

    /**
     * Jelszó-kódoló - BCrypt hash-elés
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}