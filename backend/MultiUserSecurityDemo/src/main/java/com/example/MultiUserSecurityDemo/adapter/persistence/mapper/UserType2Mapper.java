package com.example.MultiUserSecurityDemo.adapter.persistence.mapper;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.UserType2Entity;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles2;
import com.example.MultiUserSecurityDemo.domain.model.UserType2;
import org.springframework.stereotype.Component;

@Component
public class UserType2Mapper {

    public UserType2 toDomain(UserType2Entity entity){
        if (entity == null){
            return null;
        }

        UserType2 domain = new UserType2();
        domain.setId(entity.getId());
        domain.setFname(entity.getFname());
        domain.setLname(entity.getLname());
        domain.setEmail(entity.getEmail());
        domain.setPassword(entity.getPassword());
        domain.setRole(UserRoles2.valueOf(entity.getRole()));
        domain.setResetToken(entity.getResetToken());
        domain.setProfilePicture(entity.getProfilePicture());

        return domain;
    }

    public UserType2Entity toEntity(UserType2 domain){
        if (domain == null) return null;

        return UserType2Entity.builder()
                .id(domain.getId())
                .fname(domain.getFname())
                .lname(domain.getLname())
                .email(domain.getEmail())
                .password(domain.getPassword())
                .phoneNumber(domain.getPhoneNumber())
                .role(domain.getRole().name())
                .resetToken(domain.getResetToken())
                .profilePicture(domain.getProfilePicture())
                .build();

    }

}
