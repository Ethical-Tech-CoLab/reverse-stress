'use strict';

(() => {
  const A = window.ATLAS;
  const sources = window.RESEARCH_SOURCES;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const concept = id => A.concepts.find(c => c.id === id);
  const source = id => sources.find(s => s.id === id);
  const meta = id => A.sourceMeta[id];
  const researchCount = sources.filter(s => meta(s.id).level==='primary').length;
  const addedCount = sources.filter(s => Number(s.id.slice(1))>=12).length;
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/-\s*\n\s*/g, '').replace(/\s+/g, ' ').toLowerCase();
  const clean = value => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
  const refs = items => `<div class="citations">${items.map(([id, label]) => `<button class="citation" data-source="${id}" data-label="${esc(label)}" title="${esc(meta(id).title)} · ${esc(label)}">${id}<span>${esc(label)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div>`;
  const conceptButton = (id, text) => `<button class="text-link" data-concept="${id}">${esc(text || concept(id).title)} <span aria-hidden="true">↗</span></button>`;
  const storageKey = 'resilience-atlas-public-v1';
  let saved = { pins: [], checked: [], notes: '' };
  let storageWarning = '';
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.pins) || !Array.isArray(parsed.checked) || typeof parsed.notes !== 'string') throw new Error('Unrecognized saved note format');
      saved = {
        pins: parsed.pins.filter(id => concept(id)),
        checked: parsed.checked.filter(id => A.questions.some(q => q.id === id)),
        notes: parsed.notes
      };
    }
  } catch (error) {
    console.error('Atlas saved notes could not be loaded:', error);
    storageWarning = 'Saved notes could not be loaded. Export your notes before leaving this page.';
  }
  const state = { group: 'All concepts', selected: 'reverse', case: 'copper', sourceFilter: 'all', labStep: 0, loss: 20, rho: 0.8, flash: 0, revealed: false, route: 'overview' };
  let lastFocus = null;
  let toastTimer;
  let searchTimer;
  let sourceOrigin = null;
  let exportedUrl = null;

  function notify(message) {
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 5500);
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
      storageWarning = '';
      return true;
    } catch (error) {
      console.error('Atlas notes could not be saved:', error);
      storageWarning = 'Browser storage is unavailable or full. Export your notes before closing this page.';
      notify(storageWarning);
      const status = $('#save-status');
      if (status) status.textContent = 'Not saved — export before closing';
      return false;
    }
  }

  function header(eyebrow, title, description, extra = '') {
    return `<section class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${extra}</section>`;
  }

  function publicationLink(id) {
    const m=meta(id);
    const links=[];
    if(m.readUrl) links.push(`<a class="text-link" href="${esc(m.readUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.readLabel||'Read public resource ↗')}</a>`);
    if(m.doi) links.push(`<a class="text-link" href="${esc(m.doi)}" target="_blank" rel="noopener noreferrer">Publisher / DOI ↗</a>`);
    if(m.companionUrl) links.push(`<a class="text-link" href="${esc(m.companionUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.companionLabel)}</a>`);
    return links.length
      ? `<span class="public-resource-links">${links.join('')}</span>`
      : '<span class="small-muted">Teaching adaptation · not independent research evidence</span>';
  }

  function sourceEvidence(m) {
    return m.verifiedOn
      ? `<div class="source-evidence"><strong>${esc(m.evidence)}</strong><span>${esc(m.access)}</span><small>Public link / record checked ${esc(m.verifiedOn)} · not an independent replication</small></div>`
      : '<div class="source-evidence"><strong>Illustrative teaching adaptation</strong><span>No public research record is claimed for this scenario note.</span></div>';
  }

  function researchGuide() {
    return `<section class="section-block research-guide"><div class="section-heading"><div><div class="eyebrow">A READING ROUTE INTO THE PUBLIC RESEARCH</div><h2>Start with the question you need to answer.</h2></div><span class="small-muted">Click a source chip, then follow its public reading link</span></div><div class="three-grid">${A.readingPaths.map((p,i)=>`<article class="content-card"><span class="card-number">0${i+1}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>${refs(p.refs)}</article>`).join('')}</div></section>`;
  }

  function overview() {
    const reading = [
      ['S06', 'Get the language right', 'Recovery, resistance, robustness, and reliability are different design goals.', 'resilience'],
      ['S07', 'See the analytical gap', 'Much of the reviewed literature lacked explicit metrics and connected-network models.', 'system-of-systems'],
      ['S09', 'Understand the trade-off', 'Efficient innovation still needs a recoverable supply network.', 'efficiency'],
      ['S08', 'Separate the recovery levers', 'What can be built in, and what must come from outside?', 'design'],
      ['S04', 'Reverse the question', 'Start with the public preprint, then keep the supplied revised case version-qualified.', 'reverse']
    ];
    return header('PUBLIC TEACHING RESEARCH', 'Make sense of the system.<br><span class="muted-heading">Not just the next disruption.</span>', 'An attributed guide to supply chain resilience, with an anonymized High Tech × ISV × SI learning scenario.', '<span class="edition-pill"><span class="status-dot"></span>Public teaching edition</span>') +
      `<aside class="notice notice-mint"><div><strong>The scenario uses role labels, not organization identities.</strong><p><b>High Tech</b>: technology partner · <b>SI</b>: systems integrator · <b>ISV</b>: independent software vendor · <b>Supplier Knowledge Graph</b>: the dependency-mapping concept. Research authors retain scholarly credit; scenario participants are anonymized.</p></div></aside><section class="hero">
        <div class="hero-copy"><div class="eyebrow light">THE CENTRAL IDEA</div><h2>Start with what<br>cannot fail.<br><em>Work backward.</em></h2><p>Reverse stress testing begins with an unacceptable loss and asks which upstream combinations could plausibly produce it. Then forward testing helps challenge the scenarios and recovery options.</p><div class="hero-actions"><a class="button button-mint" href="#lab">Understand the method <span>↗</span></a><a class="hero-link" href="#brief">Just the teaching essentials →</a></div><div class="hero-cite">Public research lineage ${refs([['S04','Public abstract'],['S20','Research summary']])}</div></div>
        <div class="hero-visual" aria-label="Conceptual illustration of reverse reasoning, not model output"><div class="visual-caption">FOLLOW THE QUESTION UPSTREAM <span>↑</span></div>
          <div class="network-level level-ore"><button data-concept="network">Raw materials</button><button data-concept="network">Shared inputs</button><button data-concept="network">Hidden dependencies</button></div><div class="network-connectors"><span>╲</span><span>│</span><span>╱</span></div>
          <div class="network-level level-processing"><button data-concept="covariance">Supplier A</button><button data-concept="covariance">Supplier B</button></div><div class="reverse-line"><span>↑</span><small>infer plausible loss combinations</small><span>↑</span></div>
          <button class="target-node" data-concept="threshold"><span class="target-symbol">◎</span><span>THE OUTCOME OF CONCERN<strong>25% supply shortfall</strong></span><span>↗</span></button><div class="visual-footnote">Illustrative target · not a forecast or SI result</div>
        </div>
      </section>
      <div class="metric-strip"><div><strong>${researchCount}</strong><span>research & guidance entries<br><small>including draft versions & standards</small></span></div><div><strong>${A.concepts.length}</strong><span>connected concepts<br><small>plain language + caveats</small></span></div><div><strong>${sources.length}</strong><span>research & teaching entries<br><small>source-reference notes</small></span></div><div><span class="metric-icon">⌕</span><span>Research-note retrieval<br><small>search the teaching notes</small></span></div></div>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">01 / THE ONE-MINUTE VERSION</div><h2>Three ideas to take into the room.</h2></div><a class="text-link" href="#brief">Open the teaching brief ↗</a></div>
        <div class="three-grid">
          <article class="idea-card"><span class="card-number">01</span><h3>A safer node isn’t a<br>resilient network.</h3><p>Known-risk controls can protect a supplier. Resilience asks whether the whole system can restore critical function after disruption.</p>${refs([['S12','Summary'],['S06','p. 5']])}${conceptButton('resilience','Make the distinction')}</article>
          <article class="idea-card"><span class="card-number">02</span><h3>The hidden risk may be<br>in the combination.</h3><p>Network position and dependencies can matter beyond supplier size. Reverse testing asks which joint configurations could produce a specified loss.</p>${refs([['S14','Abstract'],['S04','Public abstract']])}${conceptButton('covariance','See why co-movement matters')}</article>
          <article class="idea-card"><span class="card-number">03</span><h3>Discovery is not<br>decision validation.</h3><p>Conditional loss patterns are a starting point. Define acceptance evidence, challenge assumptions, and test feasible recovery actions before committing.</p>${refs([['S18','Scope'],['S05','p. 11']])}${conceptButton('validation','Know the quality bar')}</article>
        </div>
      </section>
      <aside class="notice notice-amber"><span class="notice-icon">!</span><div><strong>Version discipline matters in the discussion.</strong><p>The Supplier Knowledge Graph explainer uses a 20% middle threshold and older results. The revised manuscript uses 25%. This atlas keeps them separate. S04 has a public preprint; S05’s exact revised version has not been publicly matched.</p></div><a class="text-link" href="#evidence">Compare versions ↗</a></aside>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">02 / THE CONNECTING THREAD</div><h2>From the mission to a better decision.</h2></div><span class="small-muted">Editorial synthesis · click any step</span></div>
        <div class="connection-path">${[['critical-function','01','Define the function'],['threshold','02','Set the loss threshold'],['reverse','03','Infer upstream stress'],['validation','04','Forward-test & validate'],['mcda','05','Choose recovery actions']].map(([id,n,title]) => `<button data-concept="${id}"><span>${n}</span><strong>${title}</strong><small>${esc(concept(id).subtitle)}</small><b aria-hidden="true">→</b></button>`).join('')}</div>
      </section>
      <section class="section-block two-column"><div><div class="eyebrow">03 / THE STARTING COLLECTION</div><h2>Five works.<br>A wider research conversation.</h2><p class="section-intro">The original collection moves from shared vocabulary to recovery strategies and inverse reasoning. The public library adds ${addedCount} resources on network structure, financial methods, model credibility, cyber dependencies, causal questions, and decision analysis. Each has a reading route and an evidence limit.</p><a class="button button-outline" href="#sources">Explore public research ↗</a></div>
        <div class="reading-map">${reading.map(([id,title,text,cid], i) => `<article><span class="reading-dot">${i+1}</span><div><button class="text-link" data-concept="${cid}">${title} ↗</button><p>${text}</p></div><button class="source-tag" data-source="${id}">${id} ↗</button></article>`).join('')}</div></section>
      <section class="route-cards"><a href="#brief"><span>IN A HURRY</span><h3>Prepare a teaching session ↗</h3><p>Opening, guardrails, questions, and your notes.</p></a><a href="#concepts"><span>BUILD THE MENTAL MODEL</span><h3>Explore the atlas ↗</h3><p>Definitions, distinctions, and related ideas.</p></a><a href="#engineering"><span>MOVE TOWARD ACTION</span><h3>Shape a scoped pilot ↗</h3><p>Owners, data, validation, and decision gates.</p></a></section>`;
  }

  function miniConcept(c) {
    return `<article class="concept-card"><div class="card-overline">${esc(c.group)} <button class="pin-button ${saved.pins.includes(c.id) ? 'is-pinned' : ''}" data-pin="${c.id}" aria-label="${saved.pins.includes(c.id) ? 'Unpin' : 'Pin'} ${esc(c.title)}" aria-pressed="${saved.pins.includes(c.id)}">${saved.pins.includes(c.id) ? '★' : '☆'}</button></div><button class="concept-card-title" data-concept="${c.id}">${esc(c.title)} <span>↗</span></button><p>${esc(c.subtitle)}</p><div class="concept-card-foot"><span>${c.refs.map(r=>r[0]).filter((v,i,a)=>a.indexOf(v)===i).join(' · ')}</span><button class="text-link" data-concept="${c.id}">Explore</button></div></article>`;
  }

  const mapNodes = [
    ['resilience',130,90],['risk',130,215],['system-of-systems',130,340],
    ['threshold',350,90],['network',350,215],['covariance',350,340],
    ['reverse',575,150],['forward',575,285],
    ['validation',795,90],['design',795,215],['mcda',795,340]
  ];
  const mapEdges = [['resilience','threshold'],['risk','network'],['system-of-systems','network'],['threshold','reverse'],['network','reverse'],['covariance','reverse'],['reverse','forward'],['reverse','validation'],['forward','validation'],['forward','design'],['design','mcda'],['validation','mcda']];

  function graph() {
    const nodeById = Object.fromEntries(mapNodes.map(n => [n[0],n]));
    return `<svg class="concept-map" viewBox="0 0 930 420" role="group" aria-label="Interactive conceptual connection map; editorial synthesis">
      <text x="50" y="30" class="map-column">FRAME THE SYSTEM</text><text x="288" y="30" class="map-column">MODEL DEPENDENCIES</text><text x="510" y="30" class="map-column">TEST BOTH WAYS</text><text x="745" y="30" class="map-column">DECIDE & LEARN</text>
      ${mapEdges.map(([a,b]) => { const p=nodeById[a],q=nodeById[b]; return `<path d="M${p[1]},${p[2]} C${(p[1]+q[1])/2},${p[2]} ${(p[1]+q[1])/2},${q[2]} ${q[1]},${q[2]}" class="map-edge ${[a,b].includes(state.selected)?'active':''}" data-edge="${a} ${b}"/>`; }).join('')}
      ${mapNodes.map(([id,x,y]) => `<g class="map-node ${id===state.selected?'selected':''} ${id==='reverse'?'map-primary':''}" role="button" tabindex="0" data-map-node="${id}" aria-label="Explore ${esc(concept(id).title)}" aria-pressed="${id===state.selected}"><rect x="${x-84}" y="${y-28}" width="168" height="56" rx="12"/><text x="${x}" y="${y+5}" text-anchor="middle">${esc(id==='system-of-systems'?'Connected systems':id==='threshold'?'Loss threshold':id==='reverse'?'Reverse stress test':id==='forward'?'Forward stress test':concept(id).title)}</text></g>`).join('')}</svg>`;
  }

  function selectedConcept() {
    const c=concept(state.selected);
    return `<span class="label label-mint">${esc(c.group)}</span><h3>${esc(c.title)}</h3><p>${esc(c.definition)}</p><div class="map-detail-why"><span class="eyebrow">WHY IT CONNECTS</span><p>${esc(c.why)}</p></div>${refs(c.refs.slice(0,2))}<button class="button button-dark" data-concept="${c.id}">Read the concept <span>↗</span></button>`;
  }

  function conceptsPage() {
    const filtered=A.concepts.filter(c => state.group==='All concepts'||c.group===state.group);
    return header('THE CONCEPT ATLAS','See the relationships.<br><span class="muted-heading">Then zoom into the detail.</span>','Every concept includes a plain-language explanation, an example, a guardrail, related ideas, and exact source references.')+
      `      <section class="map-layout"><div class="map-panel"><div class="panel-topline"><span><span class="status-dot"></span> AN INTERACTIVE MENTAL MODEL</span><small>Selected connections · not a causal model</small></div><p class="map-scroll-hint">Swipe the map to explore ↔ · every concept is also listed below.</p>${graph()}<div class="map-legend"><span><i></i>Concept</span><span><i class="legend-mint"></i>Selected connection</span><span>Click a node or use Tab + Enter</span></div></div><aside class="map-detail" id="map-detail">${selectedConcept()}</aside></section>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">THE COMPLETE GLOSSARY</div><h2>One shared vocabulary.</h2></div><span class="small-muted">${filtered.length} concepts · ☆ pin for your call</span></div><div class="filter-row" aria-label="Filter concepts">${A.groups.map(g=>`<button class="filter-chip ${g===state.group?'active':''}" data-group="${esc(g)}" aria-pressed="${g===state.group}">${esc(g)}</button>`).join('')}</div><div class="concept-grid">${filtered.map(miniConcept).join('')}</div></section>
      <section class="study-panel"><div><div class="eyebrow">ACTIVE RECALL</div><h2>Test your understanding.</h2><p>No score. Just a quick way to find the gaps before a teaching session.</p></div><div id="flashcard">${flashcard()}</div></section>`;
  }

  function flashcard() {
    const f=A.flashcards[state.flash];
    return `<span class="eyebrow">QUESTION ${state.flash+1} OF ${A.flashcards.length}</span><h3>${esc(f.q)}</h3>${state.revealed?`<p class="flash-answer">${esc(f.a)}</p>${conceptButton(f.concept,'Review the concept')}`:'<p class="small-muted">Say your answer first, then reveal.</p>'}<div class="flash-actions"><button class="button button-outline" data-flash="reveal">${state.revealed?'Hide answer':'Reveal answer'}</button><button class="text-link" data-flash="next">Next question →</button></div>`;
  }

  function labValues() {
    const covariance=20*state.rho;
    const rows=[9,25+covariance,16+covariance];
    const total=rows.reduce((a,b)=>a+b,0);
    return rows.map(v=>state.loss*v/total);
  }

  function labOutput() {
    const loss=labValues();
    const volumes=[60,25,15];
    return `<div class="lab-output-head"><span class="eyebrow">CENTRAL LOSS ALLOCATION</span><span class="label label-coral">Synthetic example</span></div>
      <div class="lab-big-number">${state.loss.toFixed(0)}<span> kt</span><small>target monthly shortfall · ${state.loss}% of 100 kt</small></div>
      <div class="bar-legend"><span>Monthly supply share</span><span>Inferred share of shortfall</span></div>
      ${loss.map((v,i)=>`<div class="supplier-row"><div class="supplier-label"><strong>Supplier ${'ABC'[i]}</strong><small>${i===0?'Steady · independent':i===1?'Volatile · linked to C':'Volatile · linked to B'}</small></div><div class="supplier-bars"><div class="volume-bar" style="width:${volumes[i]}%"><span>${volumes[i]}% supply</span></div><div class="loss-bar ${i===0?'bar-a':'bar-bc'}" style="width:${v/state.loss*100}%"></div></div><div class="supplier-value"><strong>${v.toFixed(2)} kt</strong><small>${(v/state.loss*100).toFixed(1)}% of loss</small></div></div>`).join('')}
      <div class="lab-insight"><strong>B + C carry 40% of supply, but ${((loss[1]+loss[2])/state.loss*100).toFixed(1)}% of this model’s central shortfall.</strong><p>The allocation depends on variability and co-movement—not volume ranking alone. A–B and A–C correlations are fixed at zero.</p></div><div class="sr-only" role="status">A ${loss[0].toFixed(2)}, B ${loss[1].toFixed(2)}, C ${loss[2].toFixed(2)} kilotons; total ${loss.reduce((a,b)=>a+b,0).toFixed(2)}.</div>`;
  }

  function stepDetail() {
    const s=A.steps[state.labStep];
    return `<div class="step-number">0${state.labStep+1}</div><div><div class="eyebrow">${esc(s.short)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><div class="step-output"><strong>What comes out</strong><span>${esc(s.output)}</span></div><p class="small-caveat"><strong>Guardrail:</strong> ${esc(s.caveat)}</p>${refs(s.refs)}</div>`;
  }

  function labPage() {
    return header('THE REVERSE STRESS LAB','Change the question.<br><span class="muted-heading">Change what you discover.</span>','An interactive intuition builder, followed by the actual five-step research method. No client data or production solver is used.')+
      `<div class="direction-grid"><article><span class="eyebrow">FORWARD</span><h3>“What happens if this fails?”</h3><div class="direction-line"><span>Chosen shock</span><b>→</b><span>Network</span><b>→</b><span>Impact</span></div><p>Useful for a defined event, cascade, or mitigation.</p>${refs([['S05','p. 2']])}</article><article class="reverse-direction"><span class="eyebrow">REVERSE</span><h3>“What could produce this loss?”</h3><div class="direction-line"><span>Upstream changes</span><b>←</b><span>Network</span><b>←</b><span>Target loss</span></div><p>Useful for discovering conditional failure configurations.</p>${refs([['S05','p. 4']])}</article></div>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">TRY THE INTUITION</div><h2>Biggest supplier ≠ biggest inferred loss.</h2></div><span class="label label-amber">Educational model only</span></div>
      <div class="lab-layout"><aside class="lab-controls"><h3>A simple three-supplier system.</h3><p>A delivers 60 kt/month, B 25, and C 15. Their shipment standard deviations are 3, 5, and 4 kt. A is independent; B and C can move together.</p><label for="loss-slider">Target shortfall <output id="loss-value">${state.loss}%</output></label><input id="loss-slider" type="range" min="5" max="30" step="1" value="${state.loss}"><div class="range-extremes"><span>5% loss</span><span>30% loss</span></div><label for="rho-slider">B–C correlation <output id="rho-value">${state.rho.toFixed(2)}</output></label><input id="rho-slider" type="range" min="0" max="0.95" step="0.05" value="${state.rho}"><div class="range-extremes"><span>Independent · 0</span><span>Highly linked · 0.95</span></div><button class="text-link" data-reset-lab>Reset the example ↺</button><div class="formula"><span class="eyebrow">THE SIMPLIFIED CENTRAL SOLUTION</span><code>a = L Σ1 / (1ᵀΣ1)</code><small>Positive numbers denote attributed losses.<br>Σ uses absolute-volume covariance here.</small></div>${refs([['S20','Research summary'],['S05','p. 12'],['S03','para. 103']])}</aside><div class="lab-output" id="lab-output">${labOutput()}</div></div>
      <p class="lab-disclaimer"><strong>What this is—and isn’t.</strong> This is a new synthetic, single-layer illustration of the normal-model central solution. It does not reproduce the explainer’s numbers or the paper’s preprocessing, weights, alternatives, clustering, multi-tier solver, or probability estimation. It is not a forecast, calibrated risk score, or ISV product demonstration.</p></section>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">THE ACTUAL RESEARCH WORKFLOW</div><h2>Five steps from outcome to inference.</h2></div>${refs([['S05','p. 4']])}</div><div class="method-tabs" aria-label="Method steps">${A.steps.map((s,i)=>`<button data-step="${i}" class="${i===state.labStep?'active':''}" aria-pressed="${i===state.labStep}"><span>0${i+1}</span>${esc(s.title)}</button>`).join('')}</div><article class="step-detail" id="step-detail">${stepDetail()}</article></section>
      <aside class="notice notice-dark"><span class="notice-icon">↻</span><div><strong>The complete decision loop is reverse, then forward.</strong><p>Use RST to propose configurations; use held-out evidence and forward experiments to challenge them and compare feasible interventions. The revised paper proposes this consistency loop as future validation work.</p>${refs([['S05','p. 11']])}</div><button class="button button-mint" data-concept="validation">Explore validation ↗</button></aside>`;
  }

  function copperCase() {
    return `<div class="case-heading"><div><span class="label label-mint">Research demonstration</span><h2>Copper wire into the United States.</h2><p>Four material tiers. Country-level monthly trade. Several loss thresholds. A demonstration of inference—not a validated operational deployment.</p></div><button class="button button-outline" data-source="S05" data-label="p. 14">Read the case method ↗</button></div>
      <div class="copper-path">${['Ore / HS2603','Unrefined / HS7402','Refined / HS7403','Wire / HS7408','US receipts'].map((v,i)=>`<div><span>0${i+1}</span><strong>${v}</strong>${i<4?'<b>→</b>':''}</div>`).join('')}</div>
      <div class="three-grid case-stats"><article><strong>2018–2024</strong><span>UN Comtrade records</span><p>January 2018 through December 2024; each country–good pair is a distinct entity.</p>${refs([['S05','p. 14']])}</article><article><strong>5 / 25 / 50%</strong><span>Specified monthly loss levels</span><p>The revised case uses the same q = 0.5 relative-likelihood setting across scenarios.</p>${refs([['S05','p. 14']])}</article><article><strong>Not just volume</strong><span>Dependency and variability matter</span><p>The Democratic Republic of the Congo is not a top-five ore exporter in the model, yet leads its central ore-loss scenarios.</p>${refs([['S05','p. 7']])}</article></div>
      <div class="two-grid"><article class="content-card"><h3>What the revised manuscript supports.</h3><ul class="clean-list"><li>Its abstract highlights Canada, Chile, and Zambia across loss levels.</li><li>The most likely scenarios and sampled distributions can identify different contributors.</li><li>Contributors change with severity: the discussion contrasts the Netherlands and South Africa across thresholds.</li><li>The US can be an upstream exposure at intermediate stages, not just the final importer.</li><li>Several small and medium contributors can align into a substantial systemic loss.</li></ul>${refs([['S05','p. 1'],['S05','p. 7'],['S05','p. 8'],['S05','p. 10']])}</article><article class="content-card pale-coral"><h3>What it does not establish.</h3><ul class="clean-list"><li>That any of the modeled loss events will happen.</li><li>That country-level trade is a validated proxy for a specific firm or part network.</li><li>That central-scenario quantities are physically feasible procurement needs.</li><li>A measured recovery time or a proven optimal intervention.</li><li>Production accuracy, scalability, or decision value on an SI use case.</li></ul>${refs([['S05','p. 11'],['S05','p. 13']])}</article></div>
      <section class="section-block"><div class="eyebrow">DON’T MERGE THESE VERSIONS</div><h2>One collection. Different copper stories.</h2><div class="table-scroll"><table class="version-table"><thead><tr><th>Reference</th><th>Loss thresholds</th><th>What differs</th><th>How to use it</th></tr></thead><tbody><tr><td><button class="text-link" data-source="S03" data-label="para. 106">S03 · Supplier Knowledge Graph explainer ↗</button><small>Anonymized teaching note</small></td><td>5%, <strong>20%</strong>, 50%</td><td>Older numerical examples; discusses Canada, Mexico, and Chile; uses different rankings and a 12-month framing.</td><td>Useful intuition and discovery questions. Do not quote its copper numbers as S05 results.</td></tr><tr><td><button class="text-link" data-source="S04" data-label="p. 1">S04 · 22-page manuscript ↗</button><small>Separate research version</small></td><td>5%, <strong>25%</strong>, 50%</td><td>Abstract highlights Canada, Chile, Mexico, and Papua New Guinea; results and figure numbering differ from S05.</td><td>Read as its own version. No attempt is made here to reconcile or combine datasets.</td></tr><tr><td><button class="text-link" data-source="S05" data-label="p. 1">S05 · revised manuscript ↗</button><small>Main copper reference here</small></td><td>5%, <strong>25%</strong>, 50%</td><td>Abstract highlights Canada, Chile, Zambia, the Philippines, and Uzbekistan; explicitly discusses unconstrained losses.</td><td>Use consistently for this atlas’s case discussion. Confirm final publication and validated outputs with the authors.</td></tr></tbody></table></div></section>`;
  }

  function vaccinesCase() {
    return `<div class="case-heading"><div><span class="label label-mint">Cross-domain learning</span><h2>Innovation does not guarantee delivery.</h2><p>The 2021 review and 2022 commentary explain why successful vaccine science still depended on brittle consumable, manufacturing, distribution, and governance networks.</p></div>${refs([['S09','p. 1'],['S08','p. 1']])}</div>
      <div class="two-grid"><article class="content-card pale-mint"><div class="eyebrow">INTERNAL RECOVERY CAPABILITY</div><h3>Resilience-by-design</h3><p>Engineer the network to recover using its own resources and configuration.</p><ul class="clean-list"><li>Multiple qualified suppliers in different geopolitical regions.</li><li>Interchangeable or generic materials where feasible.</li><li>Buffers for critical-path, non-perishable inputs.</li><li>Emergency plans, workforce continuity, and alternate distribution routes.</li></ul>${refs([['S08','p. 2']])}${conceptButton('design')}</article><article class="content-card pale-blue"><div class="eyebrow">EXTERNAL RECOVERY CAPABILITY</div><h3>Resilience-by-intervention</h3><p>Design the external support that enables recovery from sector-wide disruption.</p><ul class="clean-list"><li>Strategic stockpiles and emergency manufacturing finance.</li><li>Publicly coordinated transportation and supply kits.</li><li>Regulatory action and support for qualified facilities.</li><li>Operation Warp Speed’s portfolio of vaccine candidates.</li></ul>${refs([['S08','p. 2']])}${conceptButton('intervention')}</article></div>
      <article class="content-card section-block"><div class="eyebrow">THE 2021 REVIEW’S THREE RECOMMENDATIONS</div><div class="three-grid"><div><h3>01 · Standardize</h3><p>Use clear supply-chain terms and a temporal definition of resilience: plan, absorb, recover, adapt.</p></div><div><h3>02 · Model connected networks</h3><p>Use network science and richer data; include workforce, regulatory, cold-chain, and social dependencies.</p></div><div><h3>03 · Make trade-offs explicit</h3><p>Balance efficiency, sustainability, equity, health, and environmental goals with stakeholder needs.</p></div></div>${refs([['S09','p. 4']])}</article>
      <aside class="notice notice-amber"><span class="notice-icon">↔</span><div><strong>The defense connection is an analogy to test.</strong><p>Separate the levers a company can engineer into its supply base from government or ecosystem support it would need. Do not present vaccine examples as demonstrated results for SI.</p>${refs([['S01','para. 9']])}</div></aside>`;
  }

  function reviewCase() {
    return `<div class="case-heading"><div><span class="label label-mint">Historical systematic review</span><h2>Defining resilience was easier than measuring it.</h2><p>Golan, Jernegan, and Linkov’s 2020 review adds 94 papers from 2017–2019 to an earlier set of 47 papers from 2007–2016.</p></div>${refs([['S07','p. 1'],['S07','p. 16']])}</div>
      <article class="review-chart content-card"><div class="review-chart-top"><div><strong>94</strong><span>papers in the 2017–2019 sample</span></div><div><strong>22%</strong><span>provided an explicitly defined resilience measure</span></div></div><div class="stacked-bar" role="img" aria-label="22 percent explicit measures, 26 percent proxy measures, 52 percent no proposed measure or primarily qualitative analysis"><span style="width:22%">22%</span><span style="width:26%">26%</span><span style="width:52%">52%</span></div><div class="chart-key"><span><i></i>Explicit measure</span><span><i></i>Proxy measure</span><span><i></i>No measure / primarily qualitative</span></div>${refs([['S07','p. 13']])}<p class="small-caveat">These percentages describe a historical review sample—not all supply-chain research and not the current field in 2026.</p></article>
      <div class="three-grid"><article class="content-card"><h3>Scenario tunnel vision</h3><p>Many models depend on specified disruptions; uncertainty about unknown threats remains under-addressed.</p>${refs([['S07','p. 1']])}</article><article class="content-card"><h3>Network boundaries</h3><p>Supply-chain models often omit transportation, communications, and command-and-control interdependencies.</p>${refs([['S07','p. 16']])}</article><article class="content-card"><h3>Proportional complexity</h3><p>The review recommends tiered analytics, increasing model sophistication with the problem’s complexity.</p>${refs([['S07','p. 16']])}</article></div>
      <aside class="notice notice-dark"><span class="notice-icon">→</span><div><strong>Why this connects to RST.</strong><p>The review motivates richer, measurable, system-level analysis. RST offers one later method for discovering conditional loss configurations. It does not by itself close every gap in recovery modeling or systems integration.</p></div><button class="button button-mint" data-concept="reverse">Connect the ideas ↗</button></aside>`;
  }

  function evidencePage() {
    return header('EVIDENCE, NOT JUST CLAIMS','Know what the research says.<br><span class="muted-heading">And where it stops.</span>','Keep primary findings, teaching interpretations, and proposed applications separate. Every source chip opens a paraphrased reference note.')+
      `<div class="filter-row case-tabs" aria-label="Research case">${[['copper','Copper / reverse testing'],['vaccines','Vaccines / recovery design'],['review','Literature / measurement gap']].map(([id,title])=>`<button data-case="${id}" class="filter-chip ${state.case===id?'active':''}" aria-pressed="${state.case===id}">${title}</button>`).join('')}</div><section id="case-content">${state.case==='copper'?copperCase():state.case==='vaccines'?vaccinesCase():reviewCase()}</section>
      ${state.case==='copper'?`<aside class="notice notice-amber"><span class="notice-icon">i</span><div><strong>Public lineage is not a public match for every result above.</strong><p>The public arXiv preprint supports the outcome-first research lineage. The revised S05 country results and page notes are from the supplied revision, whose exact public version has not been matched. Keep the two separate when teaching or citing the copper case.</p>${refs([['S04','Public abstract'],['S05','p. 1']])}</div></aside>`:''}
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">TRIANGULATE WITH PUBLIC RESEARCH</div><h2>Related ideas. Different evidence.</h2></div><a class="text-link" href="#sources">Read the wider literature ↗</a></div><div class="three-grid">${[['S14','Abstract'],['S15','Abstract'],['S17','Objective']].map(([id,label])=>`<article class="content-card"><span class="eyebrow">${esc(meta(id).kind)}</span><h3>${esc(meta(id).title)}</h3><p>${esc(meta(id).takeaway)}</p><p class="small-caveat">${esc(meta(id).note)}</p>${refs([[id,label]])}</article>`).join('')}</div><p class="small-caveat">These studies motivate comparisons; none independently validates the revised copper model or an SI implementation.</p></section>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">THE LIMITATION LEDGER</div><h2>Six guardrails worth keeping visible.</h2></div><span class="label label-amber">Especially important with a client</span></div><div class="three-grid">${A.limitations.map((l,i)=>`<article class="limitation-card"><span>0${i+1}</span><h3>${esc(l.title)}</h3><p>${esc(l.text)}</p>${refs(l.refs)}</article>`).join('')}</div></section>`;
  }

  function engineeringPage() {
    return header('FROM RESEARCH TO CO-ENGINEERING','A credible pilot.<br><span class="muted-heading">Before a platform promise.</span>','A proposed discovery-to-delivery path synthesized from anonymized teaching notes. No architecture, staffing, compliance, or funding commitment is implied.')+
      `<aside class="notice notice-mint"><span class="notice-icon">◎</span><div><strong>The desired next step is small and concrete.</strong><p>A joint Tier 1 scoping session on one SI-selected supply chain—with a named problem owner, data-sharing path, and FDE point of contact.</p>${refs([['S01','para. 50']])}</div></aside>
      <section class="section-block"><div class="eyebrow">PROPOSED DELIVERY PATH</div><div class="three-grid engagement-grid">
      <article class="content-card"><span class="card-number">01 / DISCOVER & CHALLENGE</span><h3>Establish scientific credibility.</h3><p>ISV and invited High Tech research advisors challenge the causal framing, probabilistic assumptions, fault experiments, and evidence needed to trace cascades.</p><div class="owner-line">Owners proposed: ISV + selected advisors</div>${refs([['S02','para. 40']])}</article>
      <article class="content-card"><span class="card-number">02 / FIT & HANDOFF</span><h3>Test the engineering fit.</h3><p>Map the method to Supplier Knowledge Graph’s described dependency graph, available edge histories, and a practical cloud environment. Clarify interfaces, IP, licensing, data rights, and ownership.</p><div class="owner-line">Owners proposed: Supplier Knowledge Graph / FDE + ISV</div>${refs([['S02','para. 42'],['S01','para. 47']])}</article>
      <article class="content-card"><span class="card-number">03 / BUILD & VALIDATE</span><h3>Prove operational value.</h3><p>Use the agreed case, run reproducible reverse tests, forward-test feasible mitigations, and quantify whether the output improves a real sourcing or planning decision.</p><div class="owner-line">Owners proposed: FDE + ISV + SI</div>${refs([['S02','para. 44']])}</article></div></section>
      <section class="architecture-panel"><div class="eyebrow light">A HYPOTHESIS TO VALIDATE · NOT AN IMPLEMENTED DESIGN</div><h2>Connect data, inference, and accountable action.</h2><div class="architecture-flow">${[['Governed inputs','BOM · suppliers · receipts'],['Dependency model','Entity resolution · history'],['RST inference','Targets · configurations'],['Forward validation','Feasibility · recovery'],['Decision support','Trade-offs · human review']].map(([title,sub],i)=>`<div><span>0${i+1}</span><strong>${title}</strong><small>${sub}</small></div>`).join('')}</div><p>The teaching brief proposes secure cloud data / compute and an agent-enabled assistant. An assistant should explain evidence and approved model outputs—not invent probabilities or autonomously authorize supply-chain changes. This human-review guardrail is this atlas’s design recommendation.</p>${refs([['S13','Engineering scope'],['S18','Scope'],['S01','para. 40'],['S01','para. 41'],['S01','para. 42'],['S03','para. 138']])}</section>
      <section class="section-block two-column"><div><div class="eyebrow">PASS / PAUSE CRITERIA</div><h2>What would make<br>the pilot defensible?</h2><p class="section-intro">The opportunity note requires scientific credibility, a practical architecture, a funding path, and measurable interventions. The checks here translate that gate into an actionable discovery agenda.</p>${refs([['S18','Scope'],['S02','para. 46']])}</div><div class="gate-list">${[
        ['Operational target','A named critical function, end user, loss threshold, time horizon, and decision owner.'],
        ['Authorized, adequate data','Validated topology plus useful time-series edge quantities inside an approved sharing boundary.'],
        ['Feasible model outputs','Capacity / flow constraints and multi-input production assumptions appropriate to the selected use case.'],
        ['Reproducible validation','Held-out disruption testing, sensitivity checks, baseline comparison, and forward/reverse consistency.'],
        ['Decision and delivery value','A feasible intervention with agreed cost / recovery metrics, human review, IP terms, and funding ownership.']
      ].map(([t,d],i)=>`<article><span>0${i+1}</span><div><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div></section>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">CROSS-FUNCTIONAL TEACHING ROLES</div><h2>Match the question to the expertise.</h2></div><span class="small-muted">Illustrative responsibilities · no named participants</span></div><div class="people-grid">${A.people.map((p,i)=>`<article class="person-card"><div class="person-avatar">${['SC','ST','ME','PL'][i]}</div><h3>${esc(p.name)}</h3><span class="person-role">${esc(p.role)}</span><p>${esc(p.ask)}</p><small>${esc(p.note)}</small>${refs(p.refs)}</article>`).join('')}</div><details class="advisors content-card"><summary>Discovery disciplines—not staffing assignments</summary><p>A teaching team can examine causal framing, probabilistic inference, repeatable fault experiments, cascade observability, and applied data engineering. Assign responsibilities by expertise rather than treating a list of potential advisors as committed staffing.</p>${refs([['S02','para. 12'],['S02','para. 18'],['S02','para. 24'],['S02','para. 30'],['S02','para. 36']])}</details></section>
      <section class="section-block"><div class="section-heading"><div><div class="eyebrow">PARTNER POSITIONING, NOT A SCHEDULE PROMISE</div><h2>The tiered path described in the teaching brief.</h2></div>${refs([['S01','para. 12']])}</div><div class="three-grid"><article class="tier-card"><span>TIER 1</span><h3>Scope & baseline</h3><p>Define the system, critical function, data readiness, and next analytical step.</p><small>Teaching brief duration claim: weeks to 6 months</small></article><article class="tier-card"><span>TIER 2</span><h3>Stress tests & roadmap</h3><p>Use KPIs and quantitative tests to prioritize a costed investment path.</p><small>Teaching brief duration claim: months</small></article><article class="tier-card"><span>TIER 3</span><h3>Agent-enabled support</h3><p>Proposed simulation, MCDA, monitoring, and an assistant—not established paper results.</p><small>Teaching brief duration claim: a year or more</small></article></div></section>`;
  }

  function sourceCard(s) {
    const m=meta(s.id);
    const count=s.sections.length;
    return `<article class="source-card" data-source-card="${s.id}"><div class="source-card-top"><span class="source-id">${s.id}</span><span class="label ${m.level==='primary'?'label-mint':m.level==='proposal'?'label-coral':'label-neutral'}">${esc(m.kind)}</span></div><h3><button data-source="${s.id}">${esc(m.title)} ↗</button></h3><p class="source-subtitle">${esc(m.subtitle)}</p><div class="source-byline">${esc(m.authors)}</div><div class="source-meta-line"><span>${esc(m.date)}</span><span>${count} paraphrased reference notes</span></div>${m.takeaway?`<p class="source-takeaway"><strong>In plain language</strong>${esc(m.takeaway)}</p>`:''}${sourceEvidence(m)}<p class="source-read"><strong>Where to start:</strong> ${esc(m.read)}</p><div class="source-card-actions"><button class="button button-outline" data-source="${s.id}">Read source notes ↗</button>${publicationLink(s.id)}</div>${m.level==='primary'?'':`<div class="source-classification">${m.level==='proposal'?'ILLUSTRATIVE · NOT COMMITTED':'ANONYMIZED TEACHING CONTEXT · NOT PRIMARY EVIDENCE'}</div>`}</article>`;
  }

  function sourcesPage() {
    const filtered=sources.filter(s=>{
      if(state.sourceFilter==='primary') return meta(s.id).level==='primary';
      if(state.sourceFilter==='teaching') return meta(s.id).level!=='primary';
      if(state.sourceFilter==='added') return Number(s.id.slice(1))>=12;
      if(state.sourceFilter==='starting') return Number(s.id.slice(1))<=11;
      return true;
    }).sort((a,b)=>Number(meta(b.id).level==='primary')-Number(meta(a.id).level==='primary')||Number(a.id.slice(1))-Number(b.id.slice(1)));
    return header('THE PUBLIC RESEARCH LIBRARY','Every claim has a trail.<br><span class="muted-heading">Read the evidence—and its limits.</span>',`${researchCount} research, methods, and guidance entries plus five anonymized teaching notes. ${addedCount} resources extend the starting collection. Public records and reading links checked 9 November 2026.`)+
      `<div class="source-principles"><div><span>01</span><strong>Research ≠ teaching scenario</strong><p>Published findings and anonymized proposals are labeled separately.</p></div><div><span>02</span><strong>Versions stay separate</strong><p>S04 and S05 are distinct manuscripts, not duplicate evidence.</p></div><div><span>03</span><strong>Summaries, not source downloads</strong><p>Only editorial paraphrases are distributed. Public publisher links retain attribution.</p></div></div>
      <aside class="notice notice-amber"><span class="notice-icon">i</span><div><strong>Different sources support different kinds of claims.</strong><p>Published studies, preprints, conceptual papers, case studies, standards, textbooks, and teaching notes are not interchangeable evidence. An open link is not proof of replication or operational validity. S05's exact revised manuscript has not been publicly matched; its related arXiv link is not a journal-publication confirmation. Summaries here are editorial paraphrases, not source downloads.</p></div></aside>
      ${researchGuide()}
      <div class="section-heading source-filter-heading"><div class="filter-row" aria-label="Filter sources">${[['all','All entries'],['primary','Research / guidance'],['added','Beyond the folder'],['starting','Starting collection'],['teaching','Teaching / proposal']].map(([id,title])=>`<button class="filter-chip ${state.sourceFilter===id?'active':''}" data-source-filter="${id}" aria-pressed="${state.sourceFilter===id}">${title}</button>`).join('')}</div><span class="small-muted" role="status">${filtered.length} entries</span></div>
      <div class="source-grid">${filtered.map(sourceCard).join('')}</div><article class="source-integrity"><h3>Coverage & provenance</h3><p>Public reading links identify the checked version or access route. Some provide open full text; others provide a public institutional abstract, preprint, or official scope. Read each access and evidence label before relying on a claim. Page labels refer to supplied PDF pagination; named anchors refer to public sections or summaries. A related public version may differ from the supplied file. Teaching notes are not independently verifiable evidence. Private originals, correspondence, contacts, and full extracts remain excluded; research authors retain scholarly credit.</p></article>`;
  }

  const opener = 'The opportunity is not just to map supply-chain risk. It is to define a mission-critical loss we cannot tolerate, work backward to plausible upstream failure combinations, and then validate which interventions preserve or restore the function. ISV brings the resilience methodology; the proposed High Tech / Supplier Knowledge Graph / FDE contribution is governed data, integration, and reproducible delivery. We should start with one scoped SI use case and a clear validation gate.';

  function pinnedSection() {
    return saved.pins.length ? `<div class="pinned-list">${saved.pins.map(id=>`<div><button class="text-link" data-concept="${id}">${esc(concept(id).title)} ↗</button><button class="pin-button is-pinned" data-pin="${id}" aria-label="Unpin ${esc(concept(id).title)}">★</button></div>`).join('')}</div>` : `<p class="small-muted">No pinned concepts yet. Use ☆ in the <a href="#concepts">concept atlas</a> to keep your essentials here.</p>`;
  }

  function briefPage() {
    return header('YOUR TEACHING REFERENCE','Clear story. Better questions.<br><span class="muted-heading">Evidence always within reach.</span>','Public teaching reference with anonymized scenario roles and attributed research. Your own notes and checks stay in this browser.', '<div class="brief-header-actions"><button class="button button-outline" data-export>Export notes ↓</button><button class="button button-dark" data-print>Print brief ↗</button></div>')+
      `<section class="brief-opener"><div class="eyebrow light">A 30-SECOND OPENING · SUGGESTED WORDING, NOT A SOURCE QUOTE</div><h2>“Start from what cannot fail.”</h2><p>${opener}</p>${refs([['S12','Summary'],['S04','Public abstract'],['S18','Scope'],['S01','para. 50']])}</section>
      <div class="brief-columns"><div><section class="content-card brief-talking"><div class="eyebrow">SIX POINTS TO KEEP STRAIGHT</div><h2>The essentials.</h2>${[
        ['Resilience is about recovery.','Risk controls and robustness help; they are not the same as restoring critical function.','resilience'],
        ['Reverse testing is conditional.','Given a loss, infer plausible upstream configurations—not the probability that the loss will happen.','probabilities'],
        ['Co-movement can hide concentration.','Smaller contributors aligning may matter as much as the biggest supplier.','covariance'],
        ['Design and intervention are different levers.','Separate internal recovery capability from the external support a system needs.','design'],
        ['The revised case uses 5%, 25%, and 50%.','Do not mix the Supplier Knowledge Graph explainer’s 20% threshold and older copper results into S05.','threshold'],
        ['Prove a decision, not just a model run.','Back-test, check sensitivity, forward-test feasible options, and compare operational value.','validation']
      ].map(([title,text,id],i)=>`<article><span>0${i+1}</span><div><h3>${title}</h3><p>${text}</p>${refs(concept(id).refs.slice(0,2))}</div><button class="icon-button" data-concept="${id}" aria-label="Read ${esc(concept(id).title)}">↗</button></article>`).join('')}</section>
      <section class="content-card section-block"><div class="eyebrow">THE DISCOVERY AGENDA</div><h2>Questions that move the meeting forward.</h2><div class="question-list">${A.questions.map(q=>`<article class="question-item"><label><input type="checkbox" data-question="${q.id}" ${saved.checked.includes(q.id)?'checked':''}><span><strong>${esc(q.title)}</strong><small>${esc(q.text)}</small></span></label><details><summary>Why ask?</summary><p>${esc(q.why)}</p>${refs(q.refs)}</details></article>`).join('')}</div></section></div>
      <aside><section class="content-card guardrails"><span class="label label-amber">DON’T OVERCLAIM</span><h3>Words to avoid.</h3><ul class="clean-list"><li>“Predicts the next disruption.”</li><li>“This is the probability of failure.”</li><li>“Already validated for SI.”</li><li>“The LLM computes the science.”</li><li>“cloud automatically meets the required compliance boundary.”</li><li>“These advisors are committed.”</li></ul><p class="small-caveat">Use “conditional inference,” “proposed,” and “to validate.” These are editorial communication guardrails derived from the supplied limitations and opportunity gate.</p>${refs([['S05','p. 11'],['S05','p. 13'],['S02','para. 46']])}</section>
      <section class="content-card section-block"><div class="eyebrow">QUICK RETRIEVAL</div><h3>Your pinned concepts.</h3><div id="pinned-concepts">${pinnedSection()}</div></section>
      <section class="content-card notes-card section-block"><div class="eyebrow">LOCAL WORKING NOTES</div><h3>Capture decisions.</h3><label class="sr-only" for="call-notes">Meeting notes and actions</label><textarea id="call-notes" rows="11" placeholder="Problem owner:\nCritical function / threshold:\nData owner + access path:\nOpen scientific questions:\nIP / licensing:\nFDE counterpart:\nNext session / date:">${esc(saved.notes)}</textarea><pre class="print-notes" id="print-notes">${esc(saved.notes||'(No notes recorded)')}</pre><span class="save-status" id="save-status">${storageWarning?esc(storageWarning):'Saved locally in this browser · not uploaded'}</span><p class="small-caveat">Avoid recording restricted client data here. This browser notebook is not an approved data platform. Export to your approved location.</p><button class="button button-outline" data-export>Export briefing + notes ↓</button></section>
      <section class="meeting-close"><div class="eyebrow">CLOSE WITH AN AGREEMENT</div><h3>One use case.<br>One owner.<br>One data path.<br>One next session.</h3>${refs([['S01','para. 50']])}</section></aside></div>`;
  }

  const views={overview,concepts:conceptsPage,lab:labPage,evidence:evidencePage,engineering:engineeringPage,sources:sourcesPage,brief:briefPage};
  const titles={overview:'OVERVIEW',concepts:'CONCEPT ATLAS',lab:'REVERSE STRESS LAB',evidence:'EVIDENCE & CASES',engineering:'CO-ENGINEERING',sources:'SOURCE LIBRARY',brief:'TEACHING BRIEF'};

  function render(route, preserveScroll=false) {
    const y=scrollY;
    state.route=route;
    $('#main').innerHTML=views[route]();
    $('#breadcrumb').textContent=titles[route];
    document.title=`${titles[route].toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())} | Resilience Atlas`;
    document.querySelectorAll('[data-nav]').forEach(a=>{
      a.classList.toggle('active',a.dataset.nav===route);
      if(a.dataset.nav===route) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    document.querySelector('.call-nav').classList.toggle('active',route==='brief');
    $('.sidebar').classList.remove('mobile-open');
    $('#menu-button').setAttribute('aria-expanded','false');
    if(preserveScroll) scrollTo(0,y); else scrollTo(0,0);
  }

  function route() {
    const parts=location.hash.slice(1).split('/');
    const name=parts[0]||'overview';
    if(name==='main') {
      $('#main').focus();
      return;
    }
    if(name==='concept'&&concept(parts[1])) {
      render('concepts');
      openConcept(parts[1]);
    } else if(name==='source'&&source(parts[1])) {
      render('sources');
      let label='';
      try { label=decodeURIComponent(parts.slice(2).join('/')); } catch(error) { console.error('Invalid source anchor:',error); notify('The source link contains an invalid anchor. Showing the document instead.'); }
      openSource(parts[1],label);
    } else {
      if($('#detail-dialog').open) $('#detail-dialog').close();
      render(views[name]?name:'overview');
      if(!views[name]) notify('That section was not found. Showing the overview.');
    }
    hideSearch();
  }

  function showDialog(eyebrow,html) {
    const dialog=$('#detail-dialog');
    if(!dialog.open) lastFocus=document.activeElement;
    $('#dialog-eyebrow').textContent=eyebrow;
    $('#dialog-content').innerHTML=html;
    if(!dialog.open) dialog.showModal();
    dialog.scrollTop=0;
  }

  function closeDetail() {
    if(location.hash.startsWith('#concept/')||location.hash.startsWith('#source/')) {
      history.replaceState(null,'',`#${state.route}`);
    }
    $('#detail-dialog').close();
  }

  function openConcept(id) {
    const c=concept(id);
    sourceOrigin=id;
    showDialog('THE CONCEPT ATLAS',`<div class="concept-detail"><div class="dialog-meta"><span class="label label-mint">${esc(c.group)}</span><a class="text-link" href="#concept/${c.id}">Permalink ↗</a></div><h2 id="dialog-title">${esc(c.title)}</h2><p class="dialog-subtitle">${esc(c.subtitle)}</p><div class="definition-block"><div class="eyebrow">IN PLAIN LANGUAGE</div><p>${esc(c.definition)}</p></div><section><h3>Why it matters</h3><p>${esc(c.why)}</p></section><section><h3>Make it concrete</h3><p>${esc(c.example)}</p></section><aside class="notice notice-amber"><div><strong>Keep this distinction.</strong><p>${esc(c.caution)}</p></div></aside><section><div class="eyebrow">SOURCE TRAIL</div>${refs(c.refs)}<p class="small-muted">Explanations and examples are editorial synthesis; a paraphrased research or teaching note is available at each anchor.</p></section><section><div class="eyebrow">CONNECTED IDEAS</div><div class="related-chips">${c.related.map(r=>`<button data-concept="${r}">${esc(concept(r).title)} ↗</button>`).join('')}</div></section><button class="button button-dark" data-pin="${id}" aria-pressed="${saved.pins.includes(id)}">${saved.pins.includes(id)?'★ Pinned to your teaching brief':'☆ Pin to your teaching brief'}</button></div>`);
    hideSearch();
  }

  function openSource(id,label) {
    const s=source(id),m=meta(id);
    const valid=s.sections.some(p=>p.label===label);
    const active=valid?label:s.sections[0]?.label;
    if(label&&!valid) notify(`${id}: reference ${label} was not found. Showing the first available anchor.`);
    showDialog('PUBLIC SOURCE NOTES',`<div class="source-reader"><div class="dialog-meta"><span class="label ${m.level==='primary'?'label-mint':'label-neutral'}">${esc(m.kind)}</span><a class="text-link" href="#source/${id}/${encodeURIComponent(active||'')}">Permalink ↗</a></div><h2 id="dialog-title">${id} · ${esc(m.title)}</h2><p class="dialog-subtitle">${esc(m.subtitle)}</p><p class="source-byline">${esc(m.authors)}<br>${esc(m.date)}</p>${sourceEvidence(m)}${m.takeaway?`<p class="source-takeaway"><strong>In plain language</strong>${esc(m.takeaway)}</p>`:''}<p class="source-read"><strong>Where to start:</strong> ${esc(m.read)}</p><div class="reader-actions">${publicationLink(id)}${sourceOrigin?`<button class="text-link" data-concept="${sourceOrigin}">← Back to concept</button>`:''}</div><aside class="reader-note"><strong>Editorial paraphrase · not source text</strong><p>${esc(m.note)}</p><small>Anchors identify the underlying page, paragraph, slide, or named public section. These notes summarize selected ideas, not full pages. Private documents, personal correspondence, and original filenames are not included. Publisher links, when available, lead to authoritative research rather than the teaching adaptation.</small></aside><label class="reader-jump" for="source-jump">Jump to reference<select id="source-jump">${s.sections.map(p=>`<option value="${esc(p.label)}" ${p.label===active?'selected':''}>${esc(p.label)} · ${esc(clean(p.text).replace(/\s+/g,' ').slice(0,64))}</option>`).join('')}</select></label><div class="source-excerpts">${s.sections.map(p=>`<section class="source-section ${p.label===active?'is-target':''}" data-source-section="${esc(p.label)}"><h3>${esc(p.label)} · editorial summary <a href="#source/${id}/${encodeURIComponent(p.label)}" aria-label="Permalink to ${id} ${esc(p.label)}">↗</a></h3><pre>${esc(clean(p.text))}</pre></section>`).join('')}</div></div>`);
    hideSearch();
    if(valid) requestAnimationFrame(()=>jumpToSource(active));
  }

  function jumpToSource(label) {
    const section=[...document.querySelectorAll('[data-source-section]')].find(el=>el.dataset.sourceSection===label);
    document.querySelectorAll('[data-source-section]').forEach(el=>el.classList.toggle('is-target',el===section));
    if(section) section.scrollIntoView({block:'start',behavior:'instant'});
  }

  const searchIndex=sources.flatMap(s=>s.sections.map(p=>({id:s.id,label:p.label,text:normalize([meta(s.id).title,meta(s.id).subtitle,meta(s.id).authors,meta(s.id).doi||'',p.text].join(' '))})));

  function highlight(text,query) {
    const index=normalize(text).indexOf(query);
    if(index<0) return esc(text);
    // Display text is normalized first so character offsets remain aligned.
    const normalized=text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
    const start=normalized.toLowerCase().indexOf(query);
    return start<0?esc(text):`${esc(normalized.slice(0,start))}<mark>${esc(normalized.slice(start,start+query.length))}</mark>${esc(normalized.slice(start+query.length))}`;
  }

  function hideSearch() {
    $('#search-results').hidden=true;
    $('#global-search').setAttribute('aria-expanded','false');
  }

  function search(query) {
    const q=normalize(query.trim());
    const panel=$('#search-results');
    if(q.length<2) { hideSearch(); return; }
    const concepts=A.concepts.filter(c=>normalize([c.title,c.subtitle,c.definition,c.why,c.caution,...c.related].join(' ')).includes(q));
    const hits=searchIndex.filter(p=>p.text.includes(q));
    panel.innerHTML=`<div class="search-panel-heading"><span role="status">${concepts.length} concepts · ${hits.length} source anchors</span><button class="icon-button" data-close-search aria-label="Close search">✕</button></div>${concepts.length?`<h3>CONCEPTS</h3>${concepts.slice(0,7).map(c=>`<button class="search-result" data-concept="${c.id}"><span class="search-result-icon">◇</span><span><strong>${highlight(c.title,q)}</strong><small>${esc(c.subtitle)}</small></span><span>↗</span></button>`).join('')}`:''}${hits.length?`<h3>SOURCE NOTES · TOP ${Math.min(hits.length,16)} MATCHES</h3>${hits.slice(0,16).map(p=>{ const at=p.text.indexOf(q); const start=Math.max(0,at-70); const snippet=p.text.slice(start,at+q.length+140); return `<button class="search-result" data-source="${p.id}" data-label="${esc(p.label)}"><span class="source-tag">${p.id}</span><span><strong>${esc(meta(p.id).title)} · ${esc(p.label)}</strong><small>${start?'…':''}${highlight(snippet,q)}…</small></span></button>`; }).join('')}`:''}${!concepts.length&&!hits.length?'<div class="search-empty"><strong>No matching concepts or teaching source notes.</strong><p>Try “covariance”, “25%”, “recovery”, “Supplier Knowledge Graph”, or “stockpiles”. The public edition searches paraphrased notes, not full source documents.</p></div>':''}<div class="search-panel-footer">Searches public teaching notes · no AI-generated answers · Esc to close</div>`;
    panel.hidden=false;
    $('#global-search').setAttribute('aria-expanded','true');
  }

  function exportBrief() {
    const text=`RESILIENCE ATLAS — PUBLIC TEACHING BRIEF\nExported ${new Date().toLocaleString()}\n\nSCENARIO LABELS\nHigh Tech: technology partner\nSI: systems integrator\nISV: independent software vendor\nSupplier Knowledge Graph: dependency-mapping concept\nThese labels describe teaching roles, not organization identities.\n\nSUGGESTED OPENING (EDITORIAL SYNTHESIS)\n${opener}\n\nKEY GUARDRAILS\n- Conditional inference, not the probability of the target event.\n- S05 revised copper thresholds: 5%, 25%, 50%; do not merge S03 / S04 results.\n- No demonstrated SI production validation in the cited research.\n- Architecture, funding, staffing, IP, and compliance remain exercise questions.\n\nDISCOVERY QUESTIONS\n${A.questions.map(q=>`[${saved.checked.includes(q.id)?'x':' '}] ${q.title}\n${q.text}\nSources: ${q.refs.map(r=>r.join(' · ')).join('; ')}`).join('\n\n')}\n\nPINNED CONCEPTS\n${saved.pins.map(id=>{ const c=concept(id); return `${c.title}\n${c.definition}\nGuardrail: ${c.caution}\nSources: ${c.refs.map(r=>r.join(' · ')).join('; ')}`; }).join('\n\n')||'(None)'}\n\nLEARNER NOTES\n${saved.notes||'(None)'}\n\nSOURCE KEY\n${sources.map(s=>`${s.id} — ${meta(s.id).title}\n${meta(s.id).authors}\n${meta(s.id).subtitle}\n${meta(s.id).date}\n${[meta(s.id).readUrl,meta(s.id).doi,meta(s.id).companionUrl].filter(Boolean).join("\n")||"Teaching adaptation; no public research record claimed."}\nAccess: ${meta(s.id).access||"Anonymized teaching note"}\nEvidence: ${meta(s.id).evidence||"Illustration, not primary evidence"}\nCaution: ${meta(s.id).note}`).join('\n\n')}\n\nResearch citations and paraphrased teaching notes are available in Resilience Atlas.\nThis teaching export includes any notes you entered. Review your own notes before sharing; do not include restricted data.\n`;
    if(exportedUrl) URL.revokeObjectURL(exportedUrl);
    exportedUrl=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');
    a.href=exportedUrl;
    a.download=`Resilience-Atlas-Brief-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    notify('Briefing export prepared. Save it to an approved location.');
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('button, a, [data-map-node]');
    if(!button) {
      if(!event.target.closest('.search-wrap')) hideSearch();
      return;
    }
    const d=button.dataset;
    if(d.source) { if(!button.closest('#detail-dialog')) sourceOrigin=null; openSource(d.source,d.label); }
    else if(d.concept) openConcept(d.concept);
    else if(d.pin) {
      saved.pins=saved.pins.includes(d.pin)?saved.pins.filter(id=>id!==d.pin):[...saved.pins,d.pin];
      const stored=persist();
      if($('#detail-dialog').open&&$('#dialog-content .concept-detail')) {
        const pin=$('#dialog-content .concept-detail [data-pin]');
        const pinned=saved.pins.includes(d.pin);
        pin.textContent=pinned?'★ Pinned to your teaching brief':'☆ Pin to your teaching brief';
        pin.setAttribute('aria-pressed',String(pinned));
      }
      if(state.route==='concepts') {
        document.querySelectorAll(`.pin-button[data-pin="${d.pin}"]`).forEach(el=>{
          const pinned=saved.pins.includes(d.pin);
          el.classList.toggle('is-pinned',pinned);
          el.textContent=pinned?'★':'☆';
          el.setAttribute('aria-pressed',String(pinned));
          el.setAttribute('aria-label',`${pinned?'Unpin':'Pin'} ${concept(d.pin).title}`);
        });
      }
      if($('#pinned-concepts')) $('#pinned-concepts').innerHTML=pinnedSection();
      if(stored) notify(saved.pins.includes(d.pin)?'Pinned to your teaching brief.':'Removed from your teaching brief.');
    }
    else if(d.mapNode) {
      state.selected=d.mapNode;
      $('#map-detail').innerHTML=selectedConcept();
      document.querySelectorAll('[data-map-node]').forEach(el=>{el.classList.toggle('selected',el.dataset.mapNode===state.selected);el.setAttribute('aria-pressed',String(el.dataset.mapNode===state.selected));});
      document.querySelectorAll('[data-edge]').forEach(el=>el.classList.toggle('active',el.dataset.edge.split(' ').includes(state.selected)));
    }
    else if(d.group) {state.group=d.group;render('concepts',true);}
    else if(d.case) {state.case=d.case;render('evidence',true);}
    else if(d.sourceFilter) {state.sourceFilter=d.sourceFilter;render('sources',true);}
    else if(d.step!==undefined) {
      state.labStep=Number(d.step);
      $('#step-detail').innerHTML=stepDetail();
      document.querySelectorAll('[data-step]').forEach(el=>{el.classList.toggle('active',Number(el.dataset.step)===state.labStep);el.setAttribute('aria-pressed',String(Number(el.dataset.step)===state.labStep));});
    }
    else if(d.resetLab!==undefined) { state.loss=20;state.rho=0.8;render('lab',true); }
    else if(d.flash) {if(d.flash==='next'){state.flash=(state.flash+1)%A.flashcards.length;state.revealed=false;}else state.revealed=!state.revealed;$('#flashcard').innerHTML=flashcard();}
    else if(d.export!==undefined) exportBrief();
    else if(d.print!==undefined) window.print();
    else if(d.closeSearch!==undefined) hideSearch();
    if(button.tagName==='A'&&button.getAttribute('href')?.startsWith('#')&&$('#detail-dialog').open) {
      const target=button.getAttribute('href');
      if(target===location.hash) {event.preventDefault();route();}
    }
  });

  document.addEventListener('input',event=>{
    if(event.target.id==='global-search') {clearTimeout(searchTimer);searchTimer=setTimeout(()=>search(event.target.value),120);}
    if(event.target.id==='loss-slider'||event.target.id==='rho-slider') {
      state.loss=Number($('#loss-slider').value);
      state.rho=Number($('#rho-slider').value);
      $('#loss-value').textContent=state.loss+'%';
      $('#rho-value').textContent=state.rho.toFixed(2);
      $('#lab-output').innerHTML=labOutput();
    }
    if(event.target.id==='call-notes') {
      saved.notes=event.target.value;
      $('#print-notes').textContent=saved.notes||'(No notes recorded)';
      if(persist()) $('#save-status').textContent='Saved locally in this browser · not uploaded';
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='source-jump') jumpToSource(event.target.value);
    if(event.target.dataset.question) {
      const id=event.target.dataset.question;
      saved.checked=event.target.checked?[...new Set([...saved.checked,id])]:saved.checked.filter(v=>v!==id);
      persist();
    }
  });
  document.addEventListener('keydown',event=>{
    const editing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if((event.key==='/'&&!editing)||((event.ctrlKey||event.metaKey)&&event.key==='k')) {
      if($('#detail-dialog').open) return;
      event.preventDefault();$('#global-search').focus();$('#global-search').select();
    }
    if(event.key==='Escape') hideSearch();
    if(event.target.id==='global-search'&&event.key==='Enter') {
      clearTimeout(searchTimer);search(event.target.value);
      $('#search-results .search-result')?.click();
    }
    if(event.target.id==='global-search'&&event.key==='ArrowDown'&&!$('#search-results').hidden) {
      event.preventDefault();$('#search-results .search-result')?.focus();
    }
    if(event.target.matches('[data-map-node]')&&(event.key==='Enter'||event.key===' ')) {event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  });
  $('#close-dialog').addEventListener('click',closeDetail);
  $('#detail-dialog').addEventListener('cancel',event=>{
    event.preventDefault();
    closeDetail();
  });
  $('#detail-dialog').addEventListener('click',event=>{
    if(event.target===$('#detail-dialog')) {
      const rect=event.target.getBoundingClientRect();
      if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) closeDetail();
    }
  });
  $('#detail-dialog').addEventListener('close',()=>{
    if($('#detail-dialog').open) return;
    sourceOrigin=null;
    if(lastFocus?.isConnected) lastFocus.focus();
  });
  $('#menu-button').addEventListener('click',()=>{
    const open=$('.sidebar').classList.toggle('mobile-open');
    $('#menu-button').setAttribute('aria-expanded',String(open));
  });
  $('#global-search').addEventListener('focus',()=>{if($('#global-search').value.trim().length>=2)search($('#global-search').value);});
  window.addEventListener('hashchange',route);
  route();
  if(storageWarning) notify(storageWarning);
})();
