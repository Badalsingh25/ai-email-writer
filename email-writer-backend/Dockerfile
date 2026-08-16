# --- Build stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only the pom first so Docker can cache dependency downloads
# separately from source changes (much faster rebuilds).
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/email-writer-sb-0.0.1-SNAPSHOT.jar app.jar

# Render assigns the actual port via $PORT at runtime;
# application.properties reads it as server.port=${PORT:8080}.
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
