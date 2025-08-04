package vn.jobhunter.domain.response.job;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class ResCompanyJobDTO {
    private Long id;
    private String name;
    private String location;
    private Double salary;
    private String specialization;
    private String workType;

    private Instant createdAt;
    private Instant updatedAt;

    private CompanyDTO company;
    private List<SkillDTO> skills;

    @Getter
    @Setter
    public static class CompanyDTO {
        private Long id;
        private String name;
        private String logo;
    }

    @Getter
    @Setter
    public static class SkillDTO {
        private Long id;
        private String name;
    }
}
