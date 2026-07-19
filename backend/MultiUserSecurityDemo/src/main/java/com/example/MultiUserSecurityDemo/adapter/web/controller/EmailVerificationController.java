package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.domain.port.UserType1Port;
import com.example.MultiUserSecurityDemo.domain.port.UserType2Port;
import com.example.MultiUserSecurityDemo.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

//@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4200"})

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationController {

    private final EmailService emailService;
    private final UserType1Port userType1Port;
    private final UserType2Port userType2Port;

    // ── Verify email via OTP ───────────────────────────────────────────────

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(
            @RequestParam String email,
            @RequestParam String otp) {

        log.info("[EMAIL_VERIFY] Request | email={}", email);

        boolean valid = emailService.validateOtp(email, otp);
        if (!valid) {
            log.warn("[EMAIL_VERIFY] Invalid/expired OTP | email={}", email);
            return ResponseEntity.badRequest()
                    .body(Map.of("verified", false, "message", "Invalid or expired OTP"));
        }

        // Mark the user's email as verified (check TYPE1 first, then TYPE2)
        var type1 = userType1Port.findByEmail(email);
        if (type1.isPresent()) {
            var u = type1.get();
            u.setEmailVerified(true);
            userType1Port.save(u);
            log.info("[EMAIL_VERIFY] TYPE1 email verified | email={}", email);
            return ResponseEntity.ok(Map.of(
                    "verified", true,
                    "message", "Email verified. Awaiting admin approval before you can log in.",
                    "userType", "TYPE1"
            ));
        }

        var type2 = userType2Port.findByEmail(email);
        if (type2.isPresent()) {
            var u = type2.get();
            u.setEmailVerified(true);
            userType2Port.save(u);
            log.info("[EMAIL_VERIFY] TYPE2 email verified | email={}", email);
            return ResponseEntity.ok(Map.of(
                    "verified", true,
                    "message", "Email verified. Awaiting admin approval before you can log in.",
                    "userType", "TYPE2"
            ));
        }

        log.warn("[EMAIL_VERIFY] User not found after OTP validation | email={}", email);
        return ResponseEntity.badRequest()
                .body(Map.of("verified", false, "message", "User not found"));
    }

    // ── Resend verification OTP ────────────────────────────────────────────

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, Object>> resendVerification(@RequestParam String email) {
        log.info("[EMAIL_VERIFY] Resend requested | email={}", email);

        boolean exists = userType1Port.findByEmail(email).isPresent()
                || userType2Port.findByEmail(email).isPresent();

        if (!exists) {
            // Generic response — don't expose whether an email is registered
            return ResponseEntity.ok(Map.of(
                    "message", "If an account exists with this email, a verification code has been sent."
            ));
        }

        try {
            emailService.sendOtpViaEmail(email);
            log.info("[EMAIL_VERIFY] OTP re-sent | email={}", email);
        } catch (Exception ex) {
            log.error("[EMAIL_VERIFY] Resend failed | email={} | error={}", email, ex.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to send verification email. Please try again."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Verification OTP sent. Please check your inbox."
        ));
    }

}
