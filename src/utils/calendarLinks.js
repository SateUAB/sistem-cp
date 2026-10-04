// Each call has its own calendar feed (api/cronograma), e.g. /api/cronograma/59-2026.ics.
// Calendar apps subscribe to it, so a date changed in the CMS reaches the candidate's agenda by itself.

export const getScheduleFeedUrl = (call) => `${window.location.origin}/api/cronograma/${call.id.replace('/', '-')}.ics`;

// Opens the "subscribe to calendar" dialog of Apple Calendar and Outlook
export const getWebcalUrl = (feedUrl) => feedUrl.replace(/^https?:/, 'webcal:');

// Google Calendar only accepts external feeds through the webcal:// scheme
export const getGoogleSubscribeUrl = (feedUrl) => `https://calendar.google.com/calendar/r?cid=${getWebcalUrl(feedUrl)}`;

// Calendar apps fetch the feed from the internet, so subscribing only works on the published site
export const canSubscribe = () => !['localhost', '127.0.0.1'].includes(window.location.hostname);
