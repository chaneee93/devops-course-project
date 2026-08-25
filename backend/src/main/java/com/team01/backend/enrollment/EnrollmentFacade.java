package com.team01.backend.enrollment;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

// 이 파일의 역할: 수강신청을 Redis 분산 락으로 감싸는 바깥 껍데기.
// 핵심: 락은 DB 트랜잭션 "바깥"에서 잡고 푼다.
//   - enrollmentService.enroll()은 별도 빈이라 @Transactional이 정상 적용됨
//   - 락 해제는 finally에서 (enroll 끝 = 트랜잭션 커밋 후) → 다음 요청이 최신 상태를 봄
@Service
public class EnrollmentFacade {

    private final RedissonClient redissonClient;
    private final EnrollmentService enrollmentService;

    // WAIT_TIME  : 락을 얻으려고 최대 몇 초 기다릴지 (초과 시 포기하고 튕김)
    // LEASE_TIME : 락을 잡은 뒤 몇 초 후 자동으로 풀릴지 (= 락 타임아웃).
    //   서버가 중간에 죽어서 unlock을 못 해도, 이 시간이 지나면 자동 해제 → 영구 잠김 방지.
    private static final long WAIT_TIME  = 3;
    private static final long LEASE_TIME = 5;

    public EnrollmentFacade(RedissonClient redissonClient,
                            EnrollmentService enrollmentService) {
        this.redissonClient = redissonClient;
        this.enrollmentService = enrollmentService;
    }

    public Enrollment enroll(String studentId, Long courseId) {
        // 강의별로 락 이름을 다르게 → 서로 다른 강의는 동시에 처리되고, 같은 강의만 줄 세움
        RLock lock = redissonClient.getLock("lock:course:" + courseId);
        boolean acquired = false;
        try {
            // tryLock(대기시간, 임대시간, 단위) — 락을 얻으면 true
            acquired = lock.tryLock(WAIT_TIME, LEASE_TIME, TimeUnit.SECONDS);
            if (!acquired) {
                // 대기시간 안에 락을 못 얻음 = 지금 폭주 중 → 빠르게 튕겨서 DB 보호
                throw new ApiException(HttpStatus.CONFLICT, "LOCK_BUSY",
                        "동시 요청이 많습니다. 잠시 후 다시 시도해주세요");
            }
            // 락을 쥔 상태에서만 진짜 신청(DB 트랜잭션 + 비관적 락) 실행
            return enrollmentService.enroll(studentId, courseId);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "LOCK_INTERRUPTED",
                    "요청 처리 중 중단되었습니다");
        } finally {
            // 내가 쥔 락일 때만 해제 (남의 락, 이미 만료된 락을 잘못 푸는 것 방지)
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
