// utils/logger.js
import LoginAttempt from "../models/LoginAttempt.js";

export async function registrarIntentoFallido({ correo, nombre, ip, reason }) {
  try {
    await LoginAttempt.create({
      email: correo,
      name: nombre || null,
      ip: ip || "unknown",
      reason,
    });

    console.log("🔴 Intento de login fallido registrado:", {
      correo,
      nombre,
      ip,
      reason
    });

  } catch (err) {
    console.error("❌ Error al guardar intento fallido:", err);
  }
}
