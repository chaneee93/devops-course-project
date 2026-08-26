#!/usr/bin/env bash
# Keycloak 로컬 개발용 setup (M6-1)
# dev 모드는 재시작 시 데이터가 날아가므로, 이 스크립트로 realm/client/user를 재생성한다.
# ⚠️ 여기 자격증명(admin/admin, test1234)은 로컬 개발 전용 더미값. 운영/AWS에선 사용 안 함.
set -e
KCADM="docker exec course-keycloak /opt/keycloak/bin/kcadm.sh"

echo "▶ 관리자 인증"
$KCADM config credentials --server http://localhost:8080 --realm master --user admin --password admin

echo "▶ course realm 재생성"
$KCADM delete realms/course 2>/dev/null || true
$KCADM create realms -s realm=course -s enabled=true

echo "▶ client(course-frontend) 생성"
$KCADM create clients -r course \
  -s clientId=course-frontend \
  -s publicClient=true \
  -s standardFlowEnabled=true \
  -s directAccessGrantsEnabled=true \
  -s 'redirectUris=["http://localhost:5173/*"]' \
  -s 'webOrigins=["http://localhost:5173"]'

echo "▶ Verify Profile 필수액션 비활성화 (테스트 편의)"
$KCADM update authentication/required-actions/VERIFY_PROFILE -r course -s enabled=false

echo "▶ 테스트 사용자 생성 (이름 채워서 프로필 완성)"
$KCADM create users -r course \
  -s username=testuser -s email=test@example.com \
  -s emailVerified=true -s enabled=true \
  -s firstName=Test -s lastName=User
$KCADM set-password -r course --username testuser --new-password test1234

echo "✅ 완료 — 로그인: testuser / test1234"
