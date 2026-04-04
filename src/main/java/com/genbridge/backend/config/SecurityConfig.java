package com.genbridge.backend.config;

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
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no token needed
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**", "/swagger-ui.html").permitAll()

                // Admin-only content management
                .requestMatchers(HttpMethod.POST, "/api/content").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/content/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/content/*").hasRole("ADMIN")

                // Public lesson endpoints — no token needed
                .requestMatchers(HttpMethod.GET, "/api/lessons").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lessons/{id}").permitAll()

                // Learner: authenticated access to nested lesson endpoints
                .requestMatchers(HttpMethod.GET, "/api/lessons/{id}/quiz").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/lessons/{id}/start").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/lessons/{id}/quiz/submit").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/content/lesson/{lessonId}").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/progress").authenticated()

                // Admin-only lesson management
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/lessons").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/lessons/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/lessons/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/lessons/{id}/quiz").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/lessons/{id}/quiz/{questionId}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/lessons/{id}/quiz/{questionId}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/lessons/{id}/report").authenticated()

                // Quest endpoints - authenticated learners
.requestMatchers(HttpMethod.GET, "/api/quests").authenticated()
.requestMatchers(HttpMethod.GET, "/api/quests/*").authenticated()
.requestMatchers(HttpMethod.GET, "/api/quests/completions").authenticated()
.requestMatchers(HttpMethod.POST, "/api/quests/*/complete").authenticated()

// Admin quest management
.requestMatchers(HttpMethod.GET, "/api/admin/quests").hasRole("ADMIN")
.requestMatchers(HttpMethod.POST, "/api/quests").hasRole("ADMIN")
.requestMatchers(HttpMethod.PUT, "/api/quests/*").hasRole("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/quests/*").hasRole("ADMIN")

                // All other endpoints require any authenticated user
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
