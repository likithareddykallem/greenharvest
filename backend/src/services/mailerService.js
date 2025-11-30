import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { renderTemplate } from '../emails/templates.js';

const buildTransport = () => {
  if (!env.mailTransportJson) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  try {
    const transportConfig = JSON.parse(env.mailTransportJson);
    return nodemailer.createTransport(transportConfig);
  } catch (err) {
    console.warn('[mailer] Failed to parse MAIL_TRANSPORT_JSON, falling back to JSON transport', err);
    return nodemailer.createTransport({ jsonTransport: true });
  }
};

const transporter = buildTransport();

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw new Error('[mailer] Missing recipient');
  }
  const payload = {
    from: env.mailFrom,
    to,
    subject,
    html,
    text,
  };
  console.log(`[mailer] Sending email to ${to} | Subject: ${subject}`);
  await transporter.sendMail(payload);
};

export const sendTemplatedEmail = async ({ template, to, data }) => {
  const { subject, html, text } = renderTemplate(template, data);
  try {
    await sendEmail({ to, subject, html, text });
  } catch (err) {
    console.warn(`[mailer] Failed to send ${template} email`, err);
  }
};






