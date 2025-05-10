# Desafio Tech – Plataforma de Recomendação de Veículos com IA

## Visão Geral

Este repositório implementa uma plataforma fullstack para recomendação inteligente de veículos, utilizando IA generativa e integração com APIs. O sistema é composto por um backend Python (FastAPI) e um frontend moderno em Next.js/React, permitindo interações em tempo real via WebSocket.

## Arquitetura

- **Backend**: Python, FastAPI, CrewAI, WebSocket, integração com OpenAI e ferramentas de busca de veículos.
- **Frontend**: Next.js (React), TailwindCSS, Radix UI, comunicação via WebSocket com backend.
- **Docker**: Deploy simplificado usando `docker-compose` para backend e frontend.

```
📦desafio-tech
 ├── backend
 │    ├── main.py         # Ponto de entrada FastAPI
 │    ├── session_manager.py
 │    ├── cars_seller_agent/
 │    │     ├── agent.py
 │    │     ├── search_tool.py
 │    │     └── __init__.py
 │    ├── data/
 │    ├── images/
 │    ├── requirements.txt
 │    ├── Dockerfile
 │    ├── .env            # Variáveis de ambiente (NÃO versionar)
 │    └── EXAMPLE.env     # Exemplo de variáveis de ambiente
 ├── frontend
 │    ├── app/
 │    ├── components/
 │    ├── public/
 │    ├── package.json
 │    ├── Dockerfile
 │    └── ...
 ├── docker-compose.yml
 └── README.md
```

## Pré-requisitos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- (Opcional para dev) Python 3.10+ e Node.js 18+

## Instalação e Execução

### 1. Clonar o repositório
```bash
git clone https://github.com/Rafael-Cabral/desafio-tech.git
cd desafio-tech
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na pasta `backend` com base no `EXAMPLE.env` e adicione sua chave da OpenAI:
```env
MODEL=gpt-4.1
OPENAI_API_KEY=SUA_CHAVE
```


### 3. Subir a aplicação com Docker Compose
```bash
docker-compose up --build
```
- O backend estará disponível em: http://localhost:8001
- O frontend estará disponível em: http://localhost:3000

### 4. Acessar a aplicação
Abra o navegador em http://localhost:3000 para acessar a interface de recomendação de veículos.

## Desenvolvimento Local (sem Docker)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp EXAMPLE.env .env # Edite com suas chaves
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Estrutura dos Principais Arquivos
- `backend/main.py`: Inicializa o FastAPI, WebSocket e carrega variáveis de ambiente automaticamente.
- `backend/cars_seller_agent/agent.py`: Define agentes e tarefas CrewAI para recomendação de veículos.
- `backend/cars_seller_agent/search_tool.py`: Implementa a lógica de busca de veículos.
- `frontend/`: Código do app Next.js, componentes, páginas e integração com backend.

## Variáveis de Ambiente Importantes
- `MODEL`: Modelo OpenAI a ser utilizado.
- `OPENAI_API_KEY`: Chave de API da OpenAI.

## Licença
MIT

---

Desenvolvido por Rafael Cabral.
