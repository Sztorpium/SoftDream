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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("A foglalás nem található a megadott azonosítóval: " + bookingId));
        return convertToResponse(booking);
    }

    public List<BookingResponse> getBookingsByUserId(Integer userId) {
        return bookingRepository.findByUser_UserId(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByRoomId(Integer roomId) {
        return bookingRepository.findByRoom_RoomId(roomId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse createBooking(Integer userId, BookingRequest request) {
        // Validációk
        if (request.getCheckOut().isBefore(request.getCheckIn()) ||
                request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new BadRequestException("A kijelentkezés dátumának a bejelentkezés dátuma után kell lennie");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("A felhasználó nem található a megadott azonosítóval: " + userId));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("A szoba nem található a megadott azonosítóval: " + request.getRoomId()));

        // Ellenőrizzük, hogy a szoba elérhető-e
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                request.getRoomId(),
                request.getCheckIn(),
                request.getCheckOut()
        );

        if (!conflictingBookings.isEmpty()) {
            throw new BadRequestException("A szoba nem elérhető a kiválasztott dátumokra");
        }

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return convertToResponse(savedBooking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Integer bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("A foglalás nem található a megadott azonosítóval: " + bookingId));

        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }

    @Transactional
    public BookingResponse confirmBooking(Integer bookingId) {
        return updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
    }

    @Transactional
    public BookingResponse cancelBooking(Integer bookingId) {
        return updateBookingStatus(bookingId, BookingStatus.CANCELLED);
    }

    public void deleteBooking(Integer bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("A foglalás nem található a megadott azonosítóval: " + bookingId);
        }
        bookingRepository.deleteById(bookingId);
    }

    private BookingResponse convertToResponse(Booking booking) {
        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .userId(booking.getUser().getUserId())
                .username(booking.getUser().getUsername())
                .roomId(booking.getRoom().getRoomId())
                .roomNumber(booking.getRoom().getRoomNumber())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
