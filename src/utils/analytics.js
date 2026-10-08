import { track } from '@vercel/analytics';

/**
 * Dispara um evento personalizado com segurança no Vercel Analytics
 * @param {string} eventName
 * @param {Record<string, string | number | boolean | null>} [properties]
 */
export const trackCustomEvent = (eventName, properties = {}) => {
  try {
    track(eventName, properties);
  } catch (error) {
    console.warn('[Analytics] Falha ao registrar evento:', error);
  }
};

/**
 * Rastreia o clique no botão principal de download do edital
 */
export const trackEditalDownload = ({ editalId, editalTitle, fileUrl }) => {
  trackCustomEvent('download_edital', {
    edital_id: String(editalId || ''),
    edital_titulo: String(editalTitle || 'Edital'),
    url: String(fileUrl || '')
  });
};

/**
 * Rastreia o download de documentos complementares (resultados, aditivos, etc.)
 */
export const trackDocumentDownload = ({ editalId, docTitle, fileUrl }) => {
  trackCustomEvent('download_documento', {
    edital_id: String(editalId || ''),
    documento: String(docTitle || ''),
    url: String(fileUrl || '')
  });
};

/**
 * Rastreia cliques no botão "Inscreva-se Agora"
 */
export const trackSubscriptionClick = ({ editalId, link }) => {
  trackCustomEvent('clique_inscricao', {
    edital_id: String(editalId || ''),
    link: String(link || '')
  });
};

/**
 * Rastreia cliques no formulário de recurso
 */
export const trackAppealClick = ({ editalId, link }) => {
  trackCustomEvent('clique_recurso', {
    edital_id: String(editalId || ''),
    link: String(link || '')
  });
};

/**
 * Rastreia cliques em solicitação de isenção
 */
export const trackExemptionClick = ({ editalId, link }) => {
  trackCustomEvent('clique_isencao', {
    edital_id: String(editalId || ''),
    link: String(link || '')
  });
};
