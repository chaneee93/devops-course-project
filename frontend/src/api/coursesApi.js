/**
 * 강의/수강신청 관련 API 호출.
 * 실제 fetch, 토큰 첨부, 에러 처리는 전부 ../api.js(api 객체)가 담당함.
 */
import api from '../api'

export function fetchCourses() {
  return api.get('/api/courses')
}

export function fetchTimetable() {
  return api.get('/api/timetable')
}

export function enrollCourse(courseId) {
  return api.post('/api/enrollments', { courseId })
}

export function cancelEnrollment(enrollmentId) {
  return api.delete(`/api/enrollments/${enrollmentId}`)
}
