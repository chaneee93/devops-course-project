# Terraform 모범사례 체크리스트

> 이 프로젝트에서 Terraform 코드 작성 시 지키는 규칙

## 네이밍 규칙
- [ ] 리소스명: `snake_case` (예: `aws_security_group.backend_sg`)
- [ ] 변수명: `snake_case` (예: `var.project_name`)
- [ ] 파일명: 역할별 분리 (`main.tf`, `variables.tf`, `outputs.tf`)
- [ ] 모듈 폴더명: 서비스 단위 (`vpc/`, `rds/`, `eks/`)

## 코드 품질
- [ ] `terraform fmt` — 코드 포맷 자동 정렬 (저장 전 실행)
- [ ] `terraform validate` — 문법 오류 검사
- [ ] `terraform plan` — 적용 전 변경사항 미리보기
- [ ] 하드코딩 금지 — 값은 `variables.tf`로 빼기

## 모듈 구조
- [ ] 모듈마다 `main.tf` + `variables.tf` + `outputs.tf` 3종 세트
- [ ] 모듈 간 의존성은 `outputs`로 전달 (직접 참조 X)
- [ ] 환경 분리: `envs/dev/`, `envs/prod/`에서 모듈 호출

## 보안
- [ ] `*.tfstate`는 `.gitignore`에 반드시 포함
- [ ] `*.tfvars`(실제 값)는 Git에 올리지 않음
- [ ] sensitive 변수는 `sensitive = true` 표시
- [ ] IAM 정책은 최소 권한 원칙 적용

## 태그 정책
- [ ] 모든 리소스에 공통 태그 부여:
  - `Project` = 프로젝트 이름
  - `Environment` = dev / prod
  - `ManagedBy` = terraform

## Git 안전 수칙
- [ ] `.terraform/` 디렉토리 커밋 금지
- [ ] `terraform.tfstate` 커밋 금지
- [ ] Access Key, Secret Key 코드에 절대 포함 금지
- [ ] `*.tfvars.example`만 커밋 (실제 값 제거 후)
