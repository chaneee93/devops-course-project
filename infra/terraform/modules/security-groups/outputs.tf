output "alb_sg_id" {
  description = "ALB 보안그룹 ID"
  value       = aws_security_group.alb.id
}

output "backend_sg_id" {
  description = "Backend 보안그룹 ID"
  value       = aws_security_group.backend.id
}

output "rds_sg_id" {
  description = "RDS 보안그룹 ID"
  value       = aws_security_group.rds.id
}

output "redis_sg_id" {
  description = "Redis 보안그룹 ID"
  value       = aws_security_group.redis.id
}
