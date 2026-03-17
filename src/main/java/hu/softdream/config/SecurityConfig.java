package hu.softdream.config;

import hu.softdream.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // ========================================
                        // PUBLIC ENDPOINTS - Authentication
                        // ========================================
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // ========================================
                        // PUBLIC ENDPOINTS - Rooms & Reviews
                        // ========================================
                        .requestMatchers("/rooms/**").permitAll()
                        .requestMatchers("/api/rooms/**").permitAll()
                        .requestMatchers("/reviews/**").permitAll()
                        .requestMatchers("/api/reviews/**").permitAll()

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
                        // PUBLIC ENDPOINTS - H2 Console (Development)
                        // ========================================
                        .requestMatchers("/h2-console/**").permitAll()

                        // ========================================
                        // PUBLIC ENDPOINTS - Actuator Health Check
                        // ========================================
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()

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
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // H2 Console frame support (development only)
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }

    /**
     * CORS Configuration - Frontend hozzáférésének engedélyezése
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend URL-ek (fejlesztéshez)
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",      // React
                "http://localhost:5173",      // Vite
                "http://localhost:4200",      // Angular
                "http://localhost:8080",      // Backend (testing)
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:4200"
        ));

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