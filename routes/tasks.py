from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Tarefa
from schemas import CriarTarefa, AtualizarTarefa, RespostaTarefa

roteador = APIRouter(prefix="/tarefas", tags=["tarefas"])

# Retorna todas as tarefas
@roteador.get("/", response_model=List[RespostaTarefa])
def listar_tarefas(skip: int = 0, limit: int = 100, banco: Session = Depends(get_db)):
    return banco.query(Tarefa).offset(skip).limit(limit).all()

# Cria uma nova tarefa
@roteador.post("/", response_model=RespostaTarefa, status_code=201)
def criar_tarefa(tarefa: CriarTarefa, banco: Session = Depends(get_db)):
    nova_tarefa = Tarefa(**tarefa.model_dump())
    banco.add(nova_tarefa)
    banco.commit()
    banco.refresh(nova_tarefa)
    return nova_tarefa

# Atualiza propriedades de uma tarefa específica
@roteador.patch("/{tarefa_id}", response_model=RespostaTarefa)
def atualizar_tarefa(tarefa_id: int, atualizacoes: AtualizarTarefa, banco: Session = Depends(get_db)):
    tarefa = banco.query(Tarefa).filter(Tarefa.id == tarefa_id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    for campo, valor in atualizacoes.model_dump(exclude_none=True).items():
        setattr(tarefa, campo, valor)

    banco.commit()
    banco.refresh(tarefa)
    return tarefa

# Deleta uma tarefa
@roteador.delete("/{tarefa_id}", status_code=204)
def deletar_tarefa(tarefa_id: int, banco: Session = Depends(get_db)):
    tarefa = banco.query(Tarefa).filter(Tarefa.id == tarefa_id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    banco.delete(tarefa)
    banco.commit()