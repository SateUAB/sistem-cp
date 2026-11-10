import React from 'react';
import { ArrowUpRight, Download } from '../icons';
import { trackDoc } from './trackDoc';

// One publication: date square (day + month), full date above, big title, download button
const PubRow = ({ call, doc, mini = false, delay }) => {
    const className = `pub${mini ? ' mini' : ''}`;
    const style = delay === undefined ? undefined : { animationDelay: `${delay}ms` };
    const content = (
        <>
            <span className="pd" aria-hidden="true"><b className="mono">{doc.dia}</b><span>{doc.mes}</span></span>
            <span className="pt"><small>{doc.data}</small><strong>{doc.titulo}</strong></span>
            {doc.url && (
                <span className="pg" aria-hidden="true">{doc.ext === 'PDF' ? <Download size={18} /> : <ArrowUpRight size={18} />}</span>
            )}
        </>
    );

    if (!doc.url) {
        return <div className={className} style={style}>{content}</div>;
    }

    return (
        <a
            className={className}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            style={style}
            aria-label={`${doc.titulo}, publicado em ${doc.data}${doc.ext === 'PDF' ? ' (PDF, abre em nova aba)' : ' (abre em nova aba)'}`}
            onClick={() => trackDoc(call, doc)}
        >
            {content}
        </a>
    );
};

export default PubRow;
