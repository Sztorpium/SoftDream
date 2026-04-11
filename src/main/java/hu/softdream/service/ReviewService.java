package hu.softdream.service;

import hu.softdream.dto.request.ReviewRequest;
import hu.softdream.dto.response.ReviewResponse;
import hu.softdream.entity.Booking;
import hu.softdream.entity.Review;
import hu.softdream.entity.Room;
import hu.softdream.entity.User;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.repository.BookingRepository;
import hu.softdream.repository.ReviewRepository;
import hu.softdream.repository.RoomRepository;
import hu.softdream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public List<ReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        Map<String, Booking> bookingMap = buildBookingMap(bookingRepository.findAll());
        return reviews.stream()
                .map(r -> convertToResponse(r, bookingMap))
                .collect(Collectors.toList());
    }

    public ReviewResponse getReviewById(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Az értékelés nem található a megadott azonosítóval: " + reviewId));
        Booking booking = bookingRepository
                .findByUser_UserIdAndRoom_RoomId(review.getUser().getUserId(), review.getRoom().getRoomId())
                .stream()
                .max(Comparator.comparing(Booking::getCheckIn))
                .orElse(null);
        return convertToResponse(review, booking);
    }

    public List<ReviewResponse> getReviewsByRoomId(Integer roomId) {
        List<Review> reviews = reviewRepository.findByRoom_RoomId(roomId);
        Map<String, Booking> bookingMap = buildBookingMap(bookingRepository.findByRoom_RoomId(roomId));
        return reviews.stream()
                .map(r -> convertToResponse(r, bookingMap))
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByUserId(Integer userId) {
        List<Review> reviews = reviewRepository.findByUser_UserId(userId);
        Map<String, Booking> bookingMap = buildBookingMap(bookingRepository.findByUser_UserId(userId));
        return reviews.stream()
                .map(r -> convertToResponse(r, bookingMap))
                .collect(Collectors.toList());
    }

    public Double getAverageRatingByRoomId(Integer roomId) {
        return reviewRepository.findAverageRatingByRoomId(roomId);
    }

    @Transactional
    public ReviewResponse createReview(Integer userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott azonosítóval: " + userId));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("A szoba nem található a megadott azonosítóval: " + request.getRoomId()));

        boolean hasBooking = bookingRepository.findByUser_UserIdAndRoom_RoomId(userId, request.getRoomId())
                .stream()
                .anyMatch(b -> b.getStatus() == hu.softdream.entity.enums.BookingStatus.CONFIRMED
                        || b.getStatus() == hu.softdream.entity.enums.BookingStatus.CANCELLED);
        if (!hasBooking) {
            throw new hu.softdream.exception.BadRequestException(
                    "Csak olyan szobát értékelhet, amelyben már megszállt.");
        }

        Review review = Review.builder()
                .user(user)
                .room(room)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        Booking booking = bookingRepository
                .findByUser_UserIdAndRoom_RoomId(userId, request.getRoomId())
                .stream()
                .max(Comparator.comparing(Booking::getCheckIn))
                .orElse(null);
        return convertToResponse(savedReview, booking);
    }

    @Transactional
    public ReviewResponse updateReview(Integer reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Az értékelés nem található a megadott azonosítóval: " + reviewId));

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(review);
        Booking booking = bookingRepository
                .findByUser_UserIdAndRoom_RoomId(
                        updatedReview.getUser().getUserId(),
                        updatedReview.getRoom().getRoomId())
                .stream()
                .max(Comparator.comparing(Booking::getCheckIn))
                .orElse(null);
        return convertToResponse(updatedReview, booking);
    }

    public void deleteReview(Integer reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Az értékelés nem található a megadott azonosítóval: " + reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    // ---- helpers --------------------------------------------------------
    /**
     * Build a "userId|roomId" → most-recent-Booking map from the supplied list.
     * When a user has multiple bookings for the same room we keep the latest one.
     */
    private Map<String, Booking> buildBookingMap(List<Booking> bookings) {
        return bookings.stream()
                .collect(Collectors.toMap(
                        b -> b.getUser().getUserId() + "|" + b.getRoom().getRoomId(),
                        b -> b,
                        (a, b) -> a.getCheckIn().isBefore(b.getCheckIn()) ? b : a
                ));
    }
    private ReviewResponse convertToResponse(Review review, Map<String, Booking> bookingMap) {
        String key = review.getUser().getUserId() + "|" + review.getRoom().getRoomId();
        return convertToResponse(review, bookingMap != null ? bookingMap.get(key) : null);
    }
    private ReviewResponse convertToResponse(Review review, Booking booking) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .userId(review.getUser().getUserId())
                .username(review.getUser().getUsername())
                .roomId(review.getRoom().getRoomId())
                .roomNumber(review.getRoom().getRoomNumber())
                .rating(review.getRating())
                .comment(review.getComment())
                .checkIn(booking != null ? booking.getCheckIn() : null)
                .checkOut(booking != null ? booking.getCheckOut() : null)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
