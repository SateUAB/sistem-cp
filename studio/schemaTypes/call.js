export const call = {
    name: 'call',
    title: 'Chamada Pública (CP)',
    type: 'document',
    fields: [
        {
            name: 'editalNumber',
            title: 'Número do Edital',
            type: 'string',
            description: 'Ex: 137/2025'
        },
        {
            name: 'title',
            title: 'Título',
            type: 'string',
        },
        {
            name: 'description',
            title: 'Descrição',
            type: 'text',
        },
        {
            name: 'publicationDate',
            title: 'Data de Publicação',
            description: 'Data que aparecerá no rodapé. Ex: 2025-12-22',
            type: 'date',
        },
        {
            name: 'subscriptionLink',
            title: 'Link de Inscrição',
            description: 'Link para o Google Forms ou sistema de inscrição.',
            type: 'url',
        },
        {
            name: 'appealLink',
            title: 'Link de Recurso',
            description: 'Link para o formulário de recurso.',
            type: 'url',
        },
        {
            name: 'type',
            title: 'Tipo de Seleção',
            type: 'string',
            options: {
                list: [
                    { title: 'Professor', value: 'Professor' },
                    { title: 'Tutor', value: 'Tutor' },
                    { title: 'Mediador Pedagógico', value: 'Mediador Pedagógico' },
                    { title: 'Apoio Administrativo', value: 'Apoio Administrativo' },
                    { title: 'Coordenador', value: 'Coordenador' },
                    { title: 'Assistente à Docência', value: 'Assistente à Docência' },
                    { title: 'Aluno', value: 'Aluno' },
                ]
            }
        },
        {
            name: 'courseType',
            title: 'Tipo de Curso',
            type: 'string',
            options: {
                list: [
                    { title: 'Graduação', value: 'Graduação' },
                    { title: 'Especialização', value: 'Especialização' },
                    { title: 'Extensão', value: 'Extensão' },
                    { title: 'Outros', value: 'Outros' },
                ]
            }
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Publicado', value: 'Publicado' },
                    { title: 'Período de Inscrição', value: 'Período de Inscrição' },
                    { title: 'Em Processo', value: 'Em Processo' },
                    { title: 'Encerrado', value: 'Encerrado' },
                ]
            }
        },

        {
            name: 'startDate',
            title: 'Início',
            type: 'string',
            description: 'Início da CP e das Inscrições. Ex: 01/10/2025'
        },
        {
            name: 'subscriptionEndDate',
            title: 'Fim das Inscrições',
            type: 'string',
            description: 'Data de término do período de inscrições. Ex: 15/10/2025'
        },
        {
            name: 'endDate',
            title: 'Fim da Chamada Pública',
            type: 'string',
            description: 'Data de término da Chamada Pública / encerramento do processo. Ex: 30/10/2025'
        },
        {
            name: 'timeline',
            title: 'Resultados e Fases',
            type: 'array',
            of: [{ type: 'timelineItem' }]
        }
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'editalNumber',
            type: 'type',
            status: 'status'
        },
        prepare({ title, subtitle, type, status }) {
            const editalPrefix = subtitle ? `Edital ${subtitle}` : 'Edital sem número';
            const callTitle = title ? ` - ${title}` : '';
            const details = [type, status].filter(Boolean).join(' • ');
            return {
                title: `${editalPrefix}${callTitle}`,
                subtitle: details || 'Sem detalhes'
            };
        }
    }
}
