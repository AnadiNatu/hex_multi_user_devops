package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType1Repository;
import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType2Repository;
import com.example.MultiUserSecurityDemo.adapter.security.security_files.JwtUtil;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType1Details;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles1;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles2;
import com.example.MultiUserSecurityDemo.domain.model.UserType1;
import com.example.MultiUserSecurityDemo.domain.model.UserType2;
import com.example.MultiUserSecurityDemo.exception.InvalidOperationException;
import com.example.MultiUserSecurityDemo.exception.ResourceNotFoundException;
import com.example.MultiUserSecurityDemo.notification.SmsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/phone")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:4200"})
@RequiredArgsConstructor
public class PhoneController {

    private static final Logger log = LoggerFactory.getLogger(PhoneController.class);

    private final SmsService smsService;
    private final JwtUtil jwtUtil;
    private final UserType1Repository userType1Repository;
    private final UserType2Repository userType2Repository;

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String,Object>> sendPhoneOtp(@RequestParam String phone){
        log.info("[PHONE_AUTH] OTP requested | phone={}" , phone);

        String normalizedNum = normalizePhone(phone);
        boolean existsInType1 = userType1Repository.findAll().stream().anyMatch(u->normalizedNum.equals(normalizePhone(u.getPhoneNumber())));
        boolean existsInType2 = userType2Repository.findAll().stream().anyMatch(u ->normalizedNum.equals(normalizePhone(u.getPhoneNumber())));

        if (!existsInType1 && !existsInType2){
            throw new RuntimeException("User not found");
        }

        smsService.sendOtpViaSms(phone);
        log.info("[PHONE_AUTH] OTP sent | phone={}" , phone);

        return ResponseEntity.ok(Map.of(
                "message" , "OTP sent to " + phone,
                "phone" , phone,
                "note" , "OTP expires in 5 minutes"
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String,Object>> verifyPhoneOtp(@RequestParam String phone ,@RequestParam String otp){
        log.info("[PHONE_AUTH] OTP verification | phone={}" , phone);

        String normalizedNum = normalizePhone(phone);
        boolean valid = smsService.validateOtp(normalizedNum, otp);
        if (!valid){
            throw new InvalidOperationException("phoneLogin" , "Invalid or expired OTP");
        }

        var type1User = userType1Repository.findAll().stream().filter(u -> normalizedNum.equals(normalizePhone(u.getPhoneNumber()))).findFirst();

        if (type1User.isPresent()) {
            var entity = type1User.get();
            UserType1 domain = new UserType1();
            domain.setId(entity.getId());
            domain.setEmail(entity.getEmail());
            domain.setFname(entity.getFname());
            domain.setLname(entity.getLname());
            domain.setPassword(entity.getPassword());
            domain.setPhoneNumber(entity.getPhoneNumber());
            domain.setRoles1(UserRoles1.valueOf(entity.getRole()));

            String token = jwtUtil.generateToken(new UserType1Details(domain));
            log.info("[PHONE_AUTH] TYPE1 login via phone | id={} | phone={}", entity.getId(), phone);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "userType", "TYPE1",
                    "role", entity.getRole(),
                    "email", entity.getEmail(),
                    "message", "Phone login successful"
            ));
        }
            var type2User = userType2Repository.findAll().stream()
                    .filter(u -> normalizedNum.equals(u.getPhoneNumber()))
                    .findFirst();

            if (type2User.isPresent()) {
                var entity = type2User.get();
                UserType2 domain = new UserType2();
                domain.setId(entity.getId());
                domain.setEmail(entity.getEmail());
                domain.setFname(entity.getFname());
                domain.setLname(entity.getLname());
                domain.setPassword(entity.getPassword());
                domain.setPhoneNumber(entity.getPhoneNumber());
                domain.setRole(UserRoles2.valueOf(entity.getRole()));

                String token = jwtUtil.generateToken(new UserType2Details(domain));
                log.info("[PHONE_AUTH] TYPE2 login via phone | id={} | phone={}", entity.getId(), phone);

                return ResponseEntity.ok(Map.of(
                        "token",    token,
                        "userType", "TYPE2",
                        "role",     entity.getRole(),
                        "email",    entity.getEmail(),
                        "message",  "Phone login successful"
                ));
            }
            throw new ResourceNotFoundException("User" , "phoneNumber" , phone);
    }

    private String normalizePhone(String phone){
        if (phone == null) return null;

        phone = phone.trim().replaceAll("[^\\d]" , "");

        if (phone.length() > 10){
            return phone.substring(phone.length() - 10);
        }
        return phone;
    }
}
