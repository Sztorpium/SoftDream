package hu.softdream.service;

import hu.softdream.dto.request.ReviewRequest;
import hu.softdream.dto.response.ReviewResponse;
import hu.softdream.entity.Booking;
import hu.softdream.entity.Review;
import hu.softdream.entity.Room;
import hu.softdream.entity.RoomStatus;
import hu.softdream.entity.RoomType;
import hu.softdream.entity.User;
import hu.softdream.entity.enums.BookingStatus;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.repository.BookingRepository;
import hu.softdream.repository.ReviewRepository;
import hu.softdream.repository.RoomRepository;
import hu.softdream.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService Unit Tests")
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private Room testRoom;
    private Review testReview;
    private Booking confirmedBooking;
    private ReviewRequest validReviewRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1)
                .username("testuser")
                .email("test@example.com")
                .phone("1234567890")
                .build();

        RoomType singleType = RoomType.builder()
                .roomTypeId(1)
                .name("SINGLE")
                .basePrice(new BigDecimal("35000"))
                .description("Egyágyas szoba - 1 fő")
                .build();

        RoomStatus availableStatus = RoomStatus.builder()
                .roomStatusId(1)
                .name("AVAILABLE")
                .description("Szoba elérhető")
                .build();

        testRoom = Room.builder()
                .roomId(1)
                .roomNumber("101")
                .floor(1)
                .roomType(singleType)
                .roomStatus(availableStatus)
                .maxGuests(1)
                .build();

        testReview = Review.builder()
                .reviewId(1)
                .user(testUser)
                .room(testRoom)
                .rating(5)
                .comment("Kiváló szoba!")
                .createdAt(LocalDateTime.now())
                .build();

        confirmedBooking = Booking.builder()
                .bookingId(1)
                .user(testUser)
                .room(testRoom)
                .checkIn(LocalDate.of(2026, 3, 1))
                .checkOut(LocalDate.of(2026, 3, 3))
                .status(BookingStatus.CONFIRMED)
                .build();

        validReviewRequest = ReviewRequest.builder()
                .roomId(1)
                .rating(5)
                .comment("Kiváló szoba!")
                .build();
    }

    // ============ GET ALL REVIEWS TESTS ============

    @Test
    @DisplayName("Összes értékelés lekérése - sikeres")
    void testGetAllReviews_Success() {
        // Given
        when(reviewRepository.findAll()).thenReturn(List.of(testReview));
        when(bookingRepository.findByUserIdsAndRoomIds(anyList(), anyList()))
                .thenReturn(List.of(confirmedBooking));

        // When
        List<ReviewResponse> result = reviewService.getAllReviews();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUsername());
        assertEquals(5, result.get(0).getRating());
    }

    @Test
    @DisplayName("Összes értékelés lekérése - üres lista")
    void testGetAllReviews_Empty() {
        // Given
        when(reviewRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<ReviewResponse> result = reviewService.getAllReviews();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        // Ha üres lista, a bookingRepository-t nem kell hívni
        verify(bookingRepository, never()).findByUserIdsAndRoomIds(anyList(), anyList());
    }

    // ============ GET REVIEW BY ID TESTS ============

    @Test
    @DisplayName("Értékelés lekérése ID-vel - sikeres")
    void testGetReviewById_Success() {
        // Given
        when(reviewRepository.findById(1)).thenReturn(Optional.of(testReview));
        when(bookingRepository.findByUser_UserIdAndRoom_RoomId(1, 1))
                .thenReturn(List.of(confirmedBooking));

        // When
        ReviewResponse response = reviewService.getReviewById(1);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getReviewId());
        assertEquals("testuser", response.getUsername());
        assertEquals("101", response.getRoomNumber());
        assertEquals(5, response.getRating());
        assertEquals("Kiváló szoba!", response.getComment());
        assertEquals(LocalDate.of(2026, 3, 1), response.getCheckIn());
    }

    @Test
    @DisplayName("Értékelés lekérése ID-vel - nem található")
    void testGetReviewById_NotFound() {
        // Given
        when(reviewRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.getReviewById(999));
    }

    // ============ GET REVIEWS BY ROOM ID TESTS ============

    @Test
    @DisplayName("Szoba értékelések lekérése - sikeres")
    void testGetReviewsByRoomId_Success() {
        // Given
        when(reviewRepository.findByRoom_RoomId(1)).thenReturn(List.of(testReview));
        when(bookingRepository.findByRoom_RoomId(1)).thenReturn(List.of(confirmedBooking));

        // When
        List<ReviewResponse> result = reviewService.getReviewsByRoomId(1);

        // Then
        assertFalse(result.isEmpty());
        assertEquals("101", result.get(0).getRoomNumber());
        assertEquals(5, result.get(0).getRating());
    }

    @Test
    @DisplayName("Szoba értékelések lekérése - nincs értékelés")
    void testGetReviewsByRoomId_Empty() {
        // Given
        when(reviewRepository.findByRoom_RoomId(1)).thenReturn(Collections.emptyList());
        when(bookingRepository.findByRoom_RoomId(1)).thenReturn(Collections.emptyList());

        // When
        List<ReviewResponse> result = reviewService.getReviewsByRoomId(1);

        // Then
        assertTrue(result.isEmpty());
    }

    // ============ GET REVIEWS BY USER ID TESTS ============

    @Test
    @DisplayName("Felhasználó értékelések lekérése - sikeres")
    void testGetReviewsByUserId_Success() {
        // Given
        when(reviewRepository.findByUser_UserId(1)).thenReturn(List.of(testReview));
        when(bookingRepository.findByUser_UserId(1)).thenReturn(List.of(confirmedBooking));

        // When
        List<ReviewResponse> result = reviewService.getReviewsByUserId(1);

        // Then
        assertFalse(result.isEmpty());
        assertEquals("testuser", result.get(0).getUsername());
    }

    // ============ GET AVERAGE RATING TESTS ============

    @Test
    @DisplayName("Szoba átlagos értékelésének lekérése - sikeres")
    void testGetAverageRatingByRoomId_Success() {
        // Given
        when(reviewRepository.findAverageRatingByRoomId(1)).thenReturn(4.5);

        // When
        Double avgRating = reviewService.getAverageRatingByRoomId(1);

        // Then
        assertNotNull(avgRating);
        assertEquals(4.5, avgRating);
    }

    @Test
    @DisplayName("Szoba átlagos értékelésének lekérése - nincs értékelés")
    void testGetAverageRatingByRoomId_NoReviews() {
        // Given
        when(reviewRepository.findAverageRatingByRoomId(1)).thenReturn(null);

        // When
        Double avgRating = reviewService.getAverageRatingByRoomId(1);

        // Then
        assertNull(avgRating);
    }

    // ============ CREATE REVIEW TESTS ============

    @Test
    @DisplayName("Értékelés létrehozása - sikeres")
    void testCreateReview_Success() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.findByUser_UserIdAndRoom_RoomId(1, 1))
                .thenReturn(List.of(confirmedBooking));
        when(reviewRepository.existsByUser_UserIdAndRoom_RoomId(1, 1)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);

        // When
        ReviewResponse response = reviewService.createReview(1, validReviewRequest);

        // Then
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("101", response.getRoomNumber());
        assertEquals(5, response.getRating());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    @DisplayName("Értékelés létrehozása - felhasználó nem található")
    void testCreateReview_UserNotFound() {
        // Given
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.createReview(999, validReviewRequest));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Értékelés létrehozása - szoba nem található")
    void testCreateReview_RoomNotFound() {
        // Given
        ReviewRequest badRoomRequest = ReviewRequest.builder()
                .roomId(999)
                .rating(4)
                .comment("Jó szoba")
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.createReview(1, badRoomRequest));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Értékelés létrehozása - nincs megerősített foglalás")
    void testCreateReview_NoConfirmedBooking() {
        // Given
        Booking pendingBooking = Booking.builder()
                .bookingId(2)
                .user(testUser)
                .room(testRoom)
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(3))
                .status(BookingStatus.PENDING)
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.findByUser_UserIdAndRoom_RoomId(1, 1))
                .thenReturn(List.of(pendingBooking));

        // When & Then
        assertThrows(BadRequestException.class,
                () -> reviewService.createReview(1, validReviewRequest));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Értékelés létrehozása - duplikált értékelés")
    void testCreateReview_DuplicateReview() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.findByUser_UserIdAndRoom_RoomId(1, 1))
                .thenReturn(List.of(confirmedBooking));
        when(reviewRepository.existsByUser_UserIdAndRoom_RoomId(1, 1)).thenReturn(true);

        // When & Then
        assertThrows(BadRequestException.class,
                () -> reviewService.createReview(1, validReviewRequest));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Értékelés létrehozása - foglalás nélkül nem értékelhet")
    void testCreateReview_NoBookingAtAll() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.findByUser_UserIdAndRoom_RoomId(1, 1))
                .thenReturn(Collections.emptyList());

        // When & Then
        assertThrows(BadRequestException.class,
                () -> reviewService.createReview(1, validReviewRequest));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    // ============ UPDATE REVIEW TESTS ============

    @Test
    @DisplayName("Értékelés módosítása - sikeres")
    void testUpdateReview_Success() {
        // Given
        ReviewRequest updateRequest = ReviewRequest.builder()
                .roomId(1)
                .rating(4)
                .comment("Frissített vélemény")
                .build();

        Review updatedReview = Review.builder()
                .reviewId(1)
                .user(testUser)
                .room(testRoom)
                .rating(4)
                .comment("Frissített vélemény")
                .createdAt(LocalDateTime.now())
                .build();

        when(reviewRepository.findById(1)).thenReturn(Optional.of(testReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(updatedReview);
        when(bookingRepository.findByUser_UserIdAndRoom_RoomId(1, 1))
                .thenReturn(List.of(confirmedBooking));

        // When
        ReviewResponse response = reviewService.updateReview(1, updateRequest, 1);

        // Then
        assertNotNull(response);
        assertEquals(4, response.getRating());
        assertEquals("Frissített vélemény", response.getComment());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    @DisplayName("Értékelés módosítása - értékelés nem található")
    void testUpdateReview_NotFound() {
        // Given
        when(reviewRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.updateReview(999, validReviewRequest, 1));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Értékelés módosítása - nincs jogosultság")
    void testUpdateReview_Unauthorized() {
        // Given – a review userId=1, a requesting userId=2
        when(reviewRepository.findById(1)).thenReturn(Optional.of(testReview));

        // When & Then
        assertThrows(BadRequestException.class,
                () -> reviewService.updateReview(1, validReviewRequest, 2));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    // ============ DELETE REVIEW TESTS ============

    @Test
    @DisplayName("Értékelés törlése - sikeres (tulajdonos)")
    void testDeleteReview_SuccessAsOwner() {
        // Given
        when(reviewRepository.findById(1)).thenReturn(Optional.of(testReview));

        // When
        reviewService.deleteReview(1, 1, false);

        // Then
        verify(reviewRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Értékelés törlése - sikeres (admin)")
    void testDeleteReview_SuccessAsAdmin() {
        // Given
        when(reviewRepository.findById(1)).thenReturn(Optional.of(testReview));

        // When - adminként töröljük (más user értékelését)
        reviewService.deleteReview(1, 99, true);

        // Then
        verify(reviewRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Értékelés törlése - értékelés nem található")
    void testDeleteReview_NotFound() {
        // Given
        when(reviewRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.deleteReview(999, 1, false));

        verify(reviewRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Értékelés törlése - nincs jogosultság")
    void testDeleteReview_Unauthorized() {
        // Given – a review userId=1, requesting userId=2, nem admin
        when(reviewRepository.findById(1)).thenReturn(Optional.of(testReview));

        // When & Then
        assertThrows(BadRequestException.class,
                () -> reviewService.deleteReview(1, 2, false));

        verify(reviewRepository, never()).deleteById(any());
    }
}