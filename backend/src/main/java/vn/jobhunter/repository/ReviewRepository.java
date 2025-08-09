package vn.jobhunter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByCompany(Company company, Pageable pageable);

    long countByCompany(Company company);
    long countByCompanyAndRecommended(Company company, boolean recommended);

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.company = :company
    """)
    double avgRating(Company company);
}
