package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType1Details;
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
@RequestMapping("/api/type1")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:4200"})
public class UserType1Controller {

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminDashboard(
            @AuthenticationPrincipal UserType1Details userDetails) {
        return ResponseEntity.ok(buildResponse("ADMIN Dashboard", userDetails));
    }

    @GetMapping("/admin-type1/dashboard")
    @PreAuthorize("hasAuthority('ADMIN_TYPE1')")
    public ResponseEntity<Map<String, Object>> adminType1Dashboard(
            @AuthenticationPrincipal UserType1Details userDetails) {
        return ResponseEntity.ok(buildResponse("ADMIN_TYPE1 Dashboard", userDetails));
    }

    @GetMapping("/admin-type2/dashboard")
    @PreAuthorize("hasAuthority('ADMIN_TYPE2')")
    public ResponseEntity<Map<String, Object>> adminType2Dashboard(
            @AuthenticationPrincipal UserType1Details userDetails) {
        return ResponseEntity.ok(buildResponse("ADMIN_TYPE2 Dashboard", userDetails));
    }

    @GetMapping("/all-admin/content")
    @PreAuthorize("hasAnyAuthority('ADMIN' , 'ADMIN_TYPE1' , 'ADMIN_TYPE2')")
    public ResponseEntity<Map<String, Object>> allAdminContent(
            @AuthenticationPrincipal UserType1Details userDetails) {

        Map<String, Object> response = buildResponse("All Admin Content", userDetails);
        response.put("data", "Shared admin resources");
        return ResponseEntity.ok(response);
    }

//    Helper

    private Map<String, Object> buildResponse(String message, UserType1Details d) {
        Map<String, Object> response = new HashMap<>();
        response.put("message",  "Welcome to " + message);
        response.put("userType", "TYPE1");
        response.put("role",     d.getAuthorities());
        response.put("email",    d.getUsername());
        // FIX: fullName is now a proper string, not a collection
        response.put("fullName", d.getUser().getFname() + " " + d.getUser().getLname());
        return response;
    }
}

