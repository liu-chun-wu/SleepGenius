# Build stage
FROM eclipse-temurin:17 AS builder
WORKDIR /app

# 複製專案程式碼
COPY . .

# 確保 Maven Wrapper 可執行
RUN chmod +x ./mvnw

# 建置 jar
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:17
WORKDIR /app

# 複製 jar 成品
COPY --from=builder /app/target/*.jar app.jar

# 執行 Spring Boot
CMD ["java", "-jar", "app.jar"]
