import json
import logging
import redis

def initialize_redis(stream_name, group_name):
    redis_client = redis.StrictRedis(host='redis', port=6379, db=0)
    try:
        redis_client.xgroup_create(stream_name,
                                   group_name,
                                   id='0',
                                   mkstream=True)
    except redis.exceptions.ResponseError as e:
        logging.warning(f'Group already exists or other error: {e}')
    return redis_client

def listen_for_messages(redis_client, stream_name, group_name, consumer_name, process_message):
    logging.info(f'Worker for stream {stream_name} is listening for new documents...')
    while True:
        try:
            messages = redis_client.xreadgroup(group_name,
                                               consumer_name,
                                               {stream_name: '>'},
                                               block=0,
                                               count=1)
            for stream, message_list in messages:
                for message_id, message in message_list:
                    try:
                        doc_data = json.loads(message.get(b'message'))
                        process_message(doc_data)
                        redis_client.xack(stream_name, group_name, message_id)
                    except json.JSONDecodeError as e:
                        logging.error(f'JSON decode error: {e}', exc_info=True)
                    except Exception as e:
                        logging.error(f'Error processing message from stream: {e}', exc_info=True)
        except redis.exceptions.ResponseError as e:
            logging.error(f'Redis error: {e}', exc_info=True)
        except Exception as e:
            logging.error(f'Unexpected error: {e}', exc_info=True)