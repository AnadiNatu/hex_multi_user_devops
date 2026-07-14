package com.example.MultiUserSecurityDemo.adapter.web.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpRequest {
    private String fname;
    private String lname;
    private String email;
    private String password;
    private String phoneNumber;
    private String userType;
    private String role;

    private String createdByAdmin;

}
