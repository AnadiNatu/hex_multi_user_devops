package com.example.MultiUserSecurityDemo.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.util.UUID;

@Aspect
@Component
public class PerformanceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(PerformanceLoggingAspect.class);

    @Around("execution(* com.example.MultiUserSecurityDemo.adapter.web.service.impl.*.*(..))")
    public Object logAndMeasure(ProceedingJoinPoint joinPoint) throws Throwable{
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String fullMethod = className + "+" + methodName;

        String traceId = UUID.randomUUID().toString().substring(0 , 8);

        MDC.put("traceId" , traceId);
        MDC.put("operation" , fullMethod);

        StopWatch stopWatch = new StopWatch(fullMethod);
        stopWatch.start(methodName);

        log.debug("[AOP][ENTER] operation={} | traceId={}", fullMethod, traceId);
        log.debug("[ENTER] {}" , fullMethod);

        try{
            Object result = joinPoint.proceed();
            stopWatch.stop();

            log.info("[EXIT] {} | durations={}ms | status=SUCCESS", fullMethod , stopWatch.getTotalTimeMillis());

            return result;
        }catch (Throwable ex){
            if (stopWatch.isRunning()){
                stopWatch.stop();
            }
            log.error("[ERROR] {} | duration={}ms | exception={} | message={}" , fullMethod , stopWatch.getTotalTimeMillis() , ex.getClass().getSimpleName() , ex.getMessage());
            throw ex;
        }finally {
            MDC.remove("traceId");
            MDC.remove("operation");
        }
    }
}