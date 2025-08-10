package vn.jobhunter.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.jobhunter.domain.request.ReqPasswordOtpRequestDTO;
import vn.jobhunter.domain.request.ReqPasswordOtpVerifyDTO;
import vn.jobhunter.domain.request.ReqPasswordResetDTO;
import vn.jobhunter.service.PasswordResetService;
import vn.jobhunter.util.annotation.ApiMessage;
import vn.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1/auth/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/otp/request")
    @ApiMessage("Request OTP for password reset")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody ReqPasswordOtpRequestDTO body) throws IdInvalidException {
        passwordResetService.requestOtp(body.getEmail());
        return ResponseEntity.ok(Map.of("message", "Đã gửi OTP"));
    }

    @PostMapping("/otp/resend")
    @ApiMessage("Resend OTP")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ReqPasswordOtpRequestDTO body) throws IdInvalidException {
        passwordResetService.resendOtp(body.getEmail());
        return ResponseEntity.ok(Map.of("message", "Nếu tài khoản tồn tại, mã OTP mới đã được gửi."));
    }

    @PostMapping("/otp/verify")
    @ApiMessage("Verify OTP and issue reset token")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody ReqPasswordOtpVerifyDTO body) {
        String resetToken = passwordResetService.verifyOtpAndIssueResetToken(body.getEmail(), body.getOtp());
        return ResponseEntity.ok(Map.of("resetToken", resetToken, "expiresInMinutes", 15));
    }

    @PostMapping("/reset")
    @ApiMessage("Reset password with token")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ReqPasswordResetDTO body) {
        passwordResetService.resetPasswordWithToken(body.getResetToken(), body.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
    }
}
