import { SCHEDULE_TIMEZONE, addDays } from './schedule.js';

// Builds the iCalendar (.ics) feed of a call's schedule.
// Used by the calendar feed endpoint (api/cronograma), which Google Calendar, Apple Calendar and Outlook subscribe to.

const compactDate = (isoDate) => isoDate.replaceAll('-', '');

const toUTCStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const escapeText = (text) => text.replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\r?\n/g, '\\n');

// RFC 5545: lines are limited to 75 octets; continuation lines start with a space
const foldLine = (line) => {
    const encoder = new TextEncoder();
    const chunks = [];
    let current = '';
    let size = 0;

    for (const char of line) {
        const charSize = encoder.encode(char).length;
        if (size + charSize > 75) {
            chunks.push(current);
            current = ' ';
            size = 1;
        }
        current += char;
        size += charSize;
    }
    chunks.push(current);
    return chunks.join('\r\n');
};

// `source` is the document the dates follow (see getScheduleSource); `pageUrl` is the public page of the call.
// The UID comes from the item's key, so a date changed in the CMS moves the same event instead of creating another.
export const toCalendarEvent = (call, item, pageUrl, source) => ({
    uid: `cp-${call.id.replace(/\W+/g, '-')}-${item.key}@sate.uece.br`,
    title: `${item.title} — CP ${call.id} (SATE/UECE)`,
    description: [
        `Chamada Pública ${call.id} — SATE/UECE`,
        call.title,
        item.publication && `Publicado em ${item.publication.date}: ${item.publication.url}`,
        source ? `Datas conforme ${source.title}, publicado em ${source.date}.` : 'Datas conforme o edital.',
        'Esta agenda é atualizada automaticamente quando o cronograma muda.',
        `Acompanhe em: ${pageUrl}`
    ].filter(Boolean).join('\n\n'),
    url: pageUrl,
    startDate: item.startDate,
    endDate: item.endDate
});

export const buildIcs = (calendarName, events, updatedAt = new Date()) => {
    const stamp = toUTCStamp(updatedAt);

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SATE UECE//Chamadas Publicas//PT-BR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeText(calendarName)}`,
        `X-WR-TIMEZONE:${SCHEDULE_TIMEZONE}`,
        // How often subscribed calendars should check for changes (Google ignores it and uses its own pace)
        'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
        'X-PUBLISHED-TTL:PT1H',
        ...events.flatMap(event => [
            'BEGIN:VEVENT',
            `UID:${event.uid}`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${compactDate(event.startDate)}`,
            // All-day events: the end date is exclusive
            `DTEND;VALUE=DATE:${compactDate(addDays(event.endDate, 1))}`,
            // Reminders of dates, not appointments: they should not block the candidate's agenda
            'TRANSP:TRANSPARENT',
            `SUMMARY:${escapeText(event.title)}`,
            `DESCRIPTION:${escapeText(event.description)}`,
            `URL:${event.url}`,
            'END:VEVENT'
        ]),
        'END:VCALENDAR'
    ];

    return lines.map(foldLine).join('\r\n') + '\r\n';
};
