package vn.jobhunter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.jobhunter.domain.FavoriteJob;
import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.User;

import java.util.List;
import java.util.Optional;

public interface FavoriteJobRepository extends JpaRepository<FavoriteJob, Long> {
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
    void deleteByUser_IdAndJob_Id(Long userId, Long jobId);
    long countByJob_Id(Long jobId);

    Optional<FavoriteJob> findByUser_IdAndJob_Id(Long userId, Long jobId);

    Page<FavoriteJob> findByUser_Id(Long userId, Pageable pageable);
    void deleteByUser(User user);
    void deleteByJob(Job job);
    void deleteByJobIn(List<Job> jobs);

    void deleteByUserIn(List<User> users);
}
