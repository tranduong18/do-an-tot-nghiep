package vn.jobhunter.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.jobhunter.service.SubscriberService;
import vn.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1")
public class EmailController {
    private final SubscriberService subscriberService;

    public EmailController(SubscriberService subscriberService) {
        this.subscriberService = subscriberService;
    }

    @GetMapping("/email")
    @ApiMessage("Send simple email")
    public String sendSimpleEmail() {
        this.subscriberService.sendSubscribersEmailJobs();
        return "ok";
    }
}
