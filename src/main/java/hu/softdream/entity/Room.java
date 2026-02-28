package hu.softdream.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Integer roomId;

    @Column(name = "room_number", unique = true, nullable = false, length = 10)
    private String roomNumber;

    private Integer floor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_status_id", nullable = false)
    private RoomStatus roomStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Column(name = "max_guests", nullable = false)
    private Integer maxGuests;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Review> reviews;
}
