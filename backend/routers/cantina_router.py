from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.cantina_schema import CantinaCreate, CantinaRegistroResponse
from services.cantina_service import CantinaService

router = APIRouter(prefix="/cantinas", tags=["Cantinas"])

@router.post("/registrar", response_model=CantinaRegistroResponse, status_code=201)
def registrar_cantina(payload: CantinaCreate, db: Session = Depends(get_db)):
    service = CantinaService(db)
    return service.registrar_cantina(payload)
