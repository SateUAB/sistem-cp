import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Check, ChevronLeft, ChevronRight, Close, Warning } from '../icons';
import { prefersReducedMotion } from '../navigation';
import { trackDoc } from './trackDoc';
import { isoToBr } from '../../../utils/cp/dates';

const WEEK_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEK_LONG = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const PREVIEW = 5;
const UPCOMING_EMPTY = 'Todas as datas do cronograma já passaram. Clique em um dia marcado no calendário para rever as atividades.';

const Legend = () => (
    <div className="clg">
        <span><i className="publicacao" />Publicação</span>
        <span><i className="prazo" />Prazo do candidato</span>
        <span><i className="etapa" />Etapa</span>
        <span><i className="hoje" />Hoje</span>
        <span><i className="ok"><Check size={8} width={4} /></i>Publicado</span>
    </div>
);

const MonthCalendar = ({ month, index, total, onMonth, selected, onPick, full = false }) => (
    <>
        <div className="cnv">
            <button className="ib" type="button" aria-label="Mês anterior" disabled={index <= 0} onClick={() => onMonth(index - 1)} style={{ '--nx': '-2px' }}>
                <ChevronLeft />
            </button>
            <h3 aria-live="polite">{month.label}</h3>
            <button className="ib" type="button" aria-label="Próximo mês" disabled={index >= total - 1} onClick={() => onMonth(index + 1)} style={{ '--nx': '2px' }}>
                <ChevronRight />
            </button>
        </div>
        <div className="cwk" aria-hidden="true">
            {(full ? WEEK_LONG : WEEK_SHORT).map((day, i) => <span key={i}>{day}</span>)}
        </div>
        {/* The key replays the cascade of the days when the month changes */}
        <div className="cgr" key={full ? undefined : month.key}>
            {month.cells.map(cell => (cell.vazio ? (
                <span key={cell.key} className="cd vz" aria-hidden="true" />
            ) : (
                <button
                    key={cell.key}
                    className={`cd ${cell.cls}${cell.iso === selected ? ' sel' : ''}`}
                    type="button"
                    style={full ? { animation: 'none' } : { animationDelay: cell.delay }}
                    aria-label={cell.aria}
                    aria-pressed={cell.iso === selected}
                    disabled={!cell.tem}
                    onClick={() => onPick(cell.iso)}
                >
                    <span>{cell.n}</span>
                    <span className="dts" aria-hidden="true">{cell.dots.map(dot => <i key={dot.key} className={dot.cls} />)}</span>
                    {cell.publicado && <span className="okb" aria-hidden="true"><Check /></span>}
                    {!full && cell.tem && (
                        <span className={`tt${cell.tipLeft ? ' rt' : ''}`} aria-hidden="true">
                            <b>{cell.dataBr}</b>
                            {cell.tip.map(tip => <span key={tip.key}><i className={tip.cls} />{tip.titulo}</span>)}
                        </span>
                    )}
                </button>
            )))}
        </div>
        <Legend />
    </>
);

const itemClass = (item) => [
    item.cat === 'prazo' ? 'pz' : item.cat === 'etapa' ? 'et' : '',
    item.hoje ? 'hoje' : '',
    item.passou ? 'passou' : ''
].filter(Boolean).join(' ');

const ActivityRow = ({ call, item, delay }) => (
    <div className={`ci ${itemClass(item)}`} style={delay === undefined ? { animation: 'none' } : { animationDelay: `${delay}ms` }}>
        <div className="db" aria-hidden="true"><b>{item.dia}</b><span>{item.mes}</span></div>
        <div className="tx">
            <span className="sr-only">{item.periodo ? `De ${isoToBr(item.iso)} a ${isoToBr(item.fimIso)}` : isoToBr(item.iso)}.</span>
            <div className="mt"><span className={`bd ${item.bd}`}>{item.catLbl}</span><span className="rl">{item.rel}</span></div>
            <p>{item.titulo}</p>
            {item.doc?.url && (
                <a className="doc" href={item.doc.url} target="_blank" rel="noopener noreferrer" onClick={() => trackDoc(call, item.doc)}>
                    Ver documento publicado
                </a>
            )}
        </div>
    </div>
);

// What the list shows: the day picked in the calendar or, by default, what is coming next
const listFor = (crono, selected, limit) => {
    if (selected) {
        const items = crono.porDia[selected] || [];
        return { titulo: `Atividades em ${isoToBr(selected)}`, itens: items, vazia: items.length === 0, msg: 'Nenhuma atividade neste dia.', voltar: true };
    }
    const items = crono.proximas.slice(0, limit);
    return { titulo: 'Próximas atividades', itens: items, vazia: items.length === 0, msg: UPCOMING_EMPTY, voltar: false };
};

const focusableIn = (root) => Array.from(root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));

const CalendarModal = ({ call, crono, calendar, list, onShowUpcoming, onClose }) => {
    const panel = useRef(null);
    const closeButton = useRef(null);

    useEffect(() => {
        const opener = document.activeElement;
        closeButton.current?.focus();
        document.documentElement.classList.add('cp-lock');
        const onKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !panel.current) return;
            // Focus stays inside the dialog
            const items = focusableIn(panel.current);
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.documentElement.classList.remove('cp-lock');
            if (opener && typeof opener.focus === 'function') opener.focus();
        };
    }, [onClose]);

    const layer = document.getElementById('cp-layer') || document.body;

    return createPortal(
        <div className="mdl" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <div className="mdl-p" role="dialog" aria-modal="true" aria-labelledby="cp-mdl-title" ref={panel}>
                <div className="mdl-h">
                    <span className="crn-ic" aria-hidden="true"><Calendar size={20} /></span>
                    <div>
                        <h2 id="cp-mdl-title">Cronograma</h2>
                        <p>Chamada Pública {call.id}</p>
                    </div>
                    <button className="mdl-x" type="button" aria-label="Fechar" ref={closeButton} onClick={onClose}><Close /></button>
                </div>
                <div className="mdl-b ab">
                    <div>
                        <MonthCalendar {...calendar} full />
                    </div>
                    <div>
                        <div className="lh" style={{ marginBottom: 10 }}>
                            <h3>{list.titulo}</h3>
                            {list.voltar && <button className="lnk" type="button" onClick={onShowUpcoming}>Ver próximas</button>}
                        </div>
                        <div className="cls">
                            {list.itens.map(item => <ActivityRow key={item.key} call={call} item={item} />)}
                            {list.vazia && <p className="vazio">{list.msg}</p>}
                        </div>
                    </div>
                </div>
                <div className="mdl-f">
                    <a className="btn btn-g" href={crono.gcal} target="_blank" rel="noopener noreferrer">Adicionar ao Google Agenda</a>
                    <p>Todas as datas desta chamada, com atualização automática quando o cronograma mudar. <a href={crono.ics}>Outro calendário (iPhone, Outlook)</a></p>
                </div>
            </div>
        </div>,
        layer
    );
};

const Agenda = ({ call, crono }) => {
    const [monthIndex, setMonthIndex] = useState(crono.mesInicial);
    const [selected, setSelected] = useState(null);
    const [modal, setModal] = useState(false);
    const listRef = useRef(null);

    const index = Math.min(monthIndex, Math.max(0, crono.meses.length - 1));
    const month = crono.meses[index];

    const pick = (iso) => {
        setSelected(current => (current === iso ? null : iso));
        // One column: bring the list into view
        if (!modal && window.matchMedia('(max-width: 980px)').matches && listRef.current) {
            listRef.current.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
        }
    };
    const showUpcoming = () => setSelected(null);
    const closeModal = useCallback(() => setModal(false), []);

    const calendar = { month, index, total: crono.meses.length, onMonth: setMonthIndex, selected, onPick: pick };
    const list = listFor(crono, selected, PREVIEW);
    const listKey = selected || 'proximas';

    return (
        <div className="ab-cols">
            <div className="ab-col">
                <section className="ab-sec ab-first" style={{ animationDelay: '60ms' }} aria-label="Calendário">
                    <div className="ab-lbl">Calendário <span>{crono.sub}</span></div>
                    <div>
                        {crono.adendo ? (
                            <div className="aviso" role="note">
                                <Warning />
                                <span>
                                    Datas atualizadas conforme{' '}
                                    {crono.adendo.url
                                        ? <a href={crono.adendo.url} target="_blank" rel="noopener noreferrer" onClick={() => trackDoc(call, crono.adendo.doc)}>{crono.adendo.nome}</a>
                                        : <b>{crono.adendo.nome}</b>}
                                    , publicado em {crono.adendo.data}. Elas substituem as datas do edital.
                                </span>
                            </div>
                        ) : (
                            <p className="crn-note">Datas conforme o edital.</p>
                        )}
                        {month && <MonthCalendar {...calendar} />}
                    </div>
                </section>
            </div>
            <div className="ab-col">
                <section className="ab-sec" style={{ animationDelay: '160ms' }} aria-label={list.titulo} ref={listRef}>
                    <div className="ab-lbl">{list.titulo}</div>
                    <div>
                        {list.voltar && <button className="lnk" type="button" onClick={showUpcoming} style={{ marginTop: -12 }}>← Ver próximas</button>}
                        <div className="crn-fade" key={listKey}>
                            {list.itens.map((item, i) => <ActivityRow key={item.key} call={call} item={item} delay={i * 60} />)}
                            {list.vazia && <p className="sub2">{list.msg}</p>}
                        </div>
                        <div className="cact2">
                            <button className="btn btn-p" type="button" onClick={() => setModal(true)}>Ver calendário completo</button>
                            <a className="btn btn-g" href={crono.gcal} target="_blank" rel="noopener noreferrer">Adicionar ao Google Agenda</a>
                            <p>Todas as datas desta chamada, com atualização automática quando o cronograma mudar. <a href={crono.ics}>Outro calendário (iPhone, Outlook)</a></p>
                        </div>
                    </div>
                </section>
            </div>
            {modal && month && (
                <CalendarModal
                    call={call}
                    crono={crono}
                    calendar={calendar}
                    list={listFor(crono, selected, Infinity)}
                    onShowUpcoming={showUpcoming}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

const CronogramaTab = ({ call, crono, onGo }) => {
    if (!crono || !crono.itens.length) {
        return (
            <section className="ab-sec ab-first">
                <div className="ab-lbl">Cronograma</div>
                <div>
                    <p className="big2">Sem cronograma cadastrado</p>
                    <p className="sub2">As datas cumpridas desta chamada estão em Publicações.</p>
                    <button className="btn btn-g" type="button" style={{ marginTop: 20 }} onClick={() => onGo(2)}>Ver publicações</button>
                </div>
            </section>
        );
    }
    return <Agenda call={call} crono={crono} />;
};

export default CronogramaTab;
