import React, { useState } from 'react';
import PubRow from './PubRow';
import { docKinds } from '../../../utils/cp/call';

const ALL = 'Todos';

// One running list, most recent first. The type only shows in the filters.
const PublicacoesTab = ({ call }) => {
    const [kind, setKind] = useState(ALL);
    const kinds = [ALL, ...docKinds(call.docs)];
    const docs = call.docsRev.filter(doc => kind === ALL || doc.tipo === kind);

    if (call.nDocs === 0) {
        return (
            <section className="ab-sec ab-first">
                <div className="ab-lbl">Publicações</div>
                <div>
                    <p className="big2">Nenhuma publicação ainda</p>
                    <p className="sub2">Os documentos desta chamada aparecem aqui assim que forem publicados.</p>
                </div>
            </section>
        );
    }

    return (
        <>
            {kinds.length > 2 && (
                <div className="filt2" role="group" aria-label="Tipo de publicação">
                    {kinds.map(option => (
                        <button key={option} className={option === kind ? 'on' : ''} type="button" aria-pressed={option === kind} onClick={() => setKind(option)}>
                            {option}
                        </button>
                    ))}
                </div>
            )}
            {/* The key restarts the cascade every time the filter changes */}
            <div className="pubs" style={{ paddingTop: 16 }} key={kind}>
                {docs.map((doc, index) => <PubRow key={doc.key} call={call} doc={doc} delay={Math.min(index, 12) * 40} />)}
            </div>
        </>
    );
};

export default PublicacoesTab;
