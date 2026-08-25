variable "project_name" {
  description = "프로젝트 이름 (리소스 네이밍에 사용)"
  type        = string
}

variable "private_subnet_ids" {
  description = "ElastiCache를 배치할 프라이빗 서브넷 ID 목록"
  type        = list(string)
}

variable "redis_security_group_id" {
  description = "Redis에 적용할 보안그룹 ID (백엔드만 접근 허용)"
  type        = string
}
