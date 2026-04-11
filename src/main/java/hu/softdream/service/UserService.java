package hu.softdream.service;

import hu.softdream.dto.response.UserResponse;
import hu.softdream.entity.User;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    public UserResponse getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott azonosítóval: " + userId));
        return convertToResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott felhasználónévvel: " + username));
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
