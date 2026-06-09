package com.example.MultiUserSecurityDemo.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_type2")
public class UserType2Entity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fname;

    @Column(nullable = false)
    private String lname;

    @Column(unique = true , nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phoneNumber;

    @Column(name = "role" , nullable = false)
    private String role;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "profile_picture")
    private String profilePicture;

    private boolean isVerified;

    @Column(name = "provider")
    private String provider;

    @Column(name = "provider_id")
    private String providerId;
}
