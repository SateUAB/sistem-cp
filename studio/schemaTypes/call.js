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
            name: 'subscriptionLink',
            title: 'Link de Inscrição',
            description: 'Link para o Google Forms ou sistema de inscrição.',
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
                    { title: 'Apoio Administrativo', value: 'Apoio Administrativo' },
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
                ]
            }
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Período de Inscrição', value: 'Período de Inscrição' },
                    { title: 'Em Processo', value: 'Em Processo' },
                    { title: 'Encerrado', value: 'Encerrado' },
                ]
            }
        },
        {
            name: 'vacancies',
            title: 'Vagas',
            type: 'string', // Using string to allow "CR" or numbers
        },
        {
            name: 'remuneration',
            title: 'Bolsa / Remuneração',
            type: 'string',
        },
        {
            name: 'startDate',
            title: 'Início',
            type: 'string',
            description: 'Ex: 01/10/2025'
        },
        {
            name: 'endDate',
            title: 'Fim',
            type: 'string',
            description: 'Ex: 30/10/2025'
        },
        {
            name: 'timeline',
            title: 'Resultados e Fases',
            type: 'array',
            of: [{ type: 'timelineItem' }]
        }
    ]
}
