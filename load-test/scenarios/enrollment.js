import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const KC_URL    = __ENV.KC_URL    || 'http://host.minikube.internal:8180';
const BASE      = __ENV.BASE      || 'http://localhost:8080';
const REALM     = __ENV.REALM     || 'course';
const CLIENT_ID = __ENV.CLIENT_ID || 'course-frontend';
const VUS       = parseInt(__ENV.VUS || '100');
const COURSE_ID = parseInt(__ENV.COURSE_ID || '9001');
const CAP       = parseInt(__ENV.CAP || '30');
const PREFIX    = __ENV.USER_PREFIX || 'loaduser_';
const PASSWORD  = __ENV.LOAD_PASS || 'loadpass1234';
const MAX_RETRY = parseInt(__ENV.MAX_RETRY || '25');

// 4xx는 "실패한 HTTP"가 아니라 정상 비즈니스 응답 → threshold 오탐 방지
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 499 }));

const enrollOk    = new Counter('enroll_success');
const enrollFull  = new Counter('enroll_full');
const enrollErr   = new Counter('enroll_error');
const retryX      = new Counter('enroll_retry_exhausted');
const lockRetries = new Counter('lock_retry_total');
const loginFail   = new Counter('login_fail');

export const options = {
  scenarios: {
    enrollment_rush: { executor: 'per-vu-iterations', vus: VUS, iterations: 1, maxDuration: '90s' },
  },
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'enroll_success':  [`count<=${CAP}`],  // 오버부킹 나면 FAIL
    'enroll_error':    ['count==0'],       // 500 등 진짜 에러 0건
  },
};

// 부하 측정 전 토큰 미리 확보
export function setup() {
  const tokens = [];
  for (let i = 1; i <= VUS; i++) {
    const res = http.post(`${KC_URL}/realms/${REALM}/protocol/openid-connect/token`, {
      client_id: CLIENT_ID, grant_type: 'password',
      username: `${PREFIX}${i}`, password: PASSWORD,
    });
    tokens.push(res.status === 200 ? res.json('access_token') : null);
    if (res.status !== 200) console.error(`[setup] login 실패 ${PREFIX}${i}: ${res.status}`);
  }
  console.log(`[setup] 토큰 확보 ${tokens.filter(Boolean).length}/${VUS}`);
  return { tokens };
}

export default function (data) {
  const token = data.tokens[__VU - 1];
  if (!token) { loginFail.add(1); return; }
  const auth = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

  // ① 강의 목록
  check(http.get(`${BASE}/api/courses`, auth), { '강의목록 200': (r) => r.status === 200 });

  // ② 수강신청 — LOCK_BUSY면 재시도(실제 학생 새로고침처럼), 정원마감이면 즉시 포기
  let outcome = 'retry_exhausted';
  for (let a = 1; a <= MAX_RETRY; a++) {
    const en = http.post(`${BASE}/api/enrollments`, JSON.stringify({ courseId: COURSE_ID }), auth);
    if (en.status === 200) { enrollOk.add(1); outcome = 'ok'; break; }
    if (en.status === 409) {
      const b = en.body || '';
      if (b.indexOf('COURSE_FULL') !== -1 || b.indexOf('TIME_CONFLICT') !== -1) { enrollFull.add(1); outcome = 'full'; break; }
      lockRetries.add(1); sleep(0.1 + Math.random() * 0.3); continue;  // LOCK_BUSY → 재시도
    }
    enrollErr.add(1); console.error(`enroll ${en.status}: ${en.body}`); outcome = 'err'; break;
  }
  if (outcome === 'retry_exhausted') retryX.add(1);

  // ③ 시간표 조회
  check(http.get(`${BASE}/api/timetable`, auth), { '시간표 200': (r) => r.status === 200 });

  sleep(0.5);
}
