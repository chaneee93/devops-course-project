package com.team01.backend.enrollment;

import com.team01.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    // 신청은 Facade(Redis 락) 경유, 취소는 Service 직접 호출.
    private final EnrollmentFacade facade;
    private final EnrollmentService service;

    public EnrollmentController(EnrollmentFacade facade, EnrollmentService service) {
        this.facade = facade;
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody Map<String, Object> request) {
        // studentId는 요청 body가 아니라 JWT에서만 꺼냄 (남의 학생인 척 신청 방지)
        String studentId = JwtUtil.getUserId();
        Long courseId = Long.valueOf(request.get("courseId").toString());
        Enrollment saved = facade.enroll(studentId, courseId);   // ← 분산 락으로 감싼 신청
        return ResponseEntity.ok(Map.of(
                "enrollmentId", saved.getId(),
                "courseId", saved.getCourseId(),
                "status", "SUCCESS"
        ));
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<?> cancel(@PathVariable Long enrollmentId) {
        Long courseId = service.cancel(enrollmentId);
        return ResponseEntity.ok(Map.of("courseId", courseId, "status", "CANCELLED"));
    }
}
