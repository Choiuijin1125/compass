from app.vector.utils import process_file
from app.worker_utils import initialize_redis, listen_for_messages
from app.config import configure_firebase, configure_genai
from app import db 

def process_message(doc_data):
    print(f'Processing message document: {doc_data}')    
    process_file(db, doc_data)

if __name__ == '__main__':
    redis_client = initialize_redis('vector', 'vector_group')
    listen_for_messages(redis_client, 'vector', 'vector_group', 'vector_worker', process_message)