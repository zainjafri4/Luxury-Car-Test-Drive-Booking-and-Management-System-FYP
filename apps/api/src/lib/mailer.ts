import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: SendMailOptions): Promise<void> {
  try {
    if (transporter) {
      await transporter.sendMail({
        from: env.MAIL_FROM || 'noreply@aurumdrive.example',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info({ to: options.to, subject: options.subject }, 'Email sent successfully via SMTP');
    } else {
      logger.info(
        {
          to: options.to,
          subject: options.subject,
          text: options.text,
        },
        '[CONSOLE EMAIL DISPATCH - SMTP not configured]',
      );
    }
  } catch (err) {
    // Best-effort contract: NEVER throw or crash the caller transaction (§7.7)
    logger.error({ err, to: options.to, subject: options.subject }, 'Failed to deliver email');
  }
}
