package hu.softdream.security;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Teszteléshez használt annotáció, amely egy {@link CustomUserDetails}-alapú
 * Spring Security kontextust hoz létre. A szerep ("USER" vagy "ADMIN") alapján
 * beállítja a megfelelő {@code ROLE_<role>} jogosultságot.
 *
 * <p>Példa:
 * <pre>{@code
 * @WithMockCustomUser(userId = 1, username = "testuser", role = "USER")
 * void myTest() { ... }
 * }</pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@WithSecurityContext(factory = WithMockCustomUserSecurityContextFactory.class)
public @interface WithMockCustomUser {
    int userId() default 1;
    String username() default "testuser";
    String email() default "test@example.com";
    String phone() default "1234567890";
    String role() default "USER";
}