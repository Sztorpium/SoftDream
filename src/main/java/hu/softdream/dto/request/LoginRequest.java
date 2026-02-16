package hu.softdream.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "A felhasználónév kötelező!")
    private String username;

    @NotBlank(message = "A jelszó kötelező!")
    private String password;
}
