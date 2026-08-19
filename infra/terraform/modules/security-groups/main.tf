# ============================================
# 보안그룹 — 서비스별 방화벽 규칙
# ============================================

# ── ALB 보안그룹 (로드밸런서) ──
# 외부에서 HTTP/HTTPS 트래픽을 받는 문지기
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "ALB - HTTP/HTTPS 허용"
  vpc_id      = var.vpc_id

  # 인바운드: 80(HTTP), 443(HTTPS) 전체 허용
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # 누구나 접근 가능
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 아웃바운드: 전체 허용 (응답을 돌려줘야 하니까)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# ── Backend 보안그룹 (Spring Boot) ──
# ALB에서 오는 요청만 받음
resource "aws_security_group" "backend" {
  name        = "${var.project_name}-backend-sg"
  description = "Backend - ALB에서만 접근 허용"
  vpc_id      = var.vpc_id

  # 인바운드: 8080 포트를 ALB에서만 허용
  ingress {
    description     = "From ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]  # ALB 보안그룹만!
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-backend-sg"
  }
}

# ── RDS 보안그룹 (MySQL) ──
# Backend에서 오는 DB 접속만 허용
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS - Backend에서만 접근 허용"
  vpc_id      = var.vpc_id

  ingress {
    description     = "MySQL from Backend"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]  # Backend만!
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# ── Redis 보안그룹 (ElastiCache) ──
# Backend에서 오는 캐시/락 접속만 허용
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "Redis - Backend에서만 접근 허용"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from Backend"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]  # Backend만!
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-redis-sg"
  }
}
