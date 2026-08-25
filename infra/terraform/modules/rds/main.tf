# ==============================================
# RDS (Relational Database Service) 모듈
# AWS 관리형 MySQL — 백업, 패치, 장애복구 자동화
# ==============================================

# ── 서브넷 그룹 ─────────────────────────────────
# RDS가 어떤 서브넷(네트워크 구역)에 배치될지 지정
# private 서브넷에 넣어야 외부에서 직접 접근 불가
resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet"
  }
}

# ── 파라미터 그룹 ────────────────────────────────
# MySQL 설정값을 코드로 관리 (my.cnf 대신 Terraform)
resource "aws_db_parameter_group" "this" {
  name   = "${var.project_name}-mysql-params"
  family = "mysql8.0"

  # 한글 깨짐 방지
  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  # 느린 쿼리 로깅 (성능 모니터링용)
  parameter {
    name  = "slow_query_log"
    value = "1"
  }

  parameter {
    name  = "long_query_time"
    value = "1"
  }

  tags = {
    Name = "${var.project_name}-mysql-params"
  }
}

# ── RDS 인스턴스 ─────────────────────────────────
resource "aws_db_instance" "this" {
  identifier     = "${var.project_name}-mysql"
  engine         = "mysql"
  engine_version = "8.0"

  # db.t3.micro = 프리티어 대상 (월 750시간 무료)
  instance_class = "db.t3.micro"

  # 스토리지 설정
  allocated_storage     = 20          # 20GB (프리티어 범위)
  max_allocated_storage = 50          # 오토스케일링 최대 50GB
  storage_type          = "gp3"       # 범용 SSD

  # 데이터베이스 설정
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # 네트워크 설정
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [var.rds_security_group_id]
  publicly_accessible    = false      # 외부 접근 차단 (보안!)

  # 파라미터 그룹 연결
  parameter_group_name = aws_db_parameter_group.this.name

  # 백업 설정
  backup_retention_period = 7         # 7일간 자동 백업 보관
  backup_window           = "03:00-04:00"  # 새벽 3시에 백업 (한국 낮12시)

  # 유지보수 설정
  maintenance_window = "Mon:04:00-Mon:05:00"

  # 삭제 방지
  deletion_protection = false         # 학습용이라 false (프로덕션은 true!)
  skip_final_snapshot = true          # 학습용이라 true (프로덕션은 false!)

  tags = {
    Name = "${var.project_name}-mysql"
  }
}
