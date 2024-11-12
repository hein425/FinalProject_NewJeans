package com.example.dailyLog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DailyLogApplication {

	public static void main(String[] args) {
		SpringApplication.run(DailyLogApplication.class, args);
	}

}
