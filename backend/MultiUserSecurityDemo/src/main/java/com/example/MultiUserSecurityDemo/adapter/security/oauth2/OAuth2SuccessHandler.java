package com.example.MultiUserSecurityDemo.adapter.security.oauth2;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.UserType2Entity;
import com.example.MultiUserSecurityDemo.adapter.security.security_files.JwtUtil;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import com.example.MultiUserSecurityDemo.adapter.web.service.impl.OAuth2ServiceImpl;
import com.example.MultiUserSecurityDemo.domain.model.UserType2;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles2;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;


@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

//    @Value("${app.frontend.url:http://localhost:5173}")
//    private String frontendUrl;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String oauthRedirectUri;

    private final JwtUtil jwtUtil;
    private final OAuth2ServiceImpl oAuth2Service;

    // HANDLER ENTRY POINT
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email      = oAuth2User.getAttribute("email");
        String name       = oAuth2User.getAttribute("name");
        String provider   = oAuth2Service.determineProvider(oAuth2User);

        // Google uses "sub", GitHub uses "id" (numeric)
        String providerId = oAuth2User.getAttribute("sub");
        if (providerId == null) {
            Object idAttr = oAuth2User.getAttribute("id");
            providerId = idAttr != null ? String.valueOf(idAttr) : null;
        }

        log.info("[OAUTH2] Success handler invoked | provider={} | email={}", provider, email);

        if (email == null || email.isBlank()) {
            log.error("[OAUTH2] No email claim in OAuth2 token | provider={}", provider);
            response.sendRedirect(oauthRedirectUri + "?error=..."
                    + encode("Email not provided by " + provider));
            return;
        }

        try {
            // 1. Find or create the TYPE2 user record
            UserType2Entity entity = oAuth2Service.handleOAuthUser(
                    email, name, provider, providerId, oAuth2User);

            entity.setApproved(true);
            entity.setEmailVerified(true);


            // 2. Map entity → domain model → UserDetails wrapper
            UserType2Details userDetails = toUserDetails(entity);

            // 3. Generate tokens
            String token        = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername());

            log.info("[OAUTH2] JWT issued | email={} | role={}", email, entity.getRole());

            // 4. Redirect browser to frontend with tokens as query parameters
            String redirectUrl = oauthRedirectUri
                    + "?token="        + encode(token)
                    + "&refreshToken=" + encode(refreshToken)
                    + "&email="        + encode(email)
                    + "&username="     + encode(entity.getFname() + " " + entity.getLname())
                    + "&userType=TYPE2"
                    + "&role="         + encode(entity.getRole())
                    + "&provider="     + encode(provider);

            response.sendRedirect(redirectUrl);

        } catch (Exception ex) {
            log.error("[OAUTH2] Success handler failed | email={} | error={}", email, ex.getMessage(), ex);
            response.sendRedirect(oauthRedirectUri + "?error=" + encode("Email not provided by " + provider));
        }
    }

    // HELPERS
    private UserType2Details toUserDetails(UserType2Entity entity) {
        UserType2 domain = new UserType2();
        domain.setId(entity.getId());
        domain.setEmail(entity.getEmail());
        domain.setFname(entity.getFname());
        domain.setLname(entity.getLname());
        domain.setPassword(entity.getPassword() != null ? entity.getPassword() : "");
        domain.setPhoneNumber(entity.getPhoneNumber());
        domain.setProfilePicture(entity.getProfilePicture());
        domain.setRole(UserRoles2.valueOf(entity.getRole()));
        // OAuth Approval
        domain.setApproved(true);
        domain.setEmailVerified(true);
        return new UserType2Details(domain);
    }

    private String encode(String value) {
        if (value == null) return "";
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}