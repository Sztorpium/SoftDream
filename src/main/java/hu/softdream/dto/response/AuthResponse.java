package hu.softdream.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    @Default
    private String type = "Bearer";
    private Integer userId;
    private String username;
    private String email;
    private String role;
}
