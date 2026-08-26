output "cluster_name" {
  description = "EKS 클러스터 이름"
  value       = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  description = "EKS API 서버 접속 주소"
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_security_group_id" {
  description = "EKS가 자동 생성한 클러스터 보안그룹 ID (노드그룹 연결에 사용)"
  value       = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
}
