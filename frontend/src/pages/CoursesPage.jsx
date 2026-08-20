import { useEffect, useMemo, useState } from 'react';
import { fetchCourses, fetchTimetable } from '../api/coursesApi';
import CourseRow from '../components/CourseRow';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myEnrollments, setMyEnrollments] = useState({});
  const [deptFilter, setDeptFilter] = useState('전체');

  useEffect(() => {
    // 강의 목록 + 내 시간표(=신청 상태)를 동시에 불러옴.
    // timetable API 결과로 myEnrollments를 미리 채워두면,
    // 새로고침해도 "이미 신청한 강의" 표시가 유지됨
    // (예전엔 이 값이 화면 안 임시 상태라서 새로고침하면 사라졌었음).
    Promise.all([fetchCourses(), fetchTimetable()])
      .then(([courseList, timetable]) => {
        setCourses(courseList);

        const initialEnrollments = Object.fromEntries(
          timetable.courses.map((c) => [c.courseId, c.enrollmentId])
        );
        setMyEnrollments(initialEnrollments);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleEnrolled(courseId, enrollmentId) {
    setMyEnrollments((prev) => ({ ...prev, [courseId]: enrollmentId }));
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, remaining: c.remaining - 1, status: c.remaining - 1 > 0 ? 'OPEN' : 'CLOSED' }
          : c
      )
    );
  }

  function handleCancelled(courseId) {
    setMyEnrollments((prev) => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, remaining: c.remaining + 1, status: 'OPEN' } : c))
    );
  }

  const departments = useMemo(
    () => ['전체', ...new Set(courses.map((c) => c.department))],
    [courses]
  );

  const filtered = deptFilter === '전체' ? courses : courses.filter((c) => c.department === deptFilter);

  const totalCredits = courses
    .filter((c) => myEnrollments[c.id])
    .reduce((sum, c) => sum + c.credit, 0);

  if (loading) return <p className="text-center py-16 font-mono text-graphite">불러오는 중</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="flex items-end justify-between border-b border-chalk pb-5 mb-6">
        <h1 className="text-[30px] font-extrabold tracking-[-.035em] text-ink">수강신청</h1>
        <div className="flex items-center gap-4 text-[13px] text-graphite">
          <span>신청 {Object.keys(myEnrollments).length}과목</span>
          <span className="font-mono font-semibold text-cobalt">총 {totalCredits}학점</span>
        </div>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`h-9 px-4 rounded-field text-[13px] font-semibold transition-colors ${
              deptFilter === dept
                ? 'bg-cobalt text-white'
                : 'border border-chalk bg-white text-graphite hover:bg-chalk/40'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="border-b border-chalk">
            {['과목코드', '강의명', '교수', '학과', '학점', '시간', '정원', ''].map((h) => (
              <th key={h} className="text-left text-[13px] font-semibold text-graphite px-3 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              enrollmentId={myEnrollments[course.id]}
              onEnrolled={(enrollmentId) => handleEnrolled(course.id, enrollmentId)}
              onCancelled={() => handleCancelled(course.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
