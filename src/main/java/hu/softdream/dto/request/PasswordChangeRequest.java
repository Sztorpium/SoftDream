package hu.softdream.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordChangeRequest {

    @NotBlank(message = "A jelenlegi jelszó kötelező!")
    private String currentPassword;

    @NotBlank(message = "Az új jelszó kötelező!")
    @Size(min = 6, message = "Az új jelszónak legalább 6 karakternek kell lennie!")
    private String newPassword;

    @NotBlank(message = "Az új jelszó megerősítése kötelező!")
    private String confirmPassword;
}