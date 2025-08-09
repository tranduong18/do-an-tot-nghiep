package vn.jobhunter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.jobhunter.domain.FavoriteJob;

import java.util.Optional;

public interface FavoriteJobRepository extends JpaRepository<FavoriteJob, Long> {
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
    void deleteByUser_IdAndJob_Id(Long userId, Long jobId);
    long countByJob_Id(Long jobId);

    Optional<FavoriteJob> findByUser_IdAndJob_Id(Long userId, Long jobId);

    Page<FavoriteJob> findByUser_Id(Long userId, Pageable pageable);
}
