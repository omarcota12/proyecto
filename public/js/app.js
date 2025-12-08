const API = "/api";

function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return null;
  }
  return token;
}

// Ejecutar al cargar app
document.addEventListener("DOMContentLoaded", () => {
  const token = requireAuth();
  if (!token) return;

  // logout
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    });
  }

  // Prevent copy/paste on password inputs
  ["enc_pwd","dec_pwd"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    ["paste","copy","cut","drop"].forEach(ev => el.addEventListener(ev, e => e.preventDefault()));
  });

  // Encrypt
  const btnEnc = document.getElementById("btnEnc");
  if (btnEnc) {
    btnEnc.addEventListener("click", async () => {
      const plain = document.getElementById("plain").value;
      const password = document.getElementById("enc_pwd").value;
      if (!plain || !password) return alert("Texto y clave requeridos");

      try {
        const resp = await fetch(API + "/crypto/encrypt", {
          method: "POST",
          headers: {"Content-Type":"application/json","Authorization":"Bearer " + token},
          body: JSON.stringify({ plain, password })
        });
        const data = await resp.json();
        if (!resp.ok) return alert(data.error || "Error");
        document.getElementById("cipher").value = data.cipher;
      } catch (err) {
        alert("Error de conexión");
      }
    });
  }

  // Decrypt
  const btnDec = document.getElementById("btnDec");
  if (btnDec) {
    btnDec.addEventListener("click", async () => {
      const cipher = document.getElementById("cipher_in").value;
      const password = document.getElementById("dec_pwd").value;
      if (!cipher || !password) return alert("Criptograma y clave requeridos");

      try {
        const resp = await fetch(API + "/crypto/decrypt", {
          method: "POST",
          headers: {"Content-Type":"application/json","Authorization":"Bearer " + token},
          body: JSON.stringify({ cipher, password })
        });
        const data = await resp.json();
        if (!resp.ok) return alert(data.error || "Error");
        document.getElementById("plain_out").value = data.plain;
      } catch (err) {
        alert("Error de conexión");
      }
    });
  }
});
