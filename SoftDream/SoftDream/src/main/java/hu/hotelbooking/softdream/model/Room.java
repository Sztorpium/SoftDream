package hu.hotelbooking.softdream.model;

import hu.hotelbooking.softdream.model.enums.RoomStatus;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    @Column(nullable = false, unique = true)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @ManyToOne
    @JoinColumn(name = "room_type_id")
    private RoomType roomType;

    @OneToMany(mappedBy = "room")
    private List<Booking> bookings;

    @OneToMany(mappedBy = "room")
    private List<Review> reviews;
}