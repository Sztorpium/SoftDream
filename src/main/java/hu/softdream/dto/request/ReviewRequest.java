package hu.softdream.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ReviewRequest {

    @NotNull(message = "A szobaszám kötelező!")
    private Integer roomId;

    @NotNull(message = "Az értékelés kötelező")
    @Min(value = 1, message = "Az értékelésnek legalább 1-nek kell lennie!")
    @Max(value = 5, message = "Az értékelés legfeljebb 5 lehet!")
    private Integer rating;

    @Size(max = 2000, message = "A megjegyzés legfeljebb 2000 karakter lehet!")
    private String comment;
}
