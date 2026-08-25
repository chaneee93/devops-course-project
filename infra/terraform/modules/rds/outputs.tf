output "endpoint" {
  description = "RDS 접속 주소 (host:port)"
  value       = aws_db_instance.this.endpoint
}

output "db_name" {
  description = "데이터베이스 이름"
  value       = aws_db_instance.this.db_name
}

output "port" {
  description = "RDS 포트"
  value       = aws_db_instance.this.port
}
