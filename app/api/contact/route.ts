import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  fullName?: string;
  message?: string;
};

const recipient = process.env.CONTACT_RECIPIENT_EMAIL ?? "Dottoressavalentinatrunfio@gmail.com";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const fullName = body.fullName?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (!fullName || !message) {
      return NextResponse.json({ error: "Compila tutti i campi richiesti." }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true";

    if (!host || !user || !pass) {
      if (process.env.NODE_ENV === "development") {
        // Consente di provare il sito in locale senza credenziali SMTP.
        console.info("[contact] SMTP non configurato: messaggio simulato (solo dev)", { fullName, messageLen: message.length });
        return NextResponse.json({ ok: true, simulated: true });
      }
      return NextResponse.json(
        { error: "Server email non configurato. Imposta SMTP_HOST, SMTP_USER e SMTP_PASS." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    await transporter.sendMail({
      from: `"Sito Proforma" <${user}>`,
      to: recipient,
      subject: `Nuovo messaggio dal sito - ${fullName}`,
      text: `Nome e cognome: ${fullName}\n\nMessaggio:\n${message}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; line-height: 1.55; color: #132019;">
          <h2 style="margin: 0 0 12px; color: #1f5c45;">Nuovo messaggio dal sito</h2>
          <p style="margin: 0 0 8px;"><strong>Nome e cognome:</strong> ${fullName}</p>
          <p style="margin: 14px 0 6px;"><strong>Messaggio:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      `
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore durante l'invio del messaggio." },
      { status: 500 }
    );
  }
}
