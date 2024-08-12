import google.generativeai as genai

optimized_query_schema = genai.protos.Schema(
    type=genai.protos.Type.STRING,
    description="optimized query for better vector search")

memories_schema = genai.protos.Schema(type=genai.protos.Type.STRING,
                                      description="memory informations")

reasoning_schema = genai.protos.Schema(
    type=genai.protos.Type.STRING,
    description=
    "your thought why you choose this tools, Speak in monologue form your thought"
)

summarized_text_schema = genai.protos.Schema(
    type=genai.protos.Type.STRING,
    description=
    "summary of dialogue between the user and the assistant using the user's predefined template"
)