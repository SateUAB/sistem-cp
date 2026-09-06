export const timelineItem = {
    name: 'timelineItem',
    title: 'Item da Linha do Tempo',
    type: 'object',
    fields: [
        {
            name: 'date',
            title: 'Data',
            type: 'string', // Keeping as string to match existing "dd/mm/yyyy" format or use 'date' if we want real dates
            description: 'Ex: 01/10/2025'
        },
        {
            name: 'title',
            title: 'Título',
            type: 'string',
        },
        {
            name: 'documentType',
            title: 'Tipo do documento',
            type: 'string',
            description: 'Classificação oficial do documento (ou selecione "Outro" para escrever).',
            options: {
                list: [
                    { title: 'Edital',               value: 'edital' },
                    { title: 'Adendo',               value: 'adendo' },
                    { title: 'Retificação',          value: 'retificacao' },
                    { title: 'Comunicado',           value: 'comunicado' },
                    { title: 'Convocação',           value: 'convocacao' },
                    { title: 'Cronograma',           value: 'cronograma' },
                    { title: 'Resultado preliminar', value: 'resultado-preliminar' },
                    { title: 'Resultado definitivo', value: 'resultado-definitivo' },
                    { title: 'Resultado final',      value: 'resultado-final' },
                    { title: 'Outro',                value: 'outro' },
                ],
            },
        },
        {
            name: 'customDocumentType',
            title: 'Especificar outro tipo de documento',
            type: 'string',
            description: 'Digite o tipo do documento caso tenha selecionado "Outro"',
            hidden: ({ parent }) => parent?.documentType !== 'outro',
        },
        {
            name: 'phaseKind',
            title: 'Etapa a que se refere',
            type: 'string',
            description: 'Pode ficar em branco quando não se aplica (ou selecione "Outro" para escrever).',
            options: {
                list: [
                    { title: 'Inscrição',                        value: 'inscricao' },
                    { title: 'Análise de currículo ou títulos',  value: 'analise_titulos' },
                    { title: 'Prova online',                     value: 'prova_online' },
                    { title: 'Entrevista',                       value: 'entrevista' },
                    { title: 'Curso de formação EaD',            value: 'curso_formacao_ead' },
                    { title: 'Final',                            value: 'final' },
                    { title: 'Outro',                            value: 'outro' },
                ],
            },
        },
        {
            name: 'customPhaseKind',
            title: 'Especificar outra etapa',
            type: 'string',
            description: 'Digite a etapa caso tenha selecionado "Outro"',
            hidden: ({ parent }) => parent?.phaseKind !== 'outro',
        },
        {
            name: 'fileUrl',
            title: 'Link do PDF (WordPress)',
            type: 'url',
            validation: Rule => Rule.uri({
                scheme: ['http', 'https']
            })
        },
        {
            name: 'isFeatured',
            title: 'Destaque? (Edital/Ead na UECE)',
            type: 'boolean',
            initialValue: false
        }
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'date',
            documentType: 'documentType',
            customDocumentType: 'customDocumentType',
            phaseKind: 'phaseKind',
            customPhaseKind: 'customPhaseKind'
        },
        prepare({ title, subtitle, documentType, customDocumentType, phaseKind, customPhaseKind }) {
            const docTypeLabel = documentType === 'outro' && customDocumentType ? customDocumentType : documentType;
            const phaseLabel = phaseKind === 'outro' && customPhaseKind ? customPhaseKind : phaseKind;
            const tags = [docTypeLabel, phaseLabel].filter(Boolean).join(' • ');
            return {
                title: title || 'Sem título',
                subtitle: tags ? `${subtitle || ''} [${tags}]` : subtitle
            };
        }
    }
}
