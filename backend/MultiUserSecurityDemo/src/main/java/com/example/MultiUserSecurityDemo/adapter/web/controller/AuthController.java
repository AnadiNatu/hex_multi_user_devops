package com.example.MultiUserSecurityDemo.adapter.web.controller;


import com.example.MultiUserSecurityDemo.adapter.security.security_files.JwtUtil;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType1Details;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import com.example.MultiUserSecurityDemo.adapter.web.dto.*;
import com.example.MultiUserSecurityDemo.adapter.web.service.AuthService;
import com.example.MultiUserSecurityDemo.notification.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173" , "http://localhost:4200"})
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final NotificationService notificationService;

    public AuthController(AuthenticationManager authenticationManager , JwtUtil jwtUtil , AuthService authService , NotificationService notificationService){
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signup(@RequestBody SignUpRequest request){
        if (request.getEmail() == null || request.getEmail().isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(SignUpResponse.builder().message("Email is required").build());
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(SignUpResponse.builder().message("Password is required").build());
        }

        if (request.getUserType() == null || request.getUserType().isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(SignUpResponse.builder().message("User Type is Required (TYPE1 or TYPE2)").build());
        }

        SignUpResponse response = authService.signup(request);
        if (response.getId() != null && request.getPhoneNumber() != null){
            try {
                notificationService.sendWelcomeNotification(
                        request.getEmail(),
                        request.getPhoneNumber(),
                        request.getFname()
                );
                log.info("[signup] WELCOME_NOTIFICATION_SENT | requestPresent={} | email={}", UUID.randomUUID(), request.getEmail());
            } catch (Exception ex){
                log.warn("[signup] WELCOME_NOTIFICATION_FAILED | requestId={} | email={} | error={}",
                        UUID.randomUUID(), request.getEmail(), ex.getMessage());
            }
        }
        return response.getId() != null ? ResponseEntity.status(HttpStatus.CREATED).body(response) : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest , @RequestParam(defaultValue = "false")boolean staySignedIn , HttpServletRequest httpRequest){
        String requestId = UUID.randomUUID().toString();
        log.info("[login] REQUEST | requestId={} | username={} | staySignedIn = {}", requestId , loginRequest.getUsername() , staySignedIn);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(), loginRequest.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("UNKNOWN");

            String userType = "UNKNOWN";
            Long userId = null;
            String firstName = null;
            String lastName = null;
            String phone     = null;
            String profilePicture = null;

            if (userDetails instanceof UserType1Details d) {
                userType  = "TYPE1";
                userId = d.getUser().getId();
                firstName = d.getUser().getFname();
                lastName = d.getUser().getLname();
                phone     = d.getUser().getPhoneNumber();
                profilePicture = d.getUser().getProfilePicture();
            } else if (userDetails instanceof UserType2Details d) {
                userType  = "TYPE2";
                userId = d.getUser().getId();
                firstName = d.getUser().getFname();
                lastName = d.getUser().getLname();
                phone     = d.getUser().getPhoneNumber();
                profilePicture = d.getUser().getProfilePicture();
            } else {
                userType = "UNKNOWN";
            }

            // NEW: Persist session when staySignedIn = true
            if (staySignedIn) {
                HttpSession session = httpRequest.getSession(true);
                session.setMaxInactiveInterval(60 * 60 * 24 * 30); // 30 days
                session.setAttribute("username", userDetails.getUsername());
            }

            // NEW: Login alert via SMS
            if (phone != null && !phone.isBlank()) {
                try {
                    notificationService.sendLoginAlert(phone, firstName);
                    log.debug("[login] LOGIN_ALERT_SENT | requestId={} | username={}", requestId, userDetails.getUsername());
                } catch (Exception ex) {
                    log.warn("[login] LOGIN_ALERT_FAILED | requestId={} | error={}", requestId, ex.getMessage());
                }
            }

            log.info("[login] SUCCESS | requestId={} | username={} | userType={} | role={}", requestId, userDetails.getUsername(), userType, role);
            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .username(userDetails.getUsername())
                    .userType(userType)
                    .role(role)
                    .userId(userId)
                    .firstName(firstName)
                    .lastName(lastName)
                    .profilePicture(profilePicture)
                    .phoneNumber(phone)
                    .message("Login Successful")
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            log.warn("[login] FAIL | requestId={} | username={} | reason={}", requestId, loginRequest.getUsername(), ex.getMessage());
            LoginResponse response = LoginResponse.builder()
                    .message("Invalid credentials: " + ex.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MeResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails){

        if (userDetails == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MeResponse me;

        if (userDetails instanceof UserType1Details  d){
            var u = d.getUser();
            me = MeResponse.builder()
                    .id(u.getId())
                    .fname(u.getFname())
                    .lname(u.getLname())
                    .email(u.getEmail())
                    .phoneNumber(u.getPhoneNumber())
                    .role(u.getRoles1().name())
                    .userType("TYPE1")
                    .profilePicture(u.getProfilePicture())
                    .build();
        }else if (userDetails instanceof UserType2Details d){
            var u = d.getUser();
            me = MeResponse.builder()
                    .id(u.getId())
                    .fname(u.getFname())
                    .lname(u.getLname())
                    .email(u.getEmail())
                    .phoneNumber(u.getPhoneNumber())
                    .role(u.getRole().name())
                    .userType("TYPE2")
                    .profilePicture(u.getProfilePicture())
                    .build();
        }else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(me);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test(){
        return ResponseEntity.ok("Auth endpoint working!");
    }
}


