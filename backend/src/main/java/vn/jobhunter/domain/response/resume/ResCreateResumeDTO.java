package vn.jobhunter.domain.response.resume;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResCreateResumeDTO {
    private long id;
    private String url;
    private Instant createdAt;
    private String createdBy;
}
