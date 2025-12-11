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
    ]
}
