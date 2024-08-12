import os
import logging
from app.config import configure_firebase, configure_genai

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


firebase_key_path = os.getenv('FIREBASE_KEY_PATH')
genai_api_key = os.getenv('GENAI_API_KEY')

db = configure_firebase(firebase_key_path)
configure_genai(genai_api_key)