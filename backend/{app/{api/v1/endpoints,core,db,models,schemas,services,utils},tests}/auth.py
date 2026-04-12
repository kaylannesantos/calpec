from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def auth_status():
    return {"message": "Auth endpoint ok"}