#!/usr/bin/env bash
# course.local 자체 서명 TLS 인증서 생성 + K8s Secret 등록
# ⚠️ 인증서/키는 /tmp에만 두고 git에 커밋하지 않음 (Secret은 클러스터에만)
set -e
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /tmp/course.local.key -out /tmp/course.local.crt \
  -subj "/CN=course.local/O=course" \
  -addext "subjectAltName=DNS:course.local"

kubectl create secret tls course-backend-tls \
  --cert=/tmp/course.local.crt --key=/tmp/course.local.key \
  --dry-run=client -o yaml | kubectl apply -f -
echo "✅ TLS Secret(course-backend-tls) 생성 완료"
