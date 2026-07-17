from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from services.previsao_service import PrevisaoService


router = APIRouter(
    prefix="/previsao-estoque",
    tags=["Previsão de Estoque (IA)"],
)


@router.get("/alertas")
def obter_alertas_previsao(
    dias: int = 28,
    db: Session = Depends(get_db),
):
    """

    Retorna alertas de produtos que podem faltar amanha,
    baseado na media de vendas dos ultimos 'dias' dias.

    Parametros:
    - dias: quantidade de dias de historico a considerar (padrao: 28)

    """
    service = PrevisaoService(db)
    return service.gerar_alertas(dias_historico=dias)
