package hu.softdream.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "A felhasználónév kötelező!")
    @Size(min = 3, max = 50, message = "A felhasználónév 3 és 50 karakter között kell lennie!")
    private String username;

    @NotBlank(message = "Az email kötelező!")
    @Email(message = "Az email helyes kell lennie!")
    private String email;

    @NotBlank(message = "A telefonszám kötelező!")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "A telefonszámnak helyesnek kell lennie!")
    private String phone;

    @NotBlank(message = "A jelszó kötelező!")
    @Size(min = 6, message = "A jelszónak legalább 6 karakternek kell lennie!")
    private String password;
}
