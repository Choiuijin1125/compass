import io
import uuid
from typing import Any
import docx
import google.generativeai as genai
import PIL.Image
import requests
from google.cloud.firestore_v1.vector import Vector
from pydantic import BaseModel
from PyPDF2 import PdfReader
from app.schema import State
import logging
import yaml
import tempfile


SAFETY = [{"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
          {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
          {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
          {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"}]

# Utility Functions
def download_file(file_url):
    response = requests.get(file_url)
    response.raise_for_status()
    return io.BytesIO(response.content), response.content


def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    text = ""
    for page_num in range(len(reader.pages)):
        text += reader.pages[page_num].extract_text()
    return text


def get_image_caption(image):
    prompt = """Generate a detailed description of this image for recall memory purposes. Include details about the main objects, background elements, colors, and any noticeable activities or interactions."""
    caption_model = genai.GenerativeModel("gemini-1.5-flash")
    caption = caption_model.generate_content([prompt, image],
                                             stream=True)
    caption.resolve()
    return caption.text

def transcribe_audio(byte_content, file_type):

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:

        temp_file.write(byte_content)
        temp_file_path = temp_file.name

    audio_file = genai.upload_file(temp_file_path, mime_type=file_type)

    prompt = """Generate a transcript of the speech."""
    stt_model = genai.GenerativeModel("gemini-1.5-flash")
    script = stt_model.generate_content([prompt, audio_file], safety_settings=SAFETY)

    for file in genai.list_files():
        print(file)
        genai.delete_file(file)
        
    return script.text


def generate_vector(chunks):
    vectors = []
    chunk_list = split_string_chunks(chunks)
    for chunk in chunk_list:
        vector = genai.embed_content(
            model="models/embedding-001",
            content=chunk,
            task_type="retrieval_document",
            title="Embedding of list of strings",
        )
        vectors.append([chunk, vector])
    return vectors


def split_string_chunks(chunks, chunks_length=10000):
    return [chunks[i:i + chunks_length] for i in range(0, len(chunks), chunks_length)]


# Firestore Models
class VectorUploadSchema(BaseModel):
    vector: Any
    content: str
    user_id: str
    file_id: str

def firestore_to_id(doc_data):
    path = doc_data["path"]
    path_parts = path.split('/')
    user_id = path_parts[1]
    file_id = doc_data["id"]
    memory_collection = path_parts[2]
    state = doc_data["state"]
    return user_id, file_id, memory_collection, state

# File Processing
def process_file(db, doc_data):
    user_id, file_id, memory_collection, state = firestore_to_id(doc_data)
    if state != State.COMPLETED.value:
        file_url = doc_data['downloadURL']
        file_type = doc_data['mimeType']
        file_name = doc_data['basename']
        file_content, byte_content = download_file(file_url)

        if file_type == "application/pdf":
            content = extract_text_from_pdf(file_content)
        elif file_type == "image/jpeg":
            image = PIL.Image.open(file_content)
            content = get_image_caption(image)
        elif file_type == "text/plain":
            content = file_content.read().decode('utf-8')
        elif file_type == "application/msword" or file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            content = extract_text_from_docx(file_content)            
        elif file_type == "audio/mpeg" or file_type == "audio/wav":
            content = transcribe_audio(byte_content, file_type)            
        elif file_type == "application/x-yaml" or file_type == "text/yaml":
            content = yaml.safe_load(file_content)
            content = str(content)  # 변환된 YAML 내용을 문자열로 변환                
        else:
            print("not supported type")

        vectors = generate_vector(content)
        upload_vector(vectors, user_id, file_id, file_name, file_type, memory_collection, db)
        update_state(user_id, file_id, memory_collection, db)

def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file)
    text = '\n'.join([para.text for para in doc.paragraphs])
    return text


# Vector Uploading
def upload_vector(vectors: list, user_id: str, file_id: str, file_name: str, file_type: str, memory_collection, db):
    logging.info("Upload vector process started")
    for vector in vectors:
        obj = VectorUploadSchema(vector=vector[1],
                                 content=vector[0],
                                 user_id=user_id,
                                 file_id=file_id)
        doc_uuid = str(uuid.uuid4())

        user_doc_ref = db.collection("users").document(user_id)
        vector_collection_ref = user_doc_ref.collection("vector")
        vector_result = obj.model_dump()
        vector_result["file_name"] = file_name
        vector_result["file_type"] = file_type
        vector_result["memory_collection"] = memory_collection
        vector_result["embedding_field"] = Vector(vector_result["vector"]["embedding"])
        vector_result.pop("vector")
        vector_collection_ref.document(doc_uuid).set(vector_result)
    logging.info("upload vector process finished")

def update_state(user_id: str, file_id: str, memory_collection, db=None):
    user_doc_ref = db.collection("users").document(user_id)
    files_collection_ref = user_doc_ref.collection(memory_collection)
    data = {"state": State.COMPLETED.value}
    files_collection_ref.document(file_id).update(data)
    logging.info("File state update succeeded")
