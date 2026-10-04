import { standardPosts, numberedPosts, MANUAL, isStandard } from './standardPosts'

const categoryLabels = {
    'publicacao': 'Publicação',
    'prazo': 'Prazo do candidato',
    'etapa': 'Etapa'
}

// Publicações que podem ser previstas no cronograma: as mesmas da lista de postagens, menos as numeradas
const schedulablePosts = standardPosts.filter(name => !numberedPosts.includes(name))

const formatDate = (date) => date ? date.split('-').reverse().join('/') : ''

// Uma publicação usa o nome da lista; as demais atividades usam o nome digitado
const usesStandardName = (item) => item?.category === 'publicacao' && isStandard(item?.standardTitle)

export const scheduleItem = {
    name: 'scheduleItem',
    title: 'Item do Cronograma',
    type: 'object',
    fields: [
        {
            name: 'category',
            title: 'Tipo',
            type: 'string',
            description: 'Define a cor da atividade no calendário do site.',
            options: {
                list: [
                    { title: 'Publicação (resultado, convocação, cronograma de entrevistas)', value: 'publicacao' },
                    { title: 'Prazo do candidato (inscrição, pagamento, recurso)',            value: 'prazo' },
                    { title: 'Etapa (análise, entrevista, curso de formação)',                value: 'etapa' },
                ],
                layout: 'radio'
            },
            validation: Rule => Rule.required()
        },
        {
            name: 'standardTitle',
            title: 'Publicação',
            type: 'string',
            description: 'O mesmo nome usado em "Resultados e Fases". Quando a postagem com este nome for publicada, o calendário do site leva o candidato direto a ela.',
            options: {
                list: [
                    ...schedulablePosts.map(name => ({ title: name, value: name })),
                    { title: 'Outra (escrever o nome manualmente)', value: MANUAL },
                ],
            },
            hidden: ({ parent }) => parent?.category !== 'publicacao',
            validation: Rule => Rule.custom((value, context) =>
                context.parent?.category === 'publicacao' && !value ? 'Escolha a publicação na lista. Para um nome fora do padrão, escolha "Outra".' : true)
        },
        {
            name: 'title',
            title: 'Atividade',
            type: 'string',
            description: 'Nome curto. Ex: Período de inscrições',
            // Nas publicações o nome vem da lista; só aparece aqui ao escolher "Outra"
            hidden: ({ parent }) => parent?.category === 'publicacao' && parent?.standardTitle !== MANUAL,
            validation: Rule => Rule.custom((value, context) => {
                const { category, standardTitle } = context.parent || {};
                const needsTitle = category !== 'publicacao' || standardTitle === MANUAL;
                return needsTitle && !value?.trim() ? 'Escreva o nome da atividade.' : true;
            })
        },
        {
            name: 'startDate',
            title: 'Data (ou início do período)',
            type: 'date',
            options: { dateFormat: 'DD/MM/YYYY' },
            validation: Rule => Rule.required()
        },
        {
            name: 'endDate',
            title: 'Fim do período',
            type: 'date',
            description: 'Deixe em branco quando a atividade acontece em um único dia.',
            options: { dateFormat: 'DD/MM/YYYY' },
            validation: Rule => Rule.custom((endDate, context) => {
                const startDate = context.parent?.startDate;
                return !endDate || !startDate || endDate >= startDate ? true : 'O fim do período não pode ser anterior ao início.';
            })
        }
    ],
    preview: {
        select: {
            title: 'title',
            standardTitle: 'standardTitle',
            category: 'category',
            startDate: 'startDate',
            endDate: 'endDate'
        },
        prepare({ title, standardTitle, category, startDate, endDate }) {
            const period = endDate && endDate !== startDate ? `${formatDate(startDate)} a ${formatDate(endDate)}` : formatDate(startDate);
            return {
                title: (usesStandardName({ category, standardTitle }) ? standardTitle : title) || 'Sem título',
                subtitle: [period, categoryLabels[category]].filter(Boolean).join(' • ')
            };
        }
    }
}
