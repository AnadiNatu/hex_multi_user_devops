package com.example.MultiUserSecurityDemo.adapter.web.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeResponse {

    private Long id;
    private String fname;
    private String lname;
    private String email;
    private String phoneNumber;
    private String role;
    private String userType;
    private String profilePicture;

}