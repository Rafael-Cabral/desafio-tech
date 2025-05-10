from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from session_manager import crew_session_manager 
from cars_seller_agent.agent import executar_crew 
import uuid

from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory="images"), name="images")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time communication between client and vehicle recommendation agent.

    Establishes a new session, manages conversation history, and invokes
    the agent via CrewAI to return appropriate vehicle suggestions.

    Args:
        websocket (WebSocket): Active WebSocket connection with the frontend client.

    Workflow:
    - Accepts WebSocket connection.
    - Generates a unique session ID and starts a new Crew session.
    - Waits for user input, appends to history, and sends it to the agent.
    - Appends agent response and sends it back to the client.
    - Handles disconnection and error cleanup gracefully.
    """
    await websocket.accept()

    session_id = str(uuid.uuid4())
    crew_session_manager.start_session(session_id)

    try:
        while True:
            data = await websocket.receive_json()
            user_prompt = data.get("mensagem", "").strip()
            if not user_prompt:
                continue 

            current_chat_history = crew_session_manager.last_context()

            crew_session_manager.append_history("User", user_prompt)

            crew_instance = crew_session_manager.get_crew()
            if crew_instance is None:
                await websocket.send_json({"erro": "Session not initialized."})
                print("[ERROR] Attempted to use an uninitialized crew instance.")
                continue

            resposta_agente = await executar_crew(crew_instance, user_prompt, current_chat_history)

            crew_session_manager.append_history("Agent", resposta_agente)

            await websocket.send_json({"resposta": resposta_agente})

    except WebSocketDisconnect:
        crew_session_manager.reset()

    except Exception as e:
        print(f"[ERROR] Unexpected error in session {session_id}: {e}")
        crew_session_manager.reset()
        await websocket.close(code=1011)  