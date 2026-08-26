output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.this.id
}

output "client_id" {
  description = "앱 클라이언트 ID"
  value       = aws_cognito_user_pool_client.this.id
}

# 백엔드 JWT 검증용 — Keycloak의 issuer/JWKS와 같은 역할
output "issuer_uri" {
  description = "JWT 발급자 URI (application.yml의 issuer-uri에 사용)"
  value       = "https://${aws_cognito_user_pool.this.endpoint}"
}

output "jwks_uri" {
  description = "JWT 공개키 URI (application.yml의 jwk-set-uri에 사용)"
  value       = "https://${aws_cognito_user_pool.this.endpoint}/.well-known/jwks.json"
}
