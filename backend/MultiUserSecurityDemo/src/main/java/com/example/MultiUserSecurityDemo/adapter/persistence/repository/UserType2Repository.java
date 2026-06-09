package com.example.MultiUserSecurityDemo.adapter.persistence.repository;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.UserType2Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserType2Repository extends JpaRepository<UserType2Entity , Long> {
    Optional<UserType2Entity> findByEmail(String email);
}
