package vn.jobhunter.domain.response.blog;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Getter @Setter
public class ResBlogDTO {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String content;
    private String thumbnail;
    private Boolean published;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    private CompanyDTO company;

    @Getter
    @Setter
    public static class CompanyDTO {
        private long id;
        private String name;
        private String logo;
        private String address;
        private String country;
    }
}
