package com.example.MultiUserSecurityDemo.adapter.security.user_details;

import com.example.MultiUserSecurityDemo.domain.model.UserType1;
//import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserType1Details implements UserDetails {

    private final UserType1 user;

    public UserType1Details(UserType1 user){
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(user.getRoles1().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isEmailVerified() && user.isApproved();
    }

    public UserType1 getUser(){
        return user;
    }

    public String getUserType(){
        return "TYPE1";
    }
}
