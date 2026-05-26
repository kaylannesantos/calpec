from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, apenados, advogados, execucoes, remicoes

app = FastAPI(
    title="CalPEC API",
    description="API do Sistema Eletrônico para Cálculo do Processo de Execução Criminal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticação"])
app.include_router(apenados.router, prefix="/api/v1/apenados", tags=["Apenados"])
app.include_router(advogados.router, prefix="/api/v1/advogados", tags=["Advogados"])
app.include_router(execucoes.router, prefix="/api/v1/execucoes", tags=["Execuções"])
app.include_router(remicoes.router, prefix="/api/v1/remicoes", tags=["Remições"])

@app.get("/")
def root():
    return {"message": "CalPEC API está online"}

@app.on_event("startup")
async def startup():
    try:
        from app.db.database import engine, Base
        from app.models import user, apenado, execucao, remicao
        Base.metadata.create_all(bind=engine)
        print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")
