from datetime import datetime, timezone
from typing import Any, Dict

import google.generativeai as genai

from app.schema import State


def JsonToPart(data: Dict[str, Any]) -> genai.protos.Part:
    part_data = data.get('parts', [{}])[0]  # 첫 번째 part만 사용한다고 가정
    if 'text' in part_data:
        return genai.protos.Part(text=part_data['text'])
    elif 'functionCall' in part_data:
        function_call_data = part_data['functionCall']
        function_call = genai.protos.FunctionCall(
            name=function_call_data['name'], args=function_call_data['args'])
        return genai.protos.Part(function_call=function_call)
    elif 'functionResponse' in part_data:
        function_response_data = part_data['functionResponse']
        function_response = genai.protos.FunctionResponse(
            name=function_response_data['name'],
            response=function_response_data['response'])
        return genai.protos.Part(function_response=function_response)
    else:
        raise ValueError("Unknown part data type")


def log_to_firestore(db,
                     user_id,
                     thread_id,
                     message_id,
                     is_thread,
                     state,
                     additional_data=None):

    if is_thread == "threads":
        doc_ref = db.collection('users').document(user_id).collection(
            'threads').document(thread_id).collection('messages').document(
                message_id)
    else:
        doc_ref = db.collection('users').document(user_id).collection(
            'questions').document(thread_id).collection('messages').document(
                message_id)
    data = {
        'status': {
            'state': state.value,
            'updateTime': datetime.now(timezone.utc)
        }
    }
    if state == State.PROCESSING:
        data['status']['startTime'] = datetime.now(timezone.utc)
    if state == State.COMPLETED:
        data['status']['error'] = ""
    if additional_data:
        data.update(additional_data)
    doc_ref.set(data, merge=True)
