package vn.jobhunter.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_noti_user", columnList = "user_id"),
        @Index(name = "idx_noti_user_is_read", columnList = "user_id, is_read")
})
@Getter @Setter
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id")
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String type;

    @Column(name = "is_read")
    private Boolean read = false;

    @CreationTimestamp
    private Instant createdAt;
}

