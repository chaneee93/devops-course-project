variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "github_owner" {
  description = "GitHub 사용자명"
  type        = string
  default     = "chaneee93"
}

variable "github_repo" {
  description = "GitHub 레포 이름"
  type        = string
  default     = "devops-course-project"
}
