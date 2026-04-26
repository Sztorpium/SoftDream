package hu.softdream.security;

import hu.softdream.service.JwtService;
import hu.softdream.service.TokenBlacklistService;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import jakarta.servlet.FilterChain;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter Unit Tests")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private FilterChain filterChain;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("doFilter - expired token esetén nem dob kivételt, továbbengedi a láncot")
    void doFilter_ExpiredToken_DoesNotThrowAndContinuesFilterChain() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userDetailsService, tokenBlacklistService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer expired-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.extractUsername("expired-token"))
                .thenThrow(new ExpiredJwtException(null, null, "Token expired"));

        assertDoesNotThrow(() -> filter.doFilter(request, response, filterChain));

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(userDetailsService, tokenBlacklistService);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}