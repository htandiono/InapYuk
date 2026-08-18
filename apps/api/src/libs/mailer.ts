import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import nodemailer, { type Transporter } from 'nodemailer';
import { env, hasSmtp } from '../config/env';
import { logger } from './logger';

export type MailTemplate =
  'email-verification' | 'password-reset' | 'booking-confirmed' | 'checkin-reminder';

export interface SendMailOptions {
  to: string;
  subject: string;
  template: MailTemplate;
  context: Record<string, unknown>;
}

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'emails');
const cache = new Map<MailTemplate, HandlebarsTemplateDelegate>();

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

function compile(template: MailTemplate): HandlebarsTemplateDelegate {
  const cached = cache.get(template);
  if (cached) return cached;
  const source = fs.readFileSync(path.join(TEMPLATE_DIR, `${template}.hbs`), 'utf8');
  const compiled = Handlebars.compile(source);
  cache.set(template, compiled);
  return compiled;
}

export function renderTemplate(template: MailTemplate, context: Record<string, unknown>): string {
  return compile(template)({ ...context, appName: 'InapYuk', webBaseUrl: env.WEB_BASE_URL });
}

/**
 * Without SMTP credentials the email is logged instead of sent, so the whole
 * flow stays testable before anyone configures a mailbox.
 */
export async function sendMail(options: SendMailOptions): Promise<void> {
  const html = renderTemplate(options.template, options.context);

  if (!hasSmtp) {
    logger.warn(`SMTP not configured - email "${options.subject}" not sent`, { to: options.to });
    logger.debug('Email body', html);
    return;
  }

  await getTransporter().sendMail({
    from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    html,
  });
  logger.info(`Email sent: ${options.subject}`, { to: options.to });
}
