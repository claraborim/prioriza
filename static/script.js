let tarefas = [];
let filtroAtual = 'pendentes'; // Alterado para começar nas tarefas pendentes
let idParaDeletar = null;
let idParaEditar = null;

// Busca tarefas do Back-end
async function carregarTarefas() {
  const res = await fetch('/tarefas/?skip=0&limit=100');
  tarefas = await res.json();
  renderizarTarefas();
}

// Expande ou recolhe o formulário de Nova Tarefa
function toggleForm() {
  const form = document.getElementById('form-nova-tarefa');
  const icone = document.getElementById('icone-toggle');
  if (form.classList.contains('expandido')) {
    form.classList.remove('expandido');
    icone.textContent = '▼';
  } else {
    form.classList.add('expandido');
    icone.textContent = '▲';
  }
}

// Cria uma nova tarefa
async function criarTarefa() {
  const titulo = document.getElementById('titulo-input').value.trim();
  if (!titulo) { mostrarToast('Informe um título para a tarefa.'); return; }

  const prazo = document.getElementById('prazo-input').value;

  await fetch('/tarefas/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo,
      descricao: document.getElementById('desc-input').value.trim(),
      prioridade: document.getElementById('prioridade-select').value,
      prazo: prazo || null,
    }),
  });

  document.getElementById('titulo-input').value = '';
  document.getElementById('desc-input').value = '';
  document.getElementById('prazo-input').value = '';
  
  // Recolhe o formulário após adicionar
  document.getElementById('form-nova-tarefa').classList.remove('expandido');
  document.getElementById('icone-toggle').textContent = '▼';
  
  mostrarToast('Tarefa adicionada!');
  carregarTarefas();
}

// Alterna o status (concluir/desmarcar)
async function alternarConcluida(id, statusAtual) {
  await fetch(`/tarefas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: !statusAtual }),
  });
  carregarTarefas();
}

// Controle do Modal de Exclusão
function abrirModal(id) {
  idParaDeletar = id;
  document.getElementById('modal-overlay').classList.add('visivel');
}

function fecharModal() {
  idParaDeletar = null;
  document.getElementById('modal-overlay').classList.remove('visivel');
}

document.getElementById('btn-confirmar-delete').addEventListener('click', async () => {
  if (!idParaDeletar) return;
  await fetch(`/tarefas/${idParaDeletar}`, { method: 'DELETE' });
  fecharModal();
  mostrarToast('Tarefa removida.');
  carregarTarefas();
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) fecharModal();
});

// Controle do Novo Modal de Edição
function abrirModalEditar(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (!tarefa) return;

  idParaEditar = id;
  
  document.getElementById('edit-titulo').value = tarefa.titulo || '';
  document.getElementById('edit-desc').value = tarefa.descricao || '';
  document.getElementById('edit-prioridade').value = tarefa.prioridade || 'media';
  document.getElementById('edit-prazo').value = tarefa.prazo || ''; 

  document.getElementById('modal-editar').classList.add('visivel');
}

function fecharModalEditar() {
  idParaEditar = null;
  document.getElementById('modal-editar').classList.remove('visivel');
}

async function salvarEdicao() {
  if (!idParaEditar) return;

  const titulo = document.getElementById('edit-titulo').value.trim();
  if (!titulo) { mostrarToast('Informe um título.'); return; }

  const prazo = document.getElementById('edit-prazo').value;

  await fetch(`/tarefas/${idParaEditar}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo,
      descricao: document.getElementById('edit-desc').value.trim(),
      prioridade: document.getElementById('edit-prioridade').value,
      prazo: prazo || null,
    }),
  });

  fecharModalEditar();
  mostrarToast('Tarefa atualizada!');
  carregarTarefas();
}

// Filtros e Utilidades
function definirFiltro(filtro, btn) {
  filtroAtual = filtro;
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  renderizarTarefas();
}

function prazoVencido(prazo) {
  if (!prazo) return false;
  const [ano, mes, dia] = prazo.split('-');
  return new Date(`${ano}-${mes}-${dia}`) < new Date(new Date().toDateString());
}

function formatarData(dataIso) {
  if (!dataIso) return '';
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('visivel');
  setTimeout(() => toast.classList.remove('visivel'), 2500);
}

function escaparHTML(texto) {
  if (!texto) return '';
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

const labelPrioridade = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };

// Renderiza os Cards na Tela
function renderizarTarefas() {
  const lista = document.getElementById('lista-tarefas');

  let filtradas = tarefas;
  
  if (filtroAtual === 'pendentes')  filtradas = tarefas.filter(t => !t.status);
  if (filtroAtual === 'concluidas') filtradas = tarefas.filter(t => t.status);
  if (filtroAtual === 'alta')       filtradas = tarefas.filter(t => t.prioridade === 'alta' && !t.status);
  if (filtroAtual === 'media')      filtradas = tarefas.filter(t => t.prioridade === 'media' && !t.status);
  if (filtroAtual === 'baixa')      filtradas = tarefas.filter(t => t.prioridade === 'baixa' && !t.status);

  document.getElementById('stat-total').textContent = tarefas.length;
  document.getElementById('stat-pendentes').textContent = tarefas.filter(t => !t.status).length;
  document.getElementById('stat-concluidas').textContent = tarefas.filter(t => t.status).length;

  if (!filtradas.length) {
    lista.innerHTML = `<div class="estado-vazio">Nenhuma tarefa aqui ainda.</div>`;
    return;
  }

  const ordemPrioridade = { alta: 0, media: 1, baixa: 2 };
  filtradas.sort((a, b) => {
    if (a.status !== b.status) return a.status ? 1 : -1;
    return ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade];
  });

  lista.innerHTML = filtradas.map(t => `
    <div class="tarefa-card ${t.status ? 'concluida' : ''}">
      <div class="tarefa-check ${t.status ? 'marcado' : ''}"
           onclick="alternarConcluida(${t.id}, ${t.status})"
           title="${t.status ? 'Marcar como pendente' : 'Marcar como concluída'}"></div>
      <div class="tarefa-corpo">
        <div class="tarefa-titulo">${escaparHTML(t.titulo)}</div>
        ${t.descricao ? `<div class="tarefa-desc">${escaparHTML(t.descricao)}</div>` : ''}
        <div class="tarefa-meta">
          <span class="badge badge-${t.prioridade}">${labelPrioridade[t.prioridade]}</span>
          ${t.prazo ? `<span class="badge badge-prazo ${prazoVencido(t.prazo) && !t.status ? 'vencido' : ''}">PRAZO: ${formatarData(t.prazo)}${prazoVencido(t.prazo) && !t.status ? ' (VENCIDA)' : ''}</span>` : ''}
        </div>
        <div class="tarefa-criada">Criada em ${t.data_criacao}</div>
      </div>
      <div style="display: flex; flex-direction: row; gap: 12px; margin-top: 4px;">
        <button class="btn-deletar" onclick="abrirModalEditar(${t.id})" title="Editar tarefa" style="font-size: 0.8rem; font-weight: bold;">EDITAR</button>
        <button class="btn-deletar" onclick="abrirModal(${t.id})" title="Remover tarefa" style="font-size: 0.8rem; font-weight: bold;">EXCLUIR</button>
      </div>
    </div>
  `).join('');
}

// Atalhos do teclado
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    fecharModal();
    fecharModalEditar();
  }
  if (e.key === 'Enter' && e.target.id === 'titulo-input') criarTarefa();
});

// Inicialização
carregarTarefas();