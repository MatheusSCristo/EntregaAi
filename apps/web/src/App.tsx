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
          localArmazenamento,
          remetente,
          observacao,
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
          <span className="eyebrow">Portaria</span>
          <h1>EntregaAi</h1>
        </div>
        <strong>{pendentes.length} pendentes</strong>
      </header>

      <section className="workspace">
        <form className="panel" onSubmit={registrarEncomenda}>
          <div className="panel-heading">
            <span>Novo recebimento</span>
            <small>Dados do condomínio piloto</small>
          </div>

          <label>
            Destinatário
            <select
              value={moradorId}
              onChange={(event) => setMoradorId(event.target.value)}
              disabled={carregando || salvando}
            >
              {destinatarios.map((destinatario) => (
                <option key={destinatario.id} value={destinatario.id}>
                  Bloco {destinatario.unidade.bloco} - Ap.{' '}
                  {destinatario.unidade.numero} - {destinatario.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Local de armazenamento
            <input
              required
              value={localArmazenamento}
              onChange={(event) => setLocalArmazenamento(event.target.value)}
              placeholder="Ex.: Prateleira 2"
              disabled={salvando}
            />
          </label>

          <label>
            Remetente
            <input
              value={remetente}
              onChange={(event) => setRemetente(event.target.value)}
              placeholder="Ex.: Mercado Livre"
              disabled={salvando}
            />
          </label>

          <label>
            Observação
            <textarea
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: Caixa grande"
              disabled={salvando}
            />
          </label>

          {feedback ? (
            <p className={`feedback ${feedback.tipo}`}>{feedback.mensagem}</p>
          ) : null}

          <button type="submit" disabled={carregando || salvando}>
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
            <p className="empty">Nenhuma encomenda pendente.</p>
          ) : (
            <ul className="pending-list">
              {pendentes.map((encomenda) => (
                <li key={encomenda.id}>
                  <div>
                    <strong>{encomenda.morador.nome}</strong>
                    <span>
                      Bloco {encomenda.unidade.bloco} - Ap.{' '}
                      {encomenda.unidade.numero}
                    </span>
                  </div>
                  <div>
                    <strong>{encomenda.localArmazenamento}</strong>
                    <span>
                      {encomenda.remetente ?? 'Sem remetente'} - final{' '}
                      {encomenda.morador.telefoneFinal}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
