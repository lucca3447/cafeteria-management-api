from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.rate_limit import limiter
from schemas.cantina_schema import CantinaCreate, CantinaRegistroResponse
from services.cantina_service import CantinaService

router = APIRouter(prefix="/cantinas", tags=["Cantinas"])

@router.post("/registrar", response_model=CantinaRegistroResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
def registrar_cantina(request: Request, payload: CantinaCreate, db: Session = Depends(get_db)):
    service = CantinaService(db)
    return service.registrar_cantina(payload)
