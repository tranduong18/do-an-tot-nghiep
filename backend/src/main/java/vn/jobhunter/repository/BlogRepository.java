package vn.jobhunter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.jobhunter.domain.Blog;

import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlogRepository extends JpaRepository<Blog, Long>, JpaSpecificationExecutor<Blog> {
    Optional<Blog> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("""
      select b from Blog b 
      where b.company.id = :companyId 
        and b.published = true 
        and b.id <> :excludeId
     """)
    Page<Blog> findRelated(@Param("companyId") Long companyId,
                           @Param("excludeId") Long excludeId,
                           Pageable pageable);

    @Query("""
        select b from Blog b
        where b.company.id = :companyId
          and b.published = true
    """)
    Page<Blog> findPublishedByCompany(@Param("companyId") Long companyId, Pageable pageable);
}
