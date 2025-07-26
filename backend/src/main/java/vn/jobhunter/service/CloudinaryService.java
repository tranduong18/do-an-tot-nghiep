package vn.jobhunter.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image"
        ));
    }

    public Map<String, Object> uploadRawFile(MultipartFile file, String folder) throws IOException {
        String publicId = file.getOriginalFilename();

        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "raw",
                "public_id", publicId,
                "use_filename", true,
                "unique_filename", false
        ));
    }

    public Map<String, Object> deleteFile(String publicId, String resourceType) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                "resource_type", resourceType
        ));
    }
}
