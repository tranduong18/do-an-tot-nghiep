package vn.jobhunter.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.jobhunter.domain.Notification;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.notification.ResNotificationDTO;
import vn.jobhunter.repository.NotificationRepository;
import vn.jobhunter.util.SecurityUtil;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationService(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    private Long getCurrentUserId() {
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow();
        User me = userService.handleGetUserByUsername(email);
        return me.getId();
    }

    public ResultPaginationDTO list(Pageable pageable) {
        Long uid = getCurrentUserId();
        Page<Notification> page = notificationRepository.findByUser_IdOrderByCreatedAtDesc(uid, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(page.getTotalPages());
        mt.setTotal(page.getTotalElements());
        rs.setMeta(mt);

        rs.setResult(page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
        return rs;
    }

    public long unreadCount() {
        Long uid = getCurrentUserId();
        return notificationRepository.countByUser_IdAndReadFalse(uid);
    }

    public void markRead(Long id) {
        long uid = getCurrentUserId();
        Notification n = notificationRepository.findById(id).orElseThrow();
        if (n.getUser().getId() != (uid)) throw new RuntimeException("forbidden");
        n.setRead(true);
        notificationRepository.save(n);
    }

    public void markAllRead() {
        long uid = getCurrentUserId();
        List<Notification> list = notificationRepository
                .findByUser_IdOrderByCreatedAtDesc(uid, Pageable.unpaged())
                .getContent();
        if (list.isEmpty()) return;
        list.forEach(n -> { if (Boolean.FALSE.equals(n.getRead())) n.setRead(true); });
        notificationRepository.saveAll(list); // lưu lại
    }

    public void deleteOne(Long id) {
        long uid = getCurrentUserId();
        Notification n = notificationRepository.findById(id).orElseThrow();
        if (n.getUser().getId() != (uid)) throw new RuntimeException("forbidden");
        notificationRepository.delete(n);
    }

    @Transactional
    public void deleteAll() {
        Long uid = getCurrentUserId();
        notificationRepository.deleteByUser_Id(uid);
    }

    public Notification create(User user, String title, String content, String type) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setContent(content);
        n.setType(type);
        n.setRead(false);
        return notificationRepository.save(n);
    }

    private ResNotificationDTO toDTO(Notification n) {
        ResNotificationDTO dto = new ResNotificationDTO();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setContent(n.getContent());
        dto.setType(n.getType());
        dto.setRead(n.getRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
