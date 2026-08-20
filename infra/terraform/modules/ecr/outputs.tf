output "frontend_repository_url" {
  description = "프론트엔드 ECR 레포지토리 URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_repository_url" {
  description = "백엔드 ECR 레포지토리 URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_repository_arn" {
  description = "프론트엔드 ECR 레포지토리 ARN"
  value       = aws_ecr_repository.frontend.arn
}

output "backend_repository_arn" {
  description = "백엔드 ECR 레포지토리 ARN"
  value       = aws_ecr_repository.backend.arn
}
