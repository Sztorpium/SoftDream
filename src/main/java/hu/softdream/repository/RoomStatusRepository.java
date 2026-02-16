package hu.softdream.repository;

import hu.softdream.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomStatusRepository extends JpaRepository<RoomStatus, Integer> {
    Optional<RoomStatus> findByName(String name);
}
