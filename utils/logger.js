import fs from "fs";
import path from "path";

const logsDir = path.resolve("logs");
const file = path.join(logsDir, "seguridad.log");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  fs.writeFileSync(file, "", { encoding: "utf8" });
}

export function registrarIntentoFallido({ ip = "unknown", correo = "unknown", reason = "" } = {}) {
  const linea = `[${new Date().toISOString()}] FAIL - IP: ${ip} - correo: ${correo} ${reason ? "- " + reason : ""}\n`;
  fs.appendFileSync(file, linea);
}
