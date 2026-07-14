package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType1Repository;
import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType2Repository;
import com.example.MultiUserSecurityDemo.notification.EmailService;
import com.example.MultiUserSecurityDemo.notification.SmsService;
import com.example.MultiUserSecurityDemo.otp.OtpStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/password/")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:4200"})
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final EmailService emailService;
    private final SmsService smsService;
    private final OtpStore otpStore;
    private final UserType1Repository user1Repository;
    private final UserType2Repository user2Repository;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/forgot")
    public ResponseEntity<Map<String,Object>> forgotPassword(
            @RequestParam String email,
            @RequestParam(defaultValue = "email") String method) {

        log.info("[PWD_FORGOT] email={} | method={}", email, method);

        // TYPE1 user?
        var t1 = user1Repository.findByEmail(email);
        if (t1.isPresent()) {
            var u = t1.get();
            if ("sms".equalsIgnoreCase(method)) {
                if (u.getPhoneNumber() == null || u.getPhoneNumber().isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "No phone registered. Use email instead."));
                }
                smsService.sendOtpViaSms(u.getPhoneNumber());
                return ResponseEntity.ok(Map.of(
                        "message", "OTP sent to phone", "method", "sms",
                        "phone", maskPhone(u.getPhoneNumber()), "expiresIn", "5 minutes"));
            }
            emailService.sendOtpViaEmail(email);
            return ResponseEntity.ok(Map.of(
                    "message", "OTP sent to your email", "method", "email",
                    "email", maskEmail(email), "expiresIn", "5 minutes"));
        }

        // TYPE2 user?
        var t2 = user2Repository.findByEmail(email);
        if (t2.isPresent()) {
            var u = t2.get();
            if ("sms".equalsIgnoreCase(method)) {
                if (u.getPhoneNumber() == null || u.getPhoneNumber().isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "No phone registered. Use email instead."));
                }
                smsService.sendOtpViaSms(u.getPhoneNumber());
                return ResponseEntity.ok(Map.of(
                        "message", "OTP sent to phone", "method", "sms",
                        "phone", maskPhone(u.getPhoneNumber()), "expiresIn", "5 minutes"));
            }
            emailService.sendOtpViaEmail(email);
            return ResponseEntity.ok(Map.of(
                    "message", "OTP sent to your email", "method", "email",
                    "email", maskEmail(email), "expiresIn", "5 minutes"));
        }

        // Security: don't leak whether email exists
        log.warn("[PWD_FORGOT] User not found | email={}", email);
        return ResponseEntity.ok(Map.of(
                "message", "If an account exists with this email, you will receive an OTP"));
    }


//    @PostMapping("forgot")
//    public ResponseEntity<Map<String,Object>> forgotPassword(@RequestParam String email,@RequestParam(defaultValue = "email") String method){
//        log.info("[PASSWORD_RESET] Request initiated | email={} | method={}", email, method);
//
//        var type1User = user1Repository.findByEmail(email);
//        if (type1User.isPresent()){
//            var user = type1User.get();
//
//            if ("sms".equalsIgnoreCase(method)){
//                if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()){
//                    return ResponseEntity.badRequest().body(Map.of("error" , "No phone registered for this account",
//                            "suggestion" , "Use email method instead"));
//                }
//                smsService.sendOtpViaSms(user.getPhoneNumber());
//                log.info("[PASSWORD_RESET] SMS OTP sent | email={} | phone={}", email, user.getPhoneNumber());
//
//                return ResponseEntity.ok(Map.of(
//                        "message", "OTP sent to your phone number",
//                        "method", "sms",
//                        "phone", maskPhone(user.getPhoneNumber()),
//                        "expiresIn", "5 minutes"));
//
//                emailService.sendOtpViaEmail(email);
//                log.info("[PASSWORD_RESET] Email OTP sent | email={}", email);
//
//                return ResponseEntity.ok(Map.of(
//                        "message", "OTP sent to your email",
//                        "method", "email",
//                        "email", maskEmail(email),
//                        "expiresIn", "5 minutes"));
//            }
//        }
//
//        var type2User = user2Repository.findByEmail(email);
//        if (type2User.isPresent()){
//            var user = type2User.get();
//
//            if ("sms".equalsIgnoreCase(method)){
//                if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()){
//                    return ResponseEntity.badRequest().body(Map.of(
//                            "error", "No phone number registered for this account",
//                            "suggestion", "Use email method instead"
//                    ));
//                }
//                smsService.sendOtpViaSms(user.getPhoneNumber());
//                log.info("[PASSWORD_RESET] SMS OTP sent | email={} | phone={}", email, user.getPhoneNumber());
//
//                return ResponseEntity.ok(Map.of(
//                        "message", "OTP sent to your phone number",
//                        "method", "sms",
//                        "phone", maskPhone(user.getPhoneNumber()),
//                        "expiresIn", "5 minutes"
//                ));
//            }else {
//                emailService.sendOtpViaEmail(email);
//                log.info("[PASSWORD_RESET] Email OTP sent | email={}", email);
//
//                return ResponseEntity.ok(Map.of(
//                        "message", "OTP sent to your email",
//                        "method", "email",
//                        "email", maskEmail(email),
//                        "expiresIn", "5 minutes"
//                ));
//            }
//        }
//
//        log.warn("[PASSWORD_RESET] User not found | email={}", email);
//        return ResponseEntity.ok(Map.of("message", "If an account exists with this email, you will receive an OTP"));
//    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String,Object>> resetPassword(
            @RequestParam(name = "identifier", required = false) String identifierParam,
            @RequestParam(name = "otp",        required = false) String otpParam,
            @RequestParam(name = "newPassword",required = false) String newPasswordParam,
            @RequestBody(required = false) Map<String, String> body) {

        // Merge: query-params take precedence over body
        String identifier  = identifierParam  != null ? identifierParam  : (body != null ? body.get("identifier")  : null);
        String otp         = otpParam         != null ? otpParam         : (body != null ? body.get("otp")         : null);
        String newPassword = newPasswordParam  != null ? newPasswordParam  : (body != null ? body.get("newPassword")  : null);

        log.info("[PWD_RESET] identifier={}", identifier);

        if (identifier == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "identifier, otp and newPassword are required"));
        }
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }

        boolean valid = otpStore.validate(identifier, otp);
        if (!valid) {
            log.warn("[PWD_RESET] Invalid OTP | identifier={}", identifier);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired OTP", "suggestion", "Request a new OTP"));
        }

        // Search TYPE1 by email
        var t1Email = user1Repository.findByEmail(identifier);
        if (t1Email.isPresent()) {
            var u = t1Email.get();
            u.setPassword(passwordEncoder.encode(newPassword));
            user1Repository.save(u);
            sendPasswordChangedEmail(u.getEmail(), u.getFname());
            return ResponseEntity.ok(Map.of("message", "Password reset successful", "userType", "TYPE1"));
        }

        // Search TYPE1 by phone
        var t1Phone = user1Repository.findAll().stream()
                .filter(u -> identifier.equals(u.getPhoneNumber()))
                .findFirst();
        if (t1Phone.isPresent()) {
            var u = t1Phone.get();
            u.setPassword(passwordEncoder.encode(newPassword));
            user1Repository.save(u);
            return ResponseEntity.ok(Map.of("message", "Password reset successful", "userType", "TYPE1"));
        }

        // Search TYPE2 by email
        var t2Email = user2Repository.findByEmail(identifier);
        if (t2Email.isPresent()) {
            var u = t2Email.get();
            u.setPassword(passwordEncoder.encode(newPassword));
            user2Repository.save(u);
            sendPasswordChangedEmail(u.getEmail(), u.getFname());
            return ResponseEntity.ok(Map.of("message", "Password reset successful", "userType", "TYPE2"));
        }

        // Search TYPE2 by phone
        var t2Phone = user2Repository.findAll().stream()
                .filter(u -> identifier.equals(u.getPhoneNumber()))
                .findFirst();
        if (t2Phone.isPresent()) {
            var u = t2Phone.get();
            u.setPassword(passwordEncoder.encode(newPassword));
            user2Repository.save(u);
            return ResponseEntity.ok(Map.of("message", "Password reset successful", "userType", "TYPE2"));
        }

        log.error("[PWD_RESET] User not found after OTP validation | identifier={}", identifier);
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }


//    @PostMapping("reset")
//    public ResponseEntity<Map<String , Object>> resetPassword(@RequestParam(name = "identifier")String identifier , @RequestParam(name = "otp")String otp ,@RequestParam(name = "newPassword")String newPassword) {
//        log.info("[PASSWORD_RESET] Reset attempt | identifier={}", identifier);
//
//        if (newPassword == null || newPassword.length() < 8) {
//            return ResponseEntity.badRequest().body(Map.of(
//                    "error", "Password must be at least 8 characters long"
//            ));
//        }
//            boolean valid = otpStore.validate(identifier, otp);
//            if (!valid) {
//                log.warn("[PASSWORD_RESET] Invalid OTP | identifier={}", identifier);
//                return ResponseEntity.badRequest().body(Map.of(
//                        "error", "Invalid or expired OTP",
//                        "suggestion", "Request a new OTP"
//                ));
//            }
//            var type1User = user1Repository.findByEmail(identifier);
//            if (type1User.isPresent()) {
//                var user = type1User.get();
//                user.setPassword(passwordEncoder.encode(newPassword));
//                user1Repository.save(user);
//
//                log.info("[PASSWORD_RESET] Password updated | userType=TYPE1 | email={}", identifier);
//
//                try {
//                    emailService.sendSimpleEmail(
//                            user.getEmail(),
//                            "Password Changed Successfully",
//                            "Hi " + user.getFname() + ",\n\nYour password has been successfully changed.\n\n" +
//                                    "If you didn't make this change, please contact support immediately."
//                    );
//                } catch (Exception ex) {
//                    log.warn("[PASSWORD_RESET] Confirmation email failed | email={}", identifier);
//                }
//                return ResponseEntity.ok(Map.of(
//                        "message", "Password reset successful",
//                        "userType", "TYPE1"
//                ));
//            }
//
//            var type1ByPhone = user1Repository
//                    .findAll()
//                    .stream()
//                    .filter(u -> identifier.equals(u.getPhoneNumber()))
//                    .findFirst();
//
//            if (type1ByPhone.isPresent()) {
//                var user = type1ByPhone.get();
//                user.setPassword(passwordEncoder.encode(newPassword));
//                user1Repository.save(user);
//
//                log.info("[PASSWORD_RESET] Password updated via phone | userType=TYPE1 | phone={}", identifier);
//
//                return ResponseEntity.ok(Map.of(
//                        "message", "Password reset successful",
//                        "userType", "TYPE1"
//                ));
//            }
//
//            var type2User = user2Repository.findByEmail(identifier);
//            if (type2User.isPresent()) {
//                var user = type2User.get();
//                user.setPassword(passwordEncoder.encode(newPassword));
//                user2Repository.save(user);
//
//                log.info("[PASSWORD_RESET] Password updated | userType=TYPE2 | email={}", identifier);
//
//                try {
//                    emailService.sendSimpleEmail(
//                            user.getEmail(),
//                            "Password Changed Successfully",
//                            "Hi " + user.getFname() + ",\n\nYour password has been successfully changed.\n\n" +
//                                    "If you didn't make this change, please contact support immediately."
//                    );
//                } catch (Exception ex) {
//                    log.warn("[PASSWORD_RESET] Confirmation email failed | email={}", identifier);
//                }
//                return ResponseEntity.ok(Map.of(
//                        "message", "Password reset successful",
//                        "userType", "TYPE2"
//                ));
//            }
//
//            var type2ByPhone = user2Repository
//                    .findAll()
//                    .stream()
//                    .filter(u -> identifier.equals(u.getPhoneNumber()))
//                    .findFirst();
//
//            if (type2ByPhone.isPresent()) {
//                var user = type2ByPhone.get();
//                user.setPassword(passwordEncoder.encode(newPassword));
//                user2Repository.save(user);
//
//                log.info("[PASSWORD_RESET] Password updated via phone | userType=TYPE1 | phone={}", identifier);
//
//                return ResponseEntity.ok(Map.of(
//                        "message", "Password reset successful",
//                        "userType", "TYPE1"
//                ));
//            }
//        log.error("[PASSWORD_RESET] User not found after OTP validation | identifier={}", identifier);
//        return ResponseEntity.badRequest().body(Map.of(
//                "error", "User not found"
//        ));
//    }

    @PostMapping("change")
    public ResponseEntity<Map<String,Object>> changePassword(@RequestParam(name = "email")String email, @RequestParam(name = "currentPassword")String currentPassword, @RequestParam(name = "newPassword")String newPassword){
        log.info("[PASSWORD_CHANGE] Request | email={}", email);

        if (newPassword == null || newPassword.length() < 8){
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "New password must be at least 8 characters long"
            ));
        }

        var type1User = user1Repository.findByEmail(email);
        if (type1User.isPresent()){
            var user = type1User.get();
            if (!passwordEncoder.matches(currentPassword , user.getPassword())){
                log.warn("[PASSWORD_CHANGE] Current password mismatch | email={}", email);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Current password is incorrect"
                ));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user1Repository.save(user);
            log.info("[PASSWORD_CHANGE] Success | userType=TYPE1 | email={}", email);

            return ResponseEntity.ok(Map.of(
                    "message", "Password changed successfully",
                    "userType", "TYPE1"
            ));
        }

        var type2User = user2Repository.findByEmail(email);
        if (type2User.isPresent()) {
            var user = type2User.get();

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                log.warn("[PASSWORD_CHANGE] Current password mismatch | email={}", email);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Current password is incorrect"
                ));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user2Repository.save(user);

            log.info("[PASSWORD_CHANGE] Success | userType=TYPE2 | email={}", email);

            return ResponseEntity.ok(Map.of(
                    "message", "Password changed successfully",
                    "userType", "TYPE2"
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found"
        ));
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String localPart = parts[0];
        String domain = parts[1];

        if (localPart.length() <= 2) {
            return localPart.charAt(0) + "***@" + domain;
        }

        return localPart.charAt(0) + "***" + localPart.charAt(localPart.length() - 1) + "@" + domain;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return phone;
        return phone.substring(0, phone.length() - 4) + "****";
    }

    private void sendPasswordChangedEmail(String email, String firstName) {
        try {
            emailService.sendSimpleEmail(email, "Password Changed",
                    "Hi " + firstName + ",\n\nYour password was successfully changed.\n" +
                            "If you didn't do this, contact support immediately.");
        } catch (Exception ex) {
            log.warn("[PWD] Confirmation email failed | email={}", email);
        }
    }
}

