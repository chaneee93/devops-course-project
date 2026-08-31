# Kubernetes 매니페스트 (course-backend)

## 구조 (Kustomize)
- base/               공통 정의
  - deployment.yaml   백엔드 배포 (probe 3종, resources)
  - service.yaml      ClusterIP 서비스 (port: http)
  - configmap.yaml    비민감 설정 (DB_HOST, REDIS_HOST, ISSUER_URI 등)
  - secret.example.yaml  Secret 템플릿 (실제 값은 kubectl로 생성, git 커밋 X)
  - pdb.yaml          PodDisruptionBudget (최소 1개 보장)
  - hpa.yaml          HPA (CPU 50%, min2/max10)
  - servicemonitor.yaml  Prometheus 메트릭 수집 연동
  - ingress.yaml      Ingress + TLS (nginx)
- overlays/local/     minikube: NodePort, nginx ingress
- overlays/aws/       EKS: LoadBalancer, ALB ingress, replicas 2
- gen-tls-secret.sh   자체서명 TLS 인증서 + Secret 생성 스크립트

## 배포 (로컬)

## Ingress + TLS
### 로컬 (nginx + 자체서명)
- gen-tls-secret.sh가 course.local 자체서명 인증서를 course-backend-tls Secret으로 등록
- ingress.yaml의 tls: 섹션이 이 Secret 참조 → Ingress에서 TLS 종료 처리
- 접속: https://course.local → course-backend:8080

### ⚠️ 테스트 시 SNI 주의
- curl -H "Host: course.local" https://<IP> 로 하면 HTTP Host는 맞아도 TLS SNI가 IP로 가서
  nginx가 기본 fake 인증서를 반환함 (설정 오류 아님!)
- 올바른 테스트:
  curl -vsk --resolve course.local:443:$(minikube ip) https://course.local/api/courses
  → subject/issuer: CN=course.local (자체서명이라 subject=issuer)

### AWS 전환 (overlays/aws)
- ingress-patch.yaml이 ingressClassName을 nginx → alb로 교체
- TLS는 ACM 인증서: alb.ingress.kubernetes.io/certificate-arn 주석에 ARN 지정
- ALB가 TLS 종료 처리 (정식 HTTPS, 경고 없음)

## 운영 안정성 (M8)
- Probe 3종: startup(구동 보호) / liveness(죽으면 재시작) / readiness(준비 전 트래픽 차단)
- PDB: 롤링 업데이트·노드 정비 시 최소 가용 Pod 보장
- HPA: CPU 50% 기준 자동 스케일 (min2/max10)
- 모니터링: kube-prometheus-stack + ServiceMonitor로 Spring Actuator 메트릭 → Grafana
