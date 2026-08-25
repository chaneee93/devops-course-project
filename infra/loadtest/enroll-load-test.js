import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const BASE      = __ENV.BASE      || 'http://localhost:8080';
const MODE      = __ENV.MODE      || 'locked';   // locked(After) | unsafe(Before)
const COURSE_ID = __ENV.COURSE_ID || '999500';
const CAP       = __ENV.CAP       || '10';

const success  = new Counter('enroll_success');   // 신청 성공 수
const rejected = new Counter('enroll_rejected');  // 거절(정원마감/락튕김) 수

export const options = {
  scenarios: {
    burst: {
      executor: 'shared-iterations',
      vus: 50,          // 동시 사용자 50명
      iterations: 50,   // 총 50번 신청 (1인 1신청)
      maxDuration: '30s',
    },
  },
};

// 시작 전 1번: 강의 잔여석을 정원(CAP)으로 초기화
export function setup() {
  const res = http.post(`${BASE}/api/loadtest/reset?courseId=${COURSE_ID}&capacity=${CAP}`);
  console.log(`[setup] reset ${res.status}: ${res.body}`);
}

export default function () {
  const studentId = `load_student_${__VU}`;   // 매 사용자 다른 학생ID
  const res = http.post(
    `${BASE}/api/loadtest/enroll?studentId=${studentId}&courseId=${COURSE_ID}&mode=${MODE}`
  );
  if (res.status === 200) success.add(1);
  else rejected.add(1);
  // 200(성공) 또는 409(정원마감 거절)면 정상. 그 외(500 등)면 진짜 에러.
  check(res, { '정상응답(200 or 409)': (r) => r.status === 200 || r.status === 409 });
}

// 끝난 뒤 1번: 최종 상태(잔여석/등록수/오버부킹여부) 출력
export function teardown() {
  const res = http.get(`${BASE}/api/loadtest/status?courseId=${COURSE_ID}`);
  console.log(`[teardown] MODE=${MODE} 최종상태 → ${res.body}`);
}
