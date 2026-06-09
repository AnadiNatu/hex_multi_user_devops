package com.example.MultiUserSecurityDemo.domain.port;


import com.example.MultiUserSecurityDemo.domain.model.UserType2;

import java.util.Optional;

public interface UserType2Port {
    Optional<UserType2> findByEmail(String email);
    UserType2 save(UserType2 user);
    Optional<UserType2> findById(Long id);
    void deleteById(Long id);
}
