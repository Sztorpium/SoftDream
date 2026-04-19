package hu.softdream.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "A szobaszám kötelező!")
    private Integer roomId;

    @NotNull(message = "A bejelentkezése dátuma kötelező!")
    @FutureOrPresent(message = "A bejelentkezés dátuma nem lehet múltban!")
    private LocalDate checkIn;

    @NotNull(message = "A kijelentkezés dátuma kötelező!")
    @Future(message = "A kijelentkezés dátuma a mai napnál később kell legyen!")
    private LocalDate checkOut;
}
