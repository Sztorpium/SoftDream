package hu.softdream.controller;

import hu.softdream.dto.request.ReviewRequest;
import hu.softdream.dto.response.ReviewResponse;
import hu.softdream.security.CustomUserDetails;
import hu.softdream.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Reviews", description = "Review management APIs")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all reviews")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{reviewId}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Integer reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    @GetMapping("/room/{roomId}")
    @Operation(summary = "Get reviews by room ID")
    public ResponseEntity<List<ReviewResponse>> getReviewsByRoomId(@PathVariable Integer roomId) {
        return ResponseEntity.ok(reviewService.getReviewsByRoomId(roomId));
    }

    @GetMapping("/room/{roomId}/average-rating")
    @Operation(summary = "Get average rating for a room")
    public ResponseEntity<Double> getAverageRating(@PathVariable Integer roomId) {
        return ResponseEntity.ok(reviewService.getAverageRatingByRoomId(roomId));
    }

    @GetMapping("/my-reviews")
    @Operation(summary = "Get current user's reviews")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(userDetails.getUserId()));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get reviews by user ID (Admin only)")
    public ResponseEntity<List<ReviewResponse>> getReviewsByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
    }

    @PostMapping
    @Operation(summary = "Create a new review")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewRequest request
    ) {
        ReviewResponse response = reviewService.createReview(userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{reviewId}")
    @Operation(summary = "Update review")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete review (Admin only)")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
