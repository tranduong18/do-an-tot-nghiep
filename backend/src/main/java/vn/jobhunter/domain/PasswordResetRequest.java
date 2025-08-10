package vn.jobhunter.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "password_reset_requests",
        indexes = {
                @Index(name = "idx_prr_user_status", columnList = "user_id,status"),
                @Index(name = "idx_prr_reset_token", columnList = "resetToken")
        }
)
@Getter
@Setter
public class PasswordResetRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 190, nullable = false)
    private String identifier; // email

    @Column(nullable = false, length = 120)
    private String otpHash; // BCrypt của OTP 6 số

    @Column(nullable = false)
    private LocalDateTime otpExpiresAt; // +10 phút

    @Column(nullable = false)
    private Integer attempts = 0;

    @Column(nullable = false)
    private Integer maxAttempts = 5;

    @Column(nullable = false)
    private Integer resendCount = 0;

    @Column(nullable = false)
    private Integer maxResend = 3;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING; // PENDING, VERIFIED, USED, EXPIRED

    public enum Status { PENDING, VERIFIED, USED, EXPIRED }

    @Column(length = 120)
    private String resetToken; // UUID ngắn hạn

    private LocalDateTime resetTokenExpiresAt; // +15 phút

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
