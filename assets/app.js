/* Aplicação interativa do manual Brasil 1989–2030. Todos os dados vêm de data/data.js e data/manual.js, exportados do documento. */
(function () {
  'use strict';
  const D = window.DATA, M = window.MANUAL;
  const app = document.getElementById('app');
  const tip = document.getElementById('tip');
  const NAVY = '#002776', GREEN = '#009C3B', YEL = '#FFDF00', GOLD = '#C9A200', GREY = '#9AA5B1';
  const nf = (v, d = 0) => v == null ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v;

  function showTip(e, html) { tip.innerHTML = html; tip.style.opacity = 1; moveTip(e); }
  function moveTip(e) { const x = Math.min(e.clientX + 14, innerWidth - 270); tip.style.left = x + 'px'; tip.style.top = (e.clientY + 14) + 'px'; }
  function hideTip() { tip.style.opacity = 0; }
  function bindTips(root) {
    root.querySelectorAll('[data-tip]').forEach(n => {
      n.addEventListener('mousemove', e => showTip(e, n.getAttribute('data-tip')));
      n.addEventListener('mouseleave', hideTip);
      n.addEventListener('focus', e => { const r = n.getBoundingClientRect(); showTip({ clientX: r.left, clientY: r.bottom }, n.getAttribute('data-tip')); });
      n.addEventListener('blur', hideTip);
    });
  }
  function tableHTML(t, opts = {}) {
    if (!t) return '';
    const h = t.header.map((c, i) => `<th class="sortable" data-col="${i}">${md(c)}</th>`).join('');
    const rows = t.rows.map(r => `<tr>${r.map((c, i) => `<td data-label="${esc(t.header[i] || '').replace(/\*/g, '')}">${md(c)}</td>`).join('')}</tr>`).join('');
    return `<div class="scroll"><table class="stack ${opts.cls || ''}"><thead><tr>${h}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function sortable(root) {
    root.querySelectorAll('table').forEach(tb => {
      tb.querySelectorAll('th.sortable').forEach(th => th.addEventListener('click', () => {
        const i = +th.dataset.col, body = tb.tBodies[0], rows = [...body.rows];
        const dir = th.dataset.dir === 'asc' ? -1 : 1; th.dataset.dir = dir === 1 ? 'asc' : 'desc';
        const val = r => { const t = r.cells[i].innerText.replace(/\./g, '').replace(',', '.').replace(/[^\d.\-]/g, ''); return t && !isNaN(+t) ? +t : r.cells[i].innerText; };
        rows.sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; });
        rows.forEach(r => body.appendChild(r));
      }));
    });
  }
  const cw = (el, min = 320) => Math.max(min, Math.floor((el && el.clientWidth) || 760));
  const small = () => innerWidth < 640;
  function labelTables(root) {
    root.querySelectorAll('.doc table').forEach(tb => {
      tb.classList.add('stack');
      const hs = [...tb.querySelectorAll('thead th')].map(th => th.textContent.trim());
      tb.querySelectorAll('tbody tr').forEach(tr => [...tr.cells].forEach((td, i) => td.setAttribute('data-label', hs[i] || '')));
    });
    root.querySelectorAll('.doc figure img').forEach(img => {
      img.style.cursor = 'zoom-in'; img.title = 'Clique para ampliar';
      img.addEventListener('click', () => openLightbox(img.src, img.closest('figure').querySelector('figcaption')?.textContent || ''));
    });
  }
  function openLightbox(src, cap) {
    const lb = document.createElement('div'); lb.className = 'lightbox';
    lb.innerHTML = `<button class="lb-close" aria-label="Fechar">✕</button><div class="lb-inner"><img src="${src}" alt=""><p>${esc(cap)}${small() ? " · Deslize lateralmente para ver a figura inteira." : ""}</p></div>`;
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-close')) lb.remove(); });
    addEventListener('keydown', function k(e) { if (e.key === 'Escape') { lb.remove(); removeEventListener('keydown', k); } });
    document.body.appendChild(lb);
    const im = lb.querySelector('img'); const center = () => { lb.scrollLeft = (lb.scrollWidth - lb.clientWidth) / 2; }; im.complete ? center() : im.addEventListener('load', center);
  }
  function placeLabels(items, minGap) {
    // items: {y, h} sorted; push down to avoid overlap
    items.sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) if (items[i].y < items[i - 1].y + minGap) items[i].y = items[i - 1].y + minGap;
    return items;
  }
  function findSection(num) { for (const p of M.parts) for (const s of p.sections) if (s.num === num) return s; return null; }
  const srcLink = (txt) => `<p class="src">Fonte: ${txt}</p>`;

  /* ---------------- views ---------------- */
  const views = {};

  views.inicio = () => {
    const r = D.resultado, t2 = r.turno2, t1 = r.turno1;
    const resumo = M.parts[0].sections[0];
    app.innerHTML = `
      <span class="tag">Edição de outubro de 2026</span>
      <h1>Depois da virada: governar, articular e preparar 2028 e 2030</h1>
      <p class="lead">Lula foi reeleito com ${nf(t2.lula.pct, 2)}% dos votos válidos, depois de terminar o 1º turno em segundo lugar. Esta aplicação apresenta os dados do manual sobre o resultado, o novo Congresso, os atores, os cenários e as políticas propostas para 2027–2030.</p>
      <div class="grid g4" style="margin-top:16px">
        <div class="card kpi g"><div class="n">${nf(t2.lula.pct, 2)}%</div><div class="l">Lula no 2º turno</div><div class="s">${nf(t2.lula.votos)} votos</div></div>
        <div class="card kpi"><div class="n">${nf(t2.diferenca / 1e6, 1)} mi</div><div class="l">de vantagem</div><div class="s">margem superior à de 2022</div></div>
        <div class="card kpi"><div class="n">+${nf(r.ganhoEntreTurnos.lula / 1e6, 1)} mi</div><div class="l">votos de Lula entre os turnos</div><div class="s">Flávio: +${nf(r.ganhoEntreTurnos.flavio / 1e6, 1)} mi</div></div>
        <div class="card kpi"><div class="n">${nf(t2.abstencao, 2)}%</div><div class="l">abstenção no 2º turno</div><div class="s">1º turno: ${nf(t1.abstencao, 2)}%</div></div>
      </div>
      <h2>Módulos</h2>
      <div class="grid g3">
        ${[['mapa', 'Mapa do 2º turno', 'Estados, regiões, capitais e governadores eleitos'], ['perfil', 'Perfil do voto', 'Desempenho de Lula por sexo, renda, religião, raça e região'],
           ['congresso', 'Calculadora de coalizão', 'Simulação de maiorias na Câmara e no Senado de 2027'], ['historia', 'Série histórica', 'O PT nas urnas de 1989 a 2026'],
           ['atores', 'Atores e poder', 'Índice de Poder Estratégico e redes'], ['foresight', 'Conjuntura e foresight', 'Forças motrizes, sinais e monitor de cenários'],
           ['politicas', 'Políticas públicas', 'As sete políticas prioritárias em detalhe'], ['metas', 'Metas e riscos', 'Indicadores 2028–2030 e matriz de riscos'],
           ['ctis', 'CTIS e PICAPS', 'Contribuição da inteligência cooperativa territorial ao plano'], ['documentos', 'Documentos', 'O manual completo em PDF e em Word']]
          .map(([h, t, s]) => `<a class="card" href="#${h}" style="text-decoration:none"><h3 style="margin:0">${t}</h3><div class="src" style="margin:4px 0 0">${s}</div></a>`).join('')}
      </div>
      <h2>Resumo executivo</h2>
      <div class="doc" id="res0">${resumo.html}</div>`;
    labelTables(app);
  };

  views.mapa = () => {
    let mode = '2t', region = 'Todas', sel = null;
    app.innerHTML = `<span class="tag">Seção 3.3</span><h1>Mapa do 2º turno de 2026</h1>
      <p class="lead">Lula venceu em 13 unidades da Federação e inverteu o resultado do 1º turno apenas em Minas Gerais. Selecione um estado para ver os detalhes.</p>
      <div class="controls">
        <div class="seg" id="mode"><button data-v="2t" class="on">2º turno: % de Lula</button><button data-v="1t">1º turno: vencedor</button><button data-v="gov">Governadores</button></div>
        <select id="reg" aria-label="Região"><option>Todas</option>${['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'].map(r => `<option>${r}</option>`).join('')}</select>
      </div>
      <div class="grid g2">
        <div class="card"><svg id="map" class="map" viewBox="${D.meta.mapViewBox.join(' ')}" role="img" aria-label="Mapa do Brasil por unidade da Federação"></svg><div class="legend" id="leg"></div></div>
        <div class="card"><div id="detail"></div><h3>Ranking</h3><div id="rank"></div></div>
      </div>
      <h2>Capitais no 2º turno</h2><div class="card"><div id="caps"></div></div>
      ${srcLink('TSE, via imprensa (25–26/10/2026), conforme as Seções 3.2 e 3.3 do manual', 's3-3')}`;
    const color = s => {
      if (mode === '2t') { const v = s.lula2t; const t = Math.min(Math.abs(v - 50) / 25, 1); return v >= 50 ? mix('#BFE5CC', '#007A2E', t) : mix('#C9D3E8', '#001F5E', t); }
      if (mode === '1t') { const t = Math.min((s.pctVencedor1t - 40) / 32, 1); return s.vencedor1t === 'Lula' ? mix('#BFE5CC', '#007A2E', t) : mix('#C9D3E8', '#001F5E', t); }
      const pc = { PT: '#009C3B', PL: '#002776', PSD: '#5BA3D6', Republicanos: '#7A8699', PP: '#B9C2CF', PSDB: '#E0B800', MDB: '#C77D3A', Podemos: '#8E6BBF' };
      return pc[s.partidoGov] || '#ccc';
    };
    function mix(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)); const A = p(a), B = p(b); return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join(''); }
    function draw() {
      const svg = document.getElementById('map');
      svg.innerHTML = D.estados.map(s => `<path d="${s.path}" fill="${color(s)}" opacity="${region === 'Todas' || s.regiao === region ? 1 : .18}" data-uf="${s.uf}" tabindex="0" class="${sel === s.uf ? 'sel' : ''}"><title>${s.nome}</title></path>`).join('') +
        D.estados.filter(s => !['DF', 'SE', 'AL', 'PB', 'RN', 'PE', 'ES', 'RJ'].includes(s.uf)).map(s => `<text x="${s.cx}" y="${s.cy}" text-anchor="middle" font-size="11" font-weight="700" fill="${lum(color(s)) < .5 ? '#fff' : '#002776'}" pointer-events="none">${s.uf}</text>`).join('');
      svg.querySelectorAll('path').forEach(p => {
        const s = D.estados.find(x => x.uf === p.dataset.uf);
        const h = `<b>${s.nome}</b><br>2º turno: Lula ${nf(s.lula2t, 2)}% · Flávio ${nf(s.flavio2t, 2)}%<br>1º turno: ${s.vencedor1t} à frente (${nf(s.pctVencedor1t, 1)}%)<br>Governador: ${s.governador} (${s.partidoGov})`;
        p.addEventListener('mousemove', e => showTip(e, h)); p.addEventListener('mouseleave', hideTip);
        p.addEventListener('click', () => { sel = s.uf; draw(); detail(); });
        p.addEventListener('keydown', e => { if (e.key === 'Enter') { sel = s.uf; draw(); detail(); } });
      });
      const L = document.getElementById('leg');
      L.innerHTML = mode === 'gov' ? Object.entries({ PT: '#009C3B', PL: '#002776', PSD: '#5BA3D6', Republicanos: '#7A8699', PP: '#B9C2CF', PSDB: '#E0B800', MDB: '#C77D3A', Podemos: '#8E6BBF' }).map(([k, v]) => `<span><i style="background:${v}"></i>${k}</span>`).join('')
        : `<span><i style="background:#007A2E"></i>Lula à frente</span><span><i style="background:#001F5E"></i>Flávio à frente</span><span>Tom mais escuro = margem maior</span>`;
      rank();
    }
    function lum(h) { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255); return .2126 * r + .7152 * g + .0722 * b; }
    function detail() {
      const s = D.estados.find(x => x.uf === sel); const el = document.getElementById('detail');
      if (!s) { el.innerHTML = '<p class="src">Selecione um estado no mapa.</p>'; return; }
      el.innerHTML = `<h2 style="margin-top:0">${s.nome} <span class="pill">${s.regiao}</span></h2>
        <div class="grid g2"><div class="kpi"><div class="n" style="color:${GREEN}">${nf(s.lula2t, 2)}%</div><div class="l">Lula, 2º turno</div></div><div class="kpi"><div class="n">${nf(s.flavio2t, 2)}%</div><div class="l">Flávio, 2º turno</div></div></div>
        <p>1º turno: <b>${s.vencedor1t}</b> à frente com ${nf(s.pctVencedor1t, 1)}%. Governador eleito: <b>${s.governador}</b> (${s.partidoGov})${s.govAliado ? ', eleito com apoio de Lula' : ''}.</p>`;
    }
    function rank() {
      const list = D.estados.filter(s => region === 'Todas' || s.regiao === region).slice().sort((a, b) => b.lula2t - a.lula2t);
      const W = cw(document.getElementById('rank'), 300), rh = 20, H = list.length * rh + 24, x = v => 120 + (v / 100) * (W - 170);
      document.getElementById('rank').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ranking dos estados pelo voto em Lula">
        <line x1="${x(50)}" x2="${x(50)}" y1="0" y2="${H - 18}" stroke="${GOLD}" stroke-dasharray="4 3"/><text x="${x(50)}" y="${H - 4}" font-size="11" text-anchor="middle" fill="${css('--muted')}">50%</text>
        ${list.map((s, i) => `<g data-tip="<b>${s.nome}</b><br>Lula ${nf(s.lula2t, 2)}%" tabindex="0"><text x="114" y="${i * rh + 14}" font-size="12" text-anchor="end" fill="${css('--ink')}">${s.nome}</text>
          <rect x="120" y="${i * rh + 4}" width="${x(s.lula2t) - 120}" height="13" rx="2" fill="${s.lula2t >= 50 ? GREEN : NAVY}"/>
          <text x="${x(s.lula2t) + 4}" y="${i * rh + 14}" font-size="11.5" font-weight="700" fill="${css('--ink')}">${nf(s.lula2t, 1)}</text></g>`).join('')}</svg>`;
      bindTips(document.getElementById('rank'));
    }
    const caps = D.capitais2t.slice().sort((a, b) => (a.vencedor === b.vencedor ? b.pct - a.pct : a.vencedor === 'Lula' ? -1 : 1));
    document.getElementById('caps').innerHTML = `<div class="legend" style="margin-bottom:8px"><span><i style="background:${GREEN}"></i>Lula venceu (${caps.filter(c => c.vencedor === 'Lula').length})</span><span><i style="background:${NAVY}"></i>Flávio venceu (${caps.filter(c => c.vencedor !== 'Lula').length})</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${caps.map(c => `<span class="pill" style="background:${c.vencedor === 'Lula' ? GREEN : NAVY};color:#fff" data-tip="${c.cidade}: ${c.vencedor} ${nf(c.pct, 2)}%" tabindex="0">${c.cidade} ${nf(c.pct, 1)}</span>`).join('')}</div>`;
    bindTips(document.getElementById('caps'));
    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.v; document.querySelectorAll('#mode button').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    document.getElementById('reg').addEventListener('change', e => { region = e.target.value; draw(); });
    sel = 'MG'; draw(); detail();
  };

  views.perfil = () => {
    const S = D.segmentos;
    app.innerHTML = `<span class="tag">Seção 3.4</span><h1>Perfil do voto no 2º turno</h1>
      <p class="lead">Vantagem de Lula sobre Flávio por segmento. Não houve pesquisa de boca de urna, e a pesquisa Datafolha utilizada apontava empate (50% a 50%), enquanto Lula obteve 51,8% dos votos válidos. Os recortes indicam, portanto, a direção do voto, não sua magnitude exata.</p>
      <div class="controls"><div class="seg" id="vis"><button data-v="margem" class="on">Vantagem (pontos)</button><button data-v="pct">Lula × Flávio (%)</button></div>
      <select id="grp" aria-label="Dimensão"><option value="">Todas as dimensões</option>${S.grupos.map(g => `<option>${g.grupo}</option>`).join('')}</select>
      <label style="font-size:14px"><input type="checkbox" id="adj"> Ajustar pela diferença entre pesquisa e resultado (+1,8 ponto para Lula)</label></div>
      <div class="card"><div id="seg"></div></div>${srcLink(S.fonte, 's3-4')}
      <h2>Segmentos prioritários do plano</h2><div class="card">${tableHTML(D.tabelas.segmentosPrioritarios)}</div>${srcLink('Seção 9.8 do manual', 's9-8')}`;
    let vis = 'margem';
    function draw() {
      const g = document.getElementById('grp').value, adj = document.getElementById('adj').checked ? 1.8 : 0;
      const rows = []; S.grupos.filter(x => !g || x.grupo === g).forEach(x => { rows.push({ h: x.grupo }); x.itens.forEach(([n, a, b]) => rows.push({ n, a: a + adj, b: b - adj })); });
      const el0 = document.getElementById('seg'), W = cw(el0), rh = 26, H = rows.length * rh + 10;
      const lab = small() ? 128 : 190, maxNeg = 50, maxPos = 40;
      const sc = (W - lab - 84) / (maxNeg + maxPos), mid = lab + 40 + maxNeg * sc;
      let y = 0, out = '';
      rows.forEach(r => {
        if (r.h) { out += `<text x="10" y="${y + 18}" font-family="BC" font-weight="700" font-size="14" fill="${GREEN}">${r.h.toUpperCase()}</text>`; y += rh; return; }
        const m = r.a - r.b, tipH = `<b>${r.n}</b><br>Lula ${nf(r.a, 1)}% · Flávio ${nf(r.b, 1)}%<br>Vantagem: ${m > 0 ? '+' : ''}${nf(m, 1)}`;
        if (vis === 'margem') {
          const w = Math.abs(m) * sc, x = m >= 0 ? mid : mid - w;
          out += `<g data-tip="${tipH}" tabindex="0"><text x="${lab}" y="${y + 17}" text-anchor="end" font-size="${small() ? 11.5 : 13}" fill="${css('--ink')}">${r.n}</text>
            <rect x="${x}" y="${y + 5}" width="${w}" height="16" rx="2" fill="${m >= 0 ? GREEN : NAVY}"/>
            <text x="${m >= 0 ? x + w + 5 : x - 5}" y="${y + 17}" font-size="12.5" font-weight="700" text-anchor="${m >= 0 ? 'start' : 'end'}" fill="${css('--ink')}">${m > 0 ? '+' : ''}${nf(m, 1)}</text></g>`;
        } else {
          const x0 = lab + 8, ww = W - x0 - 10;
          out += `<g data-tip="${tipH}" tabindex="0"><text x="${x0 - 8}" y="${y + 17}" text-anchor="end" font-size="${small() ? 11.5 : 13}" fill="${css('--ink')}">${r.n}</text>
            <rect x="${x0}" y="${y + 5}" width="${ww * r.a / 100}" height="16" fill="${GREEN}"/><rect x="${x0 + ww * r.a / 100}" y="${y + 5}" width="${ww * r.b / 100}" height="16" fill="${NAVY}"/>
            <text x="${x0 + 5}" y="${y + 17}" font-size="12" font-weight="700" fill="#fff">${nf(r.a, 1)}</text><text x="${x0 + ww - 5}" y="${y + 17}" font-size="12" font-weight="700" fill="#fff" text-anchor="end">${nf(r.b, 1)}</text></g>`;
        }
        y += rh;
      });
      if (vis === 'margem') out = `<line x1="${mid}" x2="${mid}" y1="0" y2="${H}" stroke="${GREY}"/>` + out;
      else { const x0 = lab + 8, ww = W - x0 - 10; out = `<line x1="${x0 + ww / 2}" x2="${x0 + ww / 2}" y1="0" y2="${H}" stroke="${YEL}" stroke-width="2"/>` + out; }
      document.getElementById('seg').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Voto por segmento">${out}</svg>`;
      bindTips(document.getElementById('seg'));
    }
    document.querySelectorAll('#vis button').forEach(b => b.addEventListener('click', () => { vis = b.dataset.v; document.querySelectorAll('#vis button').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    document.getElementById('grp').addEventListener('change', draw); document.getElementById('adj').addEventListener('change', draw);
    draw(); sortable(app);
  };

  views.congresso = () => {
    let casa = 'camara';
    const preset = { esquerda: ['PT-PCdoB-PV', 'PSB', 'PSOL-Rede', 'PDT', 'PT', 'Rede'], anel: ['PT-PCdoB-PV', 'PSB', 'PSOL-Rede', 'PDT', 'MDB', 'PSD', 'PT', 'Rede'],
      ampla: ['PT-PCdoB-PV', 'PSB', 'PSOL-Rede', 'PDT', 'MDB', 'PSD', 'União-PP', 'Republicanos', 'Podemos', 'PSDB-Cidadania', 'Avante', 'PRD-Solidariedade', 'PT', 'Rede', 'PP', 'União', 'PSDB'],
      oposicao: ['PL', 'Novo', 'Missão', 'PP', 'Republicanos'] };
    app.innerHTML = `<span class="tag">Seções 3.2 e 9.3</span><h1>Calculadora de coalizão, 2027</h1>
      <p class="lead">Selecione os partidos para somar as cadeiras e verificar quais quóruns de votação a coalizão alcança. Os atalhos reproduzem os círculos de coalizão propostos no manual.</p>
      <div class="controls"><div class="seg" id="casa"><button data-v="camara" class="on">Câmara (513)</button><button data-v="senado">Senado (81)</button></div>
      <div class="seg" id="pre"><button data-v="esquerda">Núcleo de esquerda</button><button data-v="anel">+ MDB e PSD</button><button data-v="ampla">Coalizão ampla</button><button data-v="oposicao">Bloco de direita</button><button data-v="none">Limpar</button></div></div>
      <div class="grid g2"><div class="card" id="plist"></div><div class="card"><div id="tot"></div><div id="bar"></div><div id="thr"></div></div></div>
      <h2>Arquitetura da coalizão proposta</h2><div class="card">${tableHTML(D.tabelas.coalizao)}</div>${srcLink('Agência Câmara e CNN Brasil (5/10/2026); Agência Senado (25/10/2026); Seções 3.2 e 9.3', 's9-3')}`;
    let on = new Set(preset.anel);
    function data() { return casa === 'camara' ? D.camara2027 : D.senado2027; }
    function draw() {
      const P = data().partidos, tot = casa === 'camara' ? 513 : 81;
      document.getElementById('plist').innerHTML = `<h3 style="margin-top:0">Partidos e federações</h3>` + P.map(p => `<label class="party"><input type="checkbox" data-p="${p.p}" ${on.has(p.p) ? 'checked' : ''}> ${p.p}${p.bloco ? ` <span class="pill">${p.bloco}</span>` : ''}<span class="c">${p.c}</span></label>`).join('');
      document.querySelectorAll('#plist input').forEach(i => i.addEventListener('change', () => { i.checked ? on.add(i.dataset.p) : on.delete(i.dataset.p); draw(); }));
      const sum = P.filter(p => on.has(p.p)).reduce((s, p) => s + p.c, 0);
      document.getElementById('tot').innerHTML = `<div class="kpi"><div class="n">${sum}</div><div class="l">cadeiras na coalizão, de ${tot}</div></div>`;
      const W = cw(document.getElementById('bar'), 300), x = v => 10 + v / tot * (W - 20);
      let acc = 0, bars = '';
      P.filter(p => on.has(p.p)).forEach(p => { bars += `<rect x="${x(acc)}" y="30" width="${x(p.c) - 10}" height="34" fill="${p.bloco === 'Esquerda' || ['PT', 'PSB', 'Rede', 'PDT'].includes(p.p) ? GREEN : p.bloco === 'Direita ideológica' || ['PL', 'Novo'].includes(p.p) ? NAVY : '#B9C2CF'}" stroke="${css('--card')}" data-tip="${p.p}: ${p.c}" tabindex="0"/>`; acc += p.c; });
      const L = data().limiares;
      document.getElementById('bar').innerHTML = `<svg viewBox="0 0 ${W} 100" role="img" aria-label="Soma de cadeiras e limiares"><rect x="10" y="30" width="${W - 20}" height="34" fill="${css('--line')}"/>${bars}
        ${L.map((l, i) => `<line x1="${x(l.v)}" x2="${x(l.v)}" y1="20" y2="74" stroke="${GOLD}" stroke-width="2" stroke-dasharray="${i ? '4 3' : ''}"/><text x="${x(l.v)}" y="${i % 2 ? 90 : 15}" font-size="12" text-anchor="middle" fill="${css('--ink')}" font-weight="700">${l.v}</text>`).join('')}</svg>`;
      bindTips(document.getElementById('bar'));
      document.getElementById('thr').innerHTML = L.map(l => `<p style="margin:6px 0"><span class="status ${sum >= l.v ? 'ok' : 'no'}">${sum >= l.v ? '✓' : '✗'}</span> ${l.n} (${l.v}): ${sum >= l.v ? 'alcançada' : `faltam ${l.v - sum}`}</p>`).join('');
    }
    document.querySelectorAll('#casa button').forEach(b => b.addEventListener('click', () => { casa = b.dataset.v; document.querySelectorAll('#casa button').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    document.querySelectorAll('#pre button').forEach(b => b.addEventListener('click', () => { on = new Set(b.dataset.v === 'none' ? [] : preset[b.dataset.v]); draw(); }));
    draw(); sortable(app);
  };

  views.historia = () => {
    const H = D.serieHistorica;
    app.innerHTML = `<span class="tag">Seção 3.2</span><h1>O PT nas urnas, 1989–2026</h1>
      <p class="lead">Desde 2018, o voto presidencial do PT oscila entre 45% e 52%, patamar muito superior à força municipal do partido.</p>
      <div class="controls"><div class="seg" id="ser"><button data-v="pres" class="on">Presidência (% válidos)</button><button data-v="dep">Deputados federais</button><button data-v="pref">Prefeituras</button></div></div>
      <div class="card"><div id="ch"></div></div>${srcLink('TSE, conforme a Seção 3.2', 's3-2')}
      <h2>Painel por governo</h2><div class="card">${tableHTML(D.tabelas.painelGovernos)}</div>${srcLink('Seção 2.7', 's2-7')}
      <h2>Pobreza e desigualdade</h2><div class="card">${tableHTML(D.tabelas.pobreza)}</div>${srcLink('IPEA, Seção 2.2', 's2-2')}`;
    function line(series, xs, yMax, unit) {
      const W = cw(document.getElementById('ch')), Hh = small() ? 300 : 340, l = 46, r = small() ? 92 : 120, t = 20, b = 36, X = v => l + (v - xs[0]) / (xs[xs.length - 1] - xs[0]) * (W - l - r), Y = v => t + (1 - v / yMax) * (Hh - t - b);
      let g = '';
      for (let v = 0; v <= yMax; v += yMax / 5) g += `<line x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${css('--line')}"/><text x="${l - 6}" y="${Y(v) + 4}" font-size="11" text-anchor="end" fill="${css('--muted')}">${nf(v)}${unit}</text>`;
      xs.forEach((x, i) => { if (small() && i % 2) return; g += `<text x="${X(x)}" y="${Hh - 12}" font-size="11" text-anchor="middle" fill="${css('--muted')}">${x}</text>`; });
      series.forEach(s => {
        const pts = xs.map((x, i) => [x, s.v[i]]).filter(p => p[1] != null);
        g += `<polyline points="${pts.map(p => X(p[0]) + ',' + Y(p[1])).join(' ')}" fill="none" stroke="${s.c}" stroke-width="3"/>`;
        pts.forEach(p => { g += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5" fill="${s.c}" data-tip="<b>${p[0]}</b><br>${s.n}: ${nf(p[1], unit === '%' ? 1 : 0)}${unit}" tabindex="0"/>`; });
        const last = pts[pts.length - 1]; s._ly = Y(last[1]) + 4; s._lx = X(last[0]) + 8; s._lt = `${s.n} ${nf(last[1], unit === '%' ? 1 : 0)}${unit}`;
      });
      placeLabels(series.map(s => ({ s, y: s._ly })), 16).forEach(o => { g += `<text x="${o.s._lx}" y="${o.y}" font-size="${small() ? 11.5 : 13}" font-weight="700" fill="${o.s.c}">${o.s._lt}</text>`; });
      series.forEach(s => {
      });
      if (unit === '%') g = `<line x1="${l}" x2="${W - r}" y1="${Y(50)}" y2="${Y(50)}" stroke="${GOLD}" stroke-dasharray="5 4"/>` + g;
      return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Série histórica">${g}</svg>`;
    }
    function draw(v) {
      const el = document.getElementById('ch');
      if (v === 'pres') el.innerHTML = line([{ n: '2º turno', v: H.turno2, c: GREEN }, { n: '1º turno', v: H.turno1, c: css('--navy') }], H.anos, 70, '%');
      if (v === 'dep') el.innerHTML = line([{ n: 'Deputados', v: H.deputados, c: css('--navy') }], H.anos, 100, '');
      if (v === 'pref') el.innerHTML = line([{ n: 'Prefeitos', v: H.prefeitos.valores, c: GREEN }], H.prefeitos.anos, 700, '');
      bindTips(el);
    }
    document.querySelectorAll('#ser button').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#ser button').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.v); }));
    draw('pres'); sortable(app);
  };

  views.atores = () => {
    const A = D.atores; const cols = { progressista: GREEN, conservadora: NAVY, disputa: GOLD };
    app.innerHTML = `<span class="tag">Seções 6.1 e 6.2</span><h1>Atores e recursos de poder</h1>
      <p class="lead">Índice de Poder Estratégico (governo = 100) dos 16 atores do sistema político nacional, segundo o modelo DeepSIC do manual.</p>
      <div class="controls"><div class="seg" id="rede"><button data-v="" class="on">Todas</button><button data-v="progressista">Progressista</button><button data-v="conservadora">Conservadora</button><button data-v="disputa">Em disputa</button></div></div>
      <div class="grid g2"><div class="card"><div id="ipe"></div></div><div class="card"><h3 style="margin-top:0">Poder ponderado por rede</h3><div id="pie"></div>
      <div class="legend"><span><i style="background:${NAVY}"></i>Conservadora ${nf(A.redes.conservadora, 1)}%</span><span><i style="background:${GREEN}"></i>Progressista ${nf(A.redes.progressista, 1)}%</span><span><i style="background:${GOLD}"></i>Em disputa ${nf(A.redes.disputa, 1)}%</span></div></div></div>
      <h2>Sociometria da rede</h2><div class="card">${tableHTML(findSection('6.2').tables[0])}</div>${srcLink('Modelo DeepSIC, linha de base de outubro de 2026 (Seções 6.1 e 6.2)', 's6-1')}
      <h2>Correlação de forças depois da eleição</h2><div class="card">${tableHTML(D.tabelas.correlacao)}</div>${srcLink('Seção 7.2', 's7-2')}`;
    function draw(f) {
      const L = A.ipe.filter(a => !f || a[2] === f), W = cw(document.getElementById('ipe'), 300), rh = 24, Hh = L.length * rh + 8, x = v => 130 + v / 100 * (W - 170);
      document.getElementById('ipe').innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Índice de Poder Estratégico">${L.map((a, i) => `<g data-tip="<b>${a[0]}</b><br>IPE ${a[1]} · rede ${a[2]}" tabindex="0"><text x="124" y="${i * rh + 16}" font-size="12.5" text-anchor="end" fill="${css('--ink')}">${a[0]}</text><rect x="130" y="${i * rh + 5}" width="${x(a[1]) - 130}" height="15" rx="2" fill="${cols[a[2]]}"/><text x="${x(a[1]) + 5}" y="${i * rh + 16}" font-size="12" font-weight="700" fill="${css('--ink')}">${a[1]}</text></g>`).join('')}</svg>`;
      bindTips(document.getElementById('ipe'));
    }
    const R = A.redes, tot = R.conservadora + R.progressista + R.disputa; let a0 = -Math.PI / 2, arcs = '';
    [['conservadora', NAVY], ['progressista', GREEN], ['disputa', GOLD]].forEach(([k, c]) => {
      const a1 = a0 + R[k] / tot * 2 * Math.PI, r = 90, cx = 120, cy = 110, large = a1 - a0 > Math.PI ? 1 : 0;
      arcs += `<path d="M${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}" fill="none" stroke="${c}" stroke-width="34" data-tip="${k}: ${nf(R[k], 1)}%" tabindex="0"/>`; a0 = a1;
    });
    document.getElementById('pie').innerHTML = `<svg viewBox="0 0 240 220" style="max-width:280px" role="img" aria-label="Poder por rede">${arcs}<text x="120" y="116" text-anchor="middle" font-family="BC" font-weight="800" font-size="22" fill="${css('--navy')}">16 atores</text></svg>`;
    bindTips(document.getElementById('pie'));
    document.querySelectorAll('#rede button').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#rede button').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.v); }));
    draw(''); sortable(app);
  };

  views.foresight = () => {
    const C = D.tabelas.cenarios;
    app.innerHTML = `<span class="tag">Parte 7 e Seção 6.4</span><h1>Conjuntura e foresight</h1>
      <p class="lead">O monitor indica o cenário compatível com os valores informados para os sinais de alerta. Os limiares são os da Seção 6.4; os cenários, os da Seção 7.6.</p>
      <div class="grid g2">
        <div class="card"><h3 style="margin-top:0">Monitor de sinais</h3>
          <label>Brent (US$ por barril): <b id="vb"></b><br><input id="brent" type="range" min="60" max="160" value="116" style="width:100%"></label>
          <label>Aprovação do governo (ótimo e bom, %): <b id="va"></b><br><input id="apr" type="range" min="15" max="65" value="38" style="width:100%"></label>
          <label>Taxa de vitória em votações nominais (%): <b id="vv"></b><br><input id="vit" type="range" min="40" max="100" value="72" style="width:100%"></label>
          <label>Inflação de alimentos em 12 meses (%): <b id="vi"></b><br><input id="inf" type="range" min="0" max="15" step=".5" value="6" style="width:100%"></label>
          <label class="party"><input type="checkbox" id="org"> Metas organizativas em dia (comitês, criadores, lista da sucessão)</label>
          <label class="party"><input type="checkbox" id="stf"> Pedido de impeachment de ministro do STF pautado no Senado</label>
          <div id="alerts" style="margin-top:10px"></div></div>
        <div id="scen" class="grid g2" style="align-content:start"></div>
      </div>
      <h2>Forças motrizes: impacto e incerteza</h2><div class="card"><div id="drv"></div></div>${srcLink('Avaliação qualitativa do manual, Seção 7.3', 's7-3')}
      <h2>Sinais fracos e eventos de ruptura</h2><div class="card">${tableHTML(D.tabelas.sinaisFracos)}</div>${srcLink('Seção 7.4', 's7-4')}`;
    const ids = ['brent', 'apr', 'vit', 'inf', 'org', 'stf'];
    function calc() {
      const v = Object.fromEntries(ids.map(i => [i, document.getElementById(i).type === 'checkbox' ? document.getElementById(i).checked : +document.getElementById(i).value]));
      document.getElementById('vb').textContent = v.brent; document.getElementById('va').textContent = v.apr; document.getElementById('vv').textContent = v.vit; document.getElementById('vi').textContent = nf(v.inf, 1);
      const choque = v.brent > 120 || v.inf > 8 || v.apr < 30; const org = v.org && v.vit >= 70 && !v.stf;
      const al = [];
      if (v.brent > 120) al.push('Brent acima de US$ 120: choque de energia'); if (v.inf > 8) al.push('Inflação de alimentos acima de 8%');
      if (v.vit < 70) al.push('Coalizão abaixo de 70% de vitórias'); if (v.apr < 30) al.push('Aprovação abaixo de 30%'); if (v.stf) al.push('Impeachment de ministro do STF pautado no Senado');
      document.getElementById('alerts').innerHTML = al.length ? al.map(a => `<p style="margin:4px 0"><span class="status no">!</span> ${a}</p>`).join('') : '<p class="ok"><b>Nenhum limiar de alerta ultrapassado.</b></p>';
      const name = !choque && org ? 'Reconstrução' : choque && org ? 'Resistência organizada' : !choque && !org ? 'Governo refém' : 'Restauração';
      document.getElementById('scen').innerHTML = C.rows.map(r => `<div class="scen ${r[0] === name ? 'on' : ''}"><h3>${md(r[0])}${r[0] === name ? ' <span class="pill">cenário indicado</span>' : ''}</h3><p style="font-size:14px">${md(r[1])}</p><p class="src"><b>Sinais:</b> ${md(r[2])}</p><p class="src"><b>Estratégia:</b> ${md(r[3])}</p></div>`).join('');
    }
    ids.forEach(i => document.getElementById(i).addEventListener('input', calc)); calc();
    const drv = document.getElementById('drv'), P = D.drivers.itens, W = cw(drv), Hh = small() ? 520 : 440, X = u => 40 + u / 10.5 * (W - 60), Y = i => 20 + (1 - (i - 3.8) / 5.8) * (Hh - 60);
    const fs = small() ? 10.5 : 12;
    let svgc = `<rect x="${X(5)}" y="${Y(9.6)}" width="${X(10.5) - X(5)}" height="${Y(6.5) - Y(9.6)}" fill="${css('--pale')}"/>
      <text x="${X(10.4)}" y="${Y(9.45)}" text-anchor="end" font-size="${fs}" font-weight="700" fill="${css('--navy')}">INCERTEZAS CRÍTICAS</text>
      <line x1="${X(5)}" x2="${X(5)}" y1="${Y(9.6)}" y2="${Y(3.8)}" stroke="${css('--line')}"/><line x1="${X(0)}" x2="${X(10.5)}" y1="${Y(6.5)}" y2="${Y(6.5)}" stroke="${css('--line')}"/>
      <text x="${W / 2}" y="${Hh - 10}" font-size="12" text-anchor="middle" fill="${css('--muted')}">Incerteza →</text><text x="14" y="${Hh / 2}" font-size="12" transform="rotate(-90 14 ${Hh / 2})" text-anchor="middle" fill="${css('--muted')}">Impacto →</text>`;
    const pts = P.map(([n, i, u]) => ({ n, i, u, c: i >= 6.5 && u >= 5, left: X(u) > W * 0.62, x: X(u), y: Y(i) + 4 }));
    if (small()) {
      pts.forEach((p, k) => { svgc += `<g data-tip="<b>${p.n}</b><br>Impacto ${nf(p.i, 1)} · Incerteza ${nf(p.u, 1)}" tabindex="0"><circle cx="${p.x}" cy="${Y(p.i)}" r="9" fill="${p.c ? css('--navy') : GREY}"/><text x="${p.x}" y="${Y(p.i) + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${k + 1}</text></g>`; });
      drv.innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Forças motrizes">${svgc}</svg><ol class="drvlist">${pts.map(p => `<li class="${p.c ? 'crit' : ''}">${p.n}</li>`).join('')}</ol>`;
      bindTips(app); sortable(app); return;
    }
    pts.forEach(p => { svgc += `<circle cx="${p.x}" cy="${Y(p.i)}" r="6" fill="${p.c ? css('--navy') : GREY}" data-tip="<b>${p.n}</b><br>Impacto ${nf(p.i, 1)} · Incerteza ${nf(p.u, 1)}" tabindex="0"/>`; });
    // label placement: avoid other labels and the dots
    const placed = pts.map(p => ({ x0: p.x - 8, x1: p.x + 8, y: Y(p.i) - 8, h: 16, dot: p }));
    pts.slice().sort((a, b) => a.y - b.y).forEach(p => {
      const mctx = (placeLabels.c = placeLabels.c || document.createElement('canvas').getContext('2d')); mctx.font = `${p.c ? 700 : 400} ${fs}px Barlow, sans-serif`;
      let lines = [p.n], w = mctx.measureText(p.n).width;
      if (!p.left && p.x + 10 + w > W - 4) p.left = true; if (p.left && p.x - 10 - w < 2) { p.left = p.x > W / 2;
        const ws = p.n.split(' '), h = Math.ceil(ws.length / 2); lines = [ws.slice(0, h).join(' '), ws.slice(h).join(' ')]; w = Math.max(...lines.map(l => mctx.measureText(l).width)); }
      const x0 = p.left ? p.x - 10 - w : p.x + 10, x1 = x0 + w;
      let y = p.y;
      const hh = lines.length * (fs + 2);
      for (let k = 0; k < 20; k++) { const top0 = y - fs + 2; const hit = placed.find(q => q.dot !== p && q.x0 < x1 && x0 < q.x1 && top0 < q.y + q.h && q.y < top0 + hh - 2); if (!hit) break; y = hit.y + hit.h + fs - 1; }
      placed.push({ x0, x1, y: y - fs + 2, h: hh });
      if (Math.abs(y - p.y) > 2) svgc += `<line x1="${p.left ? p.x - 6 : p.x + 6}" y1="${p.y - 4}" x2="${p.left ? x1 : x0}" y2="${y - 4}" stroke="${GREY}" stroke-width=".7"/>`;
      svgc += `<text x="${p.left ? p.x - 10 : p.x + 10}" y="${y}" font-size="${fs}" text-anchor="${p.left ? 'end' : 'start'}" fill="${css('--ink')}" font-weight="${p.c ? 700 : 400}">${lines.map((l, i) => `<tspan x="${p.left ? p.x - 10 : p.x + 10}" dy="${i ? fs + 2 : 0}">${l}</tspan>`).join('')}</text>`;
    });
    drv.innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Forças motrizes">${svgc}</svg>`;
    bindTips(app); sortable(app);
  };

  views.politicas = (arg) => {
    const P = D.politicas; let cur = P.find(p => p.id === arg) || P[0];
    app.innerHTML = `<span class="tag">Parte 10</span><h1>As sete políticas prioritárias</h1>
      <p class="lead">Cada política é apresentada com diagnóstico, instrumentos, metas, atores, riscos e comunicação, conforme o manual.</p>
      <div class="pol-tabs" id="pt">${P.map(p => `<button data-id="${p.id}">${p.num} · ${p.titulo.split(':')[0]}</button>`).join('')}</div><div id="pd"></div>
      <h2>Agenda de políticas públicas (síntese)</h2><div class="card">${tableHTML(D.tabelas.agenda)}</div>${srcLink('Seção 9.2', 's9-2')}`;
    function draw() {
      document.querySelectorAll('#pt button').forEach(b => b.classList.toggle('on', b.dataset.id === cur.id));
      document.getElementById('pd').innerHTML = `<div class="doc"><h2>${cur.num} ${cur.titulo}</h2>${cur.html}</div>${srcLink('Parte 10 do manual', cur.id)}`;
      labelTables(document.getElementById('pd'));
      history.replaceState(null, '', '#politicas/' + cur.id);
    }
    document.querySelectorAll('#pt button').forEach(b => b.addEventListener('click', () => { cur = P.find(p => p.id === b.dataset.id); draw(); }));
    draw(); sortable(app);
  };

  views.metas = () => {
    const R = D.tabelas.riscos; const lv = { 'Alta': 2, 'Média': 1, 'Baixa': 0, 'Alto': 2, 'Médio': 1, 'Baixo': 0 };
    const cells = {}; R.rows.forEach(r => { const k = lv[r[1]] + '-' + lv[r[2]]; (cells[k] = cells[k] || []).push(r[0]); });
    const shade = (p, i) => ['#E5F4E9', '#FFF6C7', '#F9E4E4'][Math.min(2, Math.floor((p + i) / 1.5))];
    let grid = '<div></div><div class="h">Impacto baixo</div><div class="h">Impacto médio</div><div class="h">Impacto alto</div>';
    [2, 1, 0].forEach(p => { grid += `<div class="h">Probabilidade ${['baixa', 'média', 'alta'][p]}</div>`; [0, 1, 2].forEach(i => { grid += `<div class="cell" style="background:${shade(p, i)}">${(cells[p + '-' + i] || []).map(t => `<span>${md(t)}</span>`).join('')}</div>`; }); });
    app.innerHTML = `<span class="tag">Seções 11.5 e 11.6</span><h1>Metas e riscos</h1>
      <p class="lead">Indicadores com linha de base e metas para 2028 e 2030, e matriz de riscos do plano. As tabelas podem ser ordenadas pelos cabeçalhos.</p>
      <h2>Indicadores</h2><div class="card">${tableHTML(D.tabelas.indicadores)}</div>${srcLink('Seção 11.5', 's11-5')}
      <h2>Matriz de riscos</h2><div class="card"><div class="riskgrid">${grid}</div></div>
      <div class="card" style="margin-top:14px">${tableHTML(R)}</div>${srcLink('Seção 11.6', 's11-6')}
      <h2>Sinais de alerta dos cenários</h2><div class="card">${tableHTML(D.tabelas.sinaisAlerta)}</div>${srcLink('Seção 6.4', 's6-4')}`;
    sortable(app);
  };

  views.ctis = () => {
    const C = D.ctis, sec = id => { for (const p of M.parts) for (const s of p.sections) if (s.id === id) return s; return null; };
    const a1 = sec('sA-1'), sep = (sec('sA-2').html.match(/<div class="box y">[\s\S]*?<\/div>/) || [''])[0];
    const lead = (a1.html.split('</p>')[0] + '</p>');
    app.innerHTML = `<span class="tag">Anexo A</span><h1>CTIS e PICAPS: inteligência cooperativa territorial</h1>
      <div class="lead">${lead}</div>
      <h2>Trajetória, 2017–2026</h2><div class="card"><div id="tl"></div></div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card"><h3 style="margin-top:0">PICAPS</h3><p>Plataforma de Inteligência Cooperativa com a Atenção Primária à Saúde, lançada em 29 de abril de 2020 pela Fiocruz Brasília e pela UnB, com a Secretaria de Saúde do DF, e formalizada pelo Acordo de Cooperação 70/2020. Atendeu inicialmente cerca de 180 residentes da Escola de Governo Fiocruz Brasília em 182 unidades básicas de saúde. Organiza-se em quatro eixos: Radar de Territórios, teleorientação, inteligência epidemiológica e transformação digital. Desde 2025, é implementada com o Ministério da Saúde.</p></div>
        <div class="card"><h3 style="margin-top:0">CTIS</h3><p>Colaboratório de Ciência, Tecnologia, Inovação e Sociedade da Fiocruz Brasília (antes Colaboratório de Ciência, Tecnologia e Sociedade, onde a PICAPS foi concebida em 2017), um "laboratório sem paredes" que integra políticas públicas a partir de projetos territoriais, orientado pela Agenda 2030.</p></div>
      </div>
      <h2>Onde mais contribuem para o plano</h2>
      <p class="src" style="margin-top:0">Selecione uma linha para ver o instrumento, o produto e o indicador de cada eixo.</p>
      <div class="card"><div id="mx"></div><p class="src mxleg">Intensidade: ● baixa · ●● média · ●●● alta</p><div id="mxd" class="hl" style="margin-top:12px"></div></div>
      ${srcLink('Avaliação qualitativa do manual, Seção A.3', 'sA-3')}
      <h2>O ciclo da inteligência cooperativa</h2>
      <div class="card"><div id="cy"></div><div id="cyd" class="hl" style="margin-top:10px"></div></div>
      <h2>Por que importa: problemas do diagnóstico e capacidades</h2><div class="card">${tableHTML(C.problemas)}</div>${srcLink('Seção A.2', 'sA-2')}
      <div class="doc" style="margin-top:16px">${sep}</div>
      <h2>Agenda para 2027–2030</h2><div class="card">${tableHTML(C.agenda)}</div>
      <h2>Riscos e mitigação</h2><div class="card">${tableHTML(C.riscos)}</div>${srcLink('Seção A.5', 'sA-5')}
      <h2>Texto completo do anexo</h2>${C.secoes.filter(id => id !== 'autores').map(id => { const s = sec(id); return `<details class="card anx"><summary><b>${s.num}</b> · ${esc(s.title)}</summary><div class="doc">${s.html.replace(/<div class="box y"><p><strong>Nota sobre o alcance[\s\S]*?<\/div>/, '')}</div></details>`; }).join('')}`;
    labelTables(app);
    // timeline
    const tl = document.getElementById('tl'), W = cw(tl, 300), EV = C.eventos, FT = `<p class="src" style="margin-top:10px">Fontes: Martins e coautores (Ciência & Saúde Coletiva, 2024), Microsoft News Center (6/2020), Arca Fiocruz, Conselho de Saúde do DF (Ofício 68/2020), UnB Notícias (5/2022), Portaria GEREB 030/2024, Radis n. 268 (2025), Fiocruz (2025).</p>`;
    if (small()) {
      tl.innerHTML = `<ol class="vtl">${EV.map(e => `<li><b>${esc(e.data)}</b> · ${esc(e.titulo)}<br><span class="src">${esc(e.detalhe)}</span></li>`).join('')}</ol>${FT}`;
    } else {
      const n = EV.length, pad = Math.min(105, W / 9), X = i => pad + i * (W - 2 * pad) / (n - 1), wrap = (t, m) => { const out = []; let c = ''; t.split(' ').forEach(w => { if ((c + ' ' + w).trim().length > m) { out.push(c.trim()); c = w; } else c += ' ' + w; }); out.push(c.trim()); return out; };
      const m = Math.max(16, Math.floor((2 * (W - 2 * pad) / (n - 1)) / 6.6)), Y0 = 210, H = 420;
      let g = `<line x1="20" x2="${W - 20}" y1="${Y0}" y2="${Y0}" stroke="${css('--navy')}" stroke-width="3"/>`;
      EV.forEach((e, i) => {
        const up = i % 2 === 0, x = X(i), last = i === n - 1;
        const tit = wrap(e.titulo, m), det = wrap(e.detalhe, m + 2), L = [[e.data, 'd'], ...tit.map(t => [t, 't']), ...det.map(t => [t, 's'])];
        const lh = 14, stemEnd = up ? Y0 - 26 : Y0 + 26, y1 = up ? stemEnd - 6 - (L.length - 1) * lh : stemEnd + 16;
        g += `<line x1="${x}" x2="${x}" y1="${Y0}" y2="${stemEnd}" stroke="${GREY}"/><circle cx="${x}" cy="${Y0}" r="6.5" fill="${last ? GREEN : css('--navy')}" data-tip="<b>${esc(e.data)} · ${esc(e.titulo)}</b><br>${esc(e.detalhe)}" tabindex="0"/>`;
        g += `<text x="${x}" y="${y1}" text-anchor="middle">${L.map(([t, k], j) => `<tspan x="${x}" dy="${j ? lh : 0}" font-size="${k === 'd' ? 12 : 11.5}" font-weight="${k === 's' ? 400 : 700}" fill="${k === 'd' ? GREEN : k === 's' ? css('--muted') : css('--navy')}">${esc(t)}</tspan>`).join('')}</text>`;
      });
      tl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Linha do tempo do CTIS e da PICAPS">${g}</svg>${FT}`;
      const sv = tl.querySelector('svg'), bb = sv.getBBox(), top = Math.floor(bb.y) - 8, hh = Math.ceil(bb.height) + 16;
      sv.setAttribute('viewBox', `0 ${top} ${W} ${hh}`);
    }
    // matrix
    const mx = document.getElementById('mx'), lvl = small() ? ['–', '●', '●●', '●●●'] : ['—', 'baixa', 'média', 'alta'], col = ['var(--line)', '#C9D3E8', '#5B7BC0', '#002776'];
    mx.innerHTML = `<div class="mxs"><table class="mxt"><thead><tr><th>Eixo do plano</th>${C.capacidades.map(c => `<th class="c">${esc(c)}</th>`).join('')}</tr></thead><tbody>${C.eixos.map((e, i) => `<tr data-i="${i}" tabindex="0"><td>${esc(e)}</td>${C.matriz[i].map(v => `<td class="c" style="background:${col[v]};color:${v >= 2 ? '#fff' : 'var(--navy)'}" data-label="">${lvl[v]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const mxd = document.getElementById('mxd');
    function pick(i) {
      mx.querySelectorAll('tbody tr').forEach(r => r.classList.toggle('sel', +r.dataset.i === i));
      const row = C.eixosTabela.rows[i], hd = C.eixosTabela.header;
      mxd.innerHTML = `<b style="font-family:BC;font-size:18px;color:var(--navy)">${esc(row[0])}</b> <span class="pill">Seção ${esc(row[1])}</span>${[2, 3, 4].map(k => `<p style="margin:6px 0 0"><b>${esc(hd[k])}:</b> ${md(row[k])}</p>`).join('')}`;
    }
    mx.querySelectorAll('tbody tr').forEach(r => { r.addEventListener('click', () => pick(+r.dataset.i)); r.addEventListener('keydown', e => { if (e.key === 'Enter') pick(+r.dataset.i); }); });
    pick(3);
    // cycle
    const steps = [['Território', 'A comunidade identifica problemas e sinais na Sala de Cooperação Social e pelo Radar de Territórios.'], ['Dados', 'Sinais populares e registros oficiais são organizados separadamente, verificados e cruzados com indicadores territoriais.'],
      ['Inteligência cooperativa', 'Pesquisadores, gestores e comunidade interpretam os dados juntos e constroem cenários.'], ['Decisão pública', 'Atenção primária, vigilância, gestores e ministérios ajustam serviços e prioridades.'], ['Entrega e devolutiva', 'O que foi feito volta ao território para avaliação, e o ciclo recomeça.']];
    const cy = document.getElementById('cy');
    if (small()) {
      cy.innerHTML = `<ol class="cyl">${steps.map((s, k) => `<li class="k${k}"><b>${s[0]}</b><br>${s[1]}</li>`).join('')}<li class="back">↺ O ciclo recomeça no território</li></ol>`;
      document.getElementById('cyd').remove();
      bindTips(app); sortable(app); return;
    }
    const CW = cw(cy, 300), CH = 430, R = CH / 2 - 42, cx0 = CW / 2, cy0 = CH / 2;
    let cg = `<circle cx="${cx0}" cy="${cy0}" r="${R}" fill="none" stroke="${GREEN}" stroke-width="3" stroke-dasharray="6 5"/><circle cx="${cx0}" cy="${cy0}" r="${small() ? 40 : 48}" fill="${css('--navy')}"/><text x="${cx0}" y="${cy0 - 4}" text-anchor="middle" font-family="BC" font-weight="700" font-size="${small() ? 13 : 15}" fill="#fff">Inteligência</text><text x="${cx0}" y="${cy0 + 14}" text-anchor="middle" font-family="BC" font-weight="700" font-size="${small() ? 13 : 15}" fill="#fff">territorial</text>`;
    steps.forEach((s, k) => {
      const a = (-90 + k * 72) * Math.PI / 180, x = cx0 + R * Math.cos(a), y = cy0 + R * Math.sin(a), bw = 180, bh = 42;
      cg += `<g class="cstep" data-k="${k}" tabindex="0" style="cursor:pointer"><rect x="${x - bw / 2}" y="${y - bh / 2}" width="${bw}" height="${bh}" rx="8" fill="${k === 4 ? '#FFF6C7' : k === 0 ? '#E5F4E9' : '#E7EEF8'}" stroke="${k === 4 ? GOLD : k === 0 ? GREEN : NAVY}" stroke-width="1.6"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-family="BC" font-weight="700" font-size="${small() ? 12 : 14}" fill="#002776">${k + 1} · ${s[0]}</text></g>`;
    });
    cy.innerHTML = `<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Ciclo da inteligência cooperativa">${cg}</svg>`;
    const cyd = document.getElementById('cyd');
    const showStep = k => { cyd.innerHTML = `<b>${k + 1} · ${steps[k][0]}.</b> ${steps[k][1]}`; cy.querySelectorAll('.cstep rect').forEach((r, j) => r.setAttribute('stroke-width', j === k ? 3.5 : 1.6)); };
    cy.querySelectorAll('.cstep').forEach(g => { g.addEventListener('click', () => showStep(+g.dataset.k)); g.addEventListener('keydown', e => { if (e.key === 'Enter') showStep(+g.dataset.k); }); });
    showStep(0);
    bindTips(app); sortable(app);
  };

  views.documentos = () => {
    const DOC = D.documentos;
    app.innerHTML = `<span class="tag">Consultar</span><h1>Documento de referência</h1>
      <p class="lead">Versão integral do manual, com todas as partes, figuras, quadros e o anexo sobre o CTIS e a PICAPS, disponível em PDF, para leitura, e em Word, para edição.</p>
      <div class="docs">${DOC.map(d => `<article class="dcard"><header><span>${esc(d.eyebrow)}</span><h3>${esc(d.titulo)}</h3></header>
        <div class="dbody"><p>${esc(d.descricao)}</p><p class="src">${esc(d.autores)} · ${esc(d.edicao)} · ${d.paginas} páginas</p>
        <div class="dbtn"><a class="btn fill" href="${d.pdf}" download>PDF · ${d.pdfMB}</a><a class="btn line" href="${d.docx}" download>Word · ${d.docxMB}</a></div></div></article>`).join('')}</div>`;
  };

  /* ---------------- router ---------------- */
  function route() {
    const [v, arg] = (location.hash.slice(1) || 'inicio').split('/');
    const fn = views[v] || views.inicio;
    document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + (views[v] ? v : 'inicio')));
    hideTip();
    fn(arg);
    document.querySelector('.tabs').classList.remove('open');
    if (v !== 'politicas') window.scrollTo({ top: 0 });
  }
  document.querySelector('.menu-btn').addEventListener('click', e => { const t = document.querySelector('.tabs'); t.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', t.classList.contains('open')); });
  addEventListener('hashchange', route); route();
  let rw = innerWidth, rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; route(); } }, 250); });
})();
