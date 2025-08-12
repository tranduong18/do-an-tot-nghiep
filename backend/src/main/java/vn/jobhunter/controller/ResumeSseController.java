package vn.jobhunter.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vn.jobhunter.domain.User;
import vn.jobhunter.service.SseService;
import vn.jobhunter.service.UserService;
import vn.jobhunter.util.SecurityUtil;

@RestController
@RequestMapping("/api/v1/resume-sse")
public class ResumeSseController {
    private final SseService sseService;
    private final UserService userService;

    public ResumeSseController(SseService sseService, UserService userService) {
        this.sseService = sseService;
        this.userService = userService;
    }

    @GetMapping("/subscribe")
    public SseEmitter subscribe() {
        String email = SecurityUtil.getCurrentUserLogin().orElseThrow();
        User me = userService.handleGetUserByUsername(email);
        return sseService.subscribe(me.getId());
    }
}
