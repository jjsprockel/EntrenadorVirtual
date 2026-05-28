import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

export function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

export async function sendWelcomeEmail(params: {
  toName: string;
  toEmail: string;
  initialPassword: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error('EmailJS no configurado. Agrega VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID y VITE_EMAILJS_PUBLIC_KEY en las variables de entorno de Vercel.');
  }

  const appUrl = (import.meta.env.VITE_APP_URL as string) || window.location.origin;

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_name: params.toName,
      to_email: params.toEmail,
      initial_password: params.initialPassword,
      app_url: appUrl,
      from_name: 'EntrenadorVirtual',
    },
    PUBLIC_KEY,
  );
}
