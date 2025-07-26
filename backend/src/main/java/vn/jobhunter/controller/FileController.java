package vn.jobhunter.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.jobhunter.domain.response.file.ResUploadFileDTO;
import vn.jobhunter.service.FileService;
import vn.jobhunter.util.annotation.ApiMessage;
import vn.jobhunter.util.error.StorageException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1")
public class FileController {

    private final FileService fileService;
    @Value("${cloudinary.cloud_name}")
    private String cloudName;


    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/files")
    @ApiMessage("Upload file or image to Cloudinary")
    public ResponseEntity<ResUploadFileDTO> uploadFileToCloudinary(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder,
            @RequestParam("type") String type
    ) throws IOException, StorageException {
        if (file == null || file.isEmpty()) {
            throw new StorageException("File is empty. Please upload a file");
        }

        String fileName = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();

        List<String> allowed;
        if ("image".equalsIgnoreCase(type)) {
            allowed = List.of("jpg", "jpeg", "png", "gif", "webp");
        } else if ("file".equalsIgnoreCase(type)) {
            allowed = List.of("pdf", "doc", "docx");
        } else {
            throw new StorageException("Invalid type. Only 'image' or 'file' allowed.");
        }

        boolean isValid = allowed.stream().anyMatch(fileName::endsWith);
        if (!isValid) {
            throw new StorageException("Invalid file extension for type '" + type + "'");
        }

        Map<String, Object> result = fileService.upload(file, folder, type);
        String url = result.get("secure_url").toString();
        Instant uploadedAt = Instant.now();

        return ResponseEntity.ok(new ResUploadFileDTO(url, uploadedAt));
    }

    @DeleteMapping("/files")
    @ApiMessage("Delete file on Cloudinary")
    public ResponseEntity<?> deleteFile(
            @RequestParam("publicId") String publicId,
            @RequestParam("type") String type
    ) throws IOException, StorageException {
        if (publicId == null || publicId.isEmpty()) {
            throw new StorageException("Missing required param: publicId");
        }

        boolean deleted = fileService.delete(publicId, type.equalsIgnoreCase("file") ? "raw" : "image");
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } else {
            return ResponseEntity.status(400).body(Map.of("message", "File not found or already deleted"));
        }
    }

    @GetMapping("/files")
    public ResponseEntity<byte[]> downloadFileDirect(
            @RequestParam("publicId") String publicId,
            @RequestParam("type") String type
    ) throws IOException, StorageException {
        if (publicId == null || publicId.isEmpty()) {
            throw new StorageException("Missing required param: publicId");
        }

        String resourceType = type.equalsIgnoreCase("file") ? "raw" : "image";

        // Sử dụng URL đúng cho loại file (image/raw)
        String url = String.format("https://res.cloudinary.com/%s/%s/upload/%s",
                cloudName, resourceType, publicId)
                ;
        System.out.println(">>> Fetching file from Cloudinary: " + url);

        byte[] fileBytes = fileService.downloadFileFromUrl(url);

        String filename = publicId.contains("/") ?
                publicId.substring(publicId.lastIndexOf("/") + 1) : publicId;

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .header("Content-Type", "application/octet-stream")
                .body(fileBytes);
    }
}
