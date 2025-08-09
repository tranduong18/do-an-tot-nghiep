package vn.jobhunter.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.favorite.ResFavoriteJobDTO;
import vn.jobhunter.repository.UserRepository;
import vn.jobhunter.service.FavoriteJobService;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.annotation.ApiMessage;
import vn.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteJobController {

    private final FavoriteJobService favoriteJobService;
    private final UserRepository userRepository;

    public FavoriteJobController(FavoriteJobService favoriteJobService,
                                 UserRepository userRepository) {
        this.favoriteJobService = favoriteJobService;
        this.userRepository = userRepository;
    }

    private Long currentUserId() throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow();
        User u = userRepository.findByEmail(email);
        if (u == null) throw new IdInvalidException("User không tồn tại");
        return u.getId();
    }

    @PostMapping("/{jobId}")
    @ApiMessage("Thêm job vào danh sách yêu thích")
    public ResponseEntity<ResFavoriteJobDTO> add(@PathVariable Long jobId) throws IdInvalidException {
        Long uid = currentUserId();
        boolean existed = favoriteJobService.exists(uid, jobId);
        ResFavoriteJobDTO dto = favoriteJobService.add(uid, jobId);
        HttpStatus status = existed ? HttpStatus.OK : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(dto);
    }

    @DeleteMapping("/{jobId}")
    @ApiMessage("Xoá job khỏi danh sách yêu thích")
    public ResponseEntity<Void> remove(@PathVariable Long jobId) throws IdInvalidException {
        favoriteJobService.remove(currentUserId(), jobId);
        return ResponseEntity.ok().body(null);
    }

    @PostMapping("/{jobId}/toggle")
    @ApiMessage("Chuyển trạng thái yêu thích job")
    public ResponseEntity<Boolean> toggle(@PathVariable Long jobId) throws IdInvalidException {
        boolean nowFavorited = favoriteJobService.toggle(currentUserId(), jobId);
        return ResponseEntity.status(HttpStatus.OK).body(nowFavorited);
    }

    @GetMapping("/is-favorited")
    @ApiMessage("Kiểm tra job có được yêu thích hay không")
    public ResponseEntity<Boolean> isFavorited(@RequestParam Long jobId) throws IdInvalidException {
        return ResponseEntity.status(HttpStatus.OK)
                .body(favoriteJobService.isFavorited(currentUserId(), jobId));
    }

    @GetMapping("/jobs/{jobId}/count")
    @ApiMessage("Đếm số người yêu thích job")
    public ResponseEntity<Long> countForJob(@PathVariable Long jobId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(favoriteJobService.countForJob(jobId));
    }

    @GetMapping
    @ApiMessage("Danh sách job yêu thích của current user")
    public ResponseEntity<ResultPaginationDTO> fetchJobFavoriteByUser(Pageable pageable) throws IdInvalidException {
        return ResponseEntity.ok(favoriteJobService.listFavorites(currentUserId(), pageable));
    }
}
