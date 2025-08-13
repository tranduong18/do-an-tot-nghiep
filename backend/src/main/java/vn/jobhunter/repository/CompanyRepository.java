package vn.jobhunter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.response.dashboard.ResTopCompanyDTO;

import java.time.Instant;
import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long>,
                JpaSpecificationExecutor<Company> {

    List<Company> findTop5ByNameContainingIgnoreCase(String name);

    long countByCreatedAtBetween(Instant start, Instant end);
}
