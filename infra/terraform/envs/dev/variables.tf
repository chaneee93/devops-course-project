variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"  # 서울
}

variable "project_name" {
  description = "프로젝트 이름 (리소스 태그용)"
  type        = string
  default     = "course-registration"
}

variable "environment" {
  description = "환경 (dev/staging/prod)"
  type        = string
  default     = "dev"
}
