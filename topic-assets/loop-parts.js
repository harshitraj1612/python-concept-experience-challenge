(() => {
  const root = document.querySelector('[data-topic="09"]');
  if (!root) return;

  const settings = {
    for: { limit: 3 },
    while: { limit: 4 },
    nested: { limit: 10 }
  };

  root.querySelectorAll('[data-loop-part]').forEach((panel) => {
    const type = panel.dataset.loopPart;
    const config = settings[type];
    if (!config) return;

    let stepIndex = -1;
    let timer = null;
    const visual = panel.querySelector('[data-visual]');
    const output = panel.querySelector('[data-output]');
    const status = panel.querySelector('[data-status]');
    const state = panel.querySelector('[data-state]');
    const codeLines = [...panel.querySelectorAll('.part-line')];
    const playButton = panel.querySelector('[data-action="play"]');
    const speed = panel.querySelector('[data-speed]');
    const outputLines = [];

    const setLines = (...lines) => {
      codeLines.forEach((line) => line.classList.toggle('active', lines.includes(Number(line.dataset.line))));
    };
    const showOutput = () => {
      output.innerHTML = outputLines.length
        ? outputLines.slice(-6).map((line) => `<span class="part-output-line">› ${line}</span>`).join('')
        : '<span class="part-output-empty">Run the simulation to see the output.</span>';
    };
    const stop = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      playButton.textContent = '▶ Play';
      playButton.setAttribute('aria-label', 'Play simulation');
    };
    const render = () => {
      const done = stepIndex >= config.limit - 1;
      status.textContent = stepIndex < 0 ? 'Ready' : done ? 'Complete' : `Step ${stepIndex + 1}`;
      status.classList.toggle('complete', done);
      showOutput();

      if (type === 'for') {
        const names = ['Asha', 'Rohan', 'Meera'];
        const current = Math.min(stepIndex, names.length - 1);
        visual.innerHTML = `<div class="for-track">${names.map((name, i) => `<div class="for-item ${i <= stepIndex ? 'visited' : ''} ${i === current && !done ? 'current' : ''}"><span class="for-number">${i + 1}</span><strong>${name}</strong><small>${i <= stepIndex ? 'Welcomed' : i === current && !done ? 'Current item' : 'Waiting'}</small></div>`).join('')}</div><div class="for-loop-note">${done ? 'The list is finished. The loop ran once for each student.' : stepIndex < 0 ? 'Each pass takes the next student from the list.' : `Pass ${stepIndex + 1} of ${names.length}: student = "${names[current]}"`}</div>`;
        if (done) {
          setLines(2);
          state.textContent = 'No more students remain, so the loop ends.';
        } else if (stepIndex < 0) {
          setLines();
          state.textContent = 'Press Step or Play to begin.';
        } else {
          setLines(2, 3);
          state.textContent = `student is now "${names[current]}".`;
        }
      } else if (type === 'while') {
        const remaining = stepIndex < 0 ? 3 : Math.max(0, 3 - stepIndex);
        const finished = stepIndex >= 3;
        visual.innerHTML = `<div class="while-meter" aria-label="${remaining} energy units remaining">${[1, 2, 3].map((n) => `<span class="energy ${n <= remaining ? 'lit' : ''}"></span>`).join('')}</div><div class="while-count">${remaining}<small>energy left</small></div><div class="while-loop-note">${finished ? '0 > 0 is false · the loop stops safely.' : stepIndex < 0 ? 'The condition is checked before every pass.' : `The body ran, then energy decreased to ${remaining}.`}</div>`;
        if (finished) {
          setLines(2);
          state.textContent = 'Condition is false at 0, so no more passes run.';
        } else if (stepIndex < 0) {
          setLines();
          state.textContent = 'Press Step or Play to begin at energy = 3.';
        } else {
          setLines(2, 3, 4);
          state.textContent = `The loop printed ${remaining + 1}, then reduced energy by 1.`;
        }
      } else {
        const current = Math.min(stepIndex, 8);
        const row = Math.floor(current / 3) + 1;
        const column = current % 3 + 1;
        const finished = stepIndex >= 9;
        visual.innerHTML = `<div class="nested-labels"><span>Outer loop · row</span><span>Inner loop · seat</span></div><div class="nested-grid">${Array.from({ length: 9 }, (_, i) => `<div class="nested-cell ${i < stepIndex ? 'visited' : ''} ${i === current && !finished ? 'current' : ''}"><span>R${Math.floor(i / 3) + 1} · S${i % 3 + 1}</span><small>${i < stepIndex ? 'Printed' : i === current && !finished ? 'Current' : 'Waiting'}</small></div>`).join('')}</div><div class="nested-loop-note">${finished ? 'All 3 rows × 3 seats were visited: 9 total passes.' : stepIndex < 0 ? 'For each row, the inner loop visits every seat.' : `row = ${row} · seat = ${column} · inner loop pass ${column} of 3`}</div>`;
        if (finished) {
          setLines(1);
          state.textContent = 'The inner loop finished for all three rows.';
        } else if (stepIndex < 0) {
          setLines();
          state.textContent = 'Press Step or Play to begin the row-by-row scan.';
        } else {
          setLines(1, 2, 3);
          state.textContent = `The outer loop is on row ${row}; the inner loop is on seat ${column}.`;
        }
      }
    };

    const advance = () => {
      if (stepIndex >= config.limit - 1) {
        stop();
        return;
      }
      stepIndex += 1;
      if (type === 'for' && stepIndex < 3) outputLines.push(`Welcome, ${['Asha', 'Rohan', 'Meera'][stepIndex]}`);
      if (type === 'while' && stepIndex < 3) outputLines.push(`Power: ${3 - stepIndex}`);
      if (type === 'nested' && stepIndex < 9) outputLines.push(`row ${Math.floor(stepIndex / 3) + 1}, seat ${stepIndex % 3 + 1}`);
      render();
      if (stepIndex >= config.limit - 1) stop();
    };

    panel.querySelector('[data-action="step"]').addEventListener('click', advance);
    playButton.addEventListener('click', () => {
      if (timer !== null) {
        stop();
        return;
      }
      if (stepIndex >= config.limit - 1) {
        stepIndex = -1;
        outputLines.length = 0;
        render();
      }
      playButton.textContent = 'Ⅱ Pause';
      playButton.setAttribute('aria-label', 'Pause simulation');
      timer = window.setInterval(advance, 1200 - Number(speed.value) * 150);
    });
    panel.querySelector('[data-action="reset"]').addEventListener('click', () => {
      stop();
      stepIndex = -1;
      outputLines.length = 0;
      render();
    });
    speed.addEventListener('input', () => {
      if (timer !== null) {
        stop();
        playButton.click();
      }
    });
    render();
  });
})();
