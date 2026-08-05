package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/type2")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:4200"})
public class UserType2Controller {

    @GetMapping("/user/dashboard")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<Map<String, Object>> userDashboard(
            @AuthenticationPrincipal UserType2Details userDetails) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to USER Dashboard");
        response.put("userType", "TYPE2");
        response.put("role", userDetails.getAuthorities());
        response.put("email", userDetails.getUsername());
        response.put("fullName", userDetails.getUser().getFname() + " " + userDetails.getUser().getLname());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-type1/dashboard")
    @PreAuthorize("hasAuthority('USER_TYPE1')")
    public ResponseEntity<Map<String, Object>> userType1Dashboard(
            @AuthenticationPrincipal UserType2Details userDetails) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to USER_TYPE1 Dashboard");
        response.put("userType", "TYPE2");
        response.put("role", userDetails.getAuthorities());
        response.put("email", userDetails.getUsername());
        response.put("fullName", userDetails.getUser().getFname() + " " + userDetails.getUser().getLname());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-type2/dashboard")
    @PreAuthorize("hasAuthority('USER_TYPE2')")
    public ResponseEntity<Map<String, Object>> userType2Dashboard(
            @AuthenticationPrincipal UserType2Details userDetails) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to USER_TYPE2 Dashboard");
        response.put("userType", "TYPE2");
        response.put("role", userDetails.getAuthorities());
        response.put("email", userDetails.getUsername());
        response.put("fullName", userDetails.getUser().getFname() + " " + userDetails.getUser().getLname());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/all-user/content")
    @PreAuthorize("hasAnyAuthority('USER' , 'USER_TYPE2' , 'USER_TYPE1')")
    public ResponseEntity<Map<String, Object>> allUserContent(
            @AuthenticationPrincipal UserType2Details userDetails) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Content accessible to all user types");
        response.put("userType", "TYPE2");
        response.put("role", userDetails.getAuthorities());
        response.put("email", userDetails.getUsername());
        response.put("data", "Shared user content");

        return ResponseEntity.ok(response);
    }
}
