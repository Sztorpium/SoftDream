package hu.softdream.repository;

import hu.softdream.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByRoomStatus_Name(String statusName);
    List<Room> findByRoomType_RoomTypeId(Integer roomTypeId);

    @Query("SELECT r FROM Room r WHERE r.roomId NOT IN " +
            "(SELECT b.room.roomId FROM Booking b WHERE " +
            "(b.checkIn <= :checkOut AND b.checkOut >= :checkIn) AND " +
            "b.status = hu.softdream.entity.enums.BookingStatus.CONFIRMED)")
    List<Room> findAvailableRooms(@Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);
}
