// Aviso em pop-up na página da chamada (ex.: problema no formulário, prazo prorrogado).
// Tudo é opcional: chamadas sem aviso continuam exatamente como estão.
export const notice = {
    name: 'notice',
    title: 'Aviso em pop-up',
    type: 'object',
    fields: [
        {
            name: 'active',
            title: 'Mostrar o aviso no site',
            type: 'boolean',
            description: 'Ligue para o aviso aparecer em pop-up quando o candidato abrir esta chamada. Desligue quando o problema for resolvido: o texto fica guardado.',
            initialValue: false
        },
        {
            name: 'title',
            title: 'Título do aviso',
            type: 'string',
            description: 'Opcional. Se ficar em branco, o site mostra "Aviso importante".'
        },
        {
            name: 'body',
            title: 'Texto do aviso',
            type: 'array',
            description: 'Escreva o aviso para o candidato. Selecione uma palavra ou frase e use o botão B para deixá-la em negrito.',
            of: [
                {
                    type: 'block',
                    styles: [{title: 'Normal', value: 'normal'}],
                    lists: [{title: 'Lista', value: 'bullet'}, {title: 'Lista numerada', value: 'number'}],
                    marks: {
                        decorators: [
                            {title: 'Negrito', value: 'strong'},
                            {title: 'Itálico', value: 'em'},
                            {title: 'Sublinhado', value: 'underline'}
                        ],
                        annotations: [
                            {
                                name: 'link',
                                title: 'Link',
                                type: 'object',
                                fields: [
                                    {
                                        name: 'href',
                                        title: 'Endereço (URL)',
                                        type: 'url',
                                        validation: Rule => Rule.uri({scheme: ['http', 'https', 'mailto']})
                                    }
                                ]
                            }
                        ]
                    }
                }
            ],
            validation: Rule => Rule.custom((value, context) =>
                context.parent?.active && !(value && value.length)
                    ? 'Escreva o texto do aviso ou desligue "Mostrar o aviso no site".'
                    : true)
        }
    ]
}
