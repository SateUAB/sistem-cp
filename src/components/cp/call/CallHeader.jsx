import React, { useEffect, useState } from 'react';
import { Download } from '../icons';
import { prefersReducedMotion } from '../navigation';
import { trackAppealClick, trackEditalDownload, trackExemptionClick, trackSubscriptionClick } from '../../../utils/analytics';

// The call number counts from 0 while it rises through its mask (1.1s, ease-out)
// (the page remounts this header for each call, so the count starts from zero every time)
const useCountTo = (num) => {
    const target = parseInt(num, 10) || 0;
    const [animate] = useState(() => !prefersReducedMotion() && target > 0);
    const [shown, setShown] = useState(() => (animate ? '0'.padStart(num.length, '0') : null));
    useEffect(() => {
        if (!animate) return undefined;
        let frame;
        const start = performance.now();
        const step = (now) => {
            const k = Math.min(1, (now - start) / 1100);
            const eased = 1 - Math.pow(1 - k, 4);
            setShown(k >= 1 ? null : String(Math.round(target * eased)).padStart(num.length, '0'));
            if (k < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [num, target, animate]);
    return shown === null ? num : shown;
};

// 35/2026 had an exemption request period (kept from the previous header)
const EXEMPTION = {
    callId: '35/2026',
    href: 'https://forms.gle/aXGgN4hmwMzHHcsV6',
    closesAt: new Date('2026-06-04T01:00:00-03:00'),
    caption: 'Período de isenção: 01/06/2026 até 03/06/2026'
};

const Disabled = ({ children }) => (
    <span className="btn btn-g" role="link" aria-disabled="true">{children}</span>
);

// Header "1+3": number and situation on the left; name, official title, buttons and the info strip on the right
const CallHeader = ({ call }) => {
    const number = useCountTo(call.num);
    const edital = call.edital;
    const exemption = call.id === EXEMPTION.callId;
    const exemptionOpen = exemption && new Date() < EXEMPTION.closesAt;

    return (
        <header className="hx hx5">
            <div className="hx5-l">
                <span className="eyb">Chamada pública</span>
                <div className="hx5-n mono" aria-hidden="true">
                    <span className="mk"><span>{number}</span></span>
                    {call.ano && <small>/{call.ano}</small>}
                </div>
                <span className="sr-only">Chamada pública {call.id}</span>
                <span className={`st ${call.statusKey}`}><i />{call.status}</span>
            </div>

            <div className="hx5-r">
                <h1>{call.nome}</h1>
                <p className="ofc">Título oficial: {call.titulo}</p>

                <div style={{ marginTop: 24 }}>
                    <div className="acts2">
                        {edital?.url && (
                            <a
                                className="btn btn-p"
                                href={edital.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEditalDownload({ editalId: call.id, editalTitle: edital.rawTitle || 'Edital', fileUrl: edital.url })}
                            >
                                <Download />Baixar edital
                            </a>
                        )}
                        {call.aberta && (call.insc ? (
                            <a
                                className="btn btn-g"
                                href={call.insc}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackSubscriptionClick({ editalId: call.id, link: call.insc })}
                            >
                                Fazer inscrição
                            </a>
                        ) : <Disabled>Inscrição: link indisponível</Disabled>)}
                        {call.andamento && call.rec && (
                            <a
                                className="btn btn-g"
                                href={call.rec}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackAppealClick({ editalId: call.id, link: call.rec })}
                            >
                                Interpor recurso
                            </a>
                        )}
                        {exemption && (exemptionOpen ? (
                            <a
                                className="btn btn-g"
                                href={EXEMPTION.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackExemptionClick({ editalId: call.id, link: EXEMPTION.href })}
                            >
                                Solicitar isenção
                            </a>
                        ) : <Disabled>Solicitar isenção (encerrado)</Disabled>)}
                    </div>
                    {exemption && <p className="acts-note">{EXEMPTION.caption}</p>}
                </div>

                <div className="meta2">
                    <div><small>Função</small><b>{call.funcao || '—'}</b></div>
                    <div><small>Curso</small><b>{call.curso || '—'}</b></div>
                    <div><small>Inscrição</small><b>{call.inscricao}</b></div>
                    <div><small>Encerramento</small><b className="mono">{call.fim}</b></div>
                </div>
            </div>
        </header>
    );
};

export default CallHeader;
