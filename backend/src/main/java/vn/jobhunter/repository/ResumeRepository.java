package vn.jobhunter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.Resume;
import vn.jobhunter.domain.User;

import java.time.Instant;
import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long>, JpaSpecificationExecutor<Resume> {
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
    void deleteByUser(User user);
    void deleteByUserIn(List<User> users);
    void deleteByJob(Job job);
    void deleteByJobIn(List<Job> jobs);

    @Query("SELECT COUNT(r) FROM Resume r WHERE r.createdAt BETWEEN :start AND :end")
    long countCreatedBetween(@Param("start") Instant start, @Param("end") Instant end);

    // Lấy mốc thời gian tạo để build "khung giờ cao điểm" 0..23h trong 30 ngày
    @Query("SELECT r.createdAt FROM Resume r WHERE r.createdAt BETWEEN :start AND :end")
    List<Instant> findCreatedAtBetween(@Param("start") Instant start, @Param("end") Instant end);

    // Đếm hồ sơ theo chuyên môn (join Job) trong năm hiện tại
    @Query("""
    SELECT j.specialization, COUNT(r)
    FROM Resume r JOIN r.job j
    WHERE r.createdAt BETWEEN :start AND :end
    GROUP BY j.specialization
    ORDER BY COUNT(r) DESC
""")
    List<Object[]> countResumesBySpecializationBetween(@Param("start") Instant start, @Param("end") Instant end);

}
