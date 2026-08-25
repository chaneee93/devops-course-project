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

// @SpringBootTest — 앱 전체를 진짜로 띄운 상태로 테스트.
//   실제 MySQL(도커)에 붙어서 진짜 DB 락이 동작하는지 검증한다.
@SpringBootTest
class EnrollmentConcurrencyTest {

    @Autowired EnrollmentService enrollmentService;
    @Autowired CourseRepository courseRepository;
    @Autowired JdbcTemplate jdbc;   // 테스트용 강의를 SQL로 직접 심고 지우는 도구

    static final Long TEST_COURSE_ID = 999001L; // 실제 데이터와 안 겹치게 높은 번호 사용
    static final int CAPACITY = 5;              // 정원 5명
    static final int THREADS  = 10;             // 동시에 신청하는 학생 10명

    // 각 테스트 전에: 이전 잔재 싹 지우고, 정원 5짜리 테스트 강의를 새로 심는다.
    @BeforeEach
    void setUp() {
        jdbc.update("DELETE FROM enrollment WHERE course_id = ?", TEST_COURSE_ID);
        jdbc.update("DELETE FROM course WHERE id = ?", TEST_COURSE_ID);
        jdbc.update(
            "INSERT INTO course " +
            "(id, course_code, name, professor, department, capacity, remaining, credit, day_of_week, start_time, end_time) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            TEST_COURSE_ID, "TEST101", "동시성 테스트 강의", "테스트교수", "컴퓨터공학과",
            CAPACITY, CAPACITY, 3, "MON", "09:00", "10:00"
        );
    }

    // 각 테스트 후: 심어둔 데이터 정리 (DB를 원래대로 되돌림)
    @AfterEach
    void tearDown() {
        jdbc.update("DELETE FROM enrollment WHERE course_id = ?", TEST_COURSE_ID);
        jdbc.update("DELETE FROM course WHERE id = ?", TEST_COURSE_ID);
    }

    @Test
    @DisplayName("10명이 동시에 신청해도 정원(5명)만큼만 성공한다")
    void concurrentEnroll_onlyCapacitySucceeds() throws InterruptedException {
        AtomicInteger success = new AtomicInteger(); // 신청 성공 카운트
        AtomicInteger full    = new AtomicInteger(); // COURSE_FULL(정원마감) 카운트
        AtomicInteger other   = new AtomicInteger(); // 예상 못 한 기타 에러 카운트

        ExecutorService pool = Executors.newFixedThreadPool(THREADS);
        CountDownLatch ready = new CountDownLatch(THREADS); // 스레드들이 대기선에 다 섰는지
        CountDownLatch start = new CountDownLatch(1);       // 출발 신호(동시에 풀림)
        CountDownLatch done  = new CountDownLatch(THREADS); // 전원 종료 확인

        for (int i = 0; i < THREADS; i++) {
            final String studentId = "test_student_" + i; // 학생마다 다른 ID
            pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();  // ★ 여기서 10개가 다 같이 대기하다가 동시에 출발 = 진짜 경쟁 재현
                    enrollmentService.enroll(studentId, TEST_COURSE_ID);
                    success.incrementAndGet();
                } catch (ApiException e) {
                    if ("COURSE_FULL".equals(e.getCode())) full.incrementAndGet();
                    else other.incrementAndGet();
                } catch (Exception e) {
                    other.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await();       // 10개 스레드가 전부 대기선에 설 때까지 기다림
        start.countDown();   // 출발! (10개 동시에 enroll 돌진)
        done.await();        // 전원 끝날 때까지 기다림
        pool.shutdown();

        int remaining = courseRepository.findById(TEST_COURSE_ID)
                .map(Course::getRemaining).orElse(-1);
        Long enrolledRows = jdbc.queryForObject(
                "SELECT COUNT(*) FROM enrollment WHERE course_id = ?", Long.class, TEST_COURSE_ID);

        System.out.println("========== 동시성 테스트 결과 ==========");
        System.out.println("신청 성공     : " + success.get() + " (기대값 5)");
        System.out.println("정원마감 거절 : " + full.get()    + " (기대값 5)");
        System.out.println("기타 에러     : " + other.get()   + " (기대값 0)");
        System.out.println("DB 잔여석     : " + remaining     + " (기대값 0)");
        System.out.println("DB 신청건수   : " + enrolledRows  + " (기대값 5)");
        System.out.println("=======================================");

        // ★ 락이 진짜면 아래가 전부 통과한다. 락이 고장났으면 success가 5를 넘겨서 빨갛게 실패한다.
        assertThat(success.get()).isEqualTo(CAPACITY);   // 딱 5명만 성공
        assertThat(full.get()).isEqualTo(THREADS - CAPACITY); // 나머지 5명은 정원마감
        assertThat(other.get()).isZero();                // 예상 못 한 에러 없음
        assertThat(remaining).isZero();                  // 잔여석 정확히 0
        assertThat(enrolledRows).isEqualTo(CAPACITY);    // DB에 딱 5건만 남음
    }
}
