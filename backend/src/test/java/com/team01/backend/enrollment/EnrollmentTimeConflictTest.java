package com.team01.backend.enrollment;

import com.team01.backend.course.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

// M4-3 검증: 같은 시간대에 겹치는 강의는 막고, 안 겹치면 통과하는지 확인.
@SpringBootTest
class EnrollmentTimeConflictTest {

    @Autowired EnrollmentService enrollmentService;
    @Autowired JdbcTemplate jdbc;

    // 테스트용 강의 4개 (실제 데이터와 안 겹치게 높은 번호)
    static final Long A   = 999101L; // 월 09:00~10:00 (기준 강의)
    static final Long OVERLAP  = 999102L; // 월 09:30~10:30 (A와 겹침)
    static final Long ADJACENT = 999103L; // 월 10:00~11:00 (A 바로 뒤, 안 겹침)
    static final Long OTHERDAY = 999104L; // 화 09:00~10:00 (A와 같은 시간, 다른 요일)

    @BeforeEach
    void setUp() {
        // 이전 잔재 정리
        for (Long id : new Long[]{A, OVERLAP, ADJACENT, OTHERDAY}) {
            jdbc.update("DELETE FROM enrollment WHERE course_id = ?", id);
            jdbc.update("DELETE FROM course WHERE id = ?", id);
        }
        insertCourse(A,        "월 09:00~10:00", "MON", "09:00", "10:00");
        insertCourse(OVERLAP,  "월 09:30~10:30", "MON", "09:30", "10:30");
        insertCourse(ADJACENT, "월 10:00~11:00", "MON", "10:00", "11:00");
        insertCourse(OTHERDAY, "화 09:00~10:00", "TUE", "09:00", "10:00");
    }

    private void insertCourse(Long id, String name, String day, String start, String end) {
        jdbc.update(
            "INSERT INTO course " +
            "(id, course_code, name, professor, department, capacity, remaining, credit, day_of_week, start_time, end_time) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            id, "TC" + id, name, "테스트교수", "컴퓨터공학과", 10, 10, 3, day, start, end
        );
    }

    @Test
    @DisplayName("① 시간이 겹치는 강의는 신청이 막힌다 (TIME_CONFLICT)")
    void overlappingCourse_isBlocked() {
        String student = "tc_student_overlap";
        enrollmentService.enroll(student, A);   // 먼저 A 신청 (월 09:00~10:00)

        // A와 겹치는 강의 신청 시도 → TIME_CONFLICT 예외가 나야 함
        assertThatThrownBy(() -> enrollmentService.enroll(student, OVERLAP))
            .isInstanceOfSatisfying(ApiException.class,
                ex -> assertThat(ex.getCode()).isEqualTo("TIME_CONFLICT"));
    }

    @Test
    @DisplayName("② 시간이 딱 붙은 강의는 신청된다 (경계, 안 겹침)")
    void adjacentCourse_isAllowed() {
        String student = "tc_student_adjacent";
        enrollmentService.enroll(student, A);   // 월 09:00~10:00

        // 월 10:00~11:00 — A가 끝나는 순간 시작 → 안 겹침 → 성공해야 함
        assertThatCode(() -> enrollmentService.enroll(student, ADJACENT))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("③ 요일이 다르면 같은 시간대라도 신청된다")
    void differentDay_isAllowed() {
        String student = "tc_student_otherday";
        enrollmentService.enroll(student, A);   // 월 09:00~10:00

        // 화 09:00~10:00 — 시간은 같지만 요일이 다름 → 성공해야 함
        assertThatCode(() -> enrollmentService.enroll(student, OTHERDAY))
            .doesNotThrowAnyException();
    }
}
