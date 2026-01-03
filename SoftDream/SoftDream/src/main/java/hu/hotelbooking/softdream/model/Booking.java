package hu.hotelbooking.softdream.model;

import hu.hotelbooking.softdream.model.enums.BookingStatus;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private LocalDate checkIn;
    private LocalDate checkOut;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

}