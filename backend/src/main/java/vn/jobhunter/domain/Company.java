package vn.jobhunter.domain;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import vn.jobhunter.util.SecurityUtil;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Name không được để trống")
    private String name;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String description;

    private String address;

    private String logo;

    private String country;

    private String website;       // Website công ty
    private String industry;      // Lĩnh vực
    private String size;          // Quy mô nhân sự (VD: 301-500 nhân viên)
    private String model;         // Mô hình công ty (Sản phẩm/Dịch vụ...)

    // Thông tin hoạt động
    private String workingTime;   // Thời gian làm việc (VD: Thứ 2 - Thứ 6)
    private String overtimePolicy;// Chính sách OT (Có OT/Không có OT)

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer openJobs = 0; // Số lượng việc làm đang tuyển

    // Đánh giá
    @Column(columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double rating = 0.0;        // Điểm trung bình (VD: 4.8)
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer reviewCount = 0;    // Số lượng đánh giá
    @Column(columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double reviewPercent = 0.0; // % khuyến khích làm việc (VD: 98)

    // Nội dung hiển thị thêm
    @Column(columnDefinition = "MEDIUMTEXT")
    private String benefits;      // Phúc lợi (có thể lưu dạng JSON)

    @Column(columnDefinition = "MEDIUMTEXT")
    private String tags;          // Tags chuyên môn (VD: Java, Agile...) - dạng JSON

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer postCount = 0; // Số bài viết (tab Bài viết)

    private Instant createdAt;

    private Instant updatedAt;

    private String createdBy;

    private String updatedBy;

    @OneToMany(mappedBy = "company", fetch = FetchType.LAZY)
    @JsonIgnore
    List<User> users;

    @OneToMany(mappedBy = "company", fetch = FetchType.LAZY)
    @JsonIgnore
    List<Job> jobs;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        this.updatedAt = Instant.now();
    }
}
