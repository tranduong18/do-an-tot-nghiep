package vn.jobhunter.domain;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import java.time.Instant;

@Entity @Table(name = "review")
@Getter @Setter
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double rating;
    @Column(columnDefinition = "MEDIUMTEXT")
    private String content;

    @Column(nullable = false)
    private Boolean recommended = false;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void prePersist() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate
    public void preUpdate() { updatedAt = Instant.now(); }
}
