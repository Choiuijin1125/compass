from datetime import datetime

import firebase_admin
import google.generativeai as genai
from firebase_admin import credentials, firestore


def configure_firebase(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    return firestore.client()


def configure_genai(api_key):
    genai.configure(api_key=api_key)


def get_today_date_time():
    return datetime.now().strftime('%B %d, %Y %H:%M')
