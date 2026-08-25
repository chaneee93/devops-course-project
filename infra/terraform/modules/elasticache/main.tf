# ==============================================
# ElastiCache (Redis) 모듈
# AWS 관리형 Redis — 로컬 Docker Redis의 클라우드 버전
# 용도: 분산 락(M4-2) + 잔여석 캐시
# ==============================================

# ── 서브넷 그룹 ─────────────────────────────────
# ElastiCache를 어떤 서브넷에 둘지 지정. private에 넣어 외부 직접 접근 차단.
resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.project_name}-redis-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-redis-subnet"
  }
}

# ── 파라미터 그룹 ────────────────────────────────
# Redis 설정을 코드로 관리. 분산 락 키가 함부로 삭제되지 않도록 eviction 정책 지정.
resource "aws_elasticache_parameter_group" "this" {
  name   = "${var.project_name}-redis-params"
  family = "redis7"

  # noeviction — 메모리가 차도 키를 임의로 지우지 않음 (분산 락 키 보호)
  parameter {
    name  = "maxmemory-policy"
    value = "noeviction"
  }

  tags = {
    Name = "${var.project_name}-redis-params"
  }
}

# ── ElastiCache 클러스터 (단일 노드 Redis) ──────────
resource "aws_elasticache_cluster" "this" {
  cluster_id     = "${var.project_name}-redis"
  engine         = "redis"
  engine_version = "7.1"

  # cache.t3.micro = 프리티어 대상 소형 노드
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1 # 단일 노드 (로컬 Docker Redis와 동일 구성)
  port            = 6379

  # 네트워크 설정
  subnet_group_name  = aws_elasticache_subnet_group.this.name
  security_group_ids = [var.redis_security_group_id]

  # 파라미터 그룹 연결
  parameter_group_name = aws_elasticache_parameter_group.this.name

  tags = {
    Name = "${var.project_name}-redis"
  }
}
