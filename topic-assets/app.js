(() => {
  const topics = window.TOPICS || [];
  const id = document.body.dataset.topic || '09';
  const topic = topics.find(item => item.id === id) || topics.find(item => item.id === '09');
  const $ = selector => document.getElementById(selector);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const STORAGE_KEY = 'loop-lab-completed-topics';
  const VISITED_KEY = 'loop-lab-visited-topics';

  function readSet(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return new Set(Array.isArray(value) ? value : []);
    } catch {
      return new Set();
    }
  }

  function saveSet(key, values) {
    try { localStorage.setItem(key, JSON.stringify([...values])); } catch { /* private browsing */ }
  }

  const visited = readSet(VISITED_KEY);
  const completed = readSet(STORAGE_KEY);
  visited.add(id);
  saveSet(VISITED_KEY, visited);

  const highlight = source => {
    let html = esc(source);
    html = html.replace(/(".*?"|'.*?')/g, '<span class="str">$1</span>');
    html = html.replace(/(#.*)$/g, '<span class="comment">$1</span>');
    html = html.replace(/\b(for|in|if|else|elif|not|and|or|return|def|class|import|from|as|with|try|except|finally|raise|break|continue|yield|lambda|True|False|None)\b/g, '<span class="kw">$1</span>');
    html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>');
    html = html.replace(/\b(print|input|int|str|float|len|type|range|list|set|dict|sum|next|iter|open|enumerate|round)\b(?=\()/g, '<span class="fn">$1</span>');
    return html;
  };

  document.title = `${topic.title} — Loop Lab`;
  $('module').textContent = topic.module;
  $('footerTopic').textContent = `${topic.id} · ${topic.title}`;
  $('topicNumber').textContent = `TOPIC ${topic.id}`;
  $('title').textContent = topic.title;
  $('summary').textContent = topic.summary;
  $('codeTitle').textContent = topic.id === '09' ? 'Registration validation pipeline' : `${topic.title} · worked example`;

  const orderedTopics = [...topics].sort((a, b) => a.id.localeCompare(b.id));
  const position = Math.max(1, orderedTopics.findIndex(item => item.id === id) + 1);
  const path = document.createElement('section');
  path.className = 'learning-progress';
  path.setAttribute('aria-label', 'Learning path progress');
  path.innerHTML = `
    <div class="path-meta"><span>YOUR PYTHON PATH</span><strong><b>${String(position).padStart(2, '0')}</b><i>/</i>${orderedTopics.length}</strong></div>
    <div class="path-track" role="progressbar" aria-label="Topic position" aria-valuemin="1" aria-valuemax="${orderedTopics.length}" aria-valuenow="${position}"><span style="width:${position / orderedTopics.length * 100}%"></span></div>
    <span class="path-completion" id="pathCompletion"></span>`;
  document.querySelector('.topbar').insertAdjacentElement('afterend', path);

  function updateCourseProgress() {
    const count = orderedTopics.filter(item => completed.has(item.id)).length;
    $('pathCompletion').textContent = `${count} / ${orderedTopics.length} completed`;
    document.querySelector('.path-track').setAttribute('aria-valuenow', String(position));
  }
  updateCourseProgress();

  const codeSource = topic.code.join('\n');
  $('code').innerHTML = topic.code.map((line, index) => `<div class="code-line" data-line="${index}"><span class="ln">${index + 1}</span><span class="src">${highlight(line)}</span></div>`).join('');
  $('codeEditor').value = codeSource;

  $('editToggle').addEventListener('click', () => {
    const editing = $('editorWrap').hidden;
    $('editorWrap').hidden = !editing;
    $('code').hidden = editing;
    $('codeHint').textContent = editing ? 'Edit the example, then compile it with Python.' : 'Current line highlights as the program runs';
    $('editToggle').textContent = editing ? 'Preview code' : 'Edit code';
    $('editToggle').setAttribute('aria-expanded', String(editing));
  });

  $('resetCode').addEventListener('click', () => {
    $('codeEditor').value = codeSource;
    $('compileStatus').textContent = 'Example restored. Compile when ready.';
    $('compileStatus').classList.remove('error', 'success');
  });

  $('compile').addEventListener('click', async () => {
    const button = $('compile');
    button.disabled = true;
    $('compileStatus').textContent = 'Compiling with Python…';
    $('compileStatus').classList.remove('error', 'success');
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: $('codeEditor').value })
      });
      const result = await response.json();
      if (result.ok) {
        $('compileStatus').textContent = `Python ${result.python}: compiled successfully (${result.instructions} bytecode instructions). Code was not executed.`;
        $('compileStatus').classList.add('success');
      } else {
        $('compileStatus').textContent = `Compile error${result.line ? ` on line ${result.line}${result.column ? `, column ${result.column}` : ''}` : ''}: ${result.message}`;
        $('compileStatus').classList.add('error');
      }
    } catch {
      $('compileStatus').textContent = 'Compiler unavailable. Refresh the page or check your connection, then try again.';
      $('compileStatus').classList.add('error');
    } finally {
      button.disabled = false;
    }
  });

  $('codeEditor').addEventListener('input', () => {
    $('compileStatus').textContent = 'Edited code is ready to compile.';
    $('compileStatus').classList.remove('error', 'success');
  });

  const rejectedItems = new Set();
  if (topic.id === '09') {
    topic.events.forEach(event => {
      if (/invalid|empty|fails|failed|required-field/i.test(`${event[2]} ${event[3] || ''}`)) rejectedItems.add(event[0]);
    });
  }
  $('visualLabel').textContent = topic.id === '09' ? 'Registration review · one record per iteration' : `${topic.items.length} stages in this visual`;
  $('items').innerHTML = topic.items.map((item, index) => {
    const outcome = topic.id === '09' ? '<span class="outcome" aria-live="polite"></span>' : '';
    return `<div class="item" data-i="${index}" aria-label="${esc(item)}"><div class="node">${index + 1}</div><div class="caption" title="${esc(item)}">${esc(item)}</div>${outcome}</div>`;
  }).join('');

  $('quizQuestion').textContent = topic.quiz[0];
  $('answers').innerHTML = topic.quiz[1].map((answer, index) => `<button class="answer" type="button" data-index="${index}">${esc(answer)}</button>`).join('');

  $('topicMenu').innerHTML = orderedTopics.map(item => {
    const isCurrent = item.id === topic.id;
    const isComplete = completed.has(item.id);
    const hasVisited = visited.has(item.id);
    const label = isComplete ? 'Completed' : hasVisited ? 'Visited' : 'Not visited';
    return `<a href="${item.id === '09' ? 'index.html' : `topic-${item.id}.html`}" class="${isCurrent ? 'active' : ''}${isComplete ? ' completed' : ''}" ${isCurrent ? 'aria-current="page"' : ''}><span class="topic-id">${item.id}</span><span class="topic-name">${esc(item.title)}</span><span class="topic-marker" aria-label="${label}">${isComplete ? '✓' : isCurrent ? '●' : hasVisited ? '·' : ''}</span></a>`;
  }).join('');

  const events = topic.events;
  let step = 0;
  let timer = null;

  function render() {
    const event = step ? events[step - 1] : null;
    const activeIndex = event ? Math.max(0, Math.min(event[0], topic.items.length - 1)) : -1;
    const isComplete = step >= events.length;

    document.querySelectorAll('.item').forEach((element, index) => {
      const processed = isComplete || (activeIndex >= 0 && index < activeIndex);
      const isCurrent = index === activeIndex;
      element.classList.toggle('done', processed);
      element.classList.toggle('current', isCurrent);
      element.classList.toggle('accepted', topic.id === '09' && processed && !rejectedItems.has(index));
      element.classList.toggle('rejected', topic.id === '09' && processed && rejectedItems.has(index));
      element.classList.toggle('processing', topic.id === '09' && isCurrent);
      const badge = element.querySelector('.outcome');
      if (badge) badge.textContent = processed ? (rejectedItems.has(index) ? 'SKIPPED' : 'ACCEPTED') : isCurrent ? 'IN LOOP' : 'QUEUED';
      element.setAttribute('aria-current', isCurrent ? 'step' : 'false');
    });

    $('fill').style.width = `${step / events.length * 100}%`;
    if (event) {
      const node = document.querySelectorAll('.item .node')[activeIndex];
      const track = $('items').parentElement.getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      $('traveler').style.left = `${rect.left - track.left}px`;
      $('traveler').textContent = activeIndex + 1;
      $('traveler').classList.add('visible');
      $('traveler').classList.remove('to-console');
      $('current').textContent = topic.items[activeIndex];
      $('state').textContent = event[2];
    } else {
      $('traveler').classList.remove('visible', 'to-console');
      $('current').textContent = isComplete ? 'Batch complete' : 'Ready';
      $('state').textContent = isComplete ? 'Every record has been reviewed.' : 'Press Next or Play to begin.';
    }

    if (topic.id === '09') {
      $('iteration').textContent = isComplete ? 'Batch complete' : activeIndex >= 0 ? `Record ${activeIndex + 1} of ${topic.items.length}` : 'Ready';
    } else {
      $('iteration').textContent = step === 0 ? 'Ready' : isComplete ? 'Complete' : `Step ${step} of ${events.length}`;
    }
    $('counter').textContent = `${step} / ${events.length} steps`;
    const logs = events.slice(0, step).filter(item => item[3]).map(item => item[3]);
    $('console').innerHTML = logs.length ? `<span class="prompt">›</span>${logs.map(message => `<span class="out-line">${esc(message)}</span>`).join('')}` : '<span class="prompt">›</span>Run the simulator to see the output.';

    document.querySelectorAll('.code-line').forEach((line, index) => {
      const isActive = Boolean(event && index === event[1]);
      line.classList.toggle('active', isActive);
      if (isActive) line.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    $('prev').disabled = step === 0;
    $('next').disabled = isComplete;

    if (isComplete && !completed.has(id)) {
      completed.add(id);
      saveSet(STORAGE_KEY, completed);
      updateCourseProgress();
      const currentLink = document.querySelector('.topic-menu a.active .topic-marker');
      if (currentLink) {
        currentLink.textContent = '✓';
        currentLink.setAttribute('aria-label', 'Completed');
      }
    }
  }

  function pause() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    $('play').textContent = '▶ Play';
    $('play').setAttribute('aria-pressed', 'false');
  }

  function advance() {
    if (step < events.length) { step += 1; render(); }
    if (step >= events.length) pause();
  }

  function start() {
    if (timer !== null) { pause(); return; }
    if (step >= events.length) step = 0;
    render();
    $('play').textContent = 'Ⅱ Pause';
    $('play').setAttribute('aria-pressed', 'true');
    timer = setInterval(advance, 1750 - (Number($('speed').value) - 1) * 300);
  }

  $('next').addEventListener('click', () => { pause(); advance(); });
  $('prev').addEventListener('click', () => { pause(); step = Math.max(0, step - 1); render(); });
  $('play').addEventListener('click', start);
  $('reset').addEventListener('click', () => { pause(); step = 0; render(); });
  $('speed').addEventListener('input', () => {
    $('speedOut').textContent = (.55 + Number($('speed').value) * .25).toFixed(2).replace(/0$/, '') + '×';
    if (timer !== null) { pause(); start(); }
  });

  document.querySelectorAll('.answer').forEach(button => button.addEventListener('click', () => {
    const correct = Number(button.dataset.index) === topic.quiz[2];
    document.querySelectorAll('.answer').forEach(option => option.classList.remove('correct', 'wrong'));
    button.classList.add(correct ? 'correct' : 'wrong');
    $('feedback').textContent = `${correct ? 'Correct.' : 'Not quite.'} ${topic.quiz[3]}`;
    $('feedback').classList.toggle('wrong', !correct);
    $('feedback').classList.toggle('correct', correct);
  }));

  render();
})();
