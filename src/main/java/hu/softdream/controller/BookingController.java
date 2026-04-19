package hu.softdream.controller;

import hu.softdream.dto.request.BookingRequest;
import hu.softdream.dto.response.BookingResponse;
import hu.softdream.entity.enums.BookingStatus;
import hu.softdream.security.CustomUserDetails;
import hu.softdream.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Bookings", description = "Booking management APIs")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings (Admin only)")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(bookingService.getAllBookings(pageable));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userDetails.getUserId()));
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking by ID (admin or owner)")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable("bookingId") Integer bookingId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        boolean isAdmin = "ADMIN".equals(userDetails.getRole());
        return ResponseEntity.ok(bookingService.getBookingById(bookingId, userDetails.getUserId(), isAdmin));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by user ID (Admin only)")
    public ResponseEntity<List<BookingResponse>> getBookingsByUserId(@PathVariable("userId") Integer userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by room ID (Admin only)")
    public ResponseEntity<List<BookingResponse>> getBookingsByRoomId(@PathVariable("roomId") Integer roomId) {
        return ResponseEntity.ok(bookingService.getBookingsByRoomId(roomId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by status (Admin only)")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(@PathVariable("status") BookingStatus status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingRequest request
    ) {
        BookingResponse response = bookingService.createBooking(userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{bookingId}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirm booking (Admin only)")
    public ResponseEntity<BookingResponse> confirmBooking(@PathVariable("bookingId") Integer bookingId) {
        return ResponseEntity.ok(bookingService.confirmBooking(bookingId));
    }

    @PatchMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel booking (admin or owner)")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable("bookingId") Integer bookingId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        boolean isAdmin = "ADMIN".equals(userDetails.getRole());
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, userDetails.getUserId(), isAdmin));
    }

    @DeleteMapping("/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete booking (Admin only)")
    public ResponseEntity<Void> deleteBooking(@PathVariable("bookingId") Integer bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.noContent().build();
    }
}
