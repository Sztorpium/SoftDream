package hu.softdream.repository;

import hu.softdream.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAuthRepository extends JpaRepository<UserAuth, Integer> {
    Optional<UserAuth> findByUser_Username(String username);
    Optional<UserAuth> findByUser_UserId(Integer userId);
}
