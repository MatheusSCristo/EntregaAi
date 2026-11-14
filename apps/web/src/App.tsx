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
  const [carregandoPendentes, setCarregandoPendentes] = useState(true);
  const [erroPendentes, setErroPendentes] = useState(false);
  const [tentativaPendentes, setTentativaPendentes] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [retiradaId, setRetiradaId] = useState<string | null>(null);
  const [feedbackRetirada, setFeedbackRetirada] = useState('');
  const retiradaAberta = pendentes.some(({ id }) => id === retiradaId);

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
        const destinatariosResponse = await fetch(`${API_URL}/encomendas/destinatarios`);

        if (!destinatariosResponse.ok) {
          throw new Error('Falha ao carregar dados da portaria.');
        }

        const destinatariosData = await destinatariosResponse.json() as Destinatario[];

        setDestinatarios(destinatariosData);
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
    const controller = new AbortController();

    async function carregarPendentes() {
      setCarregandoPendentes(true);
      setErroPendentes(false);

      try {
        const response = await fetch(`${API_URL}/encomendas/pendentes`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Falha ao carregar pendentes.');
        const dados = await response.json() as Encomenda[];
        if (!controller.signal.aborted) setPendentes(dados);
      } catch {
        if (!controller.signal.aborted) setErroPendentes(true);
      } finally {
        if (!controller.signal.aborted) setCarregandoPendentes(false);
      }
    }

    void carregarPendentes();
    return () => controller.abort();
  }, [tentativaPendentes]);

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
      setTentativaPendentes((atual) => atual + 1);
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

  function concluirRetirada(encomenda: Encomenda) {
    setPendentes((atuais) => atuais.filter(({ id }) => id !== encomenda.id));
    setRetiradaId(null);
    setFeedbackRetirada(`Retirada registrada para ${encomenda.morador.nome}.`);
    setTentativaPendentes((atual) => atual + 1);
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
          <strong>{carregandoPendentes ? 'Carregando...' : erroPendentes ? 'Lista indisponível' : `${pendentes.length} pendentes`}</strong>
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

        <section className="panel pending-panel" aria-label="Encomendas pendentes" aria-busy={carregandoPendentes}>
          <div className="panel-heading">
            <span>Encomendas pendentes</span>
            <small>Mais recentes primeiro</small>
          </div>

          {feedbackRetirada && <p className="feedback sucesso" role="status">{feedbackRetirada}</p>}

          {carregandoPendentes && pendentes.length === 0 ? (
            <p className="empty" role="status">Carregando encomendas pendentes...</p>
          ) : erroPendentes ? (
            <div className="empty-state">
              <p role="alert">Não foi possível carregar as encomendas pendentes.</p>
              <button type="button" onClick={() => setTentativaPendentes((atual) => atual + 1)}>
                Tentar novamente
              </button>
            </div>
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
                      {encomenda.remetente ?? 'Sem remetente'}
                    </span>
                  </div>
                  {encomenda.observacao ? (
                    <p className="pending-note">{encomenda.observacao}</p>
                  ) : null}
                  {retiradaId === encomenda.id ? (
                    <FormularioRetirada
                      encomendaId={encomenda.id}
                      onCancelar={() => setRetiradaId(null)}
                      onSucesso={() => concluirRetirada(encomenda)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="pending-action"
                      disabled={retiradaAberta}
                      onClick={() => {
                        setFeedbackRetirada('');
                        setRetiradaId(encomenda.id);
                      }}
                    >
                      Registrar retirada
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

type FormularioRetiradaProps = {
  encomendaId: string;
  onCancelar: () => void;
  onSucesso: () => void;
};

function FormularioRetirada({ encomendaId, onCancelar, onSucesso }: FormularioRetiradaProps) {
  const [metodo, setMetodo] = useState<'telefone' | 'manual'>('telefone');
  const [codigo, setCodigo] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function confirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    const motivo = justificativa.trim();
    if (metodo === 'manual' && !motivo) {
      setErro('Informe a justificativa da retirada manual.');
      return;
    }
    if (metodo === 'telefone' && !/^[0-9]{4}$/.test(codigo)) {
      setErro('Informe os quatro últimos dígitos do telefone.');
      return;
    }

    setErro('');
    setEnviando(true);
    const dados = metodo === 'manual' ? { metodo, justificativa: motivo } : { metodo, codigo };
    const mensagemPadrao = 'Não foi possível registrar a retirada.';

    try {
      const response = await fetch(`${API_URL}/encomendas/${encodeURIComponent(encomendaId)}/retirada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (response.ok) {
        onSucesso();
        return;
      }

      const erroApi = await response.json().catch(() => null);
      setErro(response.status < 500 && typeof erroApi?.message === 'string'
        ? erroApi.message
        : mensagemPadrao);
    } catch {
      setErro(mensagemPadrao);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="withdrawal-form" onSubmit={confirmar} aria-label="Registrar retirada">
      <label>
        Método de retirada
        <select
          value={metodo}
          disabled={enviando}
          onChange={(event) => {
            setMetodo(event.target.value === 'manual' ? 'manual' : 'telefone');
            setErro('');
          }}
        >
          <option value="telefone">Final do telefone</option>
          <option value="manual">Retirada manual</option>
        </select>
      </label>
      {metodo === 'telefone' ? (
        <label>
          Últimos quatro dígitos do telefone
          <input
            autoComplete="off"
            inputMode="numeric"
            maxLength={4}
            required
            value={codigo}
            disabled={enviando}
            onChange={(event) => setCodigo(event.target.value)}
          />
        </label>
      ) : (
        <label>
          Justificativa da retirada manual
          <textarea
            required
            value={justificativa}
            disabled={enviando}
            onChange={(event) => setJustificativa(event.target.value)}
          />
        </label>
      )}
      {erro && <p className="feedback erro" role="alert">{erro}</p>}
      <div className="withdrawal-actions">
        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando...' : 'Confirmar retirada'}
        </button>
        <button type="button" className="secondary-button" disabled={enviando} onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function formatarDataHora(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default App;
