# AWS 비용 최적화 가이드

> 이 프로젝트에서 비용 폭탄을 방지하기 위한 팁

## 주요 비용 발생 리소스

| 서비스 | 예상 비용 | 주의사항 |
|--------|----------|---------|
| EKS 컨트롤 플레인 | $0.10/시간 (~$73/월) | 실습 끝나면 반드시 삭제 |
| NAT Gateway | $0.045/시간 (~$33/월) | Private 서브넷 외부통신용, 불필요시 제거 |
| RDS (db.t3.micro) | ~$15/월 | Free Tier 해당 (12개월) |
| ElastiCache (cache.t3.micro) | ~$13/월 | Free Tier 해당 |
| ALB | ~$16/월 + 트래픽 | 실습 끝나면 삭제 |

## 비용 절약 전략

1. **로컬 퍼스트** — 이 프로젝트의 핵심! AWS 없이 로컬로 먼저 개발
2. **작업 후 리소스 정리** — `terraform destroy`로 한 번에 삭제
3. **Free Tier 활용** — RDS, ElastiCache는 12개월 무료
4. **Budget 알림 설정** — 80% 도달 시 이메일 알림
5. **spot 인스턴스** — EKS 노드그룹에 spot 사용 시 최대 90% 절약

## 리소스 정리 명령어

```bash
# 전체 인프라 삭제 (AWS 사용 시)
cd infra/terraform/envs/dev
terraform destroy

# 특정 리소스만 삭제
terraform destroy -target=module.eks
```

## 현재 비용 = $0

로컬 환경(Docker, minikube)으로 개발 중이므로 AWS 비용 없음!
