from sqlalchemy.orm import Session
from models.cantina_model import Cantina

class CantinaRepository:
    def __init__(self, db: Session):
        self.db = db

    def criar(self, nome_fantasia: str, cnpj: str) -> Cantina:
        cantina = Cantina(nome_fantasia=nome_fantasia, cnpj=cnpj)
        self.db.add(cantina)
        self.db.commit()
        self.db.refresh(cantina)
        return cantina
    
    def buscar_por_cnpj(self, cnpj: str):
        return self.db.query(Cantina).filter(Cantina.cnpj == cnpj).first()
