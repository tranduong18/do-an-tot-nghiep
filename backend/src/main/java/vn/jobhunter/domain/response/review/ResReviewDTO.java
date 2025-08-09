package vn.jobhunter.domain.response.review;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ResReviewDTO {
    private long id;
    private Double rating;
    private String content;
    private Boolean recommended;
    private Instant createdAt;
    private CompanyInfo company;
    private UserInfo user;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class CompanyInfo {
        private Long id;
        private String name;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String fullName;
        private String avatar;
    }
}
