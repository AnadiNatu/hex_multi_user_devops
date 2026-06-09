package com.example.MultiUserSecurityDemo.adapter.web.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User1DTO {

    private Long id;
    private String username;
    private String name;
    private String userRoles;
    private int age;

}
