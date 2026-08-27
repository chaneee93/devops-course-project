/**
 * Keycloak 인증 유틸리티 (로컬).
 * - 로그인/토큰: 인앱 처리 (password grant)
 * - 회원가입: Keycloak 자체 페이지로 리다이렉트 (IdP가 처리, 백엔드 부하 0)
 * AWS 전환 시: URL/clientId만 Cognito 값으로.
 */

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180'
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'course'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'course-frontend'

const TOKEN_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`
const STORAGE_KEY = 'course_auth'

function saveTokens(data) {
  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
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

/** 로그인 — Keycloak password grant. */
export async function signIn({ email, password }) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    username: email,
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

export async function getToken() {
  let tokens = loadTokens()
  if (!tokens) return null
  if (Date.now() < tokens.expiresAt) return tokens.accessToken
  tokens = await refresh(tokens.refreshToken)
  if (!tokens) { clearTokens(); return null }
  return tokens.accessToken
}

export function signOut() {
  clearTokens()
}

export async function isAuthenticated() {
  return (await getToken()) !== null
}

/**
 * 회원가입 — Keycloak 자체 등록 페이지로 이동.
 * 등록 완료 후 /login으로 돌아와 로그인.
 */
export function goToRegister() {
  const redirectUri = `${window.location.origin}/login`
  const url =
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/registrations` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  window.location.href = url
}
