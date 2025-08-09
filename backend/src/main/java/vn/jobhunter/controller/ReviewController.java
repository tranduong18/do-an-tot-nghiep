package vn.jobhunter.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.jobhunter.domain.request.CreateReviewRequest;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.review.ResReviewDTO;
import vn.jobhunter.service.ReviewService;
import vn.jobhunter.util.annotation.ApiMessage;
import vn.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @ApiMessage("Fetch company reviews")
    public ResponseEntity<ResultPaginationDTO> list(
            @PathVariable("companyId") long companyId,
            Pageable pageable
    ) throws IdInvalidException {
        ResultPaginationDTO data = reviewService.getCompanyReviews(companyId, pageable);
        return ResponseEntity.ok(data);
    }

    @PostMapping
    @ApiMessage("Create review")
    public ResponseEntity<ResReviewDTO> create(
            @PathVariable("companyId") long companyId,
            @Valid @RequestBody CreateReviewRequest req
    ) throws IdInvalidException {
        ResReviewDTO dto = reviewService.createReview(
                companyId, req.getRating(), req.getContent()
        );
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{reviewId}")
    @ApiMessage("Update review")
    public ResponseEntity<ResReviewDTO> update(
            @PathVariable("companyId") long companyId,
            @PathVariable("reviewId") long reviewId,
            @Valid @RequestBody CreateReviewRequest req
    ) throws IdInvalidException {
        return ResponseEntity.ok(
                reviewService.updateReview(companyId, reviewId, req.getRating(), req.getContent())
        );
    }

    @DeleteMapping("/{reviewId}")
    @ApiMessage("Delete review")
    public ResponseEntity<Void> delete(
            @PathVariable("companyId") long companyId,
            @PathVariable("reviewId") long reviewId
    ) throws IdInvalidException {
        reviewService.deleteReview(companyId, reviewId);
        return ResponseEntity.ok().body(null);
    }
}
