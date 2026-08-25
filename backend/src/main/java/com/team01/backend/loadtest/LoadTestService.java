package com.team01.backend.loadtest;

import com.team01.backend.course.Course;
import com.team01.backend.course.CourseRepository;
import com.team01.backend.enrollment.ApiException;
import com.team01.backend.enrollment.Enrollment;
import com.team01.backend.enrollment.EnrollmentFacade;
import com.team01.backend.enrollment.EnrollmentRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Profile("loadtest")   // 이 프로파일일 때만 존재. 평소엔 아예 안 뜸.
public class LoadTestService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentFacade enrollmentFacade;
    private final JdbcTemplate jdbc;

    public LoadTestService(CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository,
                           EnrollmentFacade enrollmentFacade,
                           JdbcTemplate jdbc) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.enrollmentFacade = enrollmentFacade;
        this.jdbc = jdbc;
    }

    // 강의 상태 초기화: 신청기록 지우고 잔여석을 정원으로 리셋 (없으면 새로 만듦)
    public void reset(Long courseId, int capacity) {
        jdbc.update("DELETE FROM enrollment WHERE course_id = ?", courseId);
        jdbc.update(
            "INSERT INTO course " +
            "(id, course_code, name, professor, department, capacity, remaining, credit, day_of_week, start_time, end_time) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
            "ON DUPLICATE KEY UPDATE capacity = VALUES(capacity), remaining = VALUES(remaining)",
            courseId, "LOAD" + courseId, "부하테스트 강의", "테스트교수", "컴퓨터공학과",
            capacity, capacity, 3, "MON", "09:00", "10:00"
        );
    }

    public Map<String, Object> status(Long courseId) {
        Course c = courseRepository.findById(courseId).orElse(null);
        Long enrolled = jdbc.queryForObject(
            "SELECT COUNT(*) FROM enrollment WHERE course_id = ?", Long.class, courseId);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("courseId", courseId);
        m.put("capacity", c == null ? null : c.getCapacity());
        m.put("remaining", c == null ? null : c.getRemaining());
        m.put("enrolled", enrolled);
        m.put("overbooked", c != null && enrolled != null && enrolled > c.getCapacity());
        return m;
    }

    // 락 있는 신청 (After): Redis 분산 락 + DB 비관적 락
    public void enrollLocked(String studentId, Long courseId) {
        enrollmentFacade.enroll(studentId, courseId);
    }

    // 락 없는 신청 (Before): 일부러 락을 뺀 버전 — 오버부킹 재현용.
    // ⚠️ 절대 운영에서 쓰면 안 됨. 부하테스트 프로파일 전용.
    @Transactional
    public void enrollUnsafe(String studentId, Long courseId) {
        Course c = courseRepository.findById(courseId)   // ← FOR UPDATE 없음 = 락 안 걸고 조회
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "없는 강의"));
        if (c.getRemaining() <= 0) {
            throw new ApiException(HttpStatus.CONFLICT, "COURSE_FULL", "정원 마감");
        }
        // 읽기~쓰기 사이 틈을 일부러 벌려서 race condition을 확실히 재현
        try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        c.setRemaining(c.getRemaining() - 1);
        courseRepository.save(c);
        enrollmentRepository.save(new Enrollment(studentId, courseId));
    }
}
