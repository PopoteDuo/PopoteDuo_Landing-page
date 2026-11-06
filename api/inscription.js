// Inscription à la liste d'attente : la fonction vérifie la demande, puis l'envoie par e-mail à l'équipe.
// Elle tourne dans la région Paris de Vercel (voir vercel.json).
//
// Réglages dans Vercel (Settings → Environment Variables), voir LISEZMOI.md :
//   GMAIL_USER          l'adresse Gmail qui envoie, ex. contact.popoteduo@gmail.com
//   GMAIL_APP_PASSWORD  un « mot de passe d'application » Google pour cette adresse (pas le mot de passe du compte)
//   INSCRIPTIONS_TO     facultatif : l'adresse qui reçoit les inscriptions (par défaut, GMAIL_USER)
import nodemailer from 'nodemailer';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = { parent: 'Parent', pro: 'Pro de l’animation' };

// Garde un texte court et sur une seule ligne : il finit dans un e-mail.
const clean = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  // Seul le formulaire du site peut écrire ici : un navigateur envoie toujours l'origine de la page.
  let sameSite = false;
  try { sameSite = new URL(req.headers.origin).host === req.headers.host; } catch {}
  if (!sameSite) return res.status(403).json({ ok: false });

  const b = req.body && typeof req.body === 'object' ? req.body : {};
  // Champ piège invisible : seul un robot le remplit. On fait semblant d'accepter, sans rien envoyer.
  if (b.site) return res.status(200).json({ ok: true });

  const email = clean(b.email, 200);
  if (!EMAIL.test(email)) return res.status(400).json({ ok: false, error: 'email' });
  const role = b.role === 'pro' ? 'pro' : 'parent';
  const ages = clean(b.ages, 40).replace(/[^0-9, \-–]/g, '');
  const org = role === 'pro' ? clean(b.org, 120) : '';
  const beta = b.beta === true;
  const lang = b.lang === 'en' ? 'en' : 'fr';

  const { GMAIL_USER, GMAIL_APP_PASSWORD, INSCRIPTIONS_TO } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return res.status(503).json({ ok: false, error: 'config' });

  const date = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short' });
  const text = [
    'Nouvelle inscription sur le site Popote Duo',
    '',
    `E-mail : ${email}`,
    `Profil : ${ROLES[role]}`,
    role === 'pro' ? `Structure : ${org || '(non précisée)'}` : `Âge des enfants : ${ages ? ages + ' ans' : '(non précisé)'}`,
    `Partant pour la bêta : ${beta ? 'oui' : 'non'}`,
    `Langue du site : ${lang === 'en' ? 'anglais (lui répondre en anglais)' : 'français'}`,
    `Date : ${date} (heure de Paris)`,
    '',
    'Pour lui écrire, il suffit de répondre à ce message.',
  ].join('\n');

  try {
    await nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } }).sendMail({
      from: `Site Popote Duo <${GMAIL_USER}>`,
      to: INSCRIPTIONS_TO || GMAIL_USER,
      replyTo: email,
      subject: `Inscription bêta${lang === 'en' ? ' (EN)' : ''} · ${ROLES[role]} · ${email}`,
      text,
    });
  } catch (err) {
    console.error('Envoi de l’inscription impossible :', err.message);
    return res.status(502).json({ ok: false, error: 'send' });
  }
  return res.status(200).json({ ok: true });
}
