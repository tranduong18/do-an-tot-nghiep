package vn.jobhunter.controller;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.transaction.Transactional;
import vn.jobhunter.service.EmailService;
import vn.jobhunter.service.SubscriberService;
import vn.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1")
public class EmailController {
    private final EmailService emailService;
    private final SubscriberService subscriberService;

    public EmailController(EmailService emailService, SubscriberService subscriberService) {
        this.emailService = emailService;
        this.subscriberService = subscriberService;
    }

    @GetMapping("/email")
    @ApiMessage("Send simple email")
    // @Scheduled(cron = "*/30 * * * * *")
    // @Transactional
    public String sendSimpleEmail() {
        // this.emailService.sendSimpleEmail();
        // this.emailService.sendEmailSync("ads.hoidanit@gmail.com", "test send email",
        // "<h1> <b> hello </b> </h1>", false,
        // true);
        // this.emailService.sendEmailFromTemplateSync("ads.hoidanit@gmail.com", "test
        // send email", "job");
        this.subscriberService.sendSubscribersEmailJobs();
        return "ok";
    }
}
