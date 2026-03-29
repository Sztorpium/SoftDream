package hu.softdream.controller;

import hu.softdream.dto.response.BookedDatesResponse;
import hu.softdream.dto.response.RoomResponse;
import hu.softdream.service.BookingService;
import hu.softdream.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @Operation(summary = "Get all rooms")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "Get room by ID")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Integer roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available rooms for date range")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return ResponseEntity.ok(roomService.getAvailableRooms(checkIn, checkOut));
    }

    @GetMapping("/type/{roomTypeId}")
    @Operation(summary = "Get rooms by type")
    public ResponseEntity<List<RoomResponse>> getRoomsByType(@PathVariable Integer roomTypeId) {
        return ResponseEntity.ok(roomService.getRoomsByType(roomTypeId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get rooms by status")
    public ResponseEntity<List<RoomResponse>> getRoomsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(roomService.getRoomsByStatus(status));
    }

    @GetMapping("/{roomId}/booked-dates")
    @Operation(summary = "Get booked date ranges for a room")
    public ResponseEntity<List<BookedDatesResponse>> getBookedDatesForRoom(@PathVariable Integer roomId) {
        return ResponseEntity.ok(bookingService.getBookedDatesForRoom(roomId));
    }
}
