package com.example.MultiUserSecurityDemo.adapter.security.security_files;

import com.example.MultiUserSecurityDemo.adapter.security.oauth2.OAuth2SuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CompositeUserDetailService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    public SecurityConfig(CompositeUserDetailService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:4200}")
    private String allowedOrigins;

    // SECURITY FILTER CHAIN

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // PUBLIC ENDPOINTS
                                .requestMatchers(
                                        "/api/auth/**",
                                        "/uploads/**",
                                        "/actuator/**",
                                        "/api/otp/**",
                                        "/oauth2/**",
                                        "/login/oauth2/**",
                                        "/api/oauth2/failure",
                                        "/api/password/forgot",
                                        "/api/password/reset",
                                        "/api/password/change"
                                ).permitAll()

                        // ADMIN PROVISIONING
                                .requestMatchers("/api/admin/provision/admin-user").hasAuthority("ADMIN")
                                .requestMatchers("/api/admin/provision/approve/type1/**").hasAuthority("ADMIN")
                                .requestMatchers("/api/admin/provision/pending/type1").hasAuthority("ADMIN")
                                .requestMatchers("/api/admin/provision/reset-password/type1/**").hasAuthority("ADMIN")

                        // ADMIN2 PROVISIONING
                                .requestMatchers("/api/admin/provision/user").hasAnyAuthority("ADMIN", "ADMIN_TYPE2")
                                .requestMatchers("/api/admin/provision/approve/type2/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE2")
                                .requestMatchers("/api/admin/provision/pending/type2").hasAnyAuthority("ADMIN", "ADMIN_TYPE2")
                                .requestMatchers("/api/admin/provision/reset-password/type2/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE2")

                        // USER MANAGEMENT ENDPOINTS
                        // TYPE1 (Admin) User Management
                                .requestMatchers("/api/type1/admin/**").hasAuthority("ADMIN")
                                .requestMatchers("/api/type1/admin-type1/**").hasAuthority("ADMIN_TYPE1")
                                .requestMatchers("/api/type1/admin-type2/**").hasAuthority("ADMIN_TYPE2")
                                .requestMatchers("/api/type1/all-admin/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE1", "ADMIN_TYPE2")
                        // TYPE2 (User) User Management
                        .requestMatchers("/api/type2/user/**").hasAuthority("USER")
                        .requestMatchers("/api/type2/user-type1/**").hasAuthority("USER_TYPE1")
                        .requestMatchers("/api/type2/user-type2/**").hasAuthority("USER_TYPE2")
                        .requestMatchers("/api/type2/all-user/**").hasAnyAuthority("USER", "USER_TYPE1", "USER_TYPE2")

                        // PRODUCT ENDPOINTS

                                //    Full control — ADMIN only
                                .requestMatchers("/api/product/admin/**").hasAuthority("ADMIN")
                                //    Inventory management — ADMIN + ADMIN_TYPE1
                                .requestMatchers("/api/product/admin-type1/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE1")
                                //    Pricing & category management — ADMIN + ADMIN_TYPE2
                                .requestMatchers("/api/product/admin-type2/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE2")
                                //    Basic product views — TYPE1-domain roles
                                .requestMatchers("/api/product/user/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE1", "USER", "USER_TYPE1")
                                //    Category browser — TYPE1-domain roles
                                .requestMatchers("/api/product/user-type1/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE1", "USER", "USER_TYPE1")
                                //    Price compare / sort — TYPE2-domain roles
                                .requestMatchers("/api/product/user-type2/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE2", "USER", "USER_TYPE2")

                                // ORDER ENDPOINTS
                                //    Admin order management — ADMIN + ADMIN_TYPE2
                                .requestMatchers("/api/orders/admin/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE2")
                                //    All other order paths — ADMIN + ADMIN_TYPE2 + USER + USER_TYPE2
                                .requestMatchers("/api/orders/**").hasAnyAuthority("ADMIN", "ADMIN_TYPE2", "USER", "USER_TYPE2")

                                // PROFILE ENDPOINTS
                                .requestMatchers("/api/profile/**").authenticated()

                                // OAUTH2 ENDPOINTS
                                .requestMatchers("/api/oauth2/**").authenticated()
//
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(endpoint -> endpoint.baseUri("/oauth2/authorization"))
                        .redirectionEndpoint(endpoint -> endpoint.baseUri("/login/oauth2/code/"))
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl(frontendUrl + "/oauth2/callback?error=oauth2_failed"))
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request ,response , authException) -> {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED , authException.getMessage());
                }))
                .build();
    }

    // AUTH PROVIDER (FIXED)

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // PASSWORD ENCODER

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AUTH MANAGER

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // CORS

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList();
        corsConfig.setAllowedOrigins(origins);
        corsConfig.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "PATCH" ,"DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(List.of("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }
}
