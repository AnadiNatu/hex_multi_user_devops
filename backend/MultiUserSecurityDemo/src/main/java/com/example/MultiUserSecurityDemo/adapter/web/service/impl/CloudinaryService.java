package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.MultiUserSecurityDemo.exception.InvalidOperationException;
import jakarta.mail.Multipart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.springframework.web.servlet.function.RequestPredicates.contentType;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {


//    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

   private final Cloudinary cloudinary;

   private static final String PROFILE_FOLDER = "multiuser/profiles";
   private static final String PRODUCT_FOLDER = "multiuser/products";
   private static final String DOCUMENT_FOLDER = "multiuser/documents";

   public String uploadProfilePhoto(MultipartFile file , String userId) {
       validateImageFile(file);

       String publicId = PROFILE_FOLDER + "/user_" + userId;
       log.info("[CLOUDINARY] Uploading profile photo | userId={} | filename={} | size={}KB", userId, file.getOriginalFilename(), file.getSize() / 1024);

       try {
           Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                   ObjectUtils.asMap(
                           "public_id", publicId,
                           "overwrite", true,
                           "resource_type", "image",
                           "folder", PROFILE_FOLDER,
                           "transformation", new com.cloudinary.Transformation<>().width(400).height(400).crop("fill").gravity("face").quality("auto").fetchFormat("auto")
                   ));

           String url = (String) uploadResult.get("secure_url");
           log.info("[CLOUDINARY] Profile photo uploaded successfully | userId={} | url={}", userId, url);
            return url;
       }catch (IOException e){
           log.error("[CLOUDINARY] Upload failed | userId={} | error={}", userId, e.getMessage(), e);
           throw new RuntimeException("Failed to upload profile photo: " + e.getMessage() , e);
       }
   }

   public String uploadProductImage(MultipartFile file , String productId , String userType){
       validateImageFile(file);

       String publicId = PRODUCT_FOLDER + "/" + userType.toLowerCase() + "/" + productId;

       log.info("[CLOUDINARY] Uploading product image | productId={} | userType={} | filename={}",
               productId, userType, file.getOriginalFilename());

       try
       {
           Map uploadResult = cloudinary.uploader().upload(file.getBytes() , ObjectUtils.asMap(
                   "public_id" , publicId,
                   "resource_type" , "image",
                   "folder" , PRODUCT_FOLDER + "/" + userType.toLowerCase(),
                   "transformation" , new com.cloudinary.Transformation<>().width(800).height(800).crop("limit").quality("auto").fetchFormat("auto")
           ));

           String url = (String) uploadResult.get("secure_url");
           log.info("[CLOUDINARY] Product image uploaded successfully | productId={} | url={}", productId, url);

           return url;
       } catch (IOException e) {
           log.error("[CLOUDINARY] Product upload failed | productId={} | error={}", productId, e.getMessage(), e);
           throw new RuntimeException("Failed to upload product image: " + e.getMessage());
       }
   }

   public String[] uploadProductImages(MultipartFile[] files , String productId , String userType){
       if (files == null || files.length == 0){
           throw new IllegalArgumentException("No files provided");
       }

       if (files.length > 10){
           throw new IllegalArgumentException("Maximum 10 images allowed per product");
       }

       log.info("[CLOUDINARY] Uploading {} product images | productId={}", files.length, productId);

       String[] url = new String[files.length];
       for (int i = 0 ; i < files.length ; i++){
           url[i] = uploadProductImage(files[i] , productId + "_img" + (i+1) , userType);
       }
       log.info("[CLOUDINARY] All product images upload | product={} | count={}" , productId , files.length);
       return url;
   }

   public String uploadPdfDocument(MultipartFile file , String documentId , String userType){
       validatePdfFile(file);
       String publicId = DOCUMENT_FOLDER + "/" + userType.toLowerCase() + "/" + documentId;

       log.info("[CLOUDINARY] Uploading PDF document | documentId={} | userType={} | filename={}", documentId, userType, file.getOriginalFilename());

       try {
           Map uploadResult = cloudinary.uploader().upload(file.getBytes() , ObjectUtils.asMap(
                   "public_id" , publicId,
                   "resource_type" , "raw",
                   "folder" , DOCUMENT_FOLDER + "/" + userType.toLowerCase()
           ));

           String url = (String) uploadResult.get("secure_url");
           log.info("[CLOUDINARY] PDF uploaded successfully | documentId={} | url={}", documentId, url);

           return url;
       } catch (IOException e) {
           log.error("[CLOUDINARY] PDF upload failed | documentId={} | error={}", documentId, e.getMessage(), e);
           throw new RuntimeException(e);
       }
   }

   public void deleteImage(String publicId){
       log.info("[CLOUDINARY] Deleting image | publicId={}", publicId);

       try{
           Map result = cloudinary.uploader().destroy(publicId , ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("status");
           if ("ok".equals(resultStatus)){
               log.info("[CLOUDINARY] Image deleted successfully | publicId={}", publicId);
           }else {
               log.info("[CLOUDINANRY] Image deleted returned status: {} | publicId = {}" , resultStatus , publicId);
           }

       } catch (IOException e) {
           log.error("[CLOUDINARY] Delete failed | publicId={} | error={}", publicId, e.getMessage(), e);
           throw new RuntimeException("Failed to delete image: " + e.getMessage(), e);
       }
   }

   public void deletePdf(String publicId){
       log.info("[CLOUDINARY] Deleting PDF | publicId={}", publicId);

       try{
           Map result = cloudinary.uploader().destroy(publicId , ObjectUtils.asMap("resource_type" , "raw"));
           String resultStatus = (String) result.get("result");

           if ("ok".equals(resultStatus)){
               log.info("[CLOUDINARY] PDF deleted successfully | publicId={}", publicId);
           }else {
               log.warn("[CLOUDINARY] PDF deletion returned status: {} | publicId={}", resultStatus, publicId);
           }

       } catch (IOException e) {
           log.error("[CLOUDINARY] PDF delete failed | publicId={} | error={}", publicId, e.getMessage(), e);
           throw new RuntimeException("Failed to delete PDF: " + e.getMessage(), e);
       }
   }
//   Helper Methods
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }
        String contentType;
        contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image (jpg, png, gif, webp)");
        }
        if (!contentType.equals("image/jpeg") &&
                !contentType.equals("image/png") &&
                !contentType.equals("image/gif") &&
                !contentType.equals("image/webp")) {
            throw new IllegalArgumentException("Unsupported image format. Supported: jpg, png, gif, webp");
        }
    }

    private void validatePdfFile(MultipartFile file){
       if (file == null || file.isEmpty()){
           throw new IllegalArgumentException("File is empty");
       }

       if (file.getSize() > 10*1024*1024){
           throw new IllegalArgumentException("PDF size exceeds 10MD limit");
       }

       String contentType = file.getContentType();
       if (contentType == null || !contentType.equals("application/pdf")){
           throw new IllegalArgumentException("File must be a PDF");
       }

       String filename = file.getOriginalFilename();
       if (filename == null || !filename.toLowerCase().endsWith(".pdf")){
           throw new IllegalArgumentException("File not supported");
       }
    }

    public String getUrl(String publicId){
       return cloudinary.url().generate(publicId);
    }

    public String extractPublicId(String url){
       if (url == null || url.isBlank()){
           return null;
       }

       try{
           String[] parts = url.split("/upload/");
           if (parts.length < 2) return null;

           String afterUpload = parts[1];

//           Remove version
           String withoutVersion = afterUpload.replaceFirst("v\\d+/" , "");
//           Remove file extension
           int lastDot = withoutVersion.lastIndexOf('.');

           if (lastDot > 0){
               return withoutVersion.substring(0 , lastDot);
           }
           return withoutVersion;
       }catch (Exception ex){
           log.error("[CLOUDINARY] Failed to extract public ID from URL : {}" , url , ex);
           return null;
       }
    }
}
