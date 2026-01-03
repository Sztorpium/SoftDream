package hu.hotelbooking.softdream.model;

import hu.hotelbooking.softdream.model.enums.RoomCategory;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "room_types")
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomTypeId;

    @Enumerated(EnumType.STRING)
    private RoomCategory name;

    @Column(nullable = false)
    private BigDecimal basePrice;

    @OneToMany(mappedBy = "roomType")
    private List<Room> rooms;
}
