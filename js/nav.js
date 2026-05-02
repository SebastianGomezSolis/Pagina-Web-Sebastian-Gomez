(function() {
  const pages = [
    { href: 'index.html',        label: 'Inicio'},
    { href: 'fundamentos.html',  label: 'Fundamentos'},
    { href: 'html.html',         label: 'HTML'},
    { href: 'css.html',          label: 'CSS'},
    { href: 'backend.html',      label: 'Backend'},
    { href: 'javascript.html',   label: 'JavaScript'},
  ];

  const cur = window.location.pathname.split('/').pop() || 'index.html';

  // Topbar
  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.innerHTML = `
      <a class="topbar-brand" href="index.html">
        <img src="img/web-logo.png" alt="Logo">
        Programación IV
      </a>
      <div class="topbar-spacer"></div>
      <nav class="topbar-nav">
        ${pages.map(p => `<a href="${p.href}" class="${cur===p.href?'active':''}">${p.label}</a>`).join('')}
      </nav>
      <button class="menu-toggle" onclick="toggleSidebar()" aria-label="Menú">☰</button>
    `;
  }

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <p class="sidebar-label">Temas del curso</p>
      <ul class="sidebar-nav">
        ${pages.map(p => `<li><a href="${p.href}" class="${cur===p.href?'active':''}">${p.label}</a></li>`).join('')}
      </ul>
      <div class="sidebar-progress">
        <div class="prog-bar"><div class="prog-fill" id="progFill"></div></div>
        <p style="font-size:.75rem;color:#6b6b8a;margin-top:.4rem;">Tarea continua — 2026</p>
      </div>
    `;
    // Animate progress bar
    const idx = pages.findIndex(p => p.href === cur);
    setTimeout(() => {
      const fill = document.getElementById('progFill');
      if (fill) fill.style.width = Math.round(((idx+1)/pages.length)*100) + '%';
    }, 300);
  }
})();

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  if (s) s.classList.toggle('open');
}
