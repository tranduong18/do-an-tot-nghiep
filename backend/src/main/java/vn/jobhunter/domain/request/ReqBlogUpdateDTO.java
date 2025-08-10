package vn.jobhunter.domain.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqBlogUpdateDTO {
    @NotNull
    private Long id;

    @NotBlank @Size(max = 250)
    private String title;
    @Size(max = 300)
    private String description;
    @NotBlank
    private String content;
    @NotBlank
    private String thumbnail;

    private Boolean published;

    private long companyId;
}
