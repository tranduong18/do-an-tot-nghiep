package vn.jobhunter.domain.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReqPasswordOtpVerifyDTO {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, max = 6)
    private String otp;
}
