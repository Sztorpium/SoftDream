package hu.softdream.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "room_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_status_id")
    private Integer roomStatusId;

    @Column(unique = true, nullable = false, length = 30)
    private String name; // AVAILABLE, BOOKED, MAINTENANCE

    @Column(columnDefinition = "TEXT")
    private String description;
}
