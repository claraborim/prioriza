from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Classe base dos modelos do banco de dados
Base = declarative_base()

# Modelo da tabela de tarefas
class Tarefa(Base):
    __tablename__ = "tasks"

    # Identificador único da tarefa
    id = Column(Integer, primary_key=True, index=True)

    # Título da tarefa
    titulo = Column(String, nullable=False)

    # Descrição da tarefa
    descricao = Column(String, default="")

    # Status de conclusão
    status = Column(Boolean, default=False)

    # Prioridade da tarefa
    prioridade = Column(String, default="media")

    # Prazo da tarefa
    prazo = Column(Date, nullable=True)

    # Data e hora de criação
    data_criacao = Column(String, default=lambda: datetime.now().strftime("%d/%m/%Y %H:%M"))