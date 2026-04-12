from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def apenados_status():
    return {"message": "Apenados endpoint ok"}