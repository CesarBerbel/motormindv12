import { createTransport } from "nodemailer"

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth:
    process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
})

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@motormind.com",
    to: email,
    subject: "Redefinição de senha — MotorMind",
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Redefinição de senha</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.07);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:32px 40px;">
                      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">MotorMind</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;">Redefinição de senha</h2>
                      <p style="margin:0 0 24px;color:#64748b;line-height:1.6;">
                        Recebemos uma solicitação para redefinir a senha da sua conta.
                        Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
                      </p>
                      <a href="${resetUrl}"
                         style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">
                        Redefinir senha
                      </a>
                      <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
                        Se você não solicitou a redefinição, ignore este e-mail com segurança.
                        Sua senha não será alterada.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                        © ${new Date().getFullYear()} MotorMind. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Redefina sua senha do MotorMind: ${resetUrl}\n\nO link expira em 1 hora.`,
  })
}
