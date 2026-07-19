package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.UserType2Entity;
import com.example.MultiUserSecurityDemo.adapter.security.security_files.JwtUtil;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import com.example.MultiUserSecurityDemo.adapter.web.service.impl.OAuth2ServiceImpl;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles2;
import com.example.MultiUserSecurityDemo.domain.model.UserType2;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

//@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4200"})

@RestController
@RequestMapping("/api/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {

    private final JwtUtil           jwtUtil;
    private final OAuth2ServiceImpl oauth2Service;

    // REST token exchange (optional / fallback)
    @GetMapping("/success")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> oauth2Success(
            @AuthenticationPrincipal OAuth2User oauth2User) {

        if (oauth2User == null) {
            log.error("[OAUTH2] /success called but no OAuth2User principal present");
            return ResponseEntity.badRequest().body(Map.of(
                    "error",   "Authentication failed",
                    "message", "No OAuth2 user information found in security context"
            ));
        }

        try {
            String email      = oauth2User.getAttribute("email");
            String name       = oauth2User.getAttribute("name");
            String provider   = oauth2Service.determineProvider(oauth2User);
            String providerId = oauth2User.getAttribute("sub");     // Google
            if (providerId == null) {
                providerId = String.valueOf(oauth2User.getAttribute("id")); // GitHub
            }

            log.info("[OAUTH2] /success | provider={} | email={}", provider, email);

            // Find-or-create TYPE2 user record
            UserType2Entity entity = oauth2Service.handleOAuthUser(
                    email, name, provider, providerId, oauth2User);

            // Map entity → domain → Spring Security wrapper → JWT
            UserType2Details userDetails = toUserDetails(entity);
            String token        = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername());

            return ResponseEntity.ok(Map.of(
                    "token",        token,
                    "refreshToken", refreshToken,
                    "email",        entity.getEmail(),
                    "username",     entity.getFname() + " " + entity.getLname(),
                    "userType",     "TYPE2",
                    "role",         entity.getRole(),
                    "provider",     provider
            ));

        } catch (Exception e) {
            log.error("[OAUTH2] /success failed | error={}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error",   "OAuth2 login failed",
                    "message", e.getMessage()
            ));
        }
    }

    // Failure endpoint (public — SecurityConfig points failureUrl here)

    @GetMapping("/failure")
    public ResponseEntity<Map<String, Object>> oauth2Failure(
            @RequestParam(required = false) String error) {

        return ResponseEntity.badRequest().body(oauth2Service.handleFailure(error));
    }

    // Raw OAuth2 claim inspector (authenticated)

    @GetMapping("/user-info")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserInfo(
            @AuthenticationPrincipal OAuth2User oauth2User) {

        if (oauth2User == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Not authenticated via OAuth2 — use JWT /api/auth/me instead"
            ));
        }

        return ResponseEntity.ok(oauth2Service.extractUserInfo(oauth2User));
    }

    // Helper

    private UserType2Details toUserDetails(UserType2Entity entity) {
        UserType2 domain = new UserType2();
        domain.setId(entity.getId());
        domain.setEmail(entity.getEmail());
        domain.setFname(entity.getFname());
        domain.setLname(entity.getLname());
        domain.setPassword(entity.getPassword());
        domain.setPhoneNumber(entity.getPhoneNumber());
        domain.setProfilePicture(entity.getProfilePicture());
        domain.setRole(UserRoles2.valueOf(entity.getRole()));
        return new UserType2Details(domain);
    }
}