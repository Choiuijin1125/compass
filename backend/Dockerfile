# 베이스 이미지
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 파일 복사
COPY ./backend /app

# 종속성 설치
RUN pip install --no-cache-dir -r requirements.txt