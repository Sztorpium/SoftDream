package hu.softdream.service;

import hu.softdream.dto.response.RoomResponse;
import hu.softdream.entity.Room;
import hu.softdream.entity.RoomStatus;
import hu.softdream.entity.RoomType;
import hu.softdream.exception.ResourceNotFoundException;
import hu.softdream.repository.ReviewRepository;
import hu.softdream.repository.RoomRepository;
import hu.softdream.repository.RoomStatusRepository;
import hu.softdream.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomStatusRepository roomStatusRepository;
    private final ReviewRepository reviewRepository;

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Integer roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("A szoba nem található a megadott azonosítóval: " + roomId));
        return convertToResponse(room);
    }

    public List<RoomResponse> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        List<Room> availableRooms = roomRepository.findAvailableRooms(checkIn, checkOut);
        return availableRooms.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByType(Integer roomTypeId) {
        return roomRepository.findByRoomType_RoomTypeId(roomTypeId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByStatus(String status) {
        return roomRepository.findByRoomStatus_Name(status).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse createRoom(String roomNumber, Integer floor, Integer roomTypeId,
                                   Integer roomStatusId, Integer maxGuests) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("A szobatípus nem található."));

        RoomStatus roomStatus = roomStatusRepository.findById(roomStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("A szoba státusza nem található."));

        Room room = Room.builder()
                .roomNumber(roomNumber)
                .floor(floor)
                .roomType(roomType)
                .roomStatus(roomStatus)
                .maxGuests(maxGuests)
                .build();

        Room savedRoom = roomRepository.save(room);
        return convertToResponse(savedRoom);
    }

    @Transactional
    public RoomResponse updateRoomStatus(Integer roomId, Integer roomStatusId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("A szoba nem található a megadott azonosítóval: " + roomId));

        RoomStatus roomStatus = roomStatusRepository.findById(roomStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("A szoba státusza nem található."));

        room.setRoomStatus(roomStatus);
        Room updatedRoom = roomRepository.save(room);
        return convertToResponse(updatedRoom);
    }

    public void deleteRoom(Integer roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("A szoba nem található a megadott azonosítóval: " + roomId);
        }
        roomRepository.deleteById(roomId);
    }

    private RoomResponse convertToResponse(Room room) {
        Double avgRating = reviewRepository.findAverageRatingByRoomId(room.getRoomId());

        return RoomResponse.builder()
                .roomId(room.getRoomId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .status(room.getRoomStatus().getName())
                .type(room.getRoomType().getName())
                .basePrice(room.getRoomType().getBasePrice())
                .description(room.getRoomType().getDescription())
                .maxGuests(room.getMaxGuests())
                .averageRating(avgRating)
                .build();
    }
}
