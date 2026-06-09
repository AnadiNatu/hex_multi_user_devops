package com.example.MultiUserSecurityDemo.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(1)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String traceId = UUID.randomUUID().toString().substring(0,8);
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String fullUri = query != null ? uri + "?" + query : uri;

        MDC.put("traceId" , traceId);
        long start = System.currentTimeMillis();

        log.info("[REQUEST] traceId={} | {} | {} " , traceId , method , fullUri);

        try{
            filterChain.doFilter(request , response);
        }finally {
            long duration = System.currentTimeMillis() - start;
            int status = response.getStatus();
            String level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";

            if("ERROR".equals(level)){
                log.error("[RESPONSE] traceId={} | {} {} -> {} | {}ms", traceId , method , fullUri , status , duration);
            }else if ("WARN".equals(level)){
                log.warn("[RESPONSE] traceId={} | {} {} -> {} | {}ms" , traceId , method , fullUri , status , duration);
            }else {
                log.info("[RESPONSE]  traceId={} | {} {} → {} | {}ms", traceId, method, fullUri, status, duration);
            }
            MDC.remove("traceId");
        }
    }
}
