import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Close, Warning } from '../icons';

const STORAGE_PREFIX = 'cp-aviso:';
const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

const focusableIn = (root) => Array.from(root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));

const wasClosed = (callId, signature) => {
    try {
        return sessionStorage.getItem(STORAGE_PREFIX + callId) === signature;
    } catch {
        return false;
    }
};

const remember = (callId, signature) => {
    try {
        sessionStorage.setItem(STORAGE_PREFIX + callId, signature);
    } catch {
        // storage blocked: the notice will simply show again on the next visit
    }
};

// Marks of a span (bold, italic, underline, link), from the inside out
const renderSpan = (span, defs, key) => {
    let node = span.text;
    (span.marks || []).forEach((mark) => {
        if (mark === 'strong') node = <strong>{node}</strong>;
        else if (mark === 'em') node = <em>{node}</em>;
        else if (mark === 'underline') node = <u>{node}</u>;
        else {
            const def = defs.find(item => item._key === mark);
            if (def?._type === 'link' && SAFE_HREF.test(def.href || '')) {
                node = <a href={def.href} target="_blank" rel="noopener noreferrer">{node}</a>;
            }
        }
    });
    return <React.Fragment key={key}>{node}</React.Fragment>;
};

const renderBlock = (block) => (block.children || []).map((span, i) => renderSpan(span, block.markDefs || [], i));

// Portable Text with what the Studio allows: paragraphs, lists, bold, italic, underline and links
export const NoticeText = ({ body }) => {
    const out = [];
    let list = null;
    body.forEach((block, i) => {
        if (block.listItem) {
            const ordered = block.listItem === 'number';
            if (!list || list.ordered !== ordered) {
                list = { ordered, items: [], key: block._key || `l${i}` };
                out.push(list);
            }
            list.items.push(<li key={block._key || i}>{renderBlock(block)}</li>);
            return;
        }
        list = null;
        out.push(<p key={block._key || i}>{renderBlock(block)}</p>);
    });
    return out.map(item => {
        if (!item.items) return item;
        const Tag = item.ordered ? 'ol' : 'ul';
        return <Tag key={item.key}>{item.items}</Tag>;
    });
};

const NoticeDialog = ({ notice, onClose }) => {
    const panel = useRef(null);
    const confirm = useRef(null);

    useEffect(() => {
        const opener = document.activeElement;
        confirm.current?.focus();
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
        <div className="mdl avm" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <div className="avp" role="alertdialog" aria-modal="true" aria-labelledby="cp-aviso-title" aria-describedby="cp-aviso-text" ref={panel}>
                <div className="avp-h">
                    <span className="avp-ic" aria-hidden="true"><Warning size={24} /></span>
                    <h2 id="cp-aviso-title">{notice.title}</h2>
                    <button className="avp-x" type="button" aria-label="Fechar aviso" onClick={onClose}><Close /></button>
                </div>
                <div className="avp-b" id="cp-aviso-text"><NoticeText body={notice.body} /></div>
                <div className="avp-f">
                    <button className="btn btn-p" type="button" ref={confirm} onClick={onClose}>Entendi</button>
                </div>
            </div>
        </div>,
        layer
    );
};

// Warning written in the Studio for this call: opens in a pop-up and stays one click away afterwards.
// The page keys it by `aviso.signature`, so edited text opens again for someone who closed the old one.
const CallNotice = ({ call }) => {
    const notice = call.aviso;
    const [open, setOpen] = useState(() => Boolean(notice) && !wasClosed(call.id, notice.signature));

    const close = useCallback(() => {
        setOpen(false);
        if (notice) remember(call.id, notice.signature);
    }, [call.id, notice]);

    if (!notice) return null;

    return (
        <>
            {!open && (
                <button className="avb" type="button" onClick={() => setOpen(true)}>
                    <Warning size={16} />
                    <span><b>{notice.title}</b> · Ler o aviso</span>
                </button>
            )}
            {open && <NoticeDialog notice={notice} onClose={close} />}
        </>
    );
};

export default CallNotice;
