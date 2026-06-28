package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType1Details;
import com.example.MultiUserSecurityDemo.adapter.web.dto.SignUpRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.SignUpResponse;
import com.example.MultiUserSecurityDemo.adapter.web.service.AuthService;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles1;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles2;
import com.example.MultiUserSecurityDemo.domain.port.UserType1Port;
import com.example.MultiUserSecurityDemo.domain.port.UserType2Port;
import com.example.MultiUserSecurityDemo.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/provision")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4200"})
@RequiredArgsConstructor
@Slf4j
public class AdminProvisionController {

    private final AuthService authService;
    private final UserType1Port userType1Port;
    private final UserType2Port userType2Port;
    private final EmailService emailService;

    // ═══════════════════════════════════════════════════════════════════════
    //  ADMIN-ONLY: create + approve TYPE1 users (ADMIN1 / ADMIN2)
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * ADMIN creates a new ADMIN_TYPE1 or ADMIN_TYPE2 account.
     * The created user receives a verification OTP email automatically.
     * They must still verify their email, but are pre-approved by the ADMIN.
     */
    @PostMapping("/admin-user")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SignUpResponse> createAdminUser(
            @RequestBody SignUpRequest request,
            @AuthenticationPrincipal UserType1Details caller) {

        String callerEmail = caller.getUsername();
        log.info("[PROVISION] ADMIN creating TYPE1 user | by={} | targetEmail={} | role={}",
                callerEmail, request.getEmail(), request.getRole());

        // Enforce allowed roles for this tier
        if (!isAllowedAdminRole(request.getRole())) {
            return ResponseEntity.badRequest().body(
                    SignUpResponse.builder()
                            .message("ADMIN can only create ADMIN_TYPE1 or ADMIN_TYPE2 accounts. Got: " + request.getRole())
                            .build());
        }

        request.setUserType("TYPE1");
        request.setCreatedByAdmin(callerEmail);

        SignUpResponse response = authService.signup(request);

        if (response.getId() != null) {
            // ADMIN-created users are pre-approved; they only need email verification
            userType1Port.findByEmail(request.getEmail()).ifPresent(u -> {
                u.setApproved(true);          // pre-approved by ADMIN
                u.setCreatedByAdmin(callerEmail);
                userType1Port.save(u);
            });

            // Send invitation email
            sendInvitationEmail(request.getEmail(), request.getFname(), callerEmail, request.getRole());

            response.setMessage("Admin user created and pre-approved. A verification email has been sent.");
        }

        HttpStatus status = response.getId() != null ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    /**
     * ADMIN approves a pending TYPE1 account (in case auto-pre-approve is disabled
     * or an account was created via the public signup form).
     */
    @PostMapping("/approve/type1/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveType1User(
            @PathVariable Long id,
            @AuthenticationPrincipal UserType1Details caller) {

        log.info("[PROVISION] ADMIN approving TYPE1 id={} | by={}", id, caller.getUsername());

        return userType1Port.findById(id)
                .map(u -> {
                    if (u.isApproved()) {
                        return ResponseEntity.ok(Map.<String, Object>of(
                                "message", "User is already approved.",
                                "userId", id
                        ));
                    }
                    u.setApproved(true);
                    userType1Port.save(u);

                    // Notify the user
                    try {
                        emailService.sendHtmlEmail(
                                u.getEmail(),
                                "Your account has been approved",
                                buildApprovalEmailBody(u.getFname(), u.getRoles1().name())
                        );
                    } catch (Exception ex) {
                        log.warn("[PROVISION] Approval email failed | email={}", u.getEmail());
                    }

                    log.info("[PROVISION] TYPE1 user approved | userId={} | email={}", id, u.getEmail());
                    return ResponseEntity.ok(Map.<String, Object>of(
                            "message", "User approved successfully.",
                            "userId", id,
                            "email", u.getEmail(),
                            "role", u.getRoles1().name()
                    ));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "TYPE1 user not found with id=" + id)));
    }

    /**
     * ADMIN lists all pending (unapproved) TYPE1 accounts.
     */
    @GetMapping("/pending/type1")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> pendingType1Users() {
        List<Map<String, Object>> pending = userType1Port.findByIsApprovedFalse()
                .stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "name", u.getFname() + " " + u.getLname(),
                        "role", u.getRoles1().name(),
                        "emailVerified", u.isEmailVerified(),
                        "createdByAdmin", u.getCreatedByAdmin() != null ? u.getCreatedByAdmin() : "self-registered"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(pending);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  ADMIN2-ONLY: create + approve TYPE2 users (USER1 / USER2)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ADMIN_TYPE2 creates a new USER_TYPE1 or USER_TYPE2 account.
     * The created user receives a verification OTP email automatically.
     * They must still verify their email, but are pre-approved.
     */
    @PostMapping("/user")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2')")
    public ResponseEntity<SignUpResponse> createUser(
            @RequestBody SignUpRequest request,
            @AuthenticationPrincipal UserType1Details caller) {

        String callerEmail = caller.getUsername();
        log.info("[PROVISION] ADMIN2 creating TYPE2 user | by={} | targetEmail={} | role={}",
                callerEmail, request.getEmail(), request.getRole());

        // Enforce allowed roles for this tier
        if (!isAllowedUserRole(request.getRole())) {
            return ResponseEntity.badRequest().body(
                    SignUpResponse.builder()
                            .message("ADMIN_TYPE2 can only create USER_TYPE1 or USER_TYPE2 accounts. Got: " + request.getRole())
                            .build());
        }

        request.setUserType("TYPE2");
        request.setCreatedByAdmin(callerEmail);

        SignUpResponse response = authService.signup(request);

        if (response.getId() != null) {
            // Pre-approve: admin2-created users only need email verification
            userType2Port.findByEmail(request.getEmail()).ifPresent(u -> {
                u.setApproved(true);
                u.setCreatedByAdmin(callerEmail);
                userType2Port.save(u);
            });

            sendInvitationEmail(request.getEmail(), request.getFname(), callerEmail, request.getRole());
            response.setMessage("User created and pre-approved. A verification email has been sent.");
        }

        HttpStatus status = response.getId() != null ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    /**
     * ADMIN or ADMIN_TYPE2 approves a pending TYPE2 account.
     */
    @PostMapping("/approve/type2/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2')")
    public ResponseEntity<Map<String, Object>> approveType2User(
            @PathVariable Long id,
            @AuthenticationPrincipal UserType1Details caller) {

        log.info("[PROVISION] Approving TYPE2 id={} | by={}", id, caller.getUsername());

        return userType2Port.findById(id)
                .map(u -> {
                    if (u.isApproved()) {
                        return ResponseEntity.ok(Map.<String, Object>of(
                                "message", "User is already approved.",
                                "userId", id
                        ));
                    }
                    u.setApproved(true);
                    userType2Port.save(u);

                    try {
                        emailService.sendHtmlEmail(
                                u.getEmail(),
                                "Your account has been approved",
                                buildApprovalEmailBody(u.getFname(), u.getRole().name())
                        );
                    } catch (Exception ex) {
                        log.warn("[PROVISION] Approval email failed | email={}", u.getEmail());
                    }

                    log.info("[PROVISION] TYPE2 user approved | userId={} | email={}", id, u.getEmail());
                    return ResponseEntity.ok(Map.<String, Object>of(
                            "message", "User approved successfully.",
                            "userId", id,
                            "email", u.getEmail(),
                            "role", u.getRole().name()
                    ));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "TYPE2 user not found with id=" + id)));
    }

    /**
     * ADMIN or ADMIN_TYPE2 lists all pending (unapproved) TYPE2 accounts.
     */
    @GetMapping("/pending/type2")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2')")
    public ResponseEntity<List<Map<String, Object>>> pendingType2Users() {
        List<Map<String, Object>> pending = userType2Port.findByIsApprovedFalse()
                .stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "name", u.getFname() + " " + u.getLname(),
                        "role", u.getRole().name(),
                        "emailVerified", u.isEmailVerified(),
                        "createdByAdmin", u.getCreatedByAdmin() != null ? u.getCreatedByAdmin() : "self-registered"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(pending);
    }

    // ── Password recovery trigger (admin can trigger for any managed user) ─

    /**
     * ADMIN triggers a password-reset OTP for any TYPE1 user by id.
     */
    @PostMapping("/reset-password/type1/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminTriggerPasswordResetType1(
            @PathVariable Long id,
            @AuthenticationPrincipal UserType1Details caller) {

        log.info("[PROVISION] Admin password-reset trigger | TYPE1 id={} | by={}", id, caller.getUsername());

        return userType1Port.findById(id)
                .map(u -> {
                    emailService.sendOtpViaEmail(u.getEmail());
                    log.info("[PROVISION] Password-reset OTP sent | email={}", u.getEmail());
                    return ResponseEntity.ok(Map.<String, Object>of(
                            "message", "Password reset OTP sent to " + maskEmail(u.getEmail()),
                            "userId", id
                    ));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "TYPE1 user not found with id=" + id)));
    }

    /**
     * ADMIN or ADMIN_TYPE2 triggers a password-reset OTP for any TYPE2 user by id.
     */
    @PostMapping("/reset-password/type2/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2')")
    public ResponseEntity<Map<String, Object>> adminTriggerPasswordResetType2(
            @PathVariable Long id,
            @AuthenticationPrincipal UserType1Details caller) {

        log.info("[PROVISION] Admin password-reset trigger | TYPE2 id={} | by={}", id, caller.getUsername());

        return userType2Port.findById(id)
                .map(u -> {
                    emailService.sendOtpViaEmail(u.getEmail());
                    log.info("[PROVISION] Password-reset OTP sent | email={}", u.getEmail());
                    return ResponseEntity.ok(Map.<String, Object>of(
                            "message", "Password reset OTP sent to " + maskEmail(u.getEmail()),
                            "userId", id
                    ));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "TYPE2 user not found with id=" + id)));
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private boolean isAllowedAdminRole(String role) {
        if (role == null) return false;
        try {
            UserRoles1 r = UserRoles1.valueOf(role.toUpperCase());
            return r == UserRoles1.ADMIN_TYPE1 || r == UserRoles1.ADMIN_TYPE2;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private boolean isAllowedUserRole(String role) {
        if (role == null) return false;
        try {
            UserRoles2 r = UserRoles2.valueOf(role.toUpperCase());
            return r == UserRoles2.USER_TYPE1 || r == UserRoles2.USER_TYPE2;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private void sendInvitationEmail(String toEmail, String firstName, String invitedBy, String role) {
        try {
            String subject = "You have been invited to MultiUser Platform";
            String body = "<div style='font-family:Arial,sans-serif;max-width:560px;margin:auto;'>"
                    + "<h2>Welcome, " + firstName + "!</h2>"
                    + "<p>Your account has been created by <strong>" + invitedBy + "</strong> "
                    + "with the role <strong>" + role + "</strong>.</p>"
                    + "<p>Please verify your email using the OTP sent in a separate email.</p>"
                    + "<p>Once verified, you will be able to log in to the platform.</p>"
                    + "<br/><p>Regards,<br/>The MultiUser Platform Team</p>"
                    + "</div>";
            emailService.sendHtmlEmail(toEmail, subject, body);
        } catch (Exception ex) {
            log.warn("[PROVISION] Invitation email failed | email={}", toEmail);
        }
    }

    private String buildApprovalEmailBody(String firstName, String role) {
        return "<div style='font-family:Arial,sans-serif;max-width:560px;margin:auto;'>"
                + "<h2>Hi " + firstName + ",</h2>"
                + "<p>Your account with role <strong>" + role + "</strong> has been "
                + "<span style='color:#27ae60;font-weight:bold;'>approved</span>.</p>"
                + "<p>You can now log in to the platform.</p>"
                + "<br/><p>Regards,<br/>The MultiUser Platform Team</p>"
                + "</div>";
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String local = parts[0];
        return (local.length() <= 2 ? local.charAt(0) + "***" : local.charAt(0) + "***" + local.charAt(local.length() - 1))
                + "@" + parts[1];
    }
}
