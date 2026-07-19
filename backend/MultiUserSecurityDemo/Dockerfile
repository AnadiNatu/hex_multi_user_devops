# ============================================================
# STAGE 1 — BUILD
# Uses full JDK + Maven to compile & package the Spring Boot JAR
# ============================================================
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

# Copy Maven wrapper & pom first (layer cache: deps only re-download when pom changes)
COPY .mvn/           .mvn/
COPY mvnw            mvnw
COPY pom.xml         pom.xml
RUN chmod +x mvnw

# Download all dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy source code
COPY src/ src/

# Build the fat JAR — skip tests (tests run in CI, not in image build)
RUN ./mvnw clean package -DskipTests -q

# ============================================================
# STAGE 2 — RUNTIME
# Uses slim JRE — no JDK, no Maven, no source code in final image
# ============================================================
FROM eclipse-temurin:21-jre-jammy AS runtime

# Security: run as non-root user
RUN groupadd --system appgroup && \
    useradd  --system --gid appgroup --no-create-home appuser

WORKDIR /app

# Copy only the fat JAR from the builder stage
COPY --from=builder /build/target/multiuser-demo.jar app.jar

# Ensure the non-root user owns the app
RUN chown appuser:appgroup app.jar

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
CMD curl -f http://localhost:8080/actuator/health || exit 1

# Spring Boot listens on 8080
EXPOSE 8080

# JVM flags:
#   -XX:+UseContainerSupport        → respect Docker CPU/memory limits
#   -XX:MaxRAMPercentage=75.0       → use up to 75 % of container RAM for heap
#   -Djava.security.egd=...urandom  → faster startup on Linux
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
