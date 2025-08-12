package vn.jobhunter.domain.response.notification;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ResNotificationDTO {
    private long id;
    private String title;
    private String content;
    private String type;
    private Boolean read;
    private Instant createdAt;
}
