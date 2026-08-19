# ============================================
# Terraform State Backend 설정
# ============================================

# ── 지금 (로컬) ──
# AWS 없이 로컬 파일로 state 관리
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

# ── AWS 전환 시 (아래 주석 해제, 위에 local 삭제) ──
# terraform {
#   backend "s3" {
#     bucket         = "course-registration-tfstate-dev"
#     key            = "dev/terraform.tfstate"
#     region         = "ap-northeast-2"
#     dynamodb_table = "course-registration-tfstate-lock"
#     encrypt        = true
#   }
# }
