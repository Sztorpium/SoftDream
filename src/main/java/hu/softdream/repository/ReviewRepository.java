package hu.softdream.repository;

import hu.softdream.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByRoom_RoomId(Integer roomId);
    List<Review> findByUser_UserId(Integer userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.room.roomId = :roomId")
    Double findAverageRatingByRoomId(@Param("roomId") Integer roomId);
}
