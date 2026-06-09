package com.example.MultiUserSecurityDemo.adapter.persistence.mapper;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.UserType1Entity;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles1;
import com.example.MultiUserSecurityDemo.domain.model.UserType1;
import org.springframework.stereotype.Component;

@Component
public class UserType1Mapper {

    public UserType1 toDomain(UserType1Entity entity){
        if (entity == null){
            return null;
        }

        UserType1 domain = new UserType1();
        domain.setId(entity.getId());
        domain.setFname(entity.getFname());
        domain.setLname(entity.getLname());
        domain.setEmail(entity.getEmail());
        domain.setPassword(entity.getPassword());
        domain.setRoles1(UserRoles1.valueOf(entity.getRole()));
        domain.setResetToken(entity.getResetToken());
        domain.setProfilePicture(entity.getProfilePicture());

        return domain;
    }

    public UserType1Entity toEntity(UserType1 domain){
        if (domain == null) return null;

        return UserType1Entity.builder()
                .id(domain.getId())
                .fname(domain.getFname())
                .lname(domain.getLname())
                .email(domain.getEmail())
                .password(domain.getPassword())
                .phoneNumber(domain.getPhoneNumber())
                .role(domain.getRoles1().name())
                .resetToken(domain.getResetToken())
                .profilePicture(domain.getProfilePicture())
                .build();

    }

}
