package vn.jobhunter.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.jobhunter.domain.PasswordResetRequest;
import vn.jobhunter.domain.User;
import vn.jobhunter.repository.PasswordResetRequestRepository;
import vn.jobhunter.repository.UserRepository;
import vn.jobhunter.util.error.IdInvalidException;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetRequestRepository requestRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final Duration OTP_TTL = Duration.ofMinutes(10);
    private static final Duration RESET_TOKEN_TTL = Duration.ofMinutes(15);

    public void requestOtp(String email) throws IdInvalidException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IdInvalidException("Tài khoản này không tồn tại");
        }
        expireOldPending(user.getId());

        String otp = generateOtp();
        String otpHash = passwordEncoder.encode(otp);

        PasswordResetRequest req = new PasswordResetRequest();
        req.setUser(user);
        req.setIdentifier(email);
        req.setOtpHash(otpHash);
        req.setOtpExpiresAt(LocalDateTime.now().plus(OTP_TTL));
        requestRepository.save(req);

        String html = "<p>Mã OTP đặt lại mật khẩu của bạn là: <b>" + otp + "</b></p>"
                + "<p>OTP hết hạn trong 10 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>";
        emailService.sendEmailSync(email, "Mã OTP đặt lại mật khẩu", html, false, true);
    }

    public void resendOtp(String email) throws IdInvalidException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IdInvalidException("Tài khoản này không tồn tại");
        }
        PasswordResetRequest latest = getLatestPending(user.getId());
        if (latest == null) {
            throw new IdInvalidException("Chưa có yêu cầu OTP cho tài khoản này");
        }
        if (latest.getResendCount() >= latest.getMaxResend()) {
            throw new IdInvalidException("Bạn đã vượt quá số lần gửi lại OTP");
        }

        String otp = generateOtp();
        latest.setOtpHash(passwordEncoder.encode(otp));
        latest.setOtpExpiresAt(LocalDateTime.now().plus(OTP_TTL));
        latest.setResendCount(latest.getResendCount() + 1);
        requestRepository.save(latest);

        String html = "<p>Mã OTP mới của bạn là: <b>" + otp + "</b></p><p>OTP hết hạn trong 10 phút.</p>";
        emailService.sendEmailSync(email, "Mã OTP đặt lại mật khẩu (cấp lại)", html, false, true);
    }

    public String verifyOtpAndIssueResetToken(String email, String otp) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("INVALID");

        PasswordResetRequest latest = getLatestPending(user.getId());
        if (latest == null) throw new RuntimeException("INVALID");

        if (latest.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            latest.setStatus(PasswordResetRequest.Status.EXPIRED);
            requestRepository.save(latest);
            throw new RuntimeException("OTP_EXPIRED");
        }
        if (latest.getAttempts() >= latest.getMaxAttempts()) {
            latest.setStatus(PasswordResetRequest.Status.EXPIRED);
            requestRepository.save(latest);
            throw new RuntimeException("OTP_LOCKED");
        }
        latest.setAttempts(latest.getAttempts() + 1);

        if (!passwordEncoder.matches(otp, latest.getOtpHash())) {
            requestRepository.save(latest);
            throw new RuntimeException("OTP_INCORRECT");
        }

        latest.setStatus(PasswordResetRequest.Status.VERIFIED);
        latest.setResetToken(UUID.randomUUID().toString());
        latest.setResetTokenExpiresAt(LocalDateTime.now().plus(RESET_TOKEN_TTL));
        requestRepository.save(latest);

        return latest.getResetToken();
    }

    public void resetPasswordWithToken(String resetToken, String newPassword) {
        PasswordResetRequest req = requestRepository.findByResetToken(resetToken)
                .orElseThrow(() -> new RuntimeException("INVALID_TOKEN"));

        if (req.getStatus() != PasswordResetRequest.Status.VERIFIED)
            throw new RuntimeException("INVALID_STATE");

        if (req.getResetTokenExpiresAt() == null
                || req.getResetTokenExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("TOKEN_EXPIRED");

        User user = req.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        req.setStatus(PasswordResetRequest.Status.USED);
        req.setResetToken(null);
        req.setResetTokenExpiresAt(null);
        requestRepository.save(req);
    }

    private void expireOldPending(Long userId) {
        List<PasswordResetRequest> pendings =
                requestRepository.findLatestByUserAndStatus(
                        userId, PasswordResetRequest.Status.PENDING, PageRequest.of(0, 10));
        for (PasswordResetRequest r : pendings) {
            r.setStatus(PasswordResetRequest.Status.EXPIRED);
        }
        requestRepository.saveAll(pendings);
    }

    private PasswordResetRequest getLatestPending(Long userId) {
        List<PasswordResetRequest> list =
                requestRepository.findLatestByUserAndStatus(
                        userId, PasswordResetRequest.Status.PENDING, PageRequest.of(0, 1));
        return list.isEmpty() ? null : list.get(0);
    }

    private String generateOtp() {
        SecureRandom rnd = new SecureRandom();
        int code = 100000 + rnd.nextInt(900000);
        return String.valueOf(code);
    }
}
