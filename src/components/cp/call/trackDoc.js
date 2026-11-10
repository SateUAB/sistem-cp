import { trackDocumentDownload, trackEditalDownload } from '../../../utils/analytics';

// Same analytics events as before: the edital has its own, every other document is a "download_documento"
export const trackDoc = (call, doc) => {
    if (call.edital && doc.key === call.edital.key) {
        trackEditalDownload({ editalId: call.id, editalTitle: doc.rawTitle || doc.titulo, fileUrl: doc.url });
    } else {
        trackDocumentDownload({ editalId: call.id, docTitle: doc.rawTitle || doc.titulo, fileUrl: doc.url });
    }
};
