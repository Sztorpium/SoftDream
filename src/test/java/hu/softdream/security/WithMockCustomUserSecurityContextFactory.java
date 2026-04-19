package hu.softdream.security;

import hu.softdream.entity.Role;
import hu.softdream.entity.User;
import hu.softdream.entity.UserAuth;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

/**
 * A {@link WithMockCustomUser} annotációhoz tartozó factory, amely
 * {@link CustomUserDetails} példányt épít fel és tárolja a SecurityContextben.
 */
public class WithMockCustomUserSecurityContextFactory
        implements WithSecurityContextFactory<WithMockCustomUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockCustomUser annotation) {
        Role role = Role.builder()
                .roleId(annotation.role().equals("ADMIN") ? 2 : 1)
                .name(annotation.role())
                .build();

        User user = User.builder()
                .userId(annotation.userId())
                .username(annotation.username())
                .email(annotation.email())
                .phone(annotation.phone())
                .build();

        UserAuth userAuth = UserAuth.builder()
                .authId(annotation.userId())
                .user(user)
                .role(role)
                .passwordHash("pw")
                .build();

        CustomUserDetails userDetails = new CustomUserDetails(userAuth);

        Authentication auth = UsernamePasswordAuthenticationToken.authenticated(
                userDetails, null, userDetails.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        return context;
    }
}