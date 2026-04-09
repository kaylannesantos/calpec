# CalPEC — Sistema Eletrônico para Cálculo do Processo de Execução Criminal

Trabalho de Conclusão de Curso — IFPI Campus Teresina Central  
Tecnologia em Análise e Desenvolvimento de Sistemas  
Autora: Kaylanne Mendes dos Santos  
Orientador: Prof. Me. Fernando Castelo Branco Gonçalves Santana

---

## Sobre o Projeto

O CalPEC automatiza o cálculo da execução penal conforme a Lei de Execução Penal (LEP — Lei nº 7.210/1984), cobrindo:

- Progressão de regime (art. 112 LEP + Pacote Anticrime)
- Remição de pena por trabalho, estudo e leitura (art. 126 LEP)
- Detração de pena (art. 42 CP)
- Unificação de penas
- Livramento condicional

## Stack Tecnológica

| Camada   | Tecnologia           |
|----------|----------------------|
| Frontend | React + Vite         |
| Backend  | Python + FastAPI     |
| Banco    | PostgreSQL           |
| Container| Docker Compose       |

## Estrutura do Projeto

```
calpec/
├── frontend/
│   └── src/
│       ├── components/   # Componentes reutilizáveis
│       ├── pages/        # Páginas da aplicação
│       ├── services/     # Comunicação com a API
│       ├── hooks/        # Custom hooks
│       ├── contexts/     # Context API (autenticação etc.)
│       └── utils/        # Funções utilitárias de cálculo
├── backend/
│   └── app/
│       ├── api/          # Rotas da API REST
│       ├── models/       # Modelos ORM (SQLAlchemy)
│       ├── schemas/      # Validação Pydantic
│       ├── services/     # Lógica de negócio
│       └── utils/        # Cálculos conforme LEP
└── docker-compose.yml
```

## Como Rodar

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Com Docker
```bash
docker-compose up --build
```

## Referências Legais
- [LEP — Lei nº 7.210/1984](https://www.planalto.gov.br/ccivil_03/leis/l7210.htm)
- [Código Penal — Decreto-Lei nº 2.848/1940](https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm)
- [Pacote Anticrime — Lei nº 13.964/2019](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/L13964.htm)
