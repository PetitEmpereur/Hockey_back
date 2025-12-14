import { Resend } from 'resend';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL as string,
      to,
      subject,
      html,
    });
    return result;
  } catch (err) {
    // remonter l'erreur pour que le routeur puisse renvoyer 500
    throw err;
  }
}
