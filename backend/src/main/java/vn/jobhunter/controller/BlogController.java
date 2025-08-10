// src/main/java/vn/jobhunter/controller/BlogController.java
package vn.jobhunter.controller;

import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import vn.jobhunter.domain.Blog;
import vn.jobhunter.domain.request.ReqBlogCreateDTO;
import vn.jobhunter.domain.request.ReqBlogUpdateDTO;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.blog.ResBlogDTO;
import vn.jobhunter.service.BlogService;
import vn.jobhunter.util.annotation.ApiMessage;
import vn.jobhunter.util.error.IdInvalidException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class BlogController {
    private final BlogService blogService;
    public BlogController(BlogService blogService){ this.blogService = blogService; }

    @PostMapping("/blogs")
    public ResponseEntity<ResBlogDTO> create(@Valid @RequestBody ReqBlogCreateDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.handleCreateBlog(req));
    }


    @GetMapping("/blogs")
    @ApiMessage("Fetch blogs")
    public ResponseEntity<ResultPaginationDTO> list(
            @Filter Specification<Blog> spec,
            Pageable pageable,
            @RequestHeader(value = "X-Admin-View", required = false) String adminView) {
        return ResponseEntity.ok(blogService.handleGetBlogsUnified(spec, pageable, adminView));
    }

    @GetMapping("/blogs/{id}")
    @ApiMessage("Fetch blog by id")
    public ResponseEntity<ResBlogDTO> getById(@PathVariable long id) throws IdInvalidException {
        ResBlogDTO dto = blogService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/blogs/slug/{slug}")
    @ApiMessage("Fetch blog by slug")
    public ResponseEntity<ResBlogDTO> getBySlug(@PathVariable String slug) throws IdInvalidException {
        return ResponseEntity.ok(blogService.getBySlugUnified(slug));
    }

    @PutMapping("/blogs")
    @ApiMessage("Update a blog")
    public ResponseEntity<ResBlogDTO> update(@Valid @RequestBody ReqBlogUpdateDTO req) throws IdInvalidException {
        return ResponseEntity.ok(blogService.handleUpdateBlog(req));
    }

    @DeleteMapping("/blogs/{id}")
    @ApiMessage("Delete a blog")
    public ResponseEntity<Void> delete(@PathVariable long id) throws IdInvalidException {
        blogService.handleDeleteBlog(id);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/blogs/{id}/related")
    @ApiMessage("Fetch related blogs")
    public ResponseEntity<List<ResBlogDTO>> getRelatedBlogs(@PathVariable long id,
                                                            @RequestParam(defaultValue = "6") int size)
            throws IdInvalidException {
        return ResponseEntity.ok(blogService.getRelatedByBlogId(id, size));
    }

    @GetMapping("/blogs/{companyId}/blogs")
    @ApiMessage("Fetch blogs by company id")
    public ResponseEntity<ResultPaginationDTO> getBlogsByCompany(
            @PathVariable Long companyId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "6") int size
            ) {

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.max(1, size));
        ResultPaginationDTO rs = blogService.getBlogsByCompany(companyId, pageable);
        return ResponseEntity.ok(rs);
    }
}
