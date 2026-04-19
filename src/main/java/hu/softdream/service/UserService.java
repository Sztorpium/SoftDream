package hu.softdream.service;

import hu.softdream.dto.request.PasswordChangeRequest;
import hu.softdream.dto.request.ProfileUpdateRequest;
import hu.softdream.dto.response.UserResponse;
import hu.softdream.entity.User;
import hu.softdream.entity.UserAuth;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.repository.UserAuthRepository;
import hu.softdream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott azonosítóval: " + userId));
        return convertToResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott felhasználónévvel: " + username));
        return convertToResponse(user);
    }

    @Transactional(readOnly = true)
    public void verifyCurrentPassword(Integer userId, String password) {
        UserAuth userAuth = userAuthRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó hitelesítése nem található."));

        if (!passwordEncoder.matches(password, userAuth.getPasswordHash())) {
            throw new BadRequestException("A megadott jelszó helytelen.");
        }
    }

    @Transactional
    public void changeCurrentPassword(Integer userId, PasswordChangeRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Az új jelszavak nem egyeznek.");
        }

        UserAuth userAuth = userAuthRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó hitelesítése nem található."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), userAuth.getPasswordHash())) {
            throw new BadRequestException("A megadott jelenlegi jelszó helytelen.");
        }

        userAuth.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userAuthRepository.save(userAuth);
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(Integer userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott azonosítóval: " + userId));

        UserAuth userAuth = userAuthRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó hitelesítése nem található."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), userAuth.getPasswordHash())) {
            throw new BadRequestException("A megadott jelszó helytelen.");
        }

        String nextEmail = request.getEmail().trim();
        String nextPhone = request.getPhone().trim();

        boolean emailChanged = !user.getEmail().equals(nextEmail);
        boolean phoneChanged = !user.getPhone().equals(nextPhone);

        if (emailChanged && userRepository.existsByEmailAndUserIdNot(nextEmail, userId)) {
            throw new BadRequestException("Ezzel az email címmel már regisztráltak fiókot!");
        }
        if (phoneChanged && userRepository.existsByPhoneAndUserIdNot(nextPhone, userId)) {
            throw new BadRequestException("Ezzel a telefonszámmal már regisztráltak fiókot!");
        }

        user.setEmail(nextEmail);
        user.setPhone(nextPhone);
        userRepository.save(user);

        return convertToResponse(user);
    }

    public void deleteUser(Integer userId, Integer requestingUserId) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott azonosítóval: " + userId));
        if (userId.equals(requestingUserId)) {
            throw new BadRequestException("Saját magát nem törölheti.");
        }
        String targetRole = target.getUserAuth() != null ? target.getUserAuth().getRole().getName() : null;
        if ("ADMIN".equals(targetRole)) {
            throw new BadRequestException("Más admin felhasználót nem törölhet.");
        }

        userRepository.deleteById(userId);
    }

    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getUserAuth() != null ? user.getUserAuth().getRole().getName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
