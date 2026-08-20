import { useState } from 'react';
import { Button } from './ui';
import { enrollCourse, cancelEnrollment } from '../api/coursesApi';

export default function CourseRow({ course, enrollmentId, onEnrolled, onCancelled }) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isEnrolled = Boolean(enrollmentId);
  const isOpen = course.status === 'OPEN';

  async function handleEnroll() {
    setBusy(true);
    setErrorMsg(null);
    try {
      const result = await enrollCourse(course.id);
      onEnrolled(result.enrollmentId);
    } catch (err) {
      setErrorMsg(err.message || '신청에 실패했습니다');
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    setErrorMsg(null);
    try {
      await cancelEnrollment(enrollmentId);
      onCancelled();
    } catch (err) {
      setErrorMsg(err.message || '취소에 실패했습니다');
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className={`border-b border-chalk ${isEnrolled ? 'bg-mint/5' : ''}`}>
      <td className="px-3 py-3 font-mono text-[13px] text-graphite">{course.courseCode}</td>
      <td className="px-3 py-3 text-[15px] text-ink">
        {course.name}
        {errorMsg && <p className="mt-1 text-[12px] font-medium text-signal">{errorMsg}</p>}
      </td>
      <td className="px-3 py-3 text-[15px] text-ink">{course.professor}</td>
      <td className="px-3 py-3 text-[15px] text-ink">{course.department}</td>
      <td className="px-3 py-3 text-center font-mono text-[13px] text-ink">{course.credit}</td>
      <td className="px-3 py-3 font-mono text-[13px] text-graphite">
        {course.dayOfWeek} {course.startTime}–{course.endTime}
      </td>
      <td className="px-3 py-3 text-center">
        {isOpen || isEnrolled ? (
          <span className="font-mono text-[13px] font-semibold text-mint">
            {course.remaining}/{course.capacity}
          </span>
        ) : (
          <span className="text-[13px] font-semibold text-signal">정원 마감</span>
        )}
      </td>
      <td className="px-3 py-3">
        {isEnrolled ? (
          <Button variant="danger" disabled={busy} onClick={handleCancel}>
            {busy ? '처리중' : '취소'}
          </Button>
        ) : (
          <Button variant="primary" disabled={!isOpen || busy} onClick={handleEnroll}>
            {busy ? '처리중' : '신청'}
          </Button>
        )}
      </td>
    </tr>
  );
}
