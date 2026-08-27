/**
 * Keycloak 인증 유틸리티 (로컬).
 * Cognito SDK를 걷어내고 Keycloak OIDC 토큰 엔드포인트를 직접 호출한다.
 * JWT 구조가 동일해 api.js와 각 페이지 코드는 그대로 동작한다.
 * AWS 전환 시: 아래 URL/clientId만 Cognito 값으로 바꾸면 됨 (env로 주입).
 */

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180'
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'course'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'course-frontend'

const TOKEN_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`
const STORAGE_KEY = 'course_auth'

// ── localStorage 저장/조회/삭제 헬퍼 ──
function saveTokens(data) {
  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    // 만료 시각(ms). 실제보다 10초 여유를 둬서 미리 갱신.
    expiresAt: Date.now() + (data.expires_in - 10) * 1000,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  return tokens
}
function loadTokens() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}
function clearTokens() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 로그인 — Keycloak에 password grant로 토큰 요청 후 저장.
 */
export async function signIn({ email, password }) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    username: email,   // Keycloak은 이메일/사용자명 둘 다 허용
    password,
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error_description || '로그인 실패')
  }
  const data = await res.json()
  saveTokens(data)
  return { accessToken: data.access_token }
}

/**
 * refresh_token으로 액세스 토큰 갱신.
 */
async function refresh(refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) return null
  return saveTokens(await res.json())
}

/**
 * 현재 유효한 액세스 토큰 반환.
 * 만료됐으면 refresh_token으로 자동 갱신. 실패 시 null.
 * (api.js가 매 요청마다 이걸 호출해 Authorization 헤더에 붙인다)
 */
export async function getToken() {
  let tokens = loadTokens()
  if (!tokens) return null
  if (Date.now() < tokens.expiresAt) return tokens.accessToken
  tokens = await refresh(tokens.refreshToken)
  if (!tokens) {
    clearTokens()
    return null
  }
  return tokens.accessToken
}

/** 로그아웃 — 저장된 토큰 제거. */
export function signOut() {
  clearTokens()
}

/** 로그인 상태 확인. */
export async function isAuthenticated() {
  return (await getToken()) !== null
}

// ── 회원가입 관련 — M6-4에서 연결 (지금은 import 깨지지 않게 자리만 유지) ──
export async function signUp() {
  throw new Error('회원가입은 M6-4에서 연결됩니다')
}
export async function confirmSignUp() {
  throw new Error('이메일 인증은 로컬(Keycloak)에서는 사용하지 않습니다')
}
export async function resendConfirmationCode() {
  throw new Error('이메일 인증은 로컬(Keycloak)에서는 사용하지 않습니다')
}
