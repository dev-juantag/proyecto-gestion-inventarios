import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { correo } = await req.json();

    if (!correo) {
      return NextResponse.json({ error: "El correo es requerido" }, { status: 400 });
    }

    const unUsuario = await prisma.user.findUnique({
      where: { correo },
    });

    if (!unUsuario) {
      // Devolver success siempre para no revelar emails existentes
      return NextResponse.json({ success: true, message: "Si el correo existe, se envió el token." });
    }

    // Generar token de 6 caracteres alfanuméricos
    const token = Math.random().toString(36).slice(-6).toUpperCase();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await prisma.user.update({
      where: { id: unUsuario.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // Configuración SMTP utilizando variables de entorno (Gmail por defecto para el usuario)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"LogiTrack Pro" <${process.env.SMTP_USER}>`,
        to: correo,
        subject: "Código de Recuperación de Contraseña",
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>Recuperación de Contraseña</h2>
            <p>Hola ${unUsuario.nombre},</p>
            <p>Has solicitado restablecer tu contraseña. Usa el siguiente código de 6 caracteres en la aplicación:</p>
            <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f1f5f9; border-radius: 8px; width: fit-content; letter-spacing: 5px;">
              ${token}
            </div>
            <p>Este código expirará en 15 minutos.</p>
            <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
          </div>
        `,
      });
      console.log(`[AUTH] Correo enviado a ${correo} con token ${token}`);
    } catch (mailError) {
      console.error("[AUTH] Error enviando correo, revisa SMTP_USER/PASS en .env:", mailError);
      // Para desarrollo local, imprimimos el token
      console.log(`[AUTH-DEV] Como el SMTP falló, aquí tienes tu token para testear localmente: ${token}`);
    }

    return NextResponse.json({ success: true, message: "Si el correo existe, se envió el token." });
  } catch (error) {
    console.error("Recovery error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
