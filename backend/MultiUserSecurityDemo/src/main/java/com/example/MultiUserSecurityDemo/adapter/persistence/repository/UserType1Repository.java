package com.example.MultiUserSecurityDemo.adapter.persistence.repository;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.UserType1Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserType1Repository extends JpaRepository<UserType1Entity , Long> {
    Optional<UserType1Entity> findByEmail(String email);
    Optional<UserType1Entity> findByPhoneNumber(String phone);
}
