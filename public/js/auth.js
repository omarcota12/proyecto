const API = "/api"; // si sirves desde el mismo dominio, sino pon la URL pública

// util: mostrar mensaje breve
function setMsg(el, txt, timeout = 4000) {
  el.innerText = txt;
  if (timeout) setTimeout(() => el.innerText = "", timeout);
}

// Toggle password visibility
function togglePw(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    input.type = input.type === "password" ? "text" : "password";
  });
}

// Block copy/paste already set in HTML attributes; also prevent programmatic pastes
function preventCopyPasteById(id) {
  const el = document.getElementById(id);
  if (!el) return;
  ["paste","copy","cut","drop"].forEach(ev => el.addEventListener(ev, e => e.preventDefault()));
}

// Registration logic
if (document.getElementById("btnRegister")) {
  togglePw("toggleRegisterPw","r_pwd");
  preventCopyPasteById("r_pwd");

  document.getElementById("btnRegister").addEventListener("click", async () => {
    const nombre = document.getElementById("r_name").value.trim();
    const email = document.getElementById("r_email").value.trim();
    const password = document.getElementById("r_pwd").value;
    const msg = document.getElementById("regMsg");

    if (!nombre || !email || !password) { setMsg(msg, "Faltan campos"); return; }

    try {
      const resp = await fetch(API + "/auth/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await resp.json();
      if (!resp.ok) { setMsg(msg, data.error || "Error"); return; }
      setMsg(msg, "Registrado. Redirigiendo...");
      setTimeout(() => window.location.href = "/login.html", 800);
    } catch (err) {
      setMsg(msg, "Error de conexión");
    }
  });
}

// Login logic
if (document.getElementById("btnLogin")) {
  togglePw("toggleLoginPw","l_pwd");
  preventCopyPasteById("l_pwd");

  document.getElementById("btnLogin").addEventListener("click", async () => {
    const email = document.getElementById("l_email").value.trim();
    const password = document.getElementById("l_pwd").value;
    const msg = document.getElementById("loginMsg");

    if (!email || !password) { setMsg(msg, "Faltan campos"); return; }

    try {
      const resp = await fetch(API + "/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (!resp.ok) { setMsg(msg, data.error || "Error"); return; }

      // Guardar token y redirigir a la app
      localStorage.setItem("token", data.token);
      setMsg(msg, "Login correcto. Redirigiendo...");
      setTimeout(() => window.location.href = "/app.html", 700);
    } catch (err) {
      setMsg(msg, "Error de conexión");
    }
  });
}
