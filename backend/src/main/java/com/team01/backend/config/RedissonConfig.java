package com.team01.backend.config;

import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// 이 파일의 역할: Redisson이 Redis에 접속하는 "클라이언트"를 하나 만들어
//   스프링 빈으로 등록. 이 빈을 EnrollmentFacade가 주입받아 분산 락에 씀.
//   (Redisson 코어 라이브러리만 쓰므로 접속 설정을 직접 해줘야 함)
@Configuration
public class RedissonConfig {

    // application.yml의 spring.data.redis.host/port 값을 그대로 재사용.
    // 로컬은 localhost:6379, AWS면 ElastiCache 주소가 환경변수로 들어옴.
    @Value("${spring.data.redis.host:localhost}")
    private String host;

    @Value("${spring.data.redis.port:6379}")
    private int port;

    // destroyMethod = "shutdown" — 앱이 꺼질 때 Redis 연결을 깔끔히 닫음.
    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient() {
        Config config = new Config();
        // useSingleServer — Redis 1대(단일 서버) 모드. 로컬 도커도, 단일 ElastiCache도 이걸로 됨.
        config.useSingleServer()
              .setAddress("redis://" + host + ":" + port);
        return Redisson.create(config);
    }
}
