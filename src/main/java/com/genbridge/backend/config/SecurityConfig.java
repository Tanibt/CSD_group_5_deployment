package com.genbridge.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// ✅ ADD THESE IMPORTS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // ✅ KEEP THIS
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(HttpMethod.PUT, "/api/auth/change-password").authenticated()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**", "/swagger-ui.html")
                        .permitAll()

                        // Admin content
                        .requestMatchers(HttpMethod.POST, "/api/content").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/content/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/content/*").hasRole("ADMIN")

                        // Lessons
                        .requestMatchers(HttpMethod.GET, "/api/lessons").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/lessons/{id}").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/lessons/{id}/quiz").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/lessons/{id}/start").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/lessons/{id}/quiz/submit").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/content/lesson/{lessonId}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/progress").authenticated()

                        // Admin lesson management
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/lessons").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/lessons/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/lessons/{id}").hasRole("ADMIN")

                        // Quest endpoints
                        .requestMatchers(HttpMethod.GET, "/api/quests").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/quests/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/quests/completions").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/quests/*/complete").authenticated()

                        // Admin quests
                        .requestMatchers(HttpMethod.GET, "/api/admin/quests").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/quests").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/quests/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/quests/*").hasRole("ADMIN")

                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ ADD THIS (CORS FIX)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://csd-group-5-deployment.vercel.app"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}