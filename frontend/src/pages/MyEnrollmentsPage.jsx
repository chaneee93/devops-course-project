import { useEffect, useState } from 'react';
import { fetchTimetable, cancelEnrollment } from '../api/coursesApi';
import { Button } from '../components/ui';

// GET /api/timetable이 이미 "내가 신청한 강의 + 상세정보"를 다 갖고 있어서
// 이 페이지는 별도 API 없이 그걸 그대로 재사용함.
export default function MyEnrollmentsPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable()
      .then((data) => setCourses(data.courses))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(enrollmentId) {
    await cancelEnrollment(enrollmentId);
    setCourses((prev) => prev.filter((c) => c.enrollmentId !== enrollmentId));
  }

  if (loading) return <p className="text-center py-16 font-mono text-graphite">불러오는 중</p>;

  return (
    <div className="max-w-4xl mx-auto px-6">
      <h1 className="text-[24px] font-bold tracking-[-.02em] text-ink mb-6">내 신청목록</h1>

      {courses.length === 0 ? (
        <p className="text-[15px] text-graphite">신청한 강의가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li
              key={c.enrollmentId}
              className="flex items-center justify-between border border-chalk rounded-field px-5 py-4 bg-white"
            >
              <div>
                <p className="text-[15px] font-semibold text-ink">{c.name}</p>
                <p className="text-[13px] text-graphite mt-0.5">
                  {c.professor} · {c.department} · {c.credit}학점
                </p>
                <p className="font-mono text-[13px] text-graphite mt-0.5">
                  {c.dayOfWeek} {c.startTime}–{c.endTime}
                </p>
              </div>
              <Button variant="danger" onClick={() => handleCancel(c.enrollmentId)}>
                취소
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
