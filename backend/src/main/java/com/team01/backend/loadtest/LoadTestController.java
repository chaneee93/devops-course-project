package com.team01.backend.loadtest;

import com.team01.backend.enrollment.ApiException;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loadtest")
@Profile("loadtest")   // loadtest 프로파일일 때만 이 엔드포인트들이 존재
public class LoadTestController {

    private final LoadTestService loadTestService;

    public LoadTestController(LoadTestService loadTestService) {
        this.loadTestService = loadTestService;
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestParam Long courseId, @RequestParam int capacity) {
        loadTestService.reset(courseId, capacity);
        return ResponseEntity.ok(Map.of("status", "RESET", "courseId", courseId, "capacity", capacity));
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(@RequestParam Long courseId) {
        return ResponseEntity.ok(loadTestService.status(courseId));
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestParam String studentId,
                                    @RequestParam Long courseId,
                                    @RequestParam(defaultValue = "locked") String mode) {
        try {
            if ("unsafe".equals(mode)) loadTestService.enrollUnsafe(studentId, courseId);
            else                       loadTestService.enrollLocked(studentId, courseId);
            return ResponseEntity.ok(Map.of("status", "SUCCESS"));
        } catch (ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(Map.of("status", "REJECTED", "code", e.getCode()));
        }
    }
}
