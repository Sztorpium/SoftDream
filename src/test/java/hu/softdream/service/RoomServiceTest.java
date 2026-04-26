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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoomService Unit Tests")
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private RoomStatusRepository roomStatusRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private RoomService roomService;

    private Room testRoom;
    private RoomType singleType;
    private RoomStatus availableStatus;

    @BeforeEach
    void setUp() {
        singleType = RoomType.builder()
                .roomTypeId(1)
                .name("SINGLE")
                .basePrice(new BigDecimal("35000"))
                .description("Egyágyas szoba - 1 fő")
                .build();

        availableStatus = RoomStatus.builder()
                .roomStatusId(1)
                .name("AVAILABLE")
                .description("Szoba elérhető a foglaláshoz")
                .build();

        testRoom = Room.builder()
                .roomId(1)
                .roomNumber("101")
                .floor(1)
                .roomType(singleType)
                .roomStatus(availableStatus)
                .maxGuests(1)
                .build();
    }

    // ============ GET ALL ROOMS TESTS ============

    @Test
    @DisplayName("Összes szoba lekérése - szűrő nélkül")
    void testGetAllRooms_NoFilter() {
        // Given
        List<Room> rooms = List.of(testRoom);
        when(roomRepository.findAll()).thenReturn(rooms);
        when(reviewRepository.findAverageRatingsByRoomIds(anyList())).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAllRooms(null, null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("101", result.get(0).getRoomNumber());
        assertEquals("SINGLE", result.get(0).getType());
    }

    @Test
    @DisplayName("Összes szoba lekérése - típus szerint szűrve")
    void testGetAllRooms_FilterByType() {
        // Given
        RoomType doubleType = RoomType.builder()
                .roomTypeId(2)
                .name("DOUBLE")
                .basePrice(new BigDecimal("52000"))
                .description("Dupla szoba - 2 fő")
                .build();

        Room doubleRoom = Room.builder()
                .roomId(2)
                .roomNumber("201")
                .floor(2)
                .roomType(doubleType)
                .roomStatus(availableStatus)
                .maxGuests(2)
                .build();

        when(roomRepository.findAll()).thenReturn(List.of(testRoom, doubleRoom));
        when(reviewRepository.findAverageRatingsByRoomIds(anyList())).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAllRooms(null, "SINGLE", null, null);

        // Then
        assertEquals(1, result.size());
        assertEquals("SINGLE", result.get(0).getType());
    }

    @Test
    @DisplayName("Összes szoba lekérése - szöveges keresés szobaszám alapján")
    void testGetAllRooms_FilterByQuery() {
        // Given
        List<Room> rooms = List.of(testRoom);
        when(roomRepository.findAll()).thenReturn(rooms);
        when(reviewRepository.findAverageRatingsByRoomIds(anyList())).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAllRooms("101", null, null, null);

        // Then
        assertEquals(1, result.size());
        assertEquals("101", result.get(0).getRoomNumber());
    }

    @Test
    @DisplayName("Összes szoba lekérése - maximális ár szűrő")
    void testGetAllRooms_FilterByMaxPrice() {
        // Given
        List<Room> rooms = List.of(testRoom);
        when(roomRepository.findAll()).thenReturn(rooms);
        when(reviewRepository.findAverageRatingsByRoomIds(anyList())).thenReturn(Collections.emptyList());

        // When - a tényleges ár a seeder logika alapján +/-10-15%-ot változhat
        List<RoomResponse> result = roomService.getAllRooms(null, null, new BigDecimal("999999"), null);

        // Then - a magas határ mindent átenged
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Összes szoba lekérése - ár szerint növekvő rendezés")
    void testGetAllRooms_SortByPriceAsc() {
        // Given
        RoomType suiteType = RoomType.builder()
                .roomTypeId(4)
                .name("SUITE")
                .basePrice(new BigDecimal("120000"))
                .description("Luxus szoba")
                .build();

        Room suiteRoom = Room.builder()
                .roomId(2)
                .roomNumber("301")
                .floor(3)
                .roomType(suiteType)
                .roomStatus(availableStatus)
                .maxGuests(4)
                .build();

        when(roomRepository.findAll()).thenReturn(List.of(suiteRoom, testRoom));
        when(reviewRepository.findAverageRatingsByRoomIds(anyList())).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAllRooms(null, null, null, "PRICE_ASC");

        // Then
        assertEquals(2, result.size());
        assertTrue(result.get(0).getPricePerNight().compareTo(result.get(1).getPricePerNight()) <= 0);
    }

    @Test
    @DisplayName("Összes szoba lekérése - ár szerint csökkenő rendezés")
    void testGetAllRooms_SortByPriceDesc() {
        // Given
        RoomType suiteType = RoomType.builder()
                .roomTypeId(4)
                .name("SUITE")
                .basePrice(new BigDecimal("120000"))
                .description("Luxus szoba")
                .build();

        Room suiteRoom = Room.builder()
                .roomId(2)
                .roomNumber("301")
                .floor(3)
                .roomType(suiteType)
                .roomStatus(availableStatus)
                .maxGuests(4)
                .build();

        when(roomRepository.findAll()).thenReturn(List.of(testRoom, suiteRoom));
        when(reviewRepository.findAverageRatingsByRoomIds(anyList())).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAllRooms(null, null, null, "PRICE_DESC");

        // Then
        assertEquals(2, result.size());
        assertTrue(result.get(0).getPricePerNight().compareTo(result.get(1).getPricePerNight()) >= 0);
    }

    @Test
    @DisplayName("Összes szoba lekérése - üres lista")
    void testGetAllRooms_Empty() {
        // Given
        when(roomRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAllRooms(null, null, null, null);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ============ GET ROOM BY ID TESTS ============

    @Test
    @DisplayName("Szoba lekérése ID-vel - sikeres")
    void testGetRoomById_Success() {
        // Given
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(reviewRepository.findAverageRatingByRoomId(1)).thenReturn(4.5);

        // When
        RoomResponse response = roomService.getRoomById(1);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getRoomId());
        assertEquals("101", response.getRoomNumber());
        assertEquals("SINGLE", response.getType());
        assertEquals("AVAILABLE", response.getStatus());
        assertEquals(4.5, response.getAverageRating());
    }

    @Test
    @DisplayName("Szoba lekérése ID-vel - nem található")
    void testGetRoomById_NotFound() {
        // Given
        when(roomRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> roomService.getRoomById(999));
    }

    // ============ GET AVAILABLE ROOMS TESTS ============

    @Test
    @DisplayName("Elérhető szobák lekérése - dátum alapján")
    void testGetAvailableRooms_Success() {
        // Given
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);
        when(roomRepository.findAvailableRooms(checkIn, checkOut)).thenReturn(List.of(testRoom));
        when(reviewRepository.findAverageRatingsByRoomIds(anyList())).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAvailableRooms(checkIn, checkOut);

        // Then
        assertEquals(1, result.size());
        assertEquals("101", result.get(0).getRoomNumber());
    }

    @Test
    @DisplayName("Elérhető szobák lekérése - nincs elérhető szoba")
    void testGetAvailableRooms_Empty() {
        // Given
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);
        when(roomRepository.findAvailableRooms(checkIn, checkOut)).thenReturn(Collections.emptyList());

        // When
        List<RoomResponse> result = roomService.getAvailableRooms(checkIn, checkOut);

        // Then
        assertTrue(result.isEmpty());
    }

    // ============ CREATE ROOM TESTS ============

    @Test
    @DisplayName("Szoba létrehozása - sikeres")
    void testCreateRoom_Success() {
        // Given
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(singleType));
        when(roomStatusRepository.findById(1)).thenReturn(Optional.of(availableStatus));
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);
        when(reviewRepository.findAverageRatingByRoomId(1)).thenReturn(null);

        // When
        RoomResponse response = roomService.createRoom("101", 1, 1, 1, 1);

        // Then
        assertNotNull(response);
        assertEquals("101", response.getRoomNumber());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    @DisplayName("Szoba létrehozása - szobatípus nem található")
    void testCreateRoom_RoomTypeNotFound() {
        // Given
        when(roomTypeRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> roomService.createRoom("999", 1, 999, 1, 1));

        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    @DisplayName("Szoba létrehozása - státusz nem található")
    void testCreateRoom_RoomStatusNotFound() {
        // Given
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(singleType));
        when(roomStatusRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> roomService.createRoom("101", 1, 1, 999, 1));

        verify(roomRepository, never()).save(any(Room.class));
    }

    // ============ UPDATE ROOM STATUS TESTS ============

    @Test
    @DisplayName("Szoba státuszának frissítése - sikeres")
    void testUpdateRoomStatus_Success() {
        // Given
        RoomStatus maintenanceStatus = RoomStatus.builder()
                .roomStatusId(3)
                .name("MAINTENANCE")
                .description("Karbantartás alatt")
                .build();

        Room updatedRoom = Room.builder()
                .roomId(1)
                .roomNumber("101")
                .floor(1)
                .roomType(singleType)
                .roomStatus(maintenanceStatus)
                .maxGuests(1)
                .build();

        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(roomStatusRepository.findById(3)).thenReturn(Optional.of(maintenanceStatus));
        when(roomRepository.save(any(Room.class))).thenReturn(updatedRoom);
        when(reviewRepository.findAverageRatingByRoomId(1)).thenReturn(null);

        // When
        RoomResponse response = roomService.updateRoomStatus(1, 3);

        // Then
        assertNotNull(response);
        assertEquals("MAINTENANCE", response.getStatus());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    @DisplayName("Szoba státuszának frissítése - szoba nem található")
    void testUpdateRoomStatus_RoomNotFound() {
        // Given
        when(roomRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> roomService.updateRoomStatus(999, 1));

        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    @DisplayName("Szoba státuszának frissítése - státusz nem található")
    void testUpdateRoomStatus_StatusNotFound() {
        // Given
        when(roomRepository.findById(1)).thenReturn(Optional.of(testRoom));
        when(roomStatusRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> roomService.updateRoomStatus(1, 999));

        verify(roomRepository, never()).save(any(Room.class));
    }

    // ============ DELETE ROOM TESTS ============

    @Test
    @DisplayName("Szoba törlése - sikeres")
    void testDeleteRoom_Success() {
        // Given
        when(roomRepository.existsById(1)).thenReturn(true);

        // When
        roomService.deleteRoom(1);

        // Then
        verify(roomRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Szoba törlése - nem található")
    void testDeleteRoom_NotFound() {
        // Given
        when(roomRepository.existsById(999)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> roomService.deleteRoom(999));

        verify(roomRepository, never()).deleteById(any());
    }
}