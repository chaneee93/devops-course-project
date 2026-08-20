import { useState, useEffect } from "react";
import api from "../api";

// ── 시간 설정 ──────────────────────────────────────────────
const START_HOUR = 9;
const END_HOUR = 18;
const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const DAY_LABELS = { MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금" };

// ── 색상: 강의별로 자동 배정 ──────────────────────────────────
const COURSE_COLORS = [
  { bg: "bg-cobalt/15", border: "border-cobalt/40", text: "text-cobalt" },
  { bg: "bg-mint/15", border: "border-mint/40", text: "text-mint" },
  { bg: "bg-signal/15", border: "border-signal/40", text: "text-signal" },
  { bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-600" },
  { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-600" },
  { bg: "bg-rose-500/15", border: "border-rose-500/40", text: "text-rose-600" },
];

// ── 시간 → 행 위치 계산 ──────────────────────────────────────
function timeToRow(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0);
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export default function TimetablePage() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  // ── API 호출 ─────────────────────────────────────────────
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/timetable");
      setTimetable(res);
      setError(null);
    } catch (err) {
      setError("시간표를 불러올 수 없습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // ── 수강 취소 ─────────────────────────────────────────────
  const handleCancel = async (enrollmentId, courseName) => {
    if (!confirm(`"${courseName}" 수강을 취소할까요?`)) return;
    try {
      setCancelling(enrollmentId);
      await api.delete(`/api/enrollments/${enrollmentId}`);
      await fetchTimetable();
    } catch (err) {
      alert("수강 취소에 실패했습니다.");
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  // ── 로딩 / 에러 ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-graphite">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-signal">{error}</p>
        <button
          onClick={fetchTimetable}
          className="px-4 py-2 text-sm rounded-lg bg-cobalt text-paper hover:bg-cobalt/90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const courses = timetable?.courses || [];
  const totalCredit = timetable?.totalCredit || 0;
  const totalRows = (END_HOUR - START_HOUR) * 2; // 30분 단위

  // 강의별 색상 매핑
  const colorMap = {};
  courses.forEach((c, i) => {
    colorMap[c.courseId] = COURSE_COLORS[i % COURSE_COLORS.length];
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ── 헤더 ──────────────────────────────────────── */}
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink font-[Pretendard]">
          내 시간표
        </h1>
        <span className="text-sm text-graphite font-[JetBrains_Mono]">
          {courses.length}과목 · {totalCredit}학점
        </span>
      </div>

      {/* ── 빈 시간표 ─────────────────────────────────── */}
      {courses.length === 0 ? (
        <div className="text-center py-20 text-graphite border border-dashed border-chalk rounded-xl">
          <p className="text-lg mb-1">신청한 강의가 없습니다</p>
          <p className="text-sm">강의 목록에서 수강신청을 해주세요</p>
        </div>
      ) : (
        /* ── 시간표 그리드 ──────────────────────────── */
        <div className="border border-chalk rounded-xl overflow-hidden bg-paper">
          <div
            className="grid"
            style={{
              gridTemplateColumns: "64px repeat(5, 1fr)",
            }}
          >
            {/* ── 요일 헤더 ───────────────────────────── */}
            <div className="bg-chalk/30 border-b border-chalk h-12" />
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-chalk/30 border-b border-l border-chalk h-12 flex items-center justify-center text-sm font-semibold text-ink"
              >
                {DAY_LABELS[day]}
              </div>
            ))}

            {/* ── 시간 행 + 강의 셀 ──────────────────── */}
            <div
              className="col-span-full grid"
              style={{
                gridTemplateColumns: "64px repeat(5, 1fr)",
                gridTemplateRows: `repeat(${totalRows}, 32px)`,
              }}
            >
              {/* 시간 라벨 (정시만) */}
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <div
                  key={i}
                  className="text-xs text-graphite font-[JetBrains_Mono] flex items-start justify-center pt-1 border-t border-chalk/60"
                  style={{
                    gridColumn: 1,
                    gridRow: `${i * 2 + 1} / span 2`,
                  }}
                >
                  {String(START_HOUR + i).padStart(2, "0")}:00
                </div>
              ))}

              {/* 그리드 배경선 */}
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) =>
                DAYS.map((_, di) => (
                  <div
                    key={`bg-${i}-${di}`}
                    className="border-t border-l border-chalk/60"
                    style={{
                      gridColumn: di + 2,
                      gridRow: `${i * 2 + 1} / span 2`,
                    }}
                  />
                ))
              )}

              {/* ── 강의 블록 ────────────────────────── */}
              {courses.map((course) => {
                const col = DAYS.indexOf(course.dayOfWeek) + 2;
                const rowStart = timeToRow(course.startTime) + 1;
                const rowEnd = timeToRow(course.endTime) + 1;
                const color = colorMap[course.courseId];
                const durationMin =
                  timeToMinutes(course.endTime) -
                  timeToMinutes(course.startTime);

                if (col < 2) return null; // 잘못된 요일 무시

                return (
                  <div
                    key={course.enrollmentId}
                    className={`${color.bg} ${color.border} border rounded-md mx-0.5 p-1.5 flex flex-col overflow-hidden cursor-pointer group relative`}
                    style={{
                      gridColumn: col,
                      gridRow: `${rowStart} / ${rowEnd}`,
                    }}
                  >
                    <span
                      className={`text-xs font-bold ${color.text} truncate`}
                    >
                      {course.name}
                    </span>
                    {durationMin > 60 && (
                      <>
                        <span className="text-[10px] text-graphite truncate">
                          {course.professor}
                        </span>
                        <span className="text-[10px] text-graphite font-[JetBrains_Mono]">
                          {course.startTime}–{course.endTime}
                        </span>
                      </>
                    )}

                    {/* 호버 시 취소 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(course.enrollmentId, course.name);
                      }}
                      disabled={cancelling === course.enrollmentId}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-signal/80 text-paper text-xs 
                                 opacity-0 group-hover:opacity-100 transition-opacity
                                 flex items-center justify-center hover:bg-signal"
                      title="수강 취소"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
