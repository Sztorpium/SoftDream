package hu.softdream.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomStatusUpdateRequest {

    @NotNull(message = "A szoba státuszának azonosítója kötelező!")
    private Integer roomStatusId;
}