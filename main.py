from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import create_tables
from routes.tasks import roteador as roteador_tarefas

create_tables()

app = FastAPI(
    title="Organizador de Tarefas",
    description="API para gerenciar tarefas com prioridades e prazos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(roteador_tarefas)

@app.get("/", response_class=HTMLResponse)
def frontend():
    with open("static/index.html", encoding="utf-8") as arquivo:
        return arquivo.read()