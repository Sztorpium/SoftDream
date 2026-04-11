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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomStatusRepository roomStatusRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        Map<Integer, Double> avgRatings = fetchAverageRatings(rooms);
        return rooms.stream()
                .map(room -> buildRoomResponse(room, avgRatings.get(room.getRoomId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Integer roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("A szoba nem található a megadott azonosítóval: " + roomId));
        return convertToResponse(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        List<Room> rooms = roomRepository.findAvailableRooms(checkIn, checkOut);
        Map<Integer, Double> avgRatings = fetchAverageRatings(rooms);
        return rooms.stream()
                .map(room -> buildRoomResponse(room, avgRatings.get(room.getRoomId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByType(Integer roomTypeId) {
        List<Room> rooms = roomRepository.findByRoomType_RoomTypeId(roomTypeId);
        Map<Integer, Double> avgRatings = fetchAverageRatings(rooms);
        return rooms.stream()
                .map(room -> buildRoomResponse(room, avgRatings.get(room.getRoomId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByStatus(String status) {
        List<Room> rooms = roomRepository.findByRoomStatus_Name(status);
        Map<Integer, Double> avgRatings = fetchAverageRatings(rooms);
        return rooms.stream()
                .map(room -> buildRoomResponse(room, avgRatings.get(room.getRoomId())))
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

    /**
     * Batch-fetches average ratings for the given rooms in a single query, avoiding the N+1 problem.
     */
    private Map<Integer, Double> fetchAverageRatings(List<Room> rooms) {
        if (rooms.isEmpty()) {
            return Map.of();
        }
        List<Integer> roomIds = rooms.stream().map(Room::getRoomId).collect(Collectors.toList());
        return reviewRepository.findAverageRatingsByRoomIds(roomIds).stream()
                .collect(Collectors.toMap(
                        arr -> (Integer) arr[0],
                        arr -> (Double) arr[1]
                ));
    }

    private RoomResponse convertToResponse(Room room) {
        Double avgRating = reviewRepository.findAverageRatingByRoomId(room.getRoomId());
        return buildRoomResponse(room, avgRating);
    }

    private RoomResponse buildRoomResponse(Room room, Double avgRating) {
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
