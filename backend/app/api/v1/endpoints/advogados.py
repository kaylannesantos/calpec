from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def advogados_status():
    return {"message": "Advogados endpoint ok"}