package com.example.MultiUserSecurityDemo.adapter.web.service;

import com.example.MultiUserSecurityDemo.adapter.web.dto.SignUpRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.SignUpResponse;

public interface AuthService {
    public SignUpResponse signup(SignUpRequest request);
}
