output "endpoint" {
  description = "Redis 접속 주소 (호스트)"
  value       = aws_elasticache_cluster.this.cache_nodes[0].address
}

output "port" {
  description = "Redis 포트"
  value       = aws_elasticache_cluster.this.cache_nodes[0].port
}
