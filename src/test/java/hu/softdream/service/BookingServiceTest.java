package hu.softdream.service;

import hu.softdream.dto.request.BookingRequest;
import hu.softdream.dto.response.BookingResponse;
import hu.softdream.entity.Booking;
import hu.softdream.entity.Room;
import hu.softdream.entity.User;
import hu.softdream.entity.enums.BookingStatus;
import hu.softdream.exception.BadRequestException;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.repository.BookingRepository;
import hu.softdream.repository.RoomRepository;
import hu.softdream.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Room testRoom;
    private BookingRequest validBookingRequest;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        // Teszt User
        testUser = User.builder()
                .userId(1)
                .username("testuser")
                .email("test@example.com")
                .phone("1234567890")
                .build();

        // Teszt Room
        testRoom = Room.builder()
                .roomId(1)
                .roomNumber("101")
                .floor(1)
                .maxGuests(2)
                .build();

        // Érvényes BookingRequest (validáció már átesett a controllernél)
        validBookingRequest = BookingRequest.builder()
                .roomId(1)
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(3))
                .build();

        // Teszt Booking
        testBooking = Booking.builder()
                .bookingId(1)
                .user(testUser)
                .room(testRoom)
                .checkIn(validBookingRequest.getCheckIn())
                .checkOut(validBookingRequest.getCheckOut())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ============ CREATE BOOKING TESTS ============

    @Test
    @DisplayName("Érvényes foglalás sikeres létrehozása")
    void testCreateBooking_Success() {
        // Given - Controller már validálta a requestet
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.findConflictingBookings(
                eq(1),
                eq(validBookingRequest.getCheckIn()),
                eq(validBookingRequest.getCheckOut())
        )).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        // When
        BookingResponse response = bookingService.createBooking(1, validBookingRequest);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getBookingId());
        assertEquals("testuser", response.getUsername());
        assertEquals("101", response.getRoomNumber());
        assertEquals(BookingStatus.PENDING.name(), response.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Foglalás nem létezik - UserNotFoundException")
    void testCreateBooking_UserNotFound() {
        // Given
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking(999, validBookingRequest));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Szoba nem létezik - RoomNotFoundException")
    void testCreateBooking_RoomNotFound() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(999)).thenReturn(Optional.empty());

        BookingRequest requestWithInvalidRoom = BookingRequest.builder()
                .roomId(999)
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(3))
                .build();

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking(1, requestWithInvalidRoom));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Szoba nem elérhető - Foglalt napok ütközés")
    void testCreateBooking_RoomNotAvailable_ConflictingBooking() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));

        // Konfliktáló foglalás
        Booking conflictingBooking = Booking.builder()
                .bookingId(2)
                .room(testRoom)
                .checkIn(LocalDate.now().plusDays(2))
                .checkOut(LocalDate.now().plusDays(4))
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findConflictingBookings(
                eq(1),
                eq(validBookingRequest.getCheckIn()),
                eq(validBookingRequest.getCheckOut())
        )).thenReturn(List.of(conflictingBooking));

        // When & Then
        assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(1, validBookingRequest));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    // ============ GET BOOKING TESTS ============

    @Test
    @DisplayName("Foglalás lekérése ID-vel - sikeres")
    void testGetBookingById_Success() {
        // Given
        when(bookingRepository.findById(1)).thenReturn(Optional.of(testBooking));

        // When
        BookingResponse response = bookingService.getBookingById(1);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getBookingId());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    @DisplayName("Foglalás nem található - BookingNotFoundException")
    void testGetBookingById_NotFound() {
        // Given
        when(bookingRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.getBookingById(999));
    }

    @Test
    @DisplayName("Felhasználó összes foglalása")
    void testGetBookingsByUserId() {
        // Given
        List<Booking> bookings = List.of(testBooking);
        when(bookingRepository.findByUser_UserId(1)).thenReturn(bookings);

        // When
        List<BookingResponse> responses = bookingService.getBookingsByUserId(1);

        // Then
        assertFalse(responses.isEmpty());
        assertEquals(1, responses.size());
        assertEquals("testuser", responses.get(0).getUsername());
    }

    @Test
    @DisplayName("Szoba összes foglalása")
    void testGetBookingsByRoomId() {
        // Given
        List<Booking> bookings = List.of(testBooking);
        when(bookingRepository.findByRoom_RoomId(1)).thenReturn(bookings);

        // When
        List<BookingResponse> responses = bookingService.getBookingsByRoomId(1);

        // Then
        assertFalse(responses.isEmpty());
        assertEquals("101", responses.get(0).getRoomNumber());
    }

    @Test
    @DisplayName("Foglalás státusza szerint szűrés")
    void testGetBookingsByStatus() {
        // Given
        List<Booking> bookings = List.of(testBooking);
        when(bookingRepository.findByStatus(BookingStatus.PENDING)).thenReturn(bookings);

        // When
        List<BookingResponse> responses = bookingService.getBookingsByStatus(BookingStatus.PENDING);

        // Then
        assertFalse(responses.isEmpty());
        assertEquals(BookingStatus.PENDING.name(), responses.get(0).getStatus());
    }

    // ============ UPDATE BOOKING TESTS ============

    @Test
    @DisplayName("Foglalás státusza megerősítésre módosul")
    void testConfirmBooking_Success() {
        // Given
        Booking pendingBooking = Booking.builder()
                .bookingId(1)
                .user(testUser)
                .room(testRoom)
                .status(BookingStatus.PENDING)
                .build();

        Booking confirmedBooking = Booking.builder()
                .bookingId(1)
                .user(testUser)
                .room(testRoom)
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findById(1)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);

        // When
        BookingResponse response = bookingService.confirmBooking(1);

        // Then
        assertEquals(BookingStatus.CONFIRMED.name(), response.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Foglalás státusza lemondásra módosul")
    void testCancelBooking_Success() {
        // Given
        Booking pendingBooking = Booking.builder()
                .bookingId(1)
                .user(testUser)
                .room(testRoom)
                .status(BookingStatus.PENDING)
                .build();

        Booking cancelledBooking = Booking.builder()
                .bookingId(1)
                .user(testUser)
                .room(testRoom)
                .status(BookingStatus.CANCELLED)
                .build();

        when(bookingRepository.findById(1)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(cancelledBooking);

        // When
        BookingResponse response = bookingService.cancelBooking(1);

        // Then
        assertEquals(BookingStatus.CANCELLED.name(), response.getStatus());
    }

    // ============ DELETE BOOKING TESTS ============

    @Test
    @DisplayName("Foglalás sikeres törlése")
    void testDeleteBooking_Success() {
        // Given
        when(bookingRepository.existsById(1)).thenReturn(true);

        // When
        bookingService.deleteBooking(1);

        // Then
        verify(bookingRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Nem létező foglalás törlésének kísérlete")
    void testDeleteBooking_NotFound() {
        // Given
        when(bookingRepository.existsById(999)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.deleteBooking(999));
        verify(bookingRepository, never()).deleteById(999);
    }

    // ============ GET ALL BOOKINGS TESTS ============

    @Test
    @DisplayName("Összes foglalás lekérése - üres lista")
    void testGetAllBookings_Empty() {
        // Given
        when(bookingRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<BookingResponse> responses = bookingService.getAllBookings();

        // Then
        assertTrue(responses.isEmpty());
    }

    @Test
    @DisplayName("Összes foglalás lekérése - több foglalás")
    void testGetAllBookings_Multiple() {
        // Given
        List<Booking> bookings = List.of(testBooking);
        when(bookingRepository.findAll()).thenReturn(bookings);

        // When
        List<BookingResponse> responses = bookingService.getAllBookings();

        // Then
        assertFalse(responses.isEmpty());
        assertEquals(1, responses.size());
    }
}