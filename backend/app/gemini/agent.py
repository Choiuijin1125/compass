import datetime
import json
import time
from uuid import uuid4
from app.gemini.funtion_calls import conversation_saver
import google.generativeai as genai
from google.protobuf.json_format import MessageToJson
from firebase_admin import storage

from app.config import get_today_date_time
from app.gemini.funtion_calls import memory_organizer, query_optimizer
from app.gemini.funtion_calls.memory_organizer import (
    extract_memory,
    retrieve_core_memories,
    retrieve_recall_memories,
)
from app.gemini.funtion_calls.query_optimizer import change_query
from app.gemini.funtion_calls.reasonaing import reasonaing, reasoning_query
from app.gemini.funtion_calls.conversation_saver import summarize_conversation, save_conversation, get_save_template
from app.gemini.utils import JsonToPart, log_to_firestore
from app.schema import State

today_date = get_today_date_time()


def get_system_instruction():
    system_instruction = f"""
    You are a helpful assistant with advanced long-term memory capabilities. Powered by a stateless LLM, you must rely on memories to store information between conversations.

    Memory Usage Guidelines:

    Make informed suppositions and extrapolations based on stored memories.
    Regularly reflect on past interactions to identify patterns and preferences.
    Update your mental model of the user with each new piece of information.
    Cross-reference new information with existing memories for consistency.
    Prioritize storing emotional context and personal values alongside facts.
    Use memory to anticipate needs and tailor responses to the user's style.
    Recognize and acknowledge changes in the user's situation or perspectives over time.
    Leverage memories to provide personalized examples and analogies.
    Recall past challenges or successes to inform current problem-solving.

    Core Memories Instructions:
    Core memories are fundamental to understanding the user and are always available. These memories should include critical information such as the user's goals, preferences, major milestones, and any system prompts or instructions that the agent must reference. Ensure they are regularly updated and referenced during interactions. Additionally, maintain an active and dynamic conversational style to keep the user engaged and motivated. Always utilize core memories to provide a consistent understanding of the user’s goals, preferences, and milestones.

    Recall Memories Instructions:
    Recall memories are contextually retrieved based on the current conversation. These should include details relevant to recent interactions or specific user needs. This ensures continuity and personalization in conversations. Strive to be energetic and proactive in guiding the conversation, leveraging user memories to anticipate needs and provide tailored responses.
    
    Following these guidelines, I will now proceed to use the query_optimizer and retreval_memory tools to manage and retrieve relevant memories before answering your question.
    However, if the user requests memory storage, you must call the just "conversation saver tool".

    Every conversation loop execpt when you need to save, you must follow this steps:
    1. using query_optimizer tool
    2. using retreval_memory tool
    3. using reasonaing tool    
    4. Answer

    If the user requests memory storage, you must call the just "conversation saver tool".
    1. conversation saver tool
    2. Answer

    Current Time: {today_date}
    """
    return system_instruction


def delay_time():
    time.sleep(1)


def firestore_to_id(doc_data):
    path = doc_data["path"]
    path_parts = path.split('/')
    user_id = path_parts[1]
    is_thread = path_parts[2]
    thread_id = path_parts[3]
    message_id = path_parts[-1]

    return user_id, thread_id, message_id, is_thread


def message_to_history(user_id, thread_id, is_thread, db):

    if is_thread == "threads":

        messages_ref = db.collection('users').document(user_id).collection(
            'threads').document(thread_id).collection('messages')
        messages = messages_ref.order_by('createTime').stream()
    elif is_thread == "questions":
        messages_ref = db.collection('users').document(user_id).collection(
            'questions').document(thread_id).collection('messages')
        messages = messages_ref.order_by('createTime').stream()

    all_messages = [message.to_dict() for message in messages]

    return all_messages


def get_thread(user_id, thread_id, is_thread, db):
    # 참조를 가져옵니다.

    if is_thread == "threads":
        thread_ref = db.collection('users').document(user_id).collection(
            'threads').document(thread_id)
    else:
        thread_ref = db.collection('users').document(user_id).collection(
            'questions').document(thread_id)

    try:
        # 스레드 문서를 가져옵니다.
        thread = thread_ref.get()

        if thread.exists:
            # 스레드 문서가 존재할 경우 데이터를 반환합니다.
            return thread.to_dict()
        else:
            return None
    except Exception as e:
        # 예외가 발생할 경우 에러 메시지를 출력하고 None을 반환합니다.
        print(f"An error occurred: {e}")
        return None

safety_settings = [{"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},\
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},\
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},\
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"}]
generation_config = {"temperature": 0}

query_optimizer_tool = genai.protos.Tool(
    function_declarations=[query_optimizer])
memory_organizer_tool = genai.protos.Tool(
    function_declarations=[memory_organizer])


def generate_response(doc_data, db):
    user_id, thread_id, message_id, is_thread = firestore_to_id(doc_data)
    all_messages = message_to_history(user_id, thread_id, is_thread, db)
    thread = get_thread(user_id, thread_id, is_thread, db)
    core_memories = retrieve_core_memories(
        db, user_id, core_memory_ids=thread.get("core_memory_files"))

    firestore_message = []
    history = []
    for message in all_messages:
        history.append(
            genai.protos.Content(
                parts=[genai.protos.Part(text=f"{message['prompt']}")],
                role="user"))
        if message.get("response"):
            for item in message["response"]:
                history.append(
                    genai.protos.Content(parts=[JsonToPart(item)],
                                            role=item["role"]))
    model = genai.GenerativeModel(
        system_instruction=get_system_instruction(),
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
        safety_settings=safety_settings,
        tools=[query_optimizer_tool, memory_organizer_tool, reasonaing, conversation_saver])
    chat = model.start_chat()
    chat.history = history[:-1]
    response = chat.send_message(f"{message['prompt']}",
                                    request_options={"timeout": 1200})
    response = response.candidates[0].content.parts[0]

    delay_time()

    firestore_message.append(
        json.loads(MessageToJson(chat.history[-1]._pb)))
    log_to_firestore(db, user_id, thread_id, message_id, is_thread,
                        State.PROCESSING, {'response': firestore_message})

    function_calling_in_process = True
    while function_calling_in_process:
        try:
            params = {}
            if not response.function_call:
                break
            for key, value in response.function_call.args.items():

                params[key] = value

                # print(params, "*" * 100)

            if response.function_call.name == "query_optimizer":
                call_result = json.loads(
                    MessageToJson(response.function_call._pb))
                optimized_query = change_query(
                    call_result["args"]["query"])
                recall_memories = retrieve_recall_memories(
                    db,
                    user_id,
                    optimized_query,
                    recall_memory_ids=thread.get("recall_memory_files"))

                api_response = dict(optimized_query=optimized_query)

            if response.function_call.name == "memory_reference":
                call_result = json.loads(
                    MessageToJson(response.function_call._pb))

                if recall_memories:
                    recall_memories = extract_memory(recall_memories)

                api_response = dict(core_memories=core_memories,
                                    recall_memories=recall_memories)

            if response.function_call.name == "reasonaing":
                call_result = json.loads(
                    MessageToJson(response.function_call._pb))

                reasonaing_result = reasoning_query(
                    core_memories, recall_memories, message['prompt'])

                api_response = dict(resonaing=reasonaing_result)

            if response.function_call.name == "conversation_saver":
                save_request = all_messages[-1]
                save_path = save_request["save_path_id"]

                template_path = doc_data.get("template_path")
                # save_path = doc_data.get("save_path")
                # save_path = ("recall_memory_files")


                if template_path:
                    _path = user_id + "/" + template_path
                    bucket = storage.bucket("compass-gemini-mega.appspot.com")
                    blob = bucket.get_blob(_path)
                    template_url = blob.generate_signed_url(expiration=datetime.timedelta(seconds=300), method='GET')

                # if save_path:
                #     save_path = user_id + "/" + save_path

                call_result = json.loads(MessageToJson(response.function_call._pb))
                # Retrieve the template using the provided URL or any other method
                template_content = get_save_template(template_url)
                
                # Summarize the conversation using the template
                summarized_text = summarize_conversation(template_content, chat.history)
                save_file_name = call_result["args"]["save_file_name"]                    
                # Save the summarized conversation to the specified path
                download_url = save_conversation(summarized_text, user_id, save_path, save_file_name)
                file_id = str(uuid4())
                doc_ref = db.collection('users').document(user_id).collection(save_path.split("/")[0]).document(file_id)
                file_info = {
                    'basename': f"{save_file_name}",
                    'downloadURL': download_url,
                    'file_id': file_id,
                    'file_type': "FILE",
                    'isFolder': False,
                    'mimeType': "text/plain",
                    'parent_path': f'{save_path}',
                    'path': f'{save_path}/{save_file_name}',
                    'state': "PROCESSING"
                    # 추가 필드와 값
                }                    
                print(file_info)
                doc_ref.set(file_info)
                
                # Return or log an API response or any additional logic needed
                api_response = {"summarized_text": f"{summarized_text}",
                                "status": "success"}

            function_response = genai.protos.Content(parts=[
                genai.protos.Part(
                    function_response=genai.protos.FunctionResponse(
                        name=response.function_call.name,
                        response={"result": api_response}))
            ],
                                                        role="model")

            firestore_message.append(
                json.loads(MessageToJson(function_response._pb)))
            log_to_firestore(db, user_id, thread_id, message_id, is_thread,
                                State.PROCESSING,
                                {'response': firestore_message})

            response = chat.send_message(function_response,
                                            request_options={"timeout": 6000})
            response = response.candidates[0].content.parts[0]

            firestore_message.append(
                json.loads(MessageToJson(chat.history[-1]._pb)))
            log_to_firestore(db, user_id, thread_id, message_id, is_thread,
                                State.PROCESSING,
                                {'response': firestore_message})

            delay_time()
        except AttributeError as e:
            function_calling_in_process = False
            print(e)
    log_to_firestore(db, user_id, thread_id, message_id, is_thread,
                        State.COMPLETED)
    return response
