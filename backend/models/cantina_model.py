from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from core.database import Base

class Cantina(Base):
    __tablename__ = "cantinas"

    id_cantina = Column(Integer, primary_key=True, index= True)
    nome_fantasia = Column(String(100), nullable=False, unique=True)
    cnpj = Column(String(18), nullable=False, unique= True)
    data_cadastro = Column(DateTime, server_default=func.Now(), nullable=False)
    
