# M9-4 장애 복구(Resilience) 시나리오 검증

로컬 minikube + docker-compose(MySQL/Redis/Keycloak) 환경에서 의도적으로 장애를 주입하고
서비스가 자동 복구되는지 실측. NodePort(kube-proxy 로드밸런싱)로 무중단 여부 측정.

## 1) Pod 강제 kill → 자동 재시작 + 서비스 연속성
- 방법: 부하 루프(0.3s 간격) 도는 중 `kubectl delete pod --force`로 backend pod 1개 제거
- 결과: **성공 50 / 실패 0** — 남은 pod가 계속 응답(무중단), Deployment가 새 pod 자동 생성(self-healing)

## 2) DB 재시작 → 커넥션 풀 복구
- 방법: `docker restart course-mysql` 후 `/api/courses` 연속 호출
- 결과: **약 2초 blip(1회 실패) 후 즉시 200 복귀** — 백엔드 재시작 없이 HikariCP가 커넥션 재수립

## 3) Redis 재시작 → 분산 락 복구
- 방법: `docker restart course-redis` 후 서로 다른 학생으로 수강신청(Redisson 락 경유) 연속 시도
- 결과: **재시작 전후 모두 신청 성공(200)** — Redisson이 끊긴 연결을 자동 재연결, 분산 락 정상 복구

## 4) 노드 drain → Pod 재배치 (단일노드 한계 + 메커니즘 시연)
- 환경: minikube 단일 노드. 진짜 "다른 노드로 재배치"는 멀티노드에서만 성립.
- 방법: `cordon`(스케줄 차단) → pod 삭제 → 대체 pod `Pending`(갈 곳 없음) → `uncordon` → 즉시 `Running`
- 결과: cordon 동안 남은 pod가 계속 200(무중단, PDB minAvailable=1), uncordon 시 대체 pod 재배치 완료
- **실전 다중노드 재배치는 Terraform으로 프로비저닝하는 EKS(멀티노드)에서 검증되는 경로**임을 명시

## 결론
- 애플리케이션(pod), 데이터 계층(DB/Redis) 모두 **자동 복구** 확인
- DB 비관적 락 + Redis 분산 락은 백엔드 무재시작 상태로 **연결 자가복구**
- 가용성 보장: 다중 replica + PDB + NodePort 로드밸런싱으로 단일 장애 시 무중단
