import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.RESEND_FROM_EMAIL ?? 'no-reply@cafe-ceramique.fr'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface SendResult { success: boolean; error?: string }

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  if (!resend) {
    console.log('[email] RESEND_API_KEY non configurée — email non envoyé:', opts.subject, '→', opts.to)
    return { success: true }
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })

  if (error) {
    console.error('[email] Erreur Resend:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ── Templates HTML inline (pas de dépendance React Email en prod)

export function buildReservationEmail(opts: {
  firstName: string
  date: string          // 'Mardi 10 juin 2026'
  time: string          // '14h30'
  nbParticipants: number
  cancelToken: string
}) {
  const cancelUrl = `${APP_URL}/reservation/annuler/${opts.cancelToken}`
  return {
    subject: `✅ Réservation confirmée — ${opts.date} à ${opts.time}`,
    html: `
<!DOCTYPE html><html lang="fr"><body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2B1F;background:#FAF7F2">
<h1 style="color:#C17F24;margin-bottom:4px">☕ Café Céramique</h1>
<p style="color:#6B5344;margin-top:0">Réservation confirmée</p>
<hr style="border:none;border-top:1px solid #E8DDD0;margin:20px 0">
<p>Bonjour <strong>${opts.firstName}</strong>,</p>
<p>Votre réservation est confirmée !</p>
<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="padding:12px 16px;color:#8B8080;font-size:14px">Date</td><td style="padding:12px 16px;font-weight:600">${opts.date}</td></tr>
  <tr style="background:#FFF8F0"><td style="padding:12px 16px;color:#8B8080;font-size:14px">Heure</td><td style="padding:12px 16px;font-weight:600">${opts.time} · 2h30</td></tr>
  <tr><td style="padding:12px 16px;color:#8B8080;font-size:14px">Participants</td><td style="padding:12px 16px;font-weight:600">${opts.nbParticipants} personne${opts.nbParticipants > 1 ? 's' : ''}</td></tr>
</table>
<div style="background:#FFF8F0;border:1px solid #E8DDD0;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;color:#6B5344">
  <strong>Politique d'annulation :</strong><br>
  ✅ Annulation gratuite jusqu'à 24h avant votre session<br>
  ❌ Annulation moins de 24h avant : 20 € prélevés
</div>
<p style="text-align:center">
  <a href="${cancelUrl}" style="color:#C17F24;font-size:13px">Annuler ma réservation</a>
</p>
<hr style="border:none;border-top:1px solid #E8DDD0;margin:20px 0">
<p style="font-size:12px;color:#8B8080;text-align:center">Café Céramique · À bientôt !</p>
</body></html>`,
  }
}

export function buildTokenEmail(opts: {
  firstName: string
  token: string
  pieceName: string
  orderSummary: string
  trackingUrl: string
}) {
  return {
    subject: `🏺 Votre token céramique : ${opts.token}`,
    html: `
<!DOCTYPE html><html lang="fr"><body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2B1F;background:#FAF7F2">
<h1 style="color:#C17F24;margin-bottom:4px">☕ Café Céramique</h1>
<p style="color:#6B5344;margin-top:0">Votre session est lancée !</p>
<hr style="border:none;border-top:1px solid #E8DDD0;margin:20px 0">
<p>Bonjour <strong>${opts.firstName}</strong>,</p>
<p>Voici votre token de suivi céramique :</p>
<div style="background:#fff;border:2px solid #C17F24;border-radius:16px;padding:20px;text-align:center;margin:20px 0">
  <p style="font-family:monospace;font-size:24px;font-weight:700;color:#C17F24;letter-spacing:2px;margin:0">${opts.token}</p>
  <p style="font-size:13px;color:#8B8080;margin:8px 0 0">Conservez ce token pour récupérer votre pièce</p>
</div>
<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="padding:12px 16px;color:#8B8080;font-size:14px">Pièce</td><td style="padding:12px 16px;font-weight:600">${opts.pieceName}</td></tr>
  ${opts.orderSummary ? `<tr style="background:#FFF8F0"><td style="padding:12px 16px;color:#8B8080;font-size:14px">Commande</td><td style="padding:12px 16px">${opts.orderSummary}</td></tr>` : ''}
</table>
<p style="text-align:center;margin-top:24px">
  <a href="${opts.trackingUrl}" style="background:#C17F24;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Suivre ma pièce →</a>
</p>
<hr style="border:none;border-top:1px solid #E8DDD0;margin:20px 0">
<p style="font-size:12px;color:#8B8080;text-align:center">Vous serez notifié(e) quand votre pièce sera prête à récupérer.</p>
</body></html>`,
  }
}
