package vn.jobhunter.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.jobhunter.domain.PasswordResetRequest;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    @Query("SELECT r FROM PasswordResetRequest r WHERE r.user.id = :userId AND r.status = :status ORDER BY r.createdAt DESC")
    List<PasswordResetRequest> findLatestByUserAndStatus(
            @Param("userId") Long userId,
            @Param("status") PasswordResetRequest.Status status,
            Pageable pageable);

    Optional<PasswordResetRequest> findByResetToken(String resetToken);
}
