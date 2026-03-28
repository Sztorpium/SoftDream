package hu.softdream.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Integer reviewId;
    private Integer userId;
    private String username;
    private Integer roomId;
    private String roomNumber;
    private Integer rating;
    private String comment;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private LocalDateTime createdAt;
}
