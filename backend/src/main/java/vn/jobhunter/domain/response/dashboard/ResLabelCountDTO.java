package vn.jobhunter.domain.response.dashboard;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ResLabelCountDTO {
    private String label;
    private Long count;
}
