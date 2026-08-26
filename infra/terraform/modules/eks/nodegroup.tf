# ── EKS Managed 노드그룹 (워커 노드) ──────────────
# 실제 컨테이너가 도는 서버들. AWS가 노드 관리(교체·패치)를 대신해줌.
resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.project_name}-nodegroup"
  node_role_arn   = var.node_role_arn      # 노드가 쓸 IAM 역할 (iam 모듈)
  subnet_ids      = var.private_subnet_ids # 워커는 프라이빗 서브넷에 배치 (보안)

  instance_types = [var.node_instance_type]

  # 오토스케일링 — 부하에 따라 노드 수를 2~4대로 자동 조절
  scaling_config {
    desired_size = var.node_desired_size
    min_size     = var.node_min_size
    max_size     = var.node_max_size
  }

  # 노드 업데이트 시 한 번에 1대씩만 교체 (서비스 중단 최소화)
  update_config {
    max_unavailable = 1
  }

  tags = {
    Name = "${var.project_name}-nodegroup"
  }
}
