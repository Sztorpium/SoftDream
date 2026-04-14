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
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final Environment environment;

    /** Comma-separated allowed CORS origins; set CORS_ALLOWED_ORIGINS env var in production. */
    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:4200,http://localhost:8080,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:4200}")
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
                            // PUBLIC ENDPOINTS - Authentication
                            // ========================================
                            .requestMatchers("/auth/**").permitAll()
                            .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                            .requestMatchers("/api/auth/logout").authenticated()

                            // ========================================
                            // PUBLIC ENDPOINTS - Rooms (GET only)
                            // ========================================
                            .requestMatchers(HttpMethod.GET, "/rooms/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()

                            // ========================================
                            // PUBLIC ENDPOINTS - Reviews (GET only, my-reviews requires auth)
                            // ========================================

                            .requestMatchers(HttpMethod.GET, "/reviews/**").permitAll()
                            // IMPORTANT: this rule must come before the general GET permit below,
                            // so that /api/reviews/my-reviews requires authentication.
                            .requestMatchers("/api/reviews/my-reviews").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                            // ========================================
                            // PUBLIC ENDPOINTS - Swagger/OpenAPI/Documentation
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
                            // PUBLIC ENDPOINTS - Actuator Health Check only
                            // ========================================
                            .requestMatchers("/actuator/health").permitAll()
                            .requestMatchers("/actuator/**").hasRole("ADMIN");

                    // ========================================
                    // H2 Console - Development profile only
                    // ========================================
                    if (isDevProfile) {
                        auth.requestMatchers("/h2-console/**").permitAll();
                    }

                    auth
                            // ========================================
                            // PROTECTED ENDPOINTS - Bookings (Authenticated Users)
                            // ========================================
                            .requestMatchers("/api/bookings/**").authenticated()
                            .requestMatchers("/api/users/**").authenticated()

                            // ========================================
                            // ADMIN ENDPOINTS
                            // ========================================
                            .requestMatchers("/api/admin/**").hasRole("ADMIN")

                            // ========================================
                            // ALL OTHER ENDPOINTS - Require Authentication
                            // ========================================
                            .anyRequest().authenticated();
                })
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // Disable X-Frame-Options only in dev (needed for H2 Console iframe)
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
     * CORS Configuration - origins loaded from application properties.
     * Override via CORS_ALLOWED_ORIGINS environment variable in production.
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
     * Authentication Provider - Database-based authentication
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Authentication Manager - For login/authentication
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Password Encoder - BCrypt hashing
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}