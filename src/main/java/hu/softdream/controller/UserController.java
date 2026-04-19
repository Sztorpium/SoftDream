package hu.softdream.controller;

import hu.softdream.dto.response.UserResponse;
import hu.softdream.dto.request.PasswordChangeRequest;
import hu.softdream.dto.request.ProfileUpdateRequest;
import hu.softdream.dto.request.PasswordVerifyRequest;
import hu.softdream.exception.BadRequestException;
import hu.softdream.security.CustomUserDetails;
import hu.softdream.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private static final String ROLE_ADMIN = "ADMIN";

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(userService.getUserById(principal.getUserId()));
    }

    @PostMapping("/me/verify-password")
    @Operation(summary = "Verify current user password")
    public ResponseEntity<Void> verifyCurrentUserPassword(
            @Valid @RequestBody PasswordVerifyRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        userService.verifyCurrentPassword(principal.getUserId(), request.getPassword());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<Void> changeCurrentUserPassword(
            @Valid @RequestBody PasswordChangeRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        userService.changeCurrentPassword(principal.getUserId(), request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateCurrentUserProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(userService.updateCurrentUserProfile(principal.getUserId(), request));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID (admin or own data)")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable("userId") Integer userId,
            @AuthenticationPrincipal CustomUserDetails principal) {
        boolean isAdmin = ROLE_ADMIN.equals(principal.getRole());
        if (!isAdmin && !principal.getUserId().equals(userId)) {
            throw new BadRequestException("Nincs jogosultsága megtekinteni ezt a felhasználót.");
        }
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Get user by username (admin or own data)")
    public ResponseEntity<UserResponse> getUserByUsername(
            @PathVariable("username") String username,
            @AuthenticationPrincipal CustomUserDetails principal) {
        boolean isAdmin = ROLE_ADMIN.equals(principal.getRole());
        if (!isAdmin && !principal.getUsername().equals(username)) {
            throw new BadRequestException("Nincs jogosultsága megtekinteni ezt a felhasználót.");
        }
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user (Admin only)")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("userId") Integer userId,
            @AuthenticationPrincipal CustomUserDetails principal) {
        userService.deleteUser(userId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
