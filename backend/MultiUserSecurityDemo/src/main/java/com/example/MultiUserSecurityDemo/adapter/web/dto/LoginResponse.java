package com.example.MultiUserSecurityDemo.adapter.web.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String userType;
    private String role;
    private String message;

//    New fields
    private Long userId;
    private String firstName;
    private String lastName;
    private String profilePicture;
    private String phoneNumber;
}
