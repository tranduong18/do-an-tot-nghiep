package vn.jobhunter.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.jobhunter.domain.FavoriteJob;
import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.favorite.ResFavoriteJobDTO;
import vn.jobhunter.domain.response.favorite.ResFavoriteJobItemDTO;
import vn.jobhunter.repository.FavoriteJobRepository;
import vn.jobhunter.repository.JobRepository;
import vn.jobhunter.repository.UserRepository;
import vn.jobhunter.util.error.IdInvalidException;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteJobService {
    private final FavoriteJobRepository favoriteJobRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public FavoriteJobService(FavoriteJobRepository favoriteJobRepository,
                              UserRepository userRepository,
                              JobRepository jobRepository) {
        this.favoriteJobRepository = favoriteJobRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    private ResFavoriteJobDTO toDTO(FavoriteJob f) {
        ResFavoriteJobDTO dto = new ResFavoriteJobDTO();
        dto.setId(f.getId());
        dto.setUserId(f.getUser().getId());
        dto.setJobId(f.getJob().getId());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }

    private ResFavoriteJobItemDTO toItemDTO(FavoriteJob f) {
        Job j = f.getJob();
        ResFavoriteJobItemDTO dto = new ResFavoriteJobItemDTO();
        dto.setJobId(j.getId());
        dto.setName(j.getName());
        dto.setLocation(j.getLocation());
        dto.setSalary(j.getSalary());
        dto.setSpecialization(j.getSpecialization());
        dto.setWorkType(j.getWorkType());
        dto.setFavoritedAt(f.getCreatedAt());
        if (j.getCompany() != null) {
            dto.setCompanyId(j.getCompany().getId());
            dto.setCompanyName(j.getCompany().getName());
            dto.setCompanyLogo(j.getCompany().getLogo());
        }
        if (j.getSkills() != null) {
            dto.setSkills(j.getSkills().stream().map(s -> s.getName()).collect(Collectors.toList()));
        }
        return dto;
    }

    public boolean exists(Long userId, Long jobId) {
        return favoriteJobRepository.existsByUser_IdAndJob_Id(userId, jobId);
    }

    @Transactional
    public ResFavoriteJobDTO add(Long userId, Long jobId) throws IdInvalidException {
        Optional<FavoriteJob> existed = favoriteJobRepository.findByUser_IdAndJob_Id(userId, jobId);
        if (existed.isPresent()) return toDTO(existed.get());

        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IdInvalidException("User không tồn tại"));
        Job j = jobRepository.findById(jobId)
                .orElseThrow(() -> new IdInvalidException("Job không tồn tại"));

        FavoriteJob fav = new FavoriteJob();
        fav.setUser(u);
        fav.setJob(j);
        FavoriteJob saved = favoriteJobRepository.save(fav);
        return toDTO(saved);
    }

    @Transactional
    public void remove(Long userId, Long jobId) {
        favoriteJobRepository.deleteByUser_IdAndJob_Id(userId, jobId);
    }

    @Transactional
    public boolean toggle(Long userId, Long jobId) throws IdInvalidException {
        if (favoriteJobRepository.existsByUser_IdAndJob_Id(userId, jobId)) {
            favoriteJobRepository.deleteByUser_IdAndJob_Id(userId, jobId);
            return false;
        } else {
            add(userId, jobId);
            return true;
        }
    }

    public boolean isFavorited(Long userId, Long jobId) {
        return favoriteJobRepository.existsByUser_IdAndJob_Id(userId, jobId);
    }

    public long countForJob(Long jobId) {
        return favoriteJobRepository.countByJob_Id(jobId);
    }

    public ResultPaginationDTO listFavorites(Long userId, Pageable pageable) {
        Page<FavoriteJob> page = favoriteJobRepository.findByUser_Id(userId, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(page.getTotalPages());
        mt.setTotal(page.getTotalElements());
        rs.setMeta(mt);

        rs.setResult(page.getContent().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList()));
        return rs;
    }
}
