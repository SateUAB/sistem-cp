import { standardPosts, numberedPosts, MANUAL, isStandard } from './standardPosts'

// Título final da postagem. O site monta o mesmo texto em src/utils/postTitle.js.
const getPostTitle = ({ standardTitle, number, isRectified, title }) => {
    if (!isStandard(standardTitle)) return title
    const numberSuffix = numberedPosts.includes(standardTitle) && number ? ` Nº ${String(number).padStart(2, '0')}` : ''
    return `${isRectified ? 'Retificado - ' : ''}${standardTitle}${numberSuffix}`
}

export const timelineItem = {
    name: 'timelineItem',
    title: 'Item da Linha do Tempo',
    type: 'object',
    fields: [
        {
            name: 'date',
            title: 'Data',
            type: 'string', // Keeping as string to match existing "dd/mm/yyyy" format or use 'date' if we want real dates
            description: 'Ex: 01/10/2025',
            validation: Rule => Rule.required().regex(/^\d{2}\/\d{2}\/\d{4}$/).error('Use o formato dd/mm/aaaa. Ex: 01/10/2025')
        },
        {
            name: 'standardTitle',
            title: 'Postagem',
            type: 'string',
            description: 'Escolha o nome padrão. O título sai no site sempre igual, sem precisar digitar. Para uma postagem fora do padrão, escolha "Outra".',
            options: {
                list: [
                    ...standardPosts.map(name => ({ title: name, value: name })),
                    { title: 'Outra (escrever o título manualmente)', value: MANUAL },
                ],
            },
            // Postagens antigas não têm nome padrão e continuam valendo com o título digitado
            validation: Rule => Rule.custom((value, context) =>
                value || !context.parent?.usesStandardForm ? true : 'Escolha a postagem na lista. Para um título fora do padrão, escolha "Outra".')
        },
        {
            name: 'number',
            title: 'Número',
            type: 'number',
            description: 'Só o número. Ex: 1 aparece como "Nº 01".',
            hidden: ({ parent }) => !numberedPosts.includes(parent?.standardTitle),
            validation: Rule => Rule.integer().min(1).max(99).custom((value, context) =>
                context.parent?.standardTitle === 'Adendo' && !value ? 'Informe o número do adendo.' : true)
        },
        {
            name: 'isRectified',
            title: 'Versão retificada?',
            type: 'boolean',
            description: 'Marque quando este documento substituir um já publicado. O título ganha "Retificado -" no início.',
            hidden: ({ parent }) => !isStandard(parent?.standardTitle),
            initialValue: false
        },
        {
            name: 'title',
            title: 'Título',
            type: 'string',
            description: 'Somente para postagens fora do padrão. Não precisa usar maiúsculas: o site exibe todos os títulos no mesmo formato.',
            // Aparece nas postagens manuais e nas antigas; nas novas, só depois de escolher "Outra"
            hidden: ({ parent }) => isStandard(parent?.standardTitle) || Boolean(parent?.usesStandardForm && !parent?.standardTitle),
            validation: Rule => Rule.custom((value, context) => {
                const { standardTitle, usesStandardForm } = context.parent || {};
                const needsTitle = standardTitle === MANUAL || (!usesStandardForm && !isStandard(standardTitle));
                return needsTitle && !value?.trim() ? 'Escreva o título da postagem.' : true;
            })
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
            name: 'changesSchedule',
            title: 'Altera o cronograma?',
            type: 'boolean',
            description: 'Marque quando este documento (adendo, retificação ou comunicado) mudar datas do cronograma. O site avisará que as datas seguem este documento, e não mais o edital.',
            initialValue: false
        },
        {
            // Marca as postagens criadas depois da padronização, que precisam escolher um nome da lista.
            // As antigas não têm esta marca e continuam como estavam.
            name: 'usesStandardForm',
            title: 'Postagem criada no formato padronizado',
            type: 'boolean',
            hidden: true,
            initialValue: true
        },
        // O único documento em destaque no site passou a ser o Edital, reconhecido pelo nome da postagem.
        // A caixa "Destaque?" deixou de ter efeito e fica oculta, com os dados preservados.
        {
            name: 'isFeatured',
            title: 'Destaque? (Edital/Ead na UECE)',
            type: 'boolean',
            hidden: true,
            initialValue: false
        },
        // Classificação que alimentava as etiquetas coloridas do site. As etiquetas saíram, mas os campos
        // continuam aqui, ocultos, para que os dados das postagens antigas sejam preservados.
        {
            name: 'documentType',
            title: 'Tipo do documento',
            type: 'string',
            hidden: true
        },
        {
            name: 'customDocumentType',
            title: 'Especificar outro tipo de documento',
            type: 'string',
            hidden: true
        },
        {
            name: 'phaseKind',
            title: 'Etapa a que se refere',
            type: 'string',
            hidden: true
        },
        {
            name: 'customPhaseKind',
            title: 'Especificar outra etapa',
            type: 'string',
            hidden: true
        }
    ],
    preview: {
        select: {
            standardTitle: 'standardTitle',
            number: 'number',
            isRectified: 'isRectified',
            title: 'title',
            date: 'date'
        },
        prepare({ standardTitle, number, isRectified, title, date }) {
            return {
                title: getPostTitle({ standardTitle, number, isRectified, title }) || 'Sem título',
                subtitle: isStandard(standardTitle) ? date : [date, 'título manual'].filter(Boolean).join(' • ')
            };
        }
    }
}
