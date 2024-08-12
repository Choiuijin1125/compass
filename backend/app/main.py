import json
import logging
import os
import signal
import time

import firebase_admin
import redis
from app.config import configure_firebase
from app import db

# Redis 클라이언트 초기화
redis_client = redis.StrictRedis(host=os.getenv('REDIS_HOST', 'redis'),
                                 port=int(os.getenv('REDIS_PORT', 6379)),
                                 db=int(os.getenv('REDIS_DB', 0)))


def on_snapshot(doc_snapshot, changes, read_time, stream_name):
    for change in changes:
        if change.type.name == 'ADDED':
            doc_data = change.document.to_dict()
            doc_data['id'] = change.document.id
            doc_data['path'] = change.document.reference.path  # 문서 경로 추가
            doc_data_json = json.dumps(doc_data, default=str)
            try:

                redis_client.xadd(stream_name,
                                    {"message": doc_data_json})
                logging.info(
                    f'Added new document to {stream_name}: {doc_data_json}'
                )
            except redis.RedisError as e:
                logging.error(f'Redis error: {e}')
                pass


def setup_message_listeners():
    messages_ref = db.collection_group('messages')
    messages_ref.on_snapshot(
        lambda doc_snapshot, changes, read_time, stream_name='gemini':
        on_snapshot(doc_snapshot, changes, read_time, stream_name))

    core_memory_ref = db.collection_group('core_memory_files')
    core_memory_ref.on_snapshot(
        lambda doc_snapshot, changes, read_time, stream_name='vector':
        on_snapshot(doc_snapshot, changes, read_time, stream_name))

    recall_memory_ref = db.collection_group('recall_memory_files')
    recall_memory_ref.on_snapshot(
        lambda doc_snapshot, changes, read_time, stream_name='vector':
        on_snapshot(doc_snapshot, changes, read_time, stream_name))


def main():
    setup_message_listeners()

    # 스크립트 종료를 위한 신호 처리기 설정
    def shutdown_handler(signum, frame):
        logging.info("Shutting down...")
        firebase_admin.delete_app(firebase_admin.get_app())
        redis_client.close()
        exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    # Keep the script running
    while True:
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            shutdown_handler(None, None)


if __name__ == "__main__":
    logging.info(f'Redis started')
    main()