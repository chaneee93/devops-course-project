variable "project_name" {
  description = "프로젝트 이름 (리소스 네이밍에 사용)"
  type        = string
}

variable "private_subnet_ids" {
  description = "RDS를 배치할 프라이빗 서브넷 ID 목록"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS에 적용할 보안그룹 ID (백엔드만 접근 허용)"
  type        = string
}

variable "db_name" {
  description = "데이터베이스 이름"
  type        = string
  default     = "course_db"
}

variable "db_username" {
  description = "DB 관리자 계정"
  type        = string
  default     = "course_user"
}

variable "db_password" {
  description = "DB 비밀번호 (실제 배포 시 tfvars로 주입)"
  type        = string
  sensitive   = true
}
