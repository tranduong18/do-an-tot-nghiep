package vn.jobhunter.domain.response.email;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResEmailJob {
    private Long id;
    private String name;
    private double salary;
    private CompanyEmail company;
    private List<SkillEmail> skills;

    private String url;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class CompanyEmail {
        private String name;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class SkillEmail {
        private String name;
    }
}
