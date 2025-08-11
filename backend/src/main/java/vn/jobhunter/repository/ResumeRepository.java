package vn.jobhunter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.Resume;
import vn.jobhunter.domain.User;

import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long>, JpaSpecificationExecutor<Resume> {
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
    void deleteByUser(User user);
    void deleteByUserIn(List<User> users);
    void deleteByJob(Job job);
    void deleteByJobIn(List<Job> jobs);
}
