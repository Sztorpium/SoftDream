package hu.softdream.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequest {

    @NotBlank(message = "A szobaszám kötelező!")
    @Size(max = 10, message = "A szobaszám legfeljebb 10 karakter lehet!")
    private String roomNumber;

    @NotNull(message = "Az emelet kötelező!")
    @Min(value = 1, message = "Az emeletnek legalább 1-nek kell lennie!")
    private Integer floor;

    @NotNull(message = "A szobatípus azonosítója kötelező!")
    private Integer roomTypeId;

    @NotNull(message = "A szoba státuszának azonosítója kötelező!")
    private Integer roomStatusId;

    @NotNull(message = "A maximális vendégszám kötelező!")
    @Min(value = 1, message = "A maximális vendégszámnak legalább 1-nek kell lennie!")
    private Integer maxGuests;
}