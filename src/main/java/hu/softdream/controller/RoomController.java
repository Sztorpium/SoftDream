package hu.softdream.controller;

import hu.softdream.dto.request.RoomRequest;
import hu.softdream.dto.request.RoomStatusUpdateRequest;
import hu.softdream.dto.response.BookedDatesResponse;
import hu.softdream.dto.response.RoomResponse;
import hu.softdream.service.BookingService;
import hu.softdream.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Room management APIs")
public class RoomController {

    private final RoomService roomService;
    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "Get all rooms with optional server-side filtering and sorting")
    public ResponseEntity<List<RoomResponse>> getAllRooms(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "RECOMMENDED") String sort
    ) {
        return ResponseEntity.ok(roomService.getAllRooms(q, type, maxPrice, sort));
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "Get room by ID")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable("roomId") Integer roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available rooms for date range")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return ResponseEntity.ok(roomService.getAvailableRooms(checkIn, checkOut));
    }

    @GetMapping("/type/{roomTypeId}")
    @Operation(summary = "Get rooms by type")
    public ResponseEntity<List<RoomResponse>> getRoomsByType(@PathVariable("roomTypeId") Integer roomTypeId) {
        return ResponseEntity.ok(roomService.getRoomsByType(roomTypeId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get rooms by status")
    public ResponseEntity<List<RoomResponse>> getRoomsByStatus(@PathVariable("status") String status) {
        return ResponseEntity.ok(roomService.getRoomsByStatus(status));
    }

    @GetMapping("/{roomId}/booked-dates")
    @Operation(summary = "Get booked date ranges for a room")
    public ResponseEntity<List<BookedDatesResponse>> getBookedDatesForRoom(@PathVariable("roomId") Integer roomId) {
        return ResponseEntity.ok(bookingService.getBookedDatesForRoom(roomId));
    }

    // ========================================
    // ADMIN VÉGPONTOK
    // ========================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new room (Admin only)")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.createRoom(
                request.getRoomNumber(),
                request.getFloor(),
                request.getRoomTypeId(),
                request.getRoomStatusId(),
                request.getMaxGuests()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{roomId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update room status (Admin only)")
    public ResponseEntity<RoomResponse> updateRoomStatus(
            @PathVariable("roomId") Integer roomId,
            @Valid @RequestBody RoomStatusUpdateRequest request) {
        return ResponseEntity.ok(roomService.updateRoomStatus(roomId, request.getRoomStatusId()));
    }

    @DeleteMapping("/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete room (Admin only)")
    public ResponseEntity<Void> deleteRoom(@PathVariable("roomId") Integer roomId) {
        roomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }
}
