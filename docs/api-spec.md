# 수강신청 시스템 API 명세

> Base URL: `/api`

## 인증 (Auth)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | /api/auth/signup | 회원가입 | X |
| POST | /api/auth/login | 로그인 → JWT 발급 | X |
| POST | /api/auth/refresh | 토큰 갱신 | O |

### POST /api/auth/signup
```json
// Request
{
  "username": "chani",
  "email": "chani@example.com",
  "password": "password123",
  "studentNo": "2024001"
}

// Response 201
{
  "id": 1,
  "username": "chani",
  "email": "chani@example.com",
  "studentNo": "2024001"
}
```

### POST /api/auth/login
```json
// Request
{
  "email": "chani@example.com",
  "password": "password123"
}

// Response 200
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresIn": 3600
}
```

---

## 강의 (Courses)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | /api/courses | 강의 목록 조회 | X |
| GET | /api/courses/:id | 강의 상세 조회 | X |

### GET /api/courses
```json
// Query Params: ?page=0&size=20&sort=name

// Response 200
{
  "content": [
    {
      "id": 1,
      "name": "데이터베이스",
      "professor": "김교수",
      "capacity": 30,
      "enrolled": 25,
      "credits": 3,
      "day": "MON",
      "startTime": "09:00",
      "endTime": "10:30"
    }
  ],
  "totalElements": 15,
  "totalPages": 1
}
```

---

## 수강신청 (Enrollments)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | /api/enrollments | 수강신청 | O |
| DELETE | /api/enrollments/:id | 수강취소 | O |
| GET | /api/enrollments/my | 내 수강내역 조회 | O |

### POST /api/enrollments
```json
// Request
{
  "courseId": 1
}

// Response 201
{
  "id": 1,
  "courseId": 1,
  "courseName": "데이터베이스",
  "enrolledAt": "2026-08-19T10:30:00"
}

// Error 409 — 정원 초과
{
  "error": "CAPACITY_FULL",
  "message": "정원이 초과되었습니다 (30/30)"
}

// Error 409 — 시간 중복
{
  "error": "TIME_CONFLICT",
  "message": "월요일 09:00~10:30에 이미 수강 중인 강의가 있습니다"
}
```

### GET /api/enrollments/my
```json
// Response 200
[
  {
    "id": 1,
    "courseId": 1,
    "courseName": "데이터베이스",
    "professor": "김교수",
    "day": "MON",
    "startTime": "09:00",
    "endTime": "10:30",
    "credits": 3,
    "enrolledAt": "2026-08-19T10:30:00"
  }
]
```

---

## 시간표 (Timetable)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | /api/timetable | 내 시간표 조회 | O |

### GET /api/timetable
```json
// Response 200
{
  "totalCredits": 18,
  "totalCourses": 6,
  "entries": [
    {
      "courseId": 1,
      "courseName": "데이터베이스",
      "professor": "김교수",
      "day": "MON",
      "startTime": "09:00",
      "endTime": "10:30",
      "color": "#4A90D9"
    }
  ]
}
```

---

## 에러 응답 공통 형식

```json
{
  "error": "ERROR_CODE",
  "message": "사람이 읽을 수 있는 메시지",
  "timestamp": "2026-08-19T10:30:00"
}
```

| HTTP 상태 | 의미 |
|-----------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (정원초과, 시간중복) |
| 500 | 서버 오류 |
