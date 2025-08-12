package vn.jobhunter.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.service.NotificationService;
import vn.jobhunter.util.annotation.ApiMessage;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @ApiMessage("Fetch notifications by current user with paginate")
    public ResponseEntity<ResultPaginationDTO> list(Pageable pageable) {
        return ResponseEntity.ok(notificationService.list(pageable));
    }

    @GetMapping("/unread-count")
    @ApiMessage("Unread notifications count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount()));
    }

    @PostMapping("/{id}/read")
    @ApiMessage("Mark one notification as read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    @ApiMessage("Mark all notifications as read")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete one notification")
    public ResponseEntity<Void> deleteOne(@PathVariable Long id) {
        notificationService.deleteOne(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @ApiMessage("Delete all notifications of current user")
    public ResponseEntity<Void> deleteAll() {
        notificationService.deleteAll();
        return ResponseEntity.ok().build();
    }
}
