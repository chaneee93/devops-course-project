# ============================================
# VPC — 네트워크 뼈대
# ============================================

# 가용영역(AZ) 자동 조회 — 서울이면 ap-northeast-2a, 2b, 2c 등
data "aws_availability_zones" "available" {
  state = "available"
}

# ── VPC (아파트 단지) ──
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true   # DNS 이름 부여
  enable_dns_support   = true   # DNS 조회 활성화

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# ── Public 서브넷 2개 (외부 접근 가능한 동) ──
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)  # 10.0.0.0/24, 10.0.1.0/24
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true  # 여기 뜨는 리소스는 공인IP 자동 부여

  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
    "kubernetes.io/role/elb" = 1  # EKS ALB가 이 서브넷을 찾을 수 있게
  }
}

# ── Private 서브넷 2개 (내부 전용 동) ──
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)  # 10.0.10.0/24, 10.0.11.0/24
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-${count.index + 1}"
    "kubernetes.io/role/internal-elb" = 1  # EKS 내부 LB용
  }
}

# ── Internet Gateway (정문) ──
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# ── Elastic IP (NAT Gateway에 붙일 고정 IP) ──
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip"
  }
}

# ── NAT Gateway (Private 동에서 외부로 나가는 후문) ──
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id  # Public 서브넷에 위치

  tags = {
    Name = "${var.project_name}-nat"
  }

  depends_on = [aws_internet_gateway.main]
}

# ── Public 라우팅 테이블 (정문으로 안내) ──
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"           # 모든 외부 트래픽을
    gateway_id = aws_internet_gateway.main.id  # 정문(IGW)으로 보냄
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# ── Private 라우팅 테이블 (후문으로 안내) ──
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"            # 모든 외부 트래픽을
    nat_gateway_id = aws_nat_gateway.main.id  # 후문(NAT)으로 보냄
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

# ── 서브넷 ↔ 라우팅 테이블 연결 ──
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
