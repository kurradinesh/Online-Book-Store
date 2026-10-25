```dockerfile
# Stage 1: Build the Spring Boot JAR
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

RUN mkdir -p /app/uploads \
    && useradd -m -u 1001 booknook \
    && chown -R booknook:booknook /app

USER booknook

COPY --from=build /app/target/bookstore-backend-1.0.0.jar app.jar

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-10000} -jar app.jar"]
```