package vn.jobhunter.domain.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewRequest {

    @NotNull(message = "rating không được để trống")
    @DecimalMin(value = "0.0", message = "rating phải >= 0.0")
    @DecimalMax(value = "5.0", message = "rating phải <= 5.0")
    private Double rating;

    @Size(max = 5000, message = "Nội dung quá dài (tối đa 5000 ký tự)")
    private String content;
}
