FROM openjdk:17-jdk-slim

WORKDIR /app

COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

COPY pom.xml .
COPY src ./src

RUN ./mvnw clean package -DskipTests
RUN mv target/*.jar app.jar

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "app.jar"]
