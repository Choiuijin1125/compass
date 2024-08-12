import google.generativeai as genai
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from google.cloud.firestore_v1.vector import Vector

from app.gemini.funtion_calls.schema import (
    memories_schema,
    optimized_query_schema,
    reasoning_schema,
)
from app.vector.utils import generate_vector

memory_reference_tool_instruction = """

    Extract relevant details from recall memories.
    Include information about ongoing projects if related to the query.
    Add preferences and needs if they match the context of the query.
    Prioritize storing emotional context and personal values alongside facts.
    Recognize and acknowledge changes in the user's situation or perspectives over time.

    response with summurized recall memories
    """

memory_organizer = genai.protos.FunctionDeclaration(
    name="memory_reference",
    description=
    "This tool references relevant information from core and recall memories based on the optimized query to ensure an engaging and proactive conversation.",
    parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT,
                                   properties={
                                       'optimized_query':
                                       optimized_query_schema,
                                   },
                                   required=['optimized_query']))


def retreval_memory(optimized_query: str, reasonaing: str):
    """retreval memory

    Args:
      optimized_query: optimized_query
      reasonaing: reason why you choose this tools
    """
    core_memories, recall_memories = [], []
    return core_memories, recall_memories


def retrieve_recall_memories(
    db,
    user_id: str,
    optimized_query: str,
    recall_memory_ids: list[str] = [],
):

    vectors = generate_vector(optimized_query)
    vector_collection = db.collection("users").document(user_id).collection(
        "vector")

    ##retrieve recall memories
    if recall_memory_ids:
        result = vector_collection.where(
            "file_id", "in", recall_memory_ids).find_nearest(
                vector_field="embedding_field",
                query_vector=Vector(vectors[0][1]["embedding"]),
                distance_measure=DistanceMeasure.EUCLIDEAN,
                limit=5)
        recall_memories = [x.to_dict()["content"] for x in result.get()]
    else:
        recall_memories = []

    return recall_memories


def retrieve_core_memories(
    db,
    user_id: str,
    core_memory_ids: list[str] = [],
):

    vector_collection = db.collection("users").document(user_id).collection(
        "vector")

    if core_memory_ids:
        result = vector_collection.where("file_id", "in", core_memory_ids)
        core_memories = [x.to_dict()["content"] for x in result.stream()]
    else:
        core_memories = []
    return core_memories


def extract_memory(recall_memories):
    prompt = f"""{memory_reference_tool_instruction}\n recall_memories : {recall_memories}"""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([prompt], request_options={"timeout": 1200})
    return response.text
