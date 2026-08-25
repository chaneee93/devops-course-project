package com.team01.backend.enrollment;

import com.team01.backend.course.Course;
import com.team01.backend.course.CourseRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

// M4-2 검증: Redis 분산 락(Facade)을 통과하는 경로로 동시 신청해도
//   오버부킹이 안 나는지 확인. 실제 Redis(도커)에 붙어서 RLock이 동작한다.
@SpringBootTest
class EnrollmentFacadeConcurrencyTest {

    @Autowired EnrollmentFacade enrollmentFacade;   // ← 이번엔 Facade(Redis 락)를 직접 호출
    @Autowired CourseRepository courseRepository;
    @Autowired JdbcTemplate jdbc;

    static final Long TEST_COURSE_ID = 999002L;     // M4-1 테스트와 안 겹치게 다른 번호
    static final int CAPACITY = 5;
    static final int THREADS  = 10;

    @BeforeEach
    void setUp() {
        jdbc.update("DELETE FROM enrollment WHERE course_id = ?", TEST_COURSE_ID);
        jdbc.update("DELETE FROM course WHERE id = ?", TEST_COURSE_ID);
        jdbc.update(
            "INSERT INTO course " +
            "(id, course_code, name, professor, department, capacity, remaining, credit, day_of_week, start_time, end_time) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            TEST_COURSE_ID, "TEST202", "Redis락 테스트 강의", "테스트교수", "컴퓨터공학과",
            CAPACITY, CAPACITY, 3, "TUE", "13:00", "14:00"
        );
    }

    @AfterEach
    void tearDown() {
        jdbc.update("DELETE FROM enrollment WHERE course_id = ?", TEST_COURSE_ID);
        jdbc.update("DELETE FROM course WHERE id = ?", TEST_COURSE_ID);
    }

    @Test
    @DisplayName("Redis 락 경유로 10명 동시 신청해도 정원(5명)만 성공한다")
    void facadeConcurrentEnroll_noOverbooking() throws InterruptedException {
        AtomicInteger success = new AtomicInteger();
        AtomicInteger full    = new AtomicInteger(); // COURSE_FULL (정원마감)
        AtomicInteger busy    = new AtomicInteger(); // LOCK_BUSY (락 대기 초과)
        AtomicInteger other   = new AtomicInteger();

        ExecutorService pool = Executors.newFixedThreadPool(THREADS);
        CountDownLatch ready = new CountDownLatch(THREADS);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done  = new CountDownLatch(THREADS);

        for (int i = 0; i < THREADS; i++) {
            final String studentId = "facade_student_" + i;
            pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    enrollmentFacade.enroll(studentId, TEST_COURSE_ID);
                    success.incrementAndGet();
                } catch (ApiException e) {
                    if ("COURSE_FULL".equals(e.getCode())) full.incrementAndGet();
                    else if ("LOCK_BUSY".equals(e.getCode())) busy.incrementAndGet();
                    else other.incrementAndGet();
                } catch (Exception e) {
                    other.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await();
        start.countDown();
        done.await();
        pool.shutdown();

        int remaining = courseRepository.findById(TEST_COURSE_ID)
                .map(Course::getRemaining).orElse(-1);
        Long enrolledRows = jdbc.queryForObject(
                "SELECT COUNT(*) FROM enrollment WHERE course_id = ?", Long.class, TEST_COURSE_ID);

        System.out.println("===== M4-2 Redis 락 테스트 결과 =====");
        System.out.println("신청 성공     : " + success.get()   + " (기대값 5)");
        System.out.println("정원마감      : " + full.get());
        System.out.println("락대기초과    : " + busy.get());
        System.out.println("기타 에러     : " + other.get()     + " (기대값 0)");
        System.out.println("DB 잔여석     : " + remaining       + " (기대값 0)");
        System.out.println("DB 신청건수   : " + enrolledRows    + " (기대값 5)");
        System.out.println("====================================");

        // 핵심 불변식: Redis 락을 거쳐도 오버부킹 없이 정확히 정원만큼만 성공
        assertThat(success.get()).isEqualTo(CAPACITY);        // 딱 5명
        assertThat(enrolledRows).isEqualTo((long) CAPACITY);  // DB에도 딱 5건
        assertThat(remaining).isZero();                       // 잔여석 0
        assertThat(other.get()).isZero();                     // 예상 못 한 에러 없음
        assertThat(full.get() + busy.get()).isEqualTo(THREADS - CAPACITY); // 나머지 5명은 마감 or 락튕김
    }
}
