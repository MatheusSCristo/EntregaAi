import { FormEvent, useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

type Destinatario = {
  id: string;
  nome: string;
  telefoneFinal: string;
  unidade: {
    id: string;
    bloco: string;
    numero: string;
  };
};

type Encomenda = {
  id: string;
  status: 'pendente' | 'entregue' | 'extraviada';
  localArmazenamento: string;
  observacao: string | null;
  remetente: string | null;
  createdAt: string;
  unidade: {
    id: string;
    bloco: string;
    numero: string;
  };
  morador: {
    id: string;
    nome: string;
    telefoneFinal: string;
  };
};

type Feedback = {
  tipo: 'sucesso' | 'erro';
  mensagem: string;
};

function App() {
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [pendentes, setPendentes] = useState<Encomenda[]>([]);
  const [buscaDestinatario, setBuscaDestinatario] = useState('');
  const [moradorId, setMoradorId] = useState('');
  const [localArmazenamento, setLocalArmazenamento] = useState('');
  const [remetente, setRemetente] = useState('');
  const [observacao, setObservacao] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const destinatarioSelecionado = useMemo(
    () => destinatarios.find((destinatario) => destinatario.id === moradorId),
    [destinatarios, moradorId],
  );

  const destinatariosFiltrados = useMemo(() => {
    const termo = buscaDestinatario.trim().toLocaleLowerCase('pt-BR');

    if (!termo) {
      return destinatarios;
    }

    return destinatarios.filter((destinatario) => {
      const unidade = `${destinatario.unidade.bloco} ${destinatario.unidade.numero}`;
      const textoBusca = `${destinatario.nome} ${unidade} ${destinatario.telefoneFinal}`;

      return textoBusca.toLocaleLowerCase('pt-BR').includes(termo);
    });
  }, [buscaDestinatario, destinatarios]);

  const formularioBloqueado =
    carregando || salvando || destinatariosFiltrados.length === 0;

  const podeRegistrar =
    Boolean(destinatarioSelecionado) &&
    localArmazenamento.trim().length > 0 &&
    !salvando;

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      setFeedback(null);

      try {
        const [destinatariosResponse, pendentesResponse] = await Promise.all([
          fetch(`${API_URL}/encomendas/destinatarios`),
          fetch(`${API_URL}/encomendas/pendentes`),
        ]);

        if (!destinatariosResponse.ok || !pendentesResponse.ok) {
          throw new Error('Falha ao carregar dados da portaria.');
        }

        const [destinatariosData, pendentesData] = await Promise.all([
          destinatariosResponse.json() as Promise<Destinatario[]>,
          pendentesResponse.json() as Promise<Encomenda[]>,
        ]);

        setDestinatarios(destinatariosData);
        setPendentes(pendentesData);
        setMoradorId(destinatariosData[0]?.id ?? '');
      } catch {
        setFeedback({
          tipo: 'erro',
          mensagem: 'Não foi possível carregar a portaria agora.',
        });
      } finally {
        setCarregando(false);
      }
    }

    void carregarDados();
  }, []);

  useEffect(() => {
    if (
      destinatariosFiltrados.length > 0 &&
      !destinatariosFiltrados.some((destinatario) => destinatario.id === moradorId)
    ) {
      setMoradorId(destinatariosFiltrados[0].id);
    }
  }, [destinatariosFiltrados, moradorId]);

  async function registrarEncomenda(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!destinatarioSelecionado) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Selecione um destinatário cadastrado.',
      });
      return;
    }

    setSalvando(true);

    try {
      const response = await fetch(`${API_URL}/encomendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unidadeId: destinatarioSelecionado.unidade.id,
          moradorId: destinatarioSelecionado.id,
          localArmazenamento: localArmazenamento.trim(),
          remetente: remetente.trim(),
          observacao: observacao.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar encomenda.');
      }

      const novaEncomenda = (await response.json()) as Encomenda;
      setPendentes((atuais) => [novaEncomenda, ...atuais]);
      setLocalArmazenamento('');
      setRemetente('');
      setObservacao('');
      setFeedback({
        tipo: 'sucesso',
        mensagem: 'Encomenda registrada e adicionada aos pendentes.',
      });
    } catch {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Não foi possível registrar a encomenda.',
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Portaria · registro de encomenda</span>
          <h1>EntregaAí</h1>
        </div>
        <div className="summary-card" aria-label="Resumo da portaria">
          <span>Agora na portaria</span>
          <strong>{pendentes.length} pendentes</strong>
        </div>
      </header>

      <section className="workspace">
        <form className="panel register-panel" onSubmit={registrarEncomenda}>
          <div className="panel-heading">
            <span>Novo recebimento</span>
            <small>Informe quem deve retirar e onde a encomenda ficará guardada.</small>
          </div>

          <div className="field-group">
            <label>
              Buscar destinatário
              <input
                value={buscaDestinatario}
                onChange={(event) => setBuscaDestinatario(event.target.value)}
                placeholder="Nome, bloco, apartamento ou final do telefone"
                disabled={carregando || salvando}
              />
            </label>

            <label>
              Destinatário
              <select
                value={moradorId}
                onChange={(event) => setMoradorId(event.target.value)}
                disabled={formularioBloqueado}
              >
                {destinatariosFiltrados.map((destinatario) => (
                  <option key={destinatario.id} value={destinatario.id}>
                    Bloco {destinatario.unidade.bloco} - Ap.{' '}
                    {destinatario.unidade.numero} - {destinatario.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {destinatarioSelecionado ? (
            <aside className="recipient-card" aria-label="Destinatário selecionado">
              <div>
                <span>Destinatário</span>
                <strong>{destinatarioSelecionado.nome}</strong>
              </div>
              <div>
                <span>Unidade</span>
                <strong>
                  Bloco {destinatarioSelecionado.unidade.bloco} · Ap.{' '}
                  {destinatarioSelecionado.unidade.numero}
                </strong>
              </div>
              <div>
                <span>Validação</span>
                <strong>Final {destinatarioSelecionado.telefoneFinal}</strong>
              </div>
            </aside>
          ) : (
            <p className="empty compact">
              Nenhum destinatário encontrado para a busca informada.
            </p>
          )}

          <label>
            Local de armazenamento
            <input
              required
              value={localArmazenamento}
              onChange={(event) => setLocalArmazenamento(event.target.value)}
              placeholder="Ex.: Armário A, prateleira 2"
              disabled={salvando}
            />
          </label>

          <label>
            Remetente
            <input
              value={remetente}
              onChange={(event) => setRemetente(event.target.value)}
              placeholder="Ex.: Mercado Livre, Correios, Amazon"
              disabled={salvando}
            />
          </label>

          <label>
            Observação
            <textarea
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: Caixa grande, frágil, precisa ficar em pé"
              disabled={salvando}
            />
          </label>

          {feedback ? (
            <p
              className={`feedback ${feedback.tipo}`}
              role={feedback.tipo === 'erro' ? 'alert' : 'status'}
            >
              {feedback.mensagem}
            </p>
          ) : null}

          <button type="submit" disabled={carregando || !podeRegistrar}>
            {salvando ? 'Registrando...' : 'Registrar encomenda'}
          </button>
        </form>

        <section className="panel pending-panel">
          <div className="panel-heading">
            <span>Encomendas pendentes</span>
            <small>Mais recentes primeiro</small>
          </div>

          {carregando ? (
            <p className="empty">Carregando portaria...</p>
          ) : pendentes.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhuma encomenda pendente.</strong>
              <span>Quando um recebimento for registrado, ele aparecerá aqui.</span>
            </div>
          ) : (
            <ul className="pending-list">
              {pendentes.map((encomenda) => (
                <li key={encomenda.id}>
                  <div className="pending-main">
                    <div>
                      <strong>{encomenda.morador.nome}</strong>
                      <span>
                        Bloco {encomenda.unidade.bloco} · Ap.{' '}
                        {encomenda.unidade.numero}
                      </span>
                    </div>
                    <time dateTime={encomenda.createdAt}>
                      {formatarDataHora(encomenda.createdAt)}
                    </time>
                  </div>
                  <div className="pending-details">
                    <strong>{encomenda.localArmazenamento}</strong>
                    <span>
                      {encomenda.remetente ?? 'Sem remetente'} · final{' '}
                      {encomenda.morador.telefoneFinal}
                    </span>
                  </div>
                  {encomenda.observacao ? (
                    <p className="pending-note">{encomenda.observacao}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

function formatarDataHora(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default App;
