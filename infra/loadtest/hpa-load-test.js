import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE || 'http://localhost:18080';

// 단계별 부하: 50 → 100 → 200 VU
export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },   // 부하 해제 (scale in 관찰용)
  ],
};

export default function () {
  const res = http.get(`${BASE}/api/courses`);
  check(res, { 'status 200': (r) => r.status === 200 });
}
