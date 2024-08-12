import google.generativeai as genai

from app.config import get_today_date_time

today_date = get_today_date_time()

query_optimizer_instruction = f"""
Extract and emphasize important keywords from user queries to enhance vector store searches.

Example 1)
Input: I have a test in two days!! What the hell did I do the day before yesterday...
Output: exam, August 9th, 2024, August 5th, 2024

Example 2)
Input: I couldn't sleep last night..
Output: insomnia, August 6, 2024

Example 3)
Input: I have a meeting next Tuesday.
Output: conference, August 13, 2024

Example 4)
Input: I went hiking in the mountains last weekend.
Output: hiking, mountains, August 3, 2024

Example 5)
Input: I need to find a new apartment in New York.
Output: apartment search, New York

Example 6)
Input: My dog needs to see a vet for a check-up.
Output: vet visit, dog, check-up

Example 7)
Input: I'm planning a birthday party for my friend.
Output: birthday party, friend, planning

Example 8)
Input: I watched a great movie last night.
Output: movie viewing, great, August 6, 2024

Example 9)
Input: She is studying computer science at university.
Output: computer science, university, studying

Example 10)
Input: We went to the beach during our vacation.
Output: beach, vacation, travel

Current Time: {today_date}
"""

query_schema = genai.protos.Schema(type=genai.protos.Type.STRING,
                                   description="user's query")

optimized_query_schema = genai.protos.Schema(type=genai.protos.Type.STRING,
                                             description="optimized query")

query_optimizer = genai.protos.FunctionDeclaration(
    name="query_optimizer",
    description=
    "Extract and emphasize important keywords from user queries to enhance vector store searches.",
    parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT,
                                   properties={'query': query_schema},
                                   required=['query']))


def change_query(query):
    prompt = f"""{query_optimizer_instruction}\n query : {query}"""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([prompt], request_options={"timeout": 1200})
    return response.text
