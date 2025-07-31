package vn.jobhunter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.response.dashboard.ResTopCompanyDTO;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long>,
                JpaSpecificationExecutor<Company> {
    @Query("SELECT new vn.jobhunter.domain.response.dashboard.ResTopCompanyDTO(c.name, COUNT(j)) " +
            "FROM Company c LEFT JOIN c.jobs j " +
            "GROUP BY c.name ORDER BY COUNT(j) DESC")
    List<ResTopCompanyDTO> findTopCompaniesByJobCount();

    List<Company> findTop5ByNameContainingIgnoreCase(String name);
}
