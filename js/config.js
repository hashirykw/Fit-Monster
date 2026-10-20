/* The Fit Monster — site data. Edit here; every page, the menu status and the chat read from this file.
   Source: the gym's Google Business listing (Oct 2026). Items marked CONFIRM need the owner's sign-off. */
window.FM = {
  name: 'The Fit Monster',
  full: 'The Fit Monster — Muscles Factory',
  phone: '+92 344 1070495',            // Google listing
  whatsapp: '923441070495',            // CONFIRM: assumed same number is on WhatsApp
  instagram: '',                       // CONFIRM: add handle URL to show it in the footer + chat
  address: 'Nazimabad No. 1, Block 1, Usmania Colony, Liaquatabad, Karachi 74600',
  area: 'Nazimabad · Karachi',
  maps: 'https://www.google.com/maps/search/?api=1&query=Fit%20Monster%20Gym%20Nazimabad%20Karachi&query_place_id=ChIJqY-oLL0_sz4RCYn3u2vbXzc',
  mapEmbed: 'https://www.google.com/maps?q=Fit+Monster+Gym,+Nazimabad+No.+1,+Karachi&z=16&output=embed',
  rating: 4.7,
  reviews: 140,
  /* opening hours, 24h "HH:MM"; a close earlier than open means after midnight. 0 = Sunday */
  hours: {
    0: ['06:30', '01:00'],
    1: ['06:30', '04:00'],
    2: ['06:30', '04:00'],
    3: ['06:30', '01:00'],
    4: ['06:30', '04:00'],
    5: ['06:30', '04:00'],
    6: ['06:30', '04:00']
  }
};

/* open/closed status in Karachi time (UTC+5), shared by menu, hours list and chat */
FM.now = function () {
  const d = new Date(Date.now() + (new Date().getTimezoneOffset() + 300) * 60000);
  return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
};
FM.toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
FM.fmt = s => { let [h, m] = s.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ap; };
FM.status = function () {
  const { day, min } = FM.now();
  const y = (day + 6) % 7, [yo, yc] = FM.hours[y].map(FM.toMin);
  if (yc < yo && min < yc) return { open: true, text: 'Open now · till ' + FM.fmt(FM.hours[y][1]) };
  const [o, c] = FM.hours[day].map(FM.toMin);
  if (min >= o && (c < o || min < c)) return { open: true, text: 'Open now · till ' + FM.fmt(FM.hours[day][1]) };
  return { open: false, text: 'Closed · opens ' + FM.fmt(FM.hours[min < o ? day : (day + 1) % 7][0]) };
};
FM.wa = (text) => 'https://wa.me/' + FM.whatsapp + '?text=' + encodeURIComponent(text || 'Assalam o Alaikum! I found The Fit Monster online and want to visit.');
