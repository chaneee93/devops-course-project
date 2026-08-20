/**
 * API 호출 유틸리티.
 * 모든 요청에 JWT 토큰을 자동으로 붙인다.
 *
 * 사용법:
 *   import api from './api'
 *   const courses = await api.get('/api/courses')
 *   await api.post('/api/enrollments', { courseId: 1 })
 */
import { getToken } from './auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request(method, path, body) {
  const token = await getToken()

  const headers = {
    'Content-Type': 'application/json',
  }

  // 토큰이 있으면 Authorization 헤더에 자동 첨부
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // 401이면 토큰 만료 또는 미인증
  if (res.status === 401) {
    // TODO: 로그인 페이지로 리다이렉트하거나 토큰 갱신 처리
    throw new Error('인증이 필요합니다')
  }

  // 204 No Content 등 body 없는 응답
  if (res.status === 204) return null

  const data = await res.json()

  if (!res.ok) {
    const error = new Error(data.error || '요청 실패')
    error.code = data.code
    error.status = res.status
    throw error
  }

  return data
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}

export default api
