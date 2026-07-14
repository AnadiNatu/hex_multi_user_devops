package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.example.MultiUserSecurityDemo.adapter.web.dto.*;
import com.example.MultiUserSecurityDemo.adapter.web.service.AuthService;
import com.example.MultiUserSecurityDemo.domain.model.*;
import com.example.MultiUserSecurityDemo.domain.port.*;
import com.example.MultiUserSecurityDemo.notification.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserType1Port userType1Port;
    private final UserType2Port userType2Port;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthServiceImpl(UserType1Port userType1Port ,UserType2Port userType2Port ,PasswordEncoder passwordEncoder , EmailService emailService){
        this.userType1Port = userType1Port;
        this.userType2Port = userType2Port;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public SignUpResponse signup(SignUpRequest request) {
        StopWatch sw = new StopWatch("signup");
        sw.start();
        log.info("[signup] START | email = {} | userType={}" , request.getEmail() , request.getUserType());
        try {
            if (emailExists(request.getEmail())) {
                log.warn("[signup] CONFLICT | email = {} | reason=already_exist" , request.getEmail());
                return SignUpResponse.builder().message("Email already exists").build();
            }

            SignUpResponse response;
            if ("TYPE1".equalsIgnoreCase(request.getUserType())) {
                response = registerUserType1(request);
            } else if ("TYPE2".equalsIgnoreCase(request.getUserType())) {
                response = registerUserType2(request);
            } else {
                log.warn("[signup] INVALID_TYPE | email={} | userType={}" , request.getEmail() , request.getUserType());
                return SignUpResponse.builder()
                        .message("Invalid user type. Use TYPE1 or TYPE2")
                        .build();
            }

            // email-verification OTP immediately after successful registration
            if (response.getId() != null) {
                try {
                    emailService.sendOtpViaEmail(request.getEmail());
                    log.info("[signup] VERIFICATION_OTP_SENT | email={}", request.getEmail());
                } catch (Exception ex) {
                    log.warn("[signup] VERIFICATION_OTP_FAILED | email={} | error={}", request.getEmail(), ex.getMessage());
                }
            }

            sw.stop();
            log.info("[signup] SUCCESS | email={} | userType={} | id={} | duration={}ms" , request.getEmail() , request.getUserType() , response.getId() , sw.getTotalTimeMillis());
            return response;
        }catch (Exception ex){
            sw.stop();
            log.error("[signup] ERROR | email = {} | duration = {}ms  | error = {}" ,request.getEmail() , sw.getTotalTimeMillis() , ex.getMessage());
            throw ex;
        }
    }

    public boolean emailExists(String email){
        return userType1Port.findByEmail(email).isPresent() ||
                userType2Port.findByEmail(email).isPresent();
    }

    public SignUpResponse registerUserType1(SignUpRequest request) {
        try {
            UserType1 user = new UserType1();
            user.setFname(request.getFname());
            user.setLname(request.getLname());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhoneNumber(request.getPhoneNumber());
            user.setRoles1(parseUserRole1(request.getRole()));
            // New accounts start unapproved and unverified
            user.setApproved(false);
            user.setEmailVerified(false);
            user.setCreatedByAdmin(request.getCreatedByAdmin());

            UserType1 saved = userType1Port.save(user);
            log.debug("[registerUserType1] Persisted | id={} | email={} | role={}", saved.getId(), saved.getEmail(), saved.getRoles1());

            return SignUpResponse.builder()
                    .id(saved.getId())
                    .email(saved.getEmail())
                    .fname(saved.getFname())
                    .lname(saved.getLname())
                    .userType("TYPE1")
                    .role(saved.getRoles1().name())
                    .message("Registration successful. Please verify your email before logging in.")
                    .build();
        } catch (Exception ex) {
            log.error("[registerUserType1] FAILED | email={} | error={}", request.getEmail(), ex.getMessage());
            return SignUpResponse.builder().message("Registration failed: " + ex.getMessage()).build();
        }
    }

    private SignUpResponse registerUserType2(SignUpRequest request){
        try{
            UserType2 user = new UserType2();
            user.setFname(request.getFname());
            user.setLname(request.getLname());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhoneNumber(request.getPhoneNumber());
            user.setRole(parseUserRoles2(request.getRole()));
            // New accounts start unapproved and unverified
            user.setApproved(false);
            user.setEmailVerified(false);
            user.setCreatedByAdmin(request.getCreatedByAdmin());

            UserType2 saved = userType2Port.save(user);
            log.debug("[registerUserType2] Persisted | id={} | email={} | role={}", saved.getId(), saved.getEmail(), saved.getRole());

            return SignUpResponse.builder()
                    .id(saved.getId())
                    .email(saved.getEmail())
                    .fname(saved.getFname())
                    .lname(saved.getLname())
                    .userType("TYPE2")
                    .role(saved.getRole().name())
                    .message("Registration successful. Please verify your email before logging in.")
                    .build();
        } catch (Exception ex) {
            log.error("[registerUserType2] FAILED | email={} | error={}", request.getEmail(), ex.getMessage());
            return SignUpResponse.builder().message("Registration failed: " + ex.getMessage()).build();
        }
    }

    private UserRoles1 parseUserRole1(String roleString){
        if (roleString == null || roleString.isEmpty()){
            return UserRoles1.ADMIN_TYPE2;
        }
        try{
            return UserRoles1.valueOf(roleString.toUpperCase());
        }catch (IllegalArgumentException ex){
            log.warn("[parseUserRole1] Unknown role '{}', defaulting to ADMIN_TYPE2", roleString);
            return UserRoles1.ADMIN_TYPE2;
        }
    }

    private UserRoles2 parseUserRoles2(String roleString){
        if (roleString == null || roleString.isEmpty()){
            return UserRoles2.USER_TYPE2;
        }
        try{
            return UserRoles2.valueOf(roleString.toUpperCase());
        }catch (IllegalArgumentException ex){
            log.warn("[parseUserRole2] Unknown role '{}', defaulting to ADMIN_TYPE2", roleString);
            return UserRoles2.USER_TYPE2;
        }
    }
}
