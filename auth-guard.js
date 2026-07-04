// Auth guard — include on every protected page (after firebase-init.js + auth.js + scores.js).
// Redirects to login.html if not signed in; otherwise wires Scores to the current user
// and injects a small "Xin chào <name> — Đăng xuất" bar.

(function () {
  const inSubfolder = /\/unit-?\d+.*\//.test(location.pathname) || location.pathname.includes("/unit1-full-4modules/");
  const loginPath = inSubfolder ? "../login.html" : "login.html";

  window.Auth.onChange(async (user) => {
    if (!user) {
      location.href = loginPath + "?next=" + encodeURIComponent(location.pathname);
      return;
    }
    if (window.Scores) await window.Scores.setUser(user.uid);
    injectUserBar(user);
    window.dispatchEvent(new Event("scores-ready"));
    window.currentUser = user;
  });

  function injectUserBar(user) {
    const bar = document.createElement("div");
    bar.style.cssText = "position:fixed;top:8px;right:12px;z-index:9999;background:#14324A;color:#fff;padding:6px 14px;border-radius:999px;font-size:.78rem;font-family:sans-serif;display:flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,.15);";
    const name = user.displayName || user.email;
    const adminLink = window.Auth.isAdmin(user)
      ? `<a href="${inSubfolder ? '../admin.html' : 'admin.html'}" style="color:#FFD98E;text-decoration:underline;">🛠️ Quản trị</a>`
      : "";
    bar.innerHTML = `<span>👤 ${name}</span>${adminLink}<a href="#" id="logoutLink" style="color:#cfe0f5;text-decoration:underline;">Đăng xuất</a>`;
    document.body.appendChild(bar);
    document.getElementById("logoutLink").onclick = async (e) => {
      e.preventDefault();
      await window.Auth.logout();
      location.href = loginPath;
    };
  }
})();
