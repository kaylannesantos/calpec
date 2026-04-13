from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def execucoes_status():
    return {"message": "Execucoes endpoint ok"}