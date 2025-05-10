# Desafio Tech – Plataforma de Recomendação de Veículos com IA

## Visão Geral

Este repositório implementa uma plataforma fullstack para recomendação inteligente de veículos, utilizando IA generativa e integração com APIs. O sistema é composto por um backend Python (FastAPI) e um frontend moderno em Next.js/React, permitindo interações em tempo real via WebSocket.

## Acessar a aplicação

**Acesse a aplicação em produção:**

➡️ [App](http://ec2-34-227-173-113.compute-1.amazonaws.com:3000/)

## Decisões Técnicas e Experiência do Usuário

Para entregar uma solução robusta, escalável e de baixo custo operacional, adotei as seguintes escolhas:

- **CrewAI como backbone de agentes**  
  Utilizar o framework CrewAI permite orquestrar múltiplos LLMs de forma modular: basta trocar o “motor” de IA (por exemplo, GPT-4.1, Gemini-2.0) sem alterar a estrutura de código. Isso garante flexibilidade para equilibrar desempenho, latência e custo conforme a demanda.

- **Tool personalizada com Fuzzy Search**  
  Em vez de indexar ou tokenizar todo o JSON, criei uma ferramenta de busca semântica por meio de fuzzy matching. Ela traz maior precisão na correspondência de modelo, localização e faixa de preço, reduzindo chamadas desnecessárias à API e, consequentemente, o consumo de tokens e latência.

- **FastAPI + WebSocket para contexto conversacional**  
  FastAPI oferece alta performance e suporte nativo a WebSockets. Mantendo a conexão aberta, enviamos ao agente todo o histórico de interações, promovendo uma experiência mais fluida e humanizada.

- **Next.js no frontend**  
  Optei por Next.js para renderização otimizada e carregamento rápido do chatbot. A comunicação via WebSocket direto com o backend garante troca em tempo real de mensagens, enquanto o TailwindCSS e Radix UI permitiram criar uma interface leve e acessível em poucas linhas de código.

- **Docker para entrega e testes**  
  Juntei backend e frontend para simplificar o deploy na AWS e padronizar o ambiente de desenvolvimento. Qualquer membro do time pode reproduzir a aplicação localmente com um único `docker compose up --build`.


## Plano de Negócios

### 1. Modelo de Negócios  
Monetização principal por **lead generation**: comissão de 3% sobre o valor de venda de veículos (aprox. R\$ 1.200 para um carro de R\$ 40.000).

### 2. Aquisição dos Primeiros Usuários  
- **Grupos do Facebook**: comunidades segmentadas por modelo/região. Publicamos conteúdos úteis e oferecemos avaliações gratuitas para capturar leads qualificados de forma orgânica e de baixo custo.

### 3. Estimativa de CAC  
- **Custo por token de IA**: estimado em R\$ 0,002–0,005 por lead processado.  
- **Custo médio por lead**: aproximadamente R\$ 0,005.

### 4. Proposta de LTV  
- Como a compra de carro é pontual, o **LTV** por lead convertido corresponde à comissão média de R\$ 1.200.

### 5. Modelo de Monetização Complementar  
- **Assinatura Premium para Concessionárias** (R\$ 100/mês):  
  - Prioridade na exibição dos seus veículos nas recomendações.  
  - Acesso a relatórios básicos de performance (número de leads gerados, taxa de conversão).

### 6. Estratégias de Retenção  
- **Para Concessionárias**  
  - Relatórios mensais detalhados (perfil dos leads, estágio da jornada).  
  - Descontos progressivos na assinatura conforme volume de leads.  
  - Convites exclusivos para testar novas ferramentas antes do lançamento geral.

- **Para Usuários (leads do Facebook)**  
  - **Alertas Personalizados** por e-mail/WhatsApp sobre quedas de preço e novos carros que batem com suas preferências.  
  - **Conteúdo Exclusivo**: guias rápidos e vídeos sobre financiamento, manutenção e dicas de negociação.  



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
docker compose up --build
```
- O backend estará disponível em: http://localhost:8001
- O frontend estará disponível em: http://localhost:3000

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
```bash
docker compose up --build
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
