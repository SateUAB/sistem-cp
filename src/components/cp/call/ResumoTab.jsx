import React, { useId, useState } from 'react';
import { ArrowRight, ChevronDown } from '../icons';
import PubRow from './PubRow';
import { trackDoc } from './trackDoc';
import { shortDate } from '../../../utils/cp/dates';

// Edital, adendos and (once closed) the final result; at most four
const keyDocuments = (call) => {
    const finalResult = call.encerrada ? call.resultadoFinal : null;
    const room = 4 - (call.edital ? 1 : 0) - (finalResult ? 1 : 0);
    const adendos = call.adendos.filter(doc => doc !== call.edital).slice(0, Math.max(0, room)).reverse();
    return [call.edital, ...adendos, finalResult].filter(Boolean);
};

const About = ({ call }) => {
    const [open, setOpen] = useState(false);
    const id = useId();
    const hasFullText = Boolean(call.descricao) && call.descricao !== call.resumo;
    if (!call.resumo && !call.descricao) return null;

    return (
        <section className="ab-sec" style={{ animationDelay: '120ms' }}>
            <div className="ab-lbl">Sobre a chamada</div>
            <div>
                <p className="txt2">{call.resumo || call.descricao}</p>
                {hasFullText && (
                    <>
                        <button className="more" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
                            {open ? 'Fechar o texto completo' : 'Ler o texto completo'}
                            <ChevronDown />
                        </button>
                        {open && <p className="full-txt" id={id}>{call.descricao}</p>}
                    </>
                )}
            </div>
        </section>
    );
};

const ResumoTab = ({ call, situation, onGo }) => {
    const docs = keyDocuments(call);
    const { proxima, dias, link } = situation;

    return (
        <div className="ab-cols">
            <div className="ab-col">
                <section className="ab-sec ab-first" style={{ animationDelay: '60ms' }}>
                    <div className="ab-lbl">Situação</div>
                    <div>
                        <p className="eyb" style={{ color: '#0A7A66' }}>{situation.eyb}</p>
                        <p className="big2" style={{ marginTop: 10 }}>{situation.titulo}</p>
                        {situation.sub && <p className="sub2">{situation.sub}</p>}
                        {proxima && dias !== null && (
                            <div className="nxt">
                                <b>{dias}</b>
                                <div>
                                    <small>{dias === 1 ? 'dia' : 'dias'} até o próximo passo</small>
                                    <p>{proxima.titulo} · {shortDate(proxima.iso)}</p>
                                </div>
                            </div>
                        )}
                        <div className="acts2" style={{ marginTop: 24 }}>
                            {link && (
                                <a className="btn btn-k" href={link.doc.url} target="_blank" rel="noopener noreferrer" onClick={() => trackDoc(call, link.doc)}>
                                    {link.label}
                                </a>
                            )}
                            {call.temAgenda ? (
                                <button className="btn btn-g" type="button" onClick={() => onGo(1)}>
                                    Ver cronograma<ArrowRight className="mv" />
                                </button>
                            ) : call.nDocs > 0 && (
                                <button className="btn btn-g" type="button" onClick={() => onGo(2)}>
                                    Ver publicações<ArrowRight className="mv" />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="ab-sec" style={{ animationDelay: '180ms' }}>
                    <div className="ab-lbl">Informações</div>
                    <dl className="dl2">
                        <div><dt>Publicação do edital</dt><dd className="mono">{call.pub}</dd></div>
                        <div><dt>Período de inscrição</dt><dd>{call.inscricao}</dd></div>
                        <div><dt>Encerramento previsto</dt><dd className="mono">{call.fim}</dd></div>
                        <div><dt>Adendos</dt><dd>{call.mudancas}</dd></div>
                    </dl>
                </section>
            </div>

            <div className="ab-col">
                <About call={call} />
                {docs.length > 0 && (
                    <section className="ab-sec" style={{ animationDelay: '240ms' }}>
                        <div className="ab-lbl">Documentos-chave <span>{docs.length}</span></div>
                        <div>
                            <div className="pubs">
                                {docs.map(doc => <PubRow key={doc.key} call={call} doc={doc} mini />)}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ResumoTab;
