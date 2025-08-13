package vn.jobhunter.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.job.ResCreateJobDTO;
import vn.jobhunter.domain.response.job.ResSimilarJobDTO;
import vn.jobhunter.domain.response.job.ResUpdateJobDTO;
import vn.jobhunter.service.JobService;
import vn.jobhunter.util.annotation.ApiMessage;
import vn.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    @ApiMessage("Create a job")
    public ResponseEntity<ResCreateJobDTO> create(@Valid @RequestBody Job job) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.jobService.create(job));
    }

    @PutMapping("/jobs")
    @ApiMessage("Update a job")
    public ResponseEntity<ResUpdateJobDTO> update(@Valid @RequestBody Job job) throws IdInvalidException {
        Optional<Job> currentJob = this.jobService.fetchJobById(job.getId());
        if (currentJob.isEmpty()) {
            throw new IdInvalidException("Job not found");
        }
        return ResponseEntity.ok().body(this.jobService.update(job, currentJob.get()));
    }

    @DeleteMapping("/jobs/{id}")
    @ApiMessage("Delete a job by id")
    public ResponseEntity<Void> delete(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Job> currentJob = this.jobService.fetchJobById(id);
        if (currentJob.isEmpty()) {
            throw new IdInvalidException("Job not found");
        }
        this.jobService.delete(id);
        return ResponseEntity.ok().body(null);
    }

    @GetMapping("/jobs/{id}")
    @ApiMessage("Get a job by id")
    public ResponseEntity<Job> getJob(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Job> currentJob = this.jobService.fetchJobById(id);
        if (currentJob.isEmpty()) {
            throw new IdInvalidException("Job not found");
        }
        return ResponseEntity.ok().body(currentJob.get());
    }

    @GetMapping("/jobs")
    @ApiMessage("Get job with pagination")
    public ResponseEntity<ResultPaginationDTO> getAllJob(
            @Filter Specification<Job> spec,
            Pageable pageable,
            @RequestHeader(value = "X-Admin-View", required = false) String adminView) {
        return ResponseEntity.ok().body(this.jobService.fetchAll(spec, pageable, adminView));
    }

    // ✅ API search
    @GetMapping("/jobs/search")
    @ApiMessage("Search job by keyword/skills/location")
    public ResponseEntity<ResultPaginationDTO> searchJobs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) List<String> location,
            @RequestParam(required = false) List<String> levels,
            Pageable pageable) {
        return ResponseEntity.ok(jobService.searchJobs(q, skills, location, levels, pageable));
    }

    // ✅ API suggestions cho autocomplete
    @GetMapping("/jobs/suggestions")
    @ApiMessage("Get job/company suggestions")
    public ResponseEntity<List<Map<String, Object>>> getSuggestions(@RequestParam String q) {
        return ResponseEntity.ok(jobService.getSuggestions(q));
    }

    @GetMapping("/jobs/{id}/similar")
    @ApiMessage("Get similar jobs")
    public ResponseEntity<List<ResSimilarJobDTO>> getSimilarJobs(@PathVariable("id") long id) throws IdInvalidException {
        return ResponseEntity.ok(jobService.findSimilarJobs(id));
    }

    @GetMapping("/jobs/specializations")
    @ApiMessage("Get all specializations")
    public ResponseEntity<List<String>> getAllSpecializations() {
        return ResponseEntity.ok(jobService.getAllSpecializations());
    }
}
