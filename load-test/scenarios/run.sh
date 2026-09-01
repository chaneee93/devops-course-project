#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
VUS="${VUS:-100}"; COURSE_ID="${COURSE_ID:-9001}"; CAP="${CAP:-30}"

echo "[1/2] 테스트 강의($COURSE_ID) 정원 $CAP 리셋..."
docker exec -i course-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" course_db' <<SQL
DELETE FROM enrollment WHERE course_id=${COURSE_ID};
INSERT INTO course (id, course_code, name, professor, department, capacity, remaining, credit, day_of_week, start_time, end_time)
VALUES (${COURSE_ID}, 'INT${COURSE_ID}', '통합테스트강의', '테스트교수', '컴퓨터공학과', ${CAP}, ${CAP}, 3, 'MON', '09:00', '10:00')
ON DUPLICATE KEY UPDATE capacity=VALUES(capacity), remaining=VALUES(remaining);
SQL

echo "[2/2] k6 통합 시나리오 실행 (VUs=$VUS, courseId=$COURSE_ID, 정원=$CAP)..."
VUS="$VUS" COURSE_ID="$COURSE_ID" CAP="$CAP" k6 run "$HERE/enrollment.js"
