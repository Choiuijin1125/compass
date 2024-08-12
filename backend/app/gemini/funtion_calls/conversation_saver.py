import os
import io
import requests
from io import BytesIO
from docx import Document
from google.protobuf.json_format import MessageToJson
import json
import google.generativeai as genai
from firebase_admin import storage
from app.gemini.funtion_calls.schema import (
    summarized_text_schema
)


conversation_saver_instruction = """
Summarize and store dialogue content between the user and the assistant using the user's predefined template. 
"""

def get_instruction(template, history):
    summarize_dialogue_instruction = f"""
    Summarize dialogue content between the user and the assistant using the user's predefined template. 

    Example
    1. **Conversation Topic:** The user may provide the main topic or question discussed.
    2. **Key Points:** The user might specify the key points discussed during the conversation.
    3. **Examples:** The user might provide examples related to the key points.
    4. **Summary:** The user might provide a summary of the entire conversation.
    5. **Additional Notes:** The user might include any additional notes or insights.
    6. **Resources:** The user might include any resources or references mentioned during the conversation.

    predefined template:
    if there is no information in template, you can edit template
    <UserTemplate>
    {template}
    </UserTemplate>

    Conversation History: {history}
"""
    return summarize_dialogue_instruction

conversation_saver = genai.protos.FunctionDeclaration(
    name="conversation_saver",
    description=conversation_saver_instruction,
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            'save_file_name': genai.protos.Schema(type=genai.protos.Type.STRING,
                                                  description="generated save file_name")
        },
        required=['save_file_name']
    )
)

def read_text_from_bytesio(bytes_io: BytesIO):
    # BytesIO 객체를 텍스트로 변환
    bytes_io.seek(0)  # 처음부터 읽기 위해 포인터를 처음으로 이동
    return bytes_io.read().decode('utf-8')

def summarize_conversation(template, history):
    history = [json.loads(MessageToJson(x._pb)) for x in history]    
    template = read_text_from_bytesio(template)
    prompt = get_instruction(template, history)
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content([prompt], request_options={"timeout": 6000})
    return response.text

def get_save_template(template_url: str):
    response = requests.get(template_url)
    response.raise_for_status()
    return BytesIO(response.content)  # Returning text content of the template


def save_conversation(summary: str, user_id, save_path, save_file_name):
    # 텍스트 파일 내용 생성
    file_content = summary
    # 메모리 내에서 파일 처리
    file_buffer = io.BytesIO()
    file_buffer.write(file_content.encode('utf-8'))
    file_buffer.seek(0)
    
    # Firebase Storage에 업로드
    bucket = storage.bucket(os.environ["FIREBASE_STORGE_DOMAIN"])
    blob = bucket.blob(f"{user_id}/{save_path}/{save_file_name}.txt")
    blob.upload_from_file(file_buffer, content_type='text/plain')
    
    # 다운로드 URL 생성
    download_url = blob.generate_signed_url(version="v4", expiration=7200)     
    
    return download_url