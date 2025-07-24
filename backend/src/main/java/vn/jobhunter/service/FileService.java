package vn.jobhunter.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {
    private final CloudinaryService cloudinaryService;
    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    public FileService(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    public Map<String, Object> upload(MultipartFile file, String folder, String type) throws IOException {
        return switch (type.toLowerCase()) {
            case "image" -> cloudinaryService.uploadImage(file, folder);
            case "file" -> cloudinaryService.uploadRawFile(file, folder);
            default -> throw new IllegalArgumentException("Invalid type: only 'image' or 'file' allowed");
        };
    }

    public boolean delete(String publicId, String type) throws IOException {
        Map<String, Object> result = cloudinaryService.deleteFile(publicId, type);
        return "ok".equals(result.get("result"));
    }

    public byte[] downloadFile(String publicId, String resourceType) throws IOException {
        String url = String.format("https://res.cloudinary.com/%s/%s/upload/%s",
                cloudName, resourceType, publicId);
        System.out.println(">>> Downloading from Cloudinary URL: " + url);

        try (InputStream in = new URL(url).openStream()) {
            return in.readAllBytes();
        } catch (IOException e) {
            throw new IOException("Failed to download file from Cloudinary", e);
        }
    }
}
