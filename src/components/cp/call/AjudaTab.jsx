import React from 'react';
import { longDate } from '../../../utils/cp/dates';

// Contact and signatures kept from the previous page: 35/2026 answers on its own address,
// and the UAB coordination changed on 05/05/2026.
const contactEmail = (call) => (call.id === '35/2026' ? 'cp.graduacao@uece.br' : 'cp.sate@uece.br');
const uabCoordination = (call) => (call.pubIso && call.pubIso >= '2026-05-05'
    ? { role: 'Coordenadora da UAB', name: 'Pâmela Felix Freitas' }
    : { role: 'Coordenador da UAB', name: 'Francisco Fábio Castelo Branco' });

const AjudaTab = ({ call }) => {
    const email = contactEmail(call);
    const uab = uabCoordination(call);

    return (
        <div className="ab-cols c3">
            <div className="ab-col">
                <section className="ab-sec ab-first" style={{ animationDelay: '60ms' }}>
                    <div className="ab-lbl">Antes de se inscrever</div>
                    <ul className="tips2">
                        <li><i>01</i>Use um e-mail Gmail</li>
                        <li><i>02</i>Envie os arquivos em PDF</li>
                        <li><i>03</i>No máximo 1 MB por arquivo</li>
                    </ul>
                </section>
            </div>
            <div className="ab-col">
                <section className="ab-sec" style={{ animationDelay: '140ms' }}>
                    <div className="ab-lbl">Dúvidas</div>
                    <div>
                        <p className="sub2" style={{ marginTop: 0 }}>Escreva para a equipe de chamadas públicas:</p>
                        <p className="big2" style={{ fontSize: 26, marginTop: 10, overflowWrap: 'anywhere' }}>
                            <a href={`mailto:${email}`}>{email}</a>
                        </p>
                    </div>
                </section>
            </div>
            <div className="ab-col">
                <section className="ab-sec" style={{ animationDelay: '220ms' }}>
                    <div className="ab-lbl">Coordenação</div>
                    <dl className="dl2" style={{ gridTemplateColumns: '1fr' }}>
                        <div><dt>{uab.role}</dt><dd>{uab.name}</dd></div>
                        <div><dt>Coordenador da SATE</dt><dd>João Rameres Regis</dd></div>
                    </dl>
                    {call.pubIso && <p className="sig">Fortaleza, {longDate(call.pubIso)}</p>}
                </section>
            </div>
        </div>
    );
};

export default AjudaTab;
