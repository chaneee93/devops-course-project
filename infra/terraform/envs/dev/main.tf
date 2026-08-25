# ============================================
# 수강신청 시스템 — Dev 환경 인프라
# ============================================
# 모듈은 마일스톤 진행하면서 하나씩 추가
#
# module "vpc" {
#   source = "../../modules/vpc"
# }
#
# module "rds" {
#   source = "../../modules/rds"
# }
#
# module "elasticache" {
#   source                  = "../../modules/elasticache"
#   project_name            = var.project_name
#   private_subnet_ids      = module.vpc.private_subnet_ids
#   redis_security_group_id = module.security_groups.redis_sg_id
# }
