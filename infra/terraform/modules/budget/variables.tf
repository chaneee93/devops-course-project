variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "monthly_limit" {
  description = "월 예산 (USD)"
  type        = string
  default     = "10"
}

variable "alert_email" {
  description = "예산 알림 받을 이메일"
  type        = string
}
