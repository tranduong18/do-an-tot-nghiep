package vn.jobhunter.domain.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqBlogCreateDTO {
    @NotBlank @Size(max = 250)
    private String title;
    @Size(max = 300)
    private String description;
    @NotBlank
    private String content;      // HTML TinyMCE
    @NotBlank
    private String thumbnail;    // URL Cloudinary
    private Boolean published;   // null => false
    private long companyId;      // null => hệ thống
}
