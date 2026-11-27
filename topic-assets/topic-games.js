/**
 * Loop Lab — Topic Mini-Games Arcade
 * Embedded into each topic page with 2 topic-themed games:
 * 1. Snake & Ladder: Python Bug Climber (dice roll, snakes are topic bugs, ladders are code fixes)
 * 2. Subway Python Runner: 3-Lane Track Runner (dodge SyntaxErrors, collect Python keywords)
 */
(() => {
  const topicId = document.body.dataset.topic || '01';
  const topics = window.TOPICS || [];
  const curTopic = topics.find(t => t.id === topicId) || { id: topicId, title: 'Python Basics' };

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Topic keywords for the runner
  const TOPIC_TOKENS = {
    '01': ['def', 'print', 'return', 'str', 'greeting()'],
    '02': ['if', ':', 'raise', 'ValueError', 'indent'],
    '03': ['total', '=', 'round()', 'tax_rate', 'float'],
    '04': ['int()', 'str()', 'float()', 'type()', 'conversion'],
    '05': ['+', '*', '//', '%', '**', 'round()'],
    '06': ['input()', 'print()', '.strip()', 'int()', 'f-string'],
    '07': ['and', 'or', 'not', '==', '!=', 'True'],
    '08': ['if', 'elif', 'else', 'condition', 'branch'],
    '09': ['for', 'in', 'range()', 'item', 'loop'],
    '10': ['while', 'condition', 'count += 1', 'break', 'flag'],
    '11': ['range()', 'start', 'stop', 'step', '-1'],
    '12': ['break', 'continue', 'exit', 'skip', 'pass'],
    '13': ['outer', 'inner', 'grid[r][c]', 'nested', 'matrix'],
    '14': ['for', 'else', 'break', 'found', 'search'],
    '15': ['dict', 'key:value', '.get()', '.update()', '.keys()'],
    '16': ['def', 'return', '*args', '**kwargs', 'call()'],
    '17': ['Local', 'Enclosing', 'Global', 'Builtin', 'nonlocal'],
    '18': ['base_case', 'recursive_call()', '@lru_cache', 'stack', 'return'],
    '19': ['lambda', 'map()', 'filter()', 'reduce()', 'fn()'],
    '20': ['[x for x in L]', '{k:v}', 'if condition', 'comprehend', 'list'],
    '21': ['try', 'except', 'else', 'finally', 'raise'],
    '22': ['with open()', 'as file:', '.read()', '.write()', 'Path'],
    '23': ['class', 'self', '__init__', '@dataclass', 'method()'],
    '24': ['yield', 'next()', 'iter()', 'generator', 'StopIteration'],
    '25': ['swap', 'compare', 'sorted()', 'bubble_pass', 'algorithm']
  };

  const tokens = TOPIC_TOKENS[topicId] || ['for', 'in', 'def', 'print', 'return'];

  // Sound chimes using Web Audio API
  let audioCtx = null;
  function playBeep(freq = 440, type = 'sine', duration = 0.12) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  /* ── Container Creation ───────────────────────────────────── */
  const arcadeSection = document.createElement('section');
  arcadeSection.className = 'card ll-games-card';
  arcadeSection.id = 'llGamesSection';
  arcadeSection.innerHTML = `
    <div class="cardhead">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">🎮</span>
        <div>
          <div class="cardtitle">Topic Arcade: Learn Through Play</div>
          <div style="font-size:11px;color:var(--muted)">Topic ${esc(topicId)} Interactive Challenges</div>
        </div>
      </div>
      <div class="ll-games-tabs" role="tablist">
        <button class="ll-game-tab active" id="tabSnake" role="tab" aria-selected="true">🐍 Snakes & Ladders</button>
        <button class="ll-game-tab" id="tabRunner" role="tab" aria-selected="false">🏃 Subway Runner</button>
      </div>
    </div>
    <div class="ll-games-body">
      <!-- GAME 1: SNAKES & LADDERS -->
      <div class="ll-game-panel" id="panelSnake">
        <div class="ll-snk-layout">
          <div class="ll-snk-board-wrap">
            <div class="ll-snk-board" id="snkBoard"></div>
          </div>
          <div class="ll-snk-hud">
            <div class="ll-snk-status" id="snkStatus">
              <h4>🎯 Python Logic Climb</h4>
              <p>Climb from Tile 1 to 36! Ladders are clean code habits, snakes are Python bugs.</p>
            </div>
            <div class="ll-snk-dice-box">
              <div class="ll-snk-dice" id="snkDice">🎲</div>
              <button class="btn primary" id="snkRollBtn" style="min-width:140px;height:42px;font-size:14px">
                Roll Dice
              </button>
            </div>
            <div class="ll-snk-info" id="snkInfo">
              <span class="ll-badge-pos" id="snkPosBadge">Current: Tile 1</span>
              <span class="ll-badge-turns" id="snkTurnBadge">Rolls: 0</span>
            </div>
            <div class="ll-snk-legend">
              <span class="snk-leg ladder">🪜 Ladder: Code Fix (+Boost)</span>
              <span class="snk-leg snake">🐍 Snake: Bug (-Slide)</span>
            </div>
            <button class="btn reset" id="snkResetBtn" style="margin-top:10px;font-size:11px">↺ Restart Board</button>
          </div>
        </div>
      </div>

      <!-- GAME 2: SUBWAY PYTHON RUNNER -->
      <div class="ll-game-panel" id="panelRunner" hidden>
        <div class="ll-runner-container">
          <div class="ll-runner-hud">
            <div class="ll-rh-item">Score: <strong id="runScore">0</strong></div>
            <div class="ll-rh-item">High Score: <strong id="runHighScore">0</strong></div>
            <div class="ll-rh-item">Tokens: <strong id="runTokens">0</strong></div>
            <div class="ll-rh-item">Speed: <strong id="runSpeed">1.0x</strong></div>
          </div>
          <div class="ll-runner-canvas-wrap">
            <canvas id="runnerCanvas" width="600" height="360"></canvas>
            <div class="ll-runner-overlay" id="runnerOverlay">
              <div class="ll-runner-start-card">
                <h3>🏃 Subway Python Runner</h3>
                <p>Run along 3 tracks. Collect valid <strong>Topic ${esc(topicId)}</strong> code tokens!</p>
                <p style="font-size:12px;color:var(--muted)">Controls: <strong>← →</strong> or <strong>A / D</strong> to switch lanes, <strong>↑ / Space</strong> to jump over bug hurdles.</p>
                <button class="btn primary" id="runStartBtn" style="padding:12px 24px;font-size:14px;margin-top:10px">▶ Play Runner</button>
              </div>
            </div>
          </div>
          <div class="ll-runner-mobile-ctrls">
            <button class="btn" id="ctrlLeft" aria-label="Move left">← Left</button>
            <button class="btn primary" id="ctrlJump" aria-label="Jump">▲ Jump</button>
            <button class="btn" id="ctrlRight" aria-label="Move right">Right →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insert before the quiz section
  const lowerSection = document.querySelector('.lower');
  if (lowerSection) {
    lowerSection.parentNode.insertBefore(arcadeSection, lowerSection);
  } else {
    const wrap = document.querySelector('.wrap') || document.body;
    wrap.appendChild(arcadeSection);
  }

  // Tab switching
  const tabSnake = document.getElementById('tabSnake');
  const tabRunner = document.getElementById('tabRunner');
  const panelSnake = document.getElementById('panelSnake');
  const panelRunner = document.getElementById('panelRunner');

  tabSnake.addEventListener('click', () => {
    tabSnake.classList.add('active');
    tabRunner.classList.remove('active');
    tabSnake.setAttribute('aria-selected', 'true');
    tabRunner.setAttribute('aria-selected', 'false');
    panelSnake.hidden = false;
    panelRunner.hidden = true;
  });

  tabRunner.addEventListener('click', () => {
    tabRunner.classList.add('active');
    tabSnake.classList.remove('active');
    tabRunner.setAttribute('aria-selected', 'true');
    tabSnake.setAttribute('aria-selected', 'false');
    panelRunner.hidden = false;
    panelSnake.hidden = true;
    initRunnerCanvas();
  });

  /* ═════════════════════════════════════════════════════════════
     1. SNAKES & LADDERS ENGINE (6x6 = 36 tiles)
  ═════════════════════════════════════════════════════════════ */
  const LADDERS = {
    4:  { to: 14, msg: '🪜 Clean logic boost! Jumped to Tile 14' },
    9:  { to: 22, msg: '🪜 Fast algorithm optimization! Jumped to Tile 22' },
    15: { to: 26, msg: '🪜 Handled edge case with elegance! Jumped to Tile 26' },
    21: { to: 32, msg: '🪜 Perfect syntax & guard clause! Jumped to Tile 32' }
  };

  const SNAKES = {
    17: { to: 7,  msg: '🐍 IndexError: slide down to Tile 7' },
    24: { to: 12, msg: '🐍 Infinite Loop bug: slide down to Tile 12' },
    29: { to: 18, msg: '🐍 Off-by-one boundary glitch: slide down to Tile 18' },
    34: { to: 20, msg: '🐍 SyntaxError: unclosed parenthesis! Slide to Tile 20' }
  };

  let playerPos = 1;
  let turnCount = 0;
  let isRolling = false;

  function buildBoard() {
    const board = document.getElementById('snkBoard');
    board.innerHTML = '';
    // Build 6 rows of 6 cells (boustrophedon / zig-zag)
    // Row 6: 36..31
    // Row 5: 25..30
    // Row 4: 24..19
    // Row 3: 13..18
    // Row 2: 12..7
    // Row 1: 1..6
    for (let r = 6; r >= 1; r--) {
      const rowCells = [];
      const isReverse = (r % 2 === 0);
      const start = (r - 1) * 6 + 1;
      for (let c = 0; c < 6; c++) {
        rowCells.push(start + c);
      }
      if (isReverse) rowCells.reverse();

      rowCells.forEach(tileNum => {
        const cell = document.createElement('div');
        cell.className = 'snk-cell';
        cell.id = `snkCell_${tileNum}`;

        let icon = '';
        if (tileNum === 36) icon = '🏆';
        else if (LADDERS[tileNum]) icon = '🪜';
        else if (SNAKES[tileNum]) icon = '🐍';
        else if (tileNum === 1) icon = '🏁';

        cell.innerHTML = `
          <span class="snk-cell-num">${tileNum}</span>
          ${icon ? `<span class="snk-cell-icon">${icon}</span>` : ''}
          <div class="snk-avatar-slot" id="snkSlot_${tileNum}"></div>
        `;
        board.appendChild(cell);
      });
    }
    updatePlayerAvatar();
  }

  function updatePlayerAvatar() {
    document.querySelectorAll('.snk-avatar').forEach(el => el.remove());
    const slot = document.getElementById(`snkSlot_${playerPos}`);
    if (slot) {
      const av = document.createElement('div');
      av.className = 'snk-avatar';
      av.innerHTML = '🤖';
      av.title = `Player at tile ${playerPos}`;
      slot.appendChild(av);
    }
    document.getElementById('snkPosBadge').textContent = `Current: Tile ${playerPos}`;
    document.getElementById('snkTurnBadge').textContent = `Rolls: ${turnCount}`;
  }

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  document.getElementById('snkRollBtn').addEventListener('click', () => {
    if (isRolling) return;
    if (playerPos >= 36) {
      document.getElementById('snkStatus').innerHTML = '<h4>🏆 Victory!</h4><p>You already mastered this board! Press Restart to play again.</p>';
      return;
    }

    isRolling = true;
    turnCount++;
    const diceEl = document.getElementById('snkDice');
    diceEl.classList.add('rolling');
    playBeep(320, 'square', 0.1);

    let rolls = 0;
    const interval = setInterval(() => {
      diceEl.textContent = diceFaces[Math.floor(Math.random() * 6)];
      rolls++;
      if (rolls > 8) {
        clearInterval(interval);
        diceEl.classList.remove('rolling');
        const rollValue = Math.floor(Math.random() * 6) + 1;
        diceEl.textContent = diceFaces[rollValue - 1];

        stepPlayer(rollValue);
      }
    }, 60);
  });

  function stepPlayer(roll) {
    let nextPos = playerPos + roll;
    if (nextPos > 36) {
      // Bounce back if overshoot
      const excess = nextPos - 36;
      nextPos = 36 - excess;
    }
    playerPos = nextPos;
    playBeep(480, 'sine', 0.1);
    updatePlayerAvatar();

    const statusEl = document.getElementById('snkStatus');
    statusEl.innerHTML = `<p>Rolled a <strong>${roll}</strong>! Moved to Tile ${playerPos}.</p>`;

    // Check ladders or snakes
    setTimeout(() => {
      if (LADDERS[playerPos]) {
        const ladder = LADDERS[playerPos];
        playerPos = ladder.to;
        playBeep(700, 'triangle', 0.25);
        updatePlayerAvatar();
        statusEl.innerHTML = `<p class="snk-boost">🎉 <strong>Ladder Boost!</strong> ${ladder.msg}</p>`;
      } else if (SNAKES[playerPos]) {
        const snake = SNAKES[playerPos];
        playerPos = snake.to;
        playBeep(220, 'sawtooth', 0.3);
        updatePlayerAvatar();
        statusEl.innerHTML = `<p class="snk-slide">⚠️ <strong>Bug Hazard!</strong> ${snake.msg}</p>`;
      }

      if (playerPos === 36) {
        playBeep(880, 'sine', 0.4);
        statusEl.innerHTML = `<h4>🎉 Level Cleared!</h4><p>You completed the Python Logic Climb in <strong>${turnCount}</strong> rolls!</p>`;
      }
      isRolling = false;
    }, 450);
  }

  document.getElementById('snkResetBtn').addEventListener('click', () => {
    playerPos = 1;
    turnCount = 0;
    isRolling = false;
    document.getElementById('snkDice').textContent = '🎲';
    document.getElementById('snkStatus').innerHTML = '<h4>🎯 Python Logic Climb</h4><p>Board reset! Roll dice to advance.</p>';
    updatePlayerAvatar();
  });

  buildBoard();

  /* ═════════════════════════════════════════════════════════════
     2. SUBWAY PYTHON RUNNER (Canvas 3-Lane Game)
  ═════════════════════════════════════════════════════════════ */
  let runnerInitialized = false;
  let canvas, ctx;
  let gameRunning = false;
  let animFrameId = null;

  // Game state
  let runnerScore = 0;
  let runnerHighScore = parseInt(localStorage.getItem(`ll_run_hs_${topicId}`) || '0', 10);
  let runnerTokensCollected = 0;
  let runnerSpeed = 4.5;
  let trackOffset = 0;

  // Player in 3 lanes: 0 (left), 1 (center), 2 (right)
  const LANES_X = [150, 300, 450];
  let playerLane = 1;
  let playerY = 270;
  let playerTargetX = LANES_X[1];
  let playerActualX = LANES_X[1];
  let isJumping = false;
  let jumpVelocity = 0;
  const GRAVITY = 0.8;

  // Obstacles and Collectibles
  let gameObjects = [];
  let spawnTimer = 0;

  function initRunnerCanvas() {
    if (runnerInitialized) return;
    runnerInitialized = true;

    canvas = document.getElementById('runnerCanvas');
    ctx = canvas.getContext('2d');
    document.getElementById('runHighScore').textContent = runnerHighScore;

    // Controls
    window.addEventListener('keydown', e => {
      if (!gameRunning) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLane(-1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveLane(1);
        e.preventDefault();
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        triggerJump();
        e.preventDefault();
      }
    });

    document.getElementById('ctrlLeft').addEventListener('click', () => moveLane(-1));
    document.getElementById('ctrlRight').addEventListener('click', () => moveLane(1));
    document.getElementById('ctrlJump').addEventListener('click', triggerJump);

    // Swipe controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', e => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 30) moveLane(1);
          else if (dx < -30) moveLane(-1);
        } else {
          if (dy < -30) triggerJump();
        }
      }
    }, { passive: true });

    document.getElementById('runStartBtn').addEventListener('click', startRunnerGame);
  }

  function moveLane(dir) {
    const nextLane = playerLane + dir;
    if (nextLane >= 0 && nextLane <= 2) {
      playerLane = nextLane;
      playerTargetX = LANES_X[playerLane];
      playBeep(450, 'sine', 0.05);
    }
  }

  function triggerJump() {
    if (!isJumping) {
      isJumping = true;
      jumpVelocity = -12;
      playBeep(600, 'triangle', 0.1);
    }
  }

  function startRunnerGame() {
    document.getElementById('runnerOverlay').style.display = 'none';
    runnerScore = 0;
    runnerTokensCollected = 0;
    runnerSpeed = 4.5;
    playerLane = 1;
    playerActualX = LANES_X[1];
    playerTargetX = LANES_X[1];
    playerY = 270;
    isJumping = false;
    jumpVelocity = 0;
    gameObjects = [];
    spawnTimer = 0;
    gameRunning = true;

    if (animFrameId) cancelAnimationFrame(animFrameId);
    runnerLoop();
  }

  function gameOver() {
    gameRunning = false;
    playBeep(180, 'sawtooth', 0.4);

    if (runnerScore > runnerHighScore) {
      runnerHighScore = runnerScore;
      localStorage.setItem(`ll_run_hs_${topicId}`, runnerHighScore);
      document.getElementById('runHighScore').textContent = runnerHighScore;
    }

    const overlay = document.getElementById('runnerOverlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div class="ll-runner-start-card">
        <h3>💥 Bug Collision!</h3>
        <p>You hit a Python Syntax Bug obstacle!</p>
        <p style="font-size:16px;margin:8px 0">Final Score: <strong>${runnerScore}</strong> · Tokens: <strong>${runnerTokensCollected}</strong></p>
        <button class="btn primary" id="runRestartBtn" style="padding:12px 24px;font-size:14px;margin-top:10px">↺ Run Again</button>
      </div>
    `;
    document.getElementById('runRestartBtn').addEventListener('click', startRunnerGame);
  }

  function spawnObjects() {
    spawnTimer++;
    if (spawnTimer > Math.max(35, 75 - Math.floor(runnerScore / 200))) {
      spawnTimer = 0;
      const lane = Math.floor(Math.random() * 3);
      const isToken = Math.random() < 0.65;

      if (isToken) {
        // Collectible Python Token
        const word = tokens[Math.floor(Math.random() * tokens.length)];
        gameObjects.push({
          type: 'token',
          lane: lane,
          x: LANES_X[lane],
          y: -20,
          label: word,
          radius: 18
        });
      } else {
        // Bug hurdle obstacle
        gameObjects.push({
          type: 'hurdle',
          lane: lane,
          x: LANES_X[lane],
          y: -30,
          width: 52,
          height: 32,
          label: 'BUG'
        });
      }
    }
  }

  function runnerLoop() {
    if (!gameRunning) return;

    // Update player jump
    if (isJumping) {
      playerY += jumpVelocity;
      jumpVelocity += GRAVITY;
      if (playerY >= 270) {
        playerY = 270;
        isJumping = false;
        jumpVelocity = 0;
      }
    }

    // Smooth horizontal lane transition
    playerActualX += (playerTargetX - playerActualX) * 0.25;

    // Increase speed and score
    runnerScore += 1;
    if (runnerScore % 300 === 0) {
      runnerSpeed += 0.4;
    }
    trackOffset = (trackOffset + runnerSpeed) % 40;

    document.getElementById('runScore').textContent = runnerScore;
    document.getElementById('runTokens').textContent = runnerTokensCollected;
    document.getElementById('runSpeed').textContent = (runnerSpeed / 4.5).toFixed(1) + 'x';

    spawnObjects();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw pseudo-3D runway tracks
    drawTracks();

    // 2. Draw game objects
    for (let i = gameObjects.length - 1; i >= 0; i--) {
      const obj = gameObjects[i];
      obj.y += runnerSpeed;

      if (obj.type === 'token') {
        // Draw spinning/glowing token
        ctx.save();
        ctx.fillStyle = '#167c58';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#54d397';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "DM Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.label, obj.x, obj.y);
        ctx.restore();

        // Collision with player
        const dist = Math.hypot(obj.x - playerActualX, obj.y - playerY);
        if (dist < 32) {
          runnerTokensCollected++;
          runnerScore += 150;
          playBeep(750, 'sine', 0.08);
          gameObjects.splice(i, 1);
          continue;
        }
      } else if (obj.type === 'hurdle') {
        // Red glitch bug block
        ctx.save();
        ctx.fillStyle = '#c0392b';
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "DM Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠ BUG', obj.x, obj.y);
        ctx.restore();

        // Collision check (can be avoided by jumping high enough or switching lanes)
        if (
          Math.abs(obj.x - playerActualX) < 28 &&
          Math.abs(obj.y - playerY) < 25
        ) {
          if (playerY > 240) { // Not high enough in jump
            gameOver();
            return;
          }
        }
      }

      // Remove off-screen objects
      if (obj.y > canvas.height + 40) {
        gameObjects.splice(i, 1);
      }
    }

    // 3. Draw player (Looper Robot)
    drawPlayer();

    animFrameId = requestAnimationFrame(runnerLoop);
  }

  function drawTracks() {
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0e1522');
    bgGrad.addColorStop(1, '#1b263b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Track rails
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
    ctx.lineWidth = 3;
    [75, 225, 375, 525].forEach(lx => {
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, canvas.height);
      ctx.stroke();
    });

    // Horizontal speed lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    for (let y = trackOffset; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(75, y);
      ctx.lineTo(525, y);
      ctx.stroke();
    }
  }

  function drawPlayer() {
    const px = playerActualX;
    const py = playerY;

    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px, 282, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Robot body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#167c58';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(px - 14, py - 24, 28, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Visor
    ctx.fillStyle = '#17231e';
    ctx.beginPath();
    ctx.roundRect(px - 10, py - 20, 20, 9, 3);
    ctx.fill();

    // Glowing eye
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.arc(px, py - 15.5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Head antenna
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py - 24);
    ctx.lineTo(px, py - 30);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(px, py - 31, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
})();
