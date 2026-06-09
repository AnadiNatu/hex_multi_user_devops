package com.example.MultiUserSecurityDemo.adapter.web.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpResponse {
    private Long id;
    private String fname;
    private String lname;
    private String email;
    private String userType;
    private String role;
    private String message;
}