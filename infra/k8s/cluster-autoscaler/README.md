# Cluster Autoscaler (M5-4)

## 개념
- **HPA**: Pod(앱 컨테이너) 개수를 자동 조절
- **Cluster Autoscaler(CA)**: 노드(EC2 서버) 개수를 자동 조절
- 둘은 짝으로 동작 — HPA가 Pod을 늘렸는데 자리가 없으면 CA가 노드를 늘림

## 로컬 전략
minikube는 싱글 노드라 CA 불필요. 본 디렉터리는 **AWS EKS 배포용 매니페스트만** 보관.

## IRSA (IAM Roles for Service Accounts)
CA가 AWS Auto Scaling API를 호출해 노드를 늘리려면 AWS 권한이 필요하다.
액세스키를 Pod에 심는 대신, K8s 서비스어카운트에 IAM 역할을 연결(IRSA)해
키 없이 최소 권한만 안전하게 부여한다.

전제조건:
1. EKS 클러스터에 OIDC provider 연결
2. CA용 IAM 역할 + 정책(autoscaling:*, ec2:Describe* 등) 생성 (Terraform)
3. 그 역할 ARN을 values.yaml의 serviceAccount annotation에 기입

## 설치 (EKS 환경에서)
```bash
helm repo add autoscaler https://kubernetes.github.io/autoscaler
helm repo update
helm install cluster-autoscaler autoscaler/cluster-autoscaler \
  -n kube-system -f values.yaml
```
