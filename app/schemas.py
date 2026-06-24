from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class CriarTarefa(BaseModel):
    titulo: str = Field(max_lenght=100)
    descricao: Optional[str] = Field("", max_length=500)
    prioridade: Optional[str] = "media"
    prazo: Optional[date] = None

class AtualizarTarefa(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[bool] = None
    prioridade: Optional[str] = None
    prazo: Optional[date] = None

class RespostaTarefa(BaseModel):
    id: int
    titulo: str
    descricao: str
    status: bool
    prioridade: str
    prazo: Optional[date]
    data_criacao: str

    class Config:
        from_attributes = True