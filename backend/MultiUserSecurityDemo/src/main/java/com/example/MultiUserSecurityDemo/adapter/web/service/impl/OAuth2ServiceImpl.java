package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.UserType2Entity;
import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType2Repository;
import com.example.MultiUserSecurityDemo.domain.model.UserType2;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles2;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;


@Service
@Slf4j
@RequiredArgsConstructor
public class OAuth2ServiceImpl {

    private final UserType2Repository userType2Repository;

    // PUBLIC API
    public UserType2Entity handleOAuthUser(String email,
                                           String name,
                                           String provider,
                                           String providerId,
                                           OAuth2User oAuth2User) {

        log.info("[OAUTH2] handleOAuthUser | provider={} | email={}", provider, email);

//        VALIDATION
        if (email == null || email.isBlank()) {
            throw new RuntimeException("OAuth provider did not return email");
        }

        return userType2Repository.findByEmail(email)
                .map(existing -> updateExistingUser(existing, provider, providerId, oAuth2User))
                .orElseGet(() -> createOAuthUser(email, name, provider, providerId, oAuth2User));
    }

    public UserType2Entity handleOAuthUser(String email,
                                           String name,
                                           String provider,
                                           String providerId) {
        return handleOAuthUser(email, name, provider, providerId, null);
    }

    public Map<String, Object> handleFailure(String error) {
        log.warn("[OAUTH2] Login failed | error={}", error);
        return Map.of(
                "error",      "OAuth2 authentication failed",
                "message",    error != null ? error : "Authentication was cancelled or denied",
                "suggestion", "Please try again or use email / password login"
        );
    }


    public Map<String, Object> extractUserInfo(OAuth2User oAuth2User) {
        return Map.of(
                "provider",   determineProvider(oAuth2User),
                "email",      oAuth2User.getAttribute("email") != null
                        ? oAuth2User.getAttribute("email") : "N/A",
                "name",       oAuth2User.getAttribute("name")  != null
                        ? oAuth2User.getAttribute("name")  : "N/A",
                "attributes", oAuth2User.getAttributes()
        );
    }

    public String determineProvider(OAuth2User oAuth2User) {
        if (oAuth2User.getAttribute("sub")   != null) return "GOOGLE";
        if (oAuth2User.getAttribute("login") != null) return "GITHUB";
        return "UNKNOWN";
    }


    //  PRIVATE HELPERS
    private UserType2Entity updateExistingUser(UserType2Entity existing,
                                               String provider,
                                               String providerId,
                                               OAuth2User oAuth2User) {

        log.info("[OAUTH2] Updating existing user | email={} | provider={}", existing.getEmail(), provider);

        existing.setProvider(provider);
        existing.setProviderId(providerId);

        // Back-fill profile picture only if we don't already have one
        if (existing.getProfilePicture() == null && oAuth2User != null) {
            String picture = extractPictureUrl(oAuth2User, provider);
            if (picture != null) {
                existing.setProfilePicture(picture);
            }
        }

        return userType2Repository.save(existing);
    }

    private UserType2Entity createOAuthUser(String email,
                                            String name,
                                            String provider,
                                            String providerId,
                                            OAuth2User oAuth2User) {

        log.info("[OAUTH2] Creating new OAuth2 user | email={} | provider={}", email, provider);

        // Parse display name into fname / lname
        String fname = "";
        String lname = "";
        if (name != null && !name.isBlank()) {
            String[] parts = name.trim().split("\\s+", 2);
            fname = parts[0];
            lname = parts.length > 1 ? parts[1] : "";
        } else {
            // Fall back to email local-part as first name
            fname = email.split("@")[0];
        }

        String pictureUrl = (oAuth2User != null) ? extractPictureUrl(oAuth2User, provider) : null;

        UserType2Entity newUser = UserType2Entity.builder()
                .email(email)
                .fname(fname)
                .lname(lname)
                // Random password — OAuth2 users never use password-based login
                .password(UUID.randomUUID().toString())
                .role(UserRoles2.USER.name())         // default role for OAuth2 sign-ups
                .provider(provider)
                .providerId(providerId)
                .profilePicture(pictureUrl)
                .isVerified(true)                      // email verified by provider
                .build();

        UserType2Entity saved = userType2Repository.save(newUser);
        log.info("[OAUTH2] New user created | id={} | email={} | provider={}", saved.getId(), email, provider);
        return saved;
    }

    private String extractPictureUrl(OAuth2User oAuth2User, String provider) {
        if ("GOOGLE".equalsIgnoreCase(provider)) {
            return oAuth2User.getAttribute("picture");
        }
        if ("GITHUB".equalsIgnoreCase(provider)) {
            return oAuth2User.getAttribute("avatar_url");
        }
        // Generic fallback — try both common keys
        String pic = oAuth2User.getAttribute("picture");
        return pic != null ? pic : oAuth2User.getAttribute("avatar_url");
    }
}