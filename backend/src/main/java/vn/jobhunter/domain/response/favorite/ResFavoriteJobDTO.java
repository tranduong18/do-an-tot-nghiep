package vn.jobhunter.domain.response.favorite;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResFavoriteJobDTO {
    private Long id;
    private Long userId;
    private Long jobId;
    private Instant createdAt;
}
