# ==============================================
# Cognito 모듈 — AWS 관리형 인증 (로컬 Keycloak의 클라우드 버전)
# JWT 구조가 Keycloak과 동일해 백엔드 코드 변경 없이 전환 가능
# ==============================================

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-user-pool"

  # 이메일로 로그인 + 이메일 자동 인증
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_uppercase = false
    require_symbols   = false
  }

  tags = {
    Name = "${var.project_name}-user-pool"
  }
}

# 앱 클라이언트 (프론트엔드 = public, 시크릿 없음)
resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.project_name}-frontend"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  callback_urls = ["http://localhost:5173"]
  logout_urls   = ["http://localhost:5173"]
}
