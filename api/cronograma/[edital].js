import { buildIcs, toCalendarEvent } from '../../src/utils/ics.js';
import { postTitle, scheduleItemTitle } from '../../src/utils/postTitle.js';
import { getScheduleSource, linkPublications, normalizeSchedule } from '../../src/utils/schedule.js';

// Calendar feed with the schedule of one call, e.g. /api/cronograma/59-2026.ics
// Calendar apps subscribe to this address and fetch it again from time to time, so a date
// changed in Sanity reaches the candidates' agenda without anyone doing anything else.

const SANITY_QUERY_URL = 'https://mktsf3hv.api.sanity.io/v2023-05-03/data/query/production';

const QUERY = `*[_type == "call" && editalNumber == $id][0] {
    "id": editalNumber,
    title,
    _updatedAt,
    schedule[] { _key, "title": ${scheduleItemTitle}, category, startDate, endDate },
    timeline[] { date, "title": ${postTitle}, "url": fileUrl, changesSchedule }
}`;

export default async function handler(req, res) {
    // "59-2026.ics" -> "59/2026"
    const id = String(req.query.edital || '').replace(/\.ics$/, '').replace(/-(\d{4})$/, '/$1');

    const params = new URLSearchParams({ query: QUERY, $id: JSON.stringify(id) });
    const response = await fetch(`${SANITY_QUERY_URL}?${params}`);
    if (!response.ok) {
        res.status(502).send('Não foi possível carregar o cronograma.');
        return;
    }

    const { result: call } = await response.json();
    const items = linkPublications(normalizeSchedule(call?.schedule), call?.timeline);
    if (items.length === 0) {
        res.status(404).send('Cronograma não encontrado.');
        return;
    }

    const pageUrl = `https://${req.headers.host}/details/${encodeURIComponent(call.id)}`;
    const source = getScheduleSource(call.timeline);
    const events = items.map(item => toCalendarEvent(call, item, pageUrl, source));

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="cronograma-cp-${call.id.replace(/\W+/g, '-')}.ics"`);
    // Cached at the edge for 5 minutes: the calendar app of every subscriber polls this address
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
    res.status(200).send(buildIcs(`Cronograma CP ${call.id} — SATE/UECE`, events, new Date(call._updatedAt)));
}
