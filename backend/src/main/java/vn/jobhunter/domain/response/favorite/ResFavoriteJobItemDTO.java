package vn.jobhunter.domain.response.favorite;

import java.time.Instant;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResFavoriteJobItemDTO {
    private Long jobId;
    private String name;
    private String location;
    private double salary;
    private String specialization;
    private String workType;

    private Instant favoritedAt;

    private Long companyId;
    private String companyName;
    private String companyLogo;

    private List<String> skills;
}
