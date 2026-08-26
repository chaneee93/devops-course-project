# ==============================================
# EKS (Elastic Kubernetes Service) 모듈 — 클러스터(컨트롤 플레인)
# AWS 관리형 쿠버네티스. 로컬 minikube의 클라우드 버전.
# 워커 노드(노드그룹)는 M5-2에서 추가.
# ==============================================

resource "aws_eks_cluster" "this" {
  name     = "${var.project_name}-eks"
  role_arn = var.cluster_role_arn # 클러스터가 AWS 리소스를 다룰 권한 (iam 모듈에서 주입)
  version  = var.kubernetes_version

  vpc_config {
    # 컨트롤 플레인이 접근할 서브넷 (퍼블릭+프라이빗 모두 지정)
    subnet_ids = concat(var.public_subnet_ids, var.private_subnet_ids)

    # API 접근 방식
    endpoint_public_access  = true # kubectl을 외부에서 쓰기 위해 (학습용)
    endpoint_private_access = true # VPC 내부에서도 접근 가능
  }

  tags = {
    Name = "${var.project_name}-eks"
  }
}
