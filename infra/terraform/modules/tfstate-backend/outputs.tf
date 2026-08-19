output "s3_bucket_name" {
  description = "State 저장 S3 버킷 이름"
  value       = aws_s3_bucket.tfstate.id
}

output "dynamodb_table_name" {
  description = "State Lock용 DynamoDB 테이블 이름"
  value       = aws_dynamodb_table.tfstate_lock.name
}
