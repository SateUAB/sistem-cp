// Nomes padrão das postagens, na ordem em que costumam acontecer em uma chamada.
// Foram levantados a partir do que já foi publicado: 135 das 151 postagens se encaixam em um deles.
// Para criar um novo nome padrão, basta acrescentar uma linha aqui.
//
// A mesma lista é usada no cronograma: quando um item do cronograma e uma postagem têm o mesmo nome,
// o calendário do site leva o candidato direto à publicação.
export const standardPosts = [
    'Edital',
    'Adendo',
    'Comunicado',
    'Resultado preliminar da solicitação de isenção',
    'Resultado definitivo da solicitação de isenção',
    'Resultado preliminar das inscrições',
    'Resultado definitivo das inscrições',
    'Resultado preliminar da análise de currículo',
    'Resultado definitivo da análise de currículo',
    'Resultado preliminar da análise de títulos',
    'Resultado definitivo da análise de títulos',
    'Orientações para a prova online',
    'Resultado preliminar da prova online',
    'Resultado definitivo da prova online',
    'Cronograma das entrevistas',
    'Resultado preliminar das entrevistas',
    'Resultado definitivo das entrevistas',
    'Convocação para o Curso de Formação em EaD',
    'Resultado preliminar do Curso de Formação em EaD',
    'Resultado definitivo do Curso de Formação em EaD',
    'Convocação para a heteroidentificação',
    'Resultado preliminar da heteroidentificação',
    'Resultado definitivo da heteroidentificação',
    'Resultado final preliminar',
    'Resultado final',
    'Comunicado de convocação',
    'Convocação para confirmação presencial de matrícula',
    'Resultado da confirmação presencial da matrícula',
]

// Postagens que levam número: "Adendo Nº 01", "Comunicado Nº 02"
export const numberedPosts = ['Adendo', 'Comunicado']

export const MANUAL = 'manual'

export const isStandard = (standardTitle) => Boolean(standardTitle) && standardTitle !== MANUAL
