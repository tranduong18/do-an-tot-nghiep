package vn.jobhunter.domain.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReqPasswordOtpRequestDTO {
    @Email
    @NotBlank
    private String email;
}
