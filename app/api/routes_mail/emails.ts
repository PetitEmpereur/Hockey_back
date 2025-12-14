import { Router } from 'express';
import { sendEmail } from '../services_mail/emailsServices';

const router = Router();

router.post('/welcome', async (req, res) => {
  const { email, nom, prenom } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'email manquant' });

  try {
    await sendEmail({
      to: email,
      subject: 'Bienvenue 🎉',
      html: `<h1>Bonjour ${prenom || ''} ${nom || ''}</h1><p>Merci pour votre inscription !</p>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('send welcome error', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/password-changed', async (req, res) => {
  const { email, nom } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'email manquant' });

  try {
    await sendEmail({
      to: email,
      subject: 'Mot de passe modifié 🔒',
      html: `<p>Bonjour ${nom || ''}, votre mot de passe a été modifié.</p>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('send password-changed error', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/order-confirmation', async (req, res) => {
  const { email, name, orderId, total } = req.body;
  if (!email || !orderId) return res.status(400).json({ success: false, message: 'email ou orderId manquant' });

  try {
    await sendEmail({
      to: email,
      subject: `Confirmation commande #${orderId}`,
      html: `<p>Bonjour ${name || ''}, merci pour votre commande ${orderId}. Total: ${total}€</p>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('send order-confirmation error', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
