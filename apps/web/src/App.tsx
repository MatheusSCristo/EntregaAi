import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';

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

type CamposEtiqueta = {
  bloco: string;
  unidade: string;
  destinatario: string;
};

type LeituraEtiqueta = {
  campos: { [Campo in keyof CamposEtiqueta]: string | null } | null;
  sugestao: Destinatario | null;
};

const camposVazios: CamposEtiqueta = { bloco: '', unidade: '', destinatario: '' };
const limiteFoto = 5 * 1024 * 1024;
const formatosFoto = 'image/jpeg,image/png,image/webp';

function normalizarBusca(texto: string) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

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
  const [camposEtiqueta, setCamposEtiqueta] = useState<CamposEtiqueta | null>(null);
  const [lendoEtiqueta, setLendoEtiqueta] = useState(false);
  const [feedbackLeitura, setFeedbackLeitura] = useState<Feedback | null>(null);
  const camera = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const [retiradaId, setRetiradaId] = useState<string | null>(null);
  const [feedbackRetirada, setFeedbackRetirada] = useState('');
  const retiradaAberta = pendentes.some(({ id }) => id === retiradaId);

  const destinatariosFiltrados = useMemo(() => {
    if (camposEtiqueta) {
      const bloco = normalizarBusca(camposEtiqueta.bloco);
      const unidade = normalizarBusca(camposEtiqueta.unidade);
      const nome = normalizarBusca(camposEtiqueta.destinatario);
      return destinatarios.filter((destinatario) =>
        normalizarBusca(destinatario.unidade.bloco).includes(bloco) &&
        normalizarBusca(destinatario.unidade.numero).includes(unidade) &&
        normalizarBusca(destinatario.nome).includes(nome),
      );
    }

    const termo = normalizarBusca(buscaDestinatario);

    if (!termo) {
      return destinatarios;
    }

    return destinatarios.filter((destinatario) => {
      const unidade = `${destinatario.unidade.bloco} ${destinatario.unidade.numero}`;
      const textoBusca = `${destinatario.nome} ${unidade} ${destinatario.telefoneFinal}`;

      return normalizarBusca(textoBusca).includes(termo);
    });
  }, [buscaDestinatario, camposEtiqueta, destinatarios]);

  const destinatarioSelecionado = destinatariosFiltrados.find((destinatario) => destinatario.id === moradorId);
  const destinatarioBloqueado = carregando || salvando || lendoEtiqueta;

  const podeRegistrar =
    Boolean(destinatarioSelecionado) &&
    localArmazenamento.trim().length > 0 &&
    !destinatarioBloqueado;

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
      !camposEtiqueta &&
      destinatariosFiltrados.length > 0 &&
      !destinatariosFiltrados.some((destinatario) => destinatario.id === moradorId)
    ) {
      setMoradorId(destinatariosFiltrados[0].id);
    }
  }, [camposEtiqueta, destinatariosFiltrados, moradorId]);

  function corrigirCampos(campos: CamposEtiqueta) {
    setCamposEtiqueta(campos);
    setMoradorId('');
  }

  async function lerEtiqueta(event: ChangeEvent<HTMLInputElement>) {
    const foto = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!foto || destinatarioBloqueado) return;

    setFeedback(null);
    setFeedbackLeitura(null);
    setBuscaDestinatario('');
    corrigirCampos(camposVazios);

    if (foto.size > limiteFoto) {
      setFeedbackLeitura({ tipo: 'erro', mensagem: 'A foto excede 5 MiB. Escolha outra ou preencha manualmente.' });
      return;
    }

    setLendoEtiqueta(true);
    const dados = new FormData();
    dados.append('foto', foto);
    try {
      const response = await fetch(`${API_URL}/encomendas/leitura-etiqueta`, {
        method: 'POST',
        body: dados,
        signal: AbortSignal.timeout(25_000),
      });
      if (response.status === 400) {
        setFeedbackLeitura({ tipo: 'erro', mensagem: 'Use uma foto JPEG, PNG ou WebP válida, ou preencha manualmente.' });
        return;
      }
      if (response.status === 413) {
        setFeedbackLeitura({ tipo: 'erro', mensagem: 'A foto excede o limite de tamanho. Escolha outra ou preencha manualmente.' });
        return;
      }
      if (!response.ok) throw new Error('Falha na leitura de etiqueta.');

      const { campos, sugestao } = await response.json() as LeituraEtiqueta;
      setCamposEtiqueta({
        bloco: campos?.bloco ?? '',
        unidade: campos?.unidade ?? '',
        destinatario: campos?.destinatario ?? '',
      });
      const cadastrada = sugestao && destinatarios.some(({ id }) => id === sugestao.id);
      setMoradorId(cadastrada ? sugestao.id : '');
      setFeedbackLeitura(cadastrada
        ? { tipo: 'sucesso', mensagem: 'Confira o destinatário e a unidade antes de registrar.' }
        : { tipo: 'erro', mensagem: 'Leitura inconclusiva. Corrija os dados e selecione um destinatário cadastrado.' });
    } catch {
      setFeedbackLeitura({ tipo: 'erro', mensagem: 'Não foi possível ler a etiqueta. Tente outra foto ou preencha manualmente.' });
    } finally {
      setLendoEtiqueta(false);
    }
  }

  async function registrarEncomenda(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (destinatarioBloqueado) return;
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
      setCamposEtiqueta(null);
      setFeedbackLeitura(null);
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
        <form className={`panel register-panel${camposEtiqueta ? ' leitura-aberta' : ''}`} onSubmit={registrarEncomenda}>
          <div className="panel-heading">
            <span>Novo recebimento</span>
            <small>Informe quem deve retirar e onde a encomenda ficará guardada.</small>
          </div>

          <div className="field-group" aria-label="Foto da etiqueta">
            <div className="photo-actions">
              <button type="button" className="secondary-button" disabled={destinatarioBloqueado}
                onClick={() => camera.current?.click()}>
                Fotografar etiqueta
              </button>
              <button type="button" className="secondary-button" disabled={destinatarioBloqueado}
                onClick={() => galeria.current?.click()}>
                Selecionar foto
              </button>
            </div>
            <input ref={camera} type="file" aria-label="Câmera" accept={formatosFoto}
              capture="environment" hidden onChange={lerEtiqueta} />
            <input ref={galeria} type="file" aria-label="Galeria" accept={formatosFoto}
              hidden onChange={lerEtiqueta} />
            {lendoEtiqueta && <p className="empty" role="status">Lendo etiqueta...</p>}
            {feedbackLeitura && (
              <p className={`feedback ${feedbackLeitura.tipo}`}
                role={feedbackLeitura.tipo === 'erro' ? 'alert' : 'status'}>
                {feedbackLeitura.mensagem}
              </p>
            )}
          </div>

          <div className="field-group">
            {camposEtiqueta ? (
              <fieldset className="label-fields" disabled={destinatarioBloqueado}>
                <legend>Dados da etiqueta</legend>
                <div className="label-address">
                  <label>
                    Bloco
                    <input value={camposEtiqueta.bloco}
                      onChange={(event) => corrigirCampos({ ...camposEtiqueta, bloco: event.target.value })} />
                  </label>
                  <label>
                    Unidade
                    <input value={camposEtiqueta.unidade}
                      onChange={(event) => corrigirCampos({ ...camposEtiqueta, unidade: event.target.value })} />
                  </label>
                </div>
                <label>
                  Nome na etiqueta
                  <input value={camposEtiqueta.destinatario}
                    onChange={(event) => corrigirCampos({ ...camposEtiqueta, destinatario: event.target.value })} />
                </label>
                {Object.values(camposEtiqueta).some(Boolean) && (
                  <button type="button" className="secondary-button clear-label"
                    onClick={() => corrigirCampos(camposVazios)}>
                    Limpar dados da etiqueta
                  </button>
                )}
              </fieldset>
            ) : <label>
              Buscar destinatário
              <input
                value={buscaDestinatario}
                onChange={(event) => setBuscaDestinatario(event.target.value)}
                placeholder="Nome, bloco, apartamento ou final do telefone"
                disabled={carregando || salvando}
              />
            </label>}

            <label>
              Destinatário
              <select
                value={destinatarioSelecionado?.id ?? ''}
                onChange={(event) => setMoradorId(event.target.value)}
                disabled={destinatarioBloqueado || destinatariosFiltrados.length === 0}
              >
                <option value="" disabled>Selecione um destinatário</option>
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
          ) : destinatariosFiltrados.length === 0 && !destinatarioBloqueado ? (
            <p className="empty compact">
              Nenhum destinatário encontrado para a busca informada.
            </p>
          ) : null}

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
