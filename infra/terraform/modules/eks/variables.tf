variable "project_name" {
  description = "프로젝트 이름 (리소스 네이밍에 사용)"
  type        = string
}

variable "cluster_role_arn" {
  description = "EKS 클러스터가 사용할 IAM 역할 ARN (iam 모듈의 eks_cluster_role_arn)"
  type        = string
}

variable "public_subnet_ids" {
  description = "퍼블릭 서브넷 ID 목록"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "프라이빗 서브넷 ID 목록"
  type        = list(string)
}

variable "kubernetes_version" {
  description = "EKS 쿠버네티스 버전"
  type        = string
  default     = "1.32"
}

variable "node_role_arn" {
  description = "워커 노드가 사용할 IAM 역할 ARN (iam 모듈의 eks_node_role_arn)"
  type        = string
}

variable "node_instance_type" {
  description = "워커 노드 인스턴스 타입"
  type        = string
  default     = "t3.medium"
}

variable "node_min_size" {
  description = "노드 최소 개수"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "노드 최대 개수"
  type        = number
  default     = 4
}

variable "node_desired_size" {
  description = "노드 기본(희망) 개수"
  type        = number
  default     = 2
}
