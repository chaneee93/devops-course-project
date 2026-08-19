output "eks_cluster_role_arn" {
  description = "EKS 클러스터 Role ARN"
  value       = aws_iam_role.eks_cluster.arn
}

output "eks_node_role_arn" {
  description = "EKS 노드그룹 Role ARN"
  value       = aws_iam_role.eks_node.arn
}

output "github_actions_role_arn" {
  description = "GitHub Actions OIDC Role ARN"
  value       = aws_iam_role.github_actions.arn
}
