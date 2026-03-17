package hu.softdream.service;

import hu.softdream.dto.request.LoginRequest;
import hu.softdream.dto.request.RegisterRequest;
import hu.softdream.dto.response.AuthResponse;
import hu.softdream.entity.Role;
import hu.softdream.entity.User;
import hu.softdream.entity.UserAuth;
import hu.softdream.exception.BadRequestException;
import hu.softdream.repository.RoleRepository;
import hu.softdream.repository.UserAuthRepository;
import hu.softdream.repository.UserRepository;
import hu.softdream.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validációk
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("A felhasználónév már létezik!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Ezzel az email címmel már regisztráltak fiókot!");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Ezzel a telefonszámmal már regisztráltak fiókot!");
        }

        // User létrehozása
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();

        User savedUser = userRepository.save(user);

        // Role lekérése (alapértelmezett: USER)
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .name("USER")
                            .description("Standard user role")
                            .build();
                    return roleRepository.save(newRole);
                });

        // UserAuth létrehozása
        UserAuth userAuth = UserAuth.builder()
                .user(savedUser)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .build();

        userAuthRepository.save(userAuth);

        // JWT token generálás
        CustomUserDetails userDetails = new CustomUserDetails(userAuth);
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(userRole.getName())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Autentikáció
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // JWT token generálás
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(userDetails.getUserId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .build();
    }

}
