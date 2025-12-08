// Registration logic
if (document.getElementById("btnRegister")) {
  togglePw("toggleRegisterPw","r_pwd");
  preventCopyPasteById("r_pwd");

  // Expresión regular para validar contraseña
  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pwd);
  };

  document.getElementById("btnRegister").addEventListener("click", async () => {
    const nombre = document.getElementById("r_name").value.trim();
    const email = document.getElementById("r_email").value.trim();
    const password = document.getElementById("r_pwd").value;
    const msg = document.getElementById("regMsg");

    if (!nombre || !email || !password) {
      setMsg(msg, "Faltan campos");
      return;
    }

    // 🟢 VALIDACIÓN DE CONTRASEÑA
    if (!validatePassword(password)) {
      setMsg(msg, "La contraseña no cumple los requisitos");
      return;
    }

    try {
      const resp = await fetch(API + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });

      const data = await resp.json();

      if (!resp.ok) {
        setMsg(msg, data.error || "Error al registrar");
        return;
      }

      setMsg(msg, "Registrado. Redirigiendo...");
      setTimeout(() => window.location.href = "/login.html", 800);

    } catch (err) {
      setMsg(msg, "Error de conexión");
    }
  });
}
