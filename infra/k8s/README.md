# 쿠버네티스(K8s) 구성 — M5

## 로컬 전략
- 로컬: **minikube** (싱글 노드)
- AWS: **EKS** (Terraform 코드만, 배포는 안 함)

## 로컬 클러스터 세팅 (재현용)
```bash
# 1. 클러스터 시작
minikube start --driver=docker --cpus=2 --memory=2800

# 2. metrics-server (kubectl top + HPA 전제조건)
minikube addons enable metrics-server

# 3. 확인
kubectl get nodes            # Ready
kubectl get pods -A          # 시스템 Pod Running
kubectl top nodes            # 리소스 사용량
```

## AWS(EKS) 코드 위치
- `infra/terraform/modules/eks/` — 클러스터 + 노드그룹(t3.medium, 오토스케일 2~4)
- `infra/k8s/cluster-autoscaler/` — 노드 오토스케일러 Helm values + IRSA 문서

## 마일스톤별
- M5-1: EKS 클러스터 모듈 + minikube 클러스터 생성
- M5-2: EKS 노드그룹 코드
- M5-3: metrics-server 설치
- M5-4: Cluster Autoscaler 매니페스트 (개념 + IRSA)
- M5-5: 클러스터 완성 검증
