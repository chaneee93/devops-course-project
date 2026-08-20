/**
 * Cognito 인증 유틸리티.
 * 회원가입, 로그인, 인증코드 확인, 토큰 저장/조회를 처리한다.
 */
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'

const POOL_DATA = {
  UserPoolId: 'ap-northeast-3_81iUULHdX',
  ClientId: 'bbfrmvvt5q6rq95f6mgg0a9oh',
}

const userPool = new CognitoUserPool(POOL_DATA)

/**
 * 회원가입.
 * 성공하면 Cognito가 이메일로 인증 코드를 보낸다.
 */
export function signUp({ email, password, name, studentNo }) {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
      new CognitoUserAttribute({ Name: 'custom:studentNo', Value: studentNo }),
    ]

    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/**
 * 인증 코드 확인.
 * 가입 시 이메일로 받은 6자리 코드를 검증한다.
 */
export function confirmSignUp({ email, code }) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/**
 * 인증 코드 재전송.
 */
export function resendConfirmationCode({ email }) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    user.resendConfirmationCode((err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/**
 * 로그인.
 * 성공하면 JWT 토큰(idToken, accessToken, refreshToken)이 localStorage에 자동 저장된다.
 */
export function signIn({ email, password }) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    })

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        })
      },
      onFailure: (err) => reject(err),
    })
  })
}

/**
 * 현재 로그인된 사용자의 JWT 토큰을 가져온다.
 * 만료됐으면 refreshToken으로 자동 갱신한다.
 * 로그인 안 돼있으면 null 반환.
 */
export function getToken() {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser()
    if (!user) return resolve(null)

    user.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null)
      resolve(session.getIdToken().getJwtToken())
    })
  })
}

/**
 * 로그아웃.
 * localStorage에서 토큰 제거.
 */
export function signOut() {
  const user = userPool.getCurrentUser()
  if (user) user.signOut()
}

/**
 * 현재 로그인 상태인지 확인.
 */
export function isAuthenticated() {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser()
    if (!user) return resolve(false)

    user.getSession((err, session) => {
      resolve(!err && session?.isValid())
    })
  })
}
