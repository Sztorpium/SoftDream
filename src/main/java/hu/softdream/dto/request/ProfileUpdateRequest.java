package hu.softdream.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequest {

    @NotBlank(message = "Az email kötelező!")
    @Email(message = "Az email helyes kell lennie!")
    private String email;

    @NotBlank(message = "A telefonszám kötelező!")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "A telefonszámnak helyesnek kell lennie!")
    private String phone;

    @NotBlank(message = "A jelszó kötelező!")
    private String currentPassword;
}