variable "vpc_cidr" {
  description = "VPC CIDR 블록"
  type        = string
  default     = "10.0.0.0/16"
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}
