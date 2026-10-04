// Data shown in the header of a call

export const STEPS = ['Publicado', 'Período de Inscrição', 'Em Processo', 'Encerrado'];

// The edital is the only highlighted document: it goes in the header, away from "Resultados e Fases"
export const isEdital = (post) => post.title?.trim().toLowerCase() === 'edital';

const getPeriod = (call) => {
    if (call.startDate && call.subscriptionEndDate) return `${call.startDate} até ${call.subscriptionEndDate}`;
    if (call.subscriptionEndDate) return `Até ${call.subscriptionEndDate}`;
    if (call.startDate && call.endDate) return `${call.startDate} até ${call.endDate}`;
    return call.startDate || call.endDate || 'Não informado';
};

export const getHeaderData = (call) => ({
    category: [call.type, call.courseType].filter(Boolean).join(' - ') || 'Não informada',
    period: getPeriod(call),
    editais: call.timeline.filter(isEdital),
    stepIndex: Math.max(STEPS.indexOf(call.status), 0)
});

// Buttons of the header, in the order they are shown
export const getActions = (call) => {
    const actions = [];

    if (call.status === 'Período de Inscrição' || call.status === 'Em Processo') {
        actions.push({
            key: 'subscribe',
            label: call.subscriptionLink ? 'Inscreva-se Agora' : 'Link indisponível',
            href: call.subscriptionLink,
            kind: call.subscriptionLink ? 'primary' : 'disabled'
        });
    }

    if (call.id === '35/2026') {
        const isOpen = new Date() < new Date('2026-06-04T01:00:00-03:00');
        actions.push({
            key: 'exemption',
            label: isOpen ? 'Solicitar Isenção' : 'Solicitar Isenção (Encerrado)',
            href: isOpen ? 'https://forms.gle/aXGgN4hmwMzHHcsV6' : null,
            kind: isOpen ? 'secondary' : 'disabled',
            caption: 'Período de isenção: 01/06/2026 até 03/06/2026'
        });
    }

    if (call.appealLink) {
        actions.push({ key: 'appeal', label: 'Formulário de Recurso', href: call.appealLink, kind: 'secondary' });
    }

    return actions;
};
