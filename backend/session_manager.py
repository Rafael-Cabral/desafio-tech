from cars_seller_agent.agent import agente_busca, tarefa_busca 
from crewai import Process, Crew

class CrewSessionManager:
    """
    Manages individual sessions with a CrewAI agent, including 
    initialization, chat history tracking, and reset behavior.
    """
    def __init__(self):
        self.crew = None
        self.session_id = None
        self.chat_history: list[str] = []

    def start_session(self, session_id: str):
        self.session_id = session_id
        self.chat_history = []

        self.crew = Crew(
            agents=[agente_busca],
            tasks=[tarefa_busca], 
            process=Process.sequential,
            memory=True, 
        )
        print(f"Sessão {session_id} iniciada, instância da Crew criada.")


    def get_crew(self):
        return self.crew

    def append_history(self, role: str, text: str):
        if text and text.strip():
            self.chat_history.append(f"{role}: {text.strip()}")

    def last_context(self, max_turns: int = 10) -> str:
        return "\n".join(self.chat_history[-(max_turns*2):])


    def reset(self):
        print(f"Resetando sessão {self.session_id}.")
        self.crew = None
        self.session_id = None
        self.chat_history = []

crew_session_manager = CrewSessionManager()