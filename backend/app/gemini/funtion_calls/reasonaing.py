import google.generativeai as genai
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from google.cloud.firestore_v1.vector import Vector

from app.gemini.funtion_calls.schema import (
    memories_schema,
    optimized_query_schema,
    reasoning_schema,
)

reasonaing = genai.protos.FunctionDeclaration(
    name="reasonaing",
    description=
    "This tool utilizes core and recall memories to reference relevant information, ensuring the conversation remains engaging and proactive.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            'optimized_query': optimized_query_schema,
            'core_memories': memories_schema,
            'recall_memories': memories_schema,
        },
        required=['core_memories', "recall_memories", "optimized_query"]))


def reasoning_query(core_memories, recall_memories, optimized_query):
    memory_reference_tool_instruction = f"""Using the provided user's core memories and recall memories, 
    generate a monologue detailing what the response to the given query should be. 
    Explain your reasoning as if you are thinking through the response.
        
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
    
    User Core Memories:
    {core_memories}
    
    User Recall Memories:
    {recall_memories}
    
    User Query:
    {optimized_query}

    *Thought:
    """

    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content([memory_reference_tool_instruction],
                                      request_options={"timeout": 1200})
    return response.text
