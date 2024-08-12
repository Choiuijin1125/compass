import logging
from app.config import configure_genai, configure_firebase
from app.gemini.agent import generate_response
from app.worker_utils import initialize_redis, listen_for_messages
from app import db 

def process_message(doc_data):
    try:
        if not doc_data.get("response"):
            response = generate_response(doc_data, db)
            logging.info(f'Response: {response}')
    except Exception as e:
        logging.error(f'Error processing message: {e}', exc_info=True)

if __name__ == '__main__':
    redis_client = initialize_redis('gemini', 'gemini_group')
    listen_for_messages(redis_client, 'gemini', 'gemini_group', 'gemini_worker', process_message)