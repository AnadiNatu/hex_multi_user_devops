package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType1Repository;
import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType2Repository;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType1Details;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import com.example.MultiUserSecurityDemo.adapter.web.service.impl.CloudinaryService;
import com.example.MultiUserSecurityDemo.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

//import java.util.logging.Logger;
//@CrossOrigin(origins = {"http://localhost:5173","http://localhost:4200"})


@RestController
@RequestMapping("/api/profile/")
@RequiredArgsConstructor
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    private final CloudinaryService cloudinaryService;
    private final UserType1Repository userType1Repository;
    private final UserType2Repository userType2Repository;

    @PostMapping("photo")
    public ResponseEntity<Map<String, Object>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        log.info("[PROFILE] Photo upload request | email={}", email);

        if (userDetails instanceof UserType1Details d) {
            var entity = userType1Repository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("UserType1", "email", email));

            String url = cloudinaryService.uploadProfilePhoto(file, "t1_" + entity.getId());
            entity.setProfilePicture(url);
            userType1Repository.save(entity);

            log.info("[PROFILE] TYPE1 photo updated | id={} | url={}", entity.getId(), url);
            return ResponseEntity.ok(Map.of(
                    "message",    "Profile photo updated successfully",
                    "photoUrl",   url,
                    "userType",   "TYPE1"
            ));

        } else if (userDetails instanceof UserType2Details d) {
            var entity = userType2Repository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("UserType2", "email", email));

            String url = cloudinaryService.uploadProfilePhoto(file, "t2_" + entity.getId());
            entity.setProfilePicture(url);
            userType2Repository.save(entity);

            log.info("[PROFILE] TYPE2 photo updated | id={} | url={}", entity.getId(), url);
            return ResponseEntity.ok(Map.of(
                    "message",    "Profile photo updated successfully",
                    "photoUrl",   url,
                    "userType",   "TYPE2"
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Unknown user type"));
    }

    @GetMapping("photo")
    public ResponseEntity<Map<String, Object>> getProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();

        if (userDetails instanceof UserType1Details d) {
            var entity = userType1Repository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("UserType1", "email", email));
            return ResponseEntity.ok(Map.of(
                    "photoUrl", entity.getProfilePicture() != null ? entity.getProfilePicture() : "",
                    "userType", "TYPE1"
            ));

        } else if (userDetails instanceof UserType2Details d) {
            var entity = userType2Repository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("UserType2", "email", email));
            return ResponseEntity.ok(Map.of(
                    "photoUrl", entity.getProfilePicture() != null ? entity.getProfilePicture() : "",
                    "userType", "TYPE2"
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Unknown user type"));
    }

    @DeleteMapping("photo")
    public ResponseEntity<Map<String, Object>> removeProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();

        if (userDetails instanceof UserType1Details d) {
            var entity = userType1Repository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("UserType1", "email", email));

            if (entity.getProfilePicture() != null) {
                cloudinaryService.deleteImage("multiuser/profiles/user_t1_" + entity.getId());
                entity.setProfilePicture(null);
                userType1Repository.save(entity);
            }
            return ResponseEntity.ok(Map.of("message", "Profile photo removed"));

        } else if (userDetails instanceof UserType2Details d) {
            var entity = userType2Repository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("UserType2", "email", email));

            if (entity.getProfilePicture() != null) {
                cloudinaryService.deleteImage("multiuser/profiles/user_t2_" + entity.getId());
                entity.setProfilePicture(null);
                userType2Repository.save(entity);
            }
            return ResponseEntity.ok(Map.of("message", "Profile photo removed"));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Unknown user type"));
    }
}
