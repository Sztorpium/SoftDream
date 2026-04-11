package hu.softdream.repository;

import hu.softdream.entity.Booking;
import hu.softdream.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByUser_UserId(Integer userId);
    List<Booking> findByRoom_RoomId(Integer roomId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUser_UserIdAndRoom_RoomId(Integer userId, Integer roomId);

    @Query("SELECT b FROM Booking b WHERE b.room.roomId = :roomId AND " +
            "((b.checkIn <= :checkOut AND b.checkOut >= :checkIn)) AND " +
            "(b.status = hu.softdream.entity.enums.BookingStatus.CONFIRMED OR " +
            "b.status = hu.softdream.entity.enums.BookingStatus.PENDING)")
    List<Booking> findConflictingBookings(@Param("roomId") Integer roomId,
                                          @Param("checkIn") LocalDate checkIn,
                                          @Param("checkOut") LocalDate checkOut);
}
