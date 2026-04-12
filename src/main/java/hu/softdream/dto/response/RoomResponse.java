package hu.softdream.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {
    private Integer roomId;
    private String roomNumber;
    private Integer floor;
    private String status;
    private String type;
    private BigDecimal pricePerNight;
    private BigDecimal basePrice;
    private String description;
    private Integer maxGuests;
    private Double averageRating;
}
