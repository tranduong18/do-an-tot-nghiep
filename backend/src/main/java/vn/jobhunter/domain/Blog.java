package vn.jobhunter.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import vn.jobhunter.util.SecurityUtil;

import java.time.Instant;

@Entity
@Table(name = "blogs", indexes = {
        @Index(name = "idx_blogs_slug", columnList = "slug", unique = true),
        @Index(name = "idx_blogs_createdAt", columnList = "createdAt"),
        @Index(name = "idx_blogs_company", columnList = "company_id")
})
@Getter
@Setter
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Column(nullable = false, length = 250)
    private String title;

    @Column(nullable = false, length = 260, unique = true)
    private String slug;

    @Column(length = 300)
    private String description;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String thumbnail;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @JsonIgnore
    private Company company;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user")
    @JsonIgnore
    private User createdByUser;

    private Instant createdAt;
    private Instant updatedAt;

    private String createdBy;
    private String updatedBy;

    @Column(nullable = false, columnDefinition = "BIT(1) DEFAULT 0")
    private Boolean published = false;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.updatedAt = Instant.now();
    }
}
