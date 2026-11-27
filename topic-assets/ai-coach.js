/**
 * Loop Lab — AI Performance Coach
 * Analyzes quiz scores and produces a personalized performance report.
 * Works fully offline with curated rule-based messages.
 * Drop in a real Gemini/OpenAI key via callCoachAPI() to upgrade to live AI.
 */
(() => {
  /* ──────────────────────────────────────────────────────────────
     OPTIONAL: plug in a real AI API here.
     Replace the stub with a real fetch to your backend / edge function.
     Never put API keys directly in this file.
  ────────────────────────────────────────────────────────────── */
  async function callCoachAPI(username, scores, topicMap) {
    // Example hook — swap the return below with your real API call:
    // const res = await fetch('/api/ai-coach', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, scores }),
    // });
    // if (res.ok) return (await res.json()).analysis;
    return null; // null = fall back to offline analysis
  }

  /* ── Offline rule-based analysis engine ─────────────────────── */
  function offlineAnalysis(scores, username, isGuest) {
    const entries = Object.entries(scores); // [[topicId, {correct,total,pct}], ...]
    if (entries.length === 0) {
      return `<p class="ll-ai-p">Hi <strong>${username}</strong>! Complete a few quizzes to unlock your personalised performance report. Each topic has a quick check at the bottom — give one a try!</p>`;
    }

    const avg      = Math.round(entries.reduce((a,[,s]) => a + s.pct, 0) / entries.length);
    const strong   = entries.filter(([,s]) => s.pct >= 80).map(([id]) => id);
    const weak     = entries.filter(([,s]) => s.pct < 50).map(([id]) => id);
    const moderate = entries.filter(([,s]) => s.pct >= 50 && s.pct < 80).map(([id]) => id);
    const topics   = window.TOPICS || [];
    const nameOf   = id => { const t = topics.find(x => x.id === id); return t ? t.title : `Topic ${id}`; };

    let html = '';

    // Overall verdict
    if (avg >= 85) {
      html += `<p class="ll-ai-p">🏆 <strong>Outstanding, ${username}!</strong> You're averaging <strong>${avg}%</strong> across ${entries.length} topic${entries.length>1?'s':''}. You have a strong command of Python fundamentals.</p>`;
    } else if (avg >= 65) {
      html += `<p class="ll-ai-p">👍 <strong>Great work, ${username}!</strong> Your average of <strong>${avg}%</strong> shows solid understanding. A few targeted reviews will push you to mastery.</p>`;
    } else if (avg >= 40) {
      html += `<p class="ll-ai-p">📈 <strong>Good start, ${username}!</strong> You're averaging <strong>${avg}%</strong>. The topics below need attention — revisit the simulator on each and step through the code slowly.</p>`;
    } else {
      html += `<p class="ll-ai-p">🌱 <strong>Keep going, ${username}!</strong> You're at <strong>${avg}%</strong> so far. Learning to read Python step-by-step takes practice — use the ▶ Play button on every topic before answering.</p>`;
    }

    // Strengths
    if (strong.length) {
      html += `<div class="ll-ai-section"><span class="ll-ai-badge ll-ai-green">✦ Strengths</span>
      <ul class="ll-ai-list">${strong.map(id=>`<li><strong>${nameOf(id)}</strong> — excellent grasp. Try explaining this concept in your own words to deepen retention.</li>`).join('')}</ul></div>`;
    }

    // Areas to improve
    if (weak.length) {
      html += `<div class="ll-ai-section"><span class="ll-ai-badge ll-ai-red">↓ Needs Work</span>
      <ul class="ll-ai-list">${weak.map(id => {
        const tips = topicTips(id);
        return `<li><strong>${nameOf(id)}</strong> — ${tips}</li>`;
      }).join('')}</ul></div>`;
    }

    // On track
    if (moderate.length) {
      html += `<div class="ll-ai-section"><span class="ll-ai-badge ll-ai-amber">◑ Almost There</span>
      <ul class="ll-ai-list">${moderate.map(id=>`<li><strong>${nameOf(id)}</strong> — re-run the simulator and pay attention to the highlighted line before each answer.</li>`).join('')}</ul></div>`;
    }

    // Next step
    const nextTopic = topics.find(t => !scores[t.id]);
    if (nextTopic) {
      html += `<p class="ll-ai-p">🎯 <strong>Up next:</strong> <a class="ll-ai-link" href="topic-${nextTopic.id}.html">Topic ${nextTopic.id} — ${nextTopic.title}</a></p>`;
    } else {
      html += `<p class="ll-ai-p">🎉 You've visited every topic! Head back to any weak areas listed above for a second round.</p>`;
    }

    if (isGuest) {
      html += `<p class="ll-ai-guest-note">💡 <em>Create a free profile to save this analysis and track progress across sessions.</em></p>`;
    }

    return html;
  }

  /* ── Per-topic improvement tips ─────────────────────────────── */
  function topicTips(id) {
    const tips = {
      '01': 'Focus on how function arguments flow into the return value. Trace it line by line.',
      '02': 'Practice reading colons and indentation — Python uses whitespace to define blocks.',
      '03': 'Variables are just labels; re-assignment moves the label, not the value.',
      '04': 'Remember: input() always returns a string. Convert with int() or float() as needed.',
      '05': 'Operator precedence: multiplication runs before addition. Use parentheses to be explicit.',
      '06': 'Trace the data type at each step — text → int → validation → output.',
      '07': 'Draw a truth table for and/or/not to build intuition before guessing.',
      '08': 'An if/elif/else chain stops at the first True condition — order matters.',
      '09': 'Step through each for iteration manually and write down what changes.',
      '10': 'while loops need a condition that eventually becomes False, or they run forever.',
      '11': 'range(start, stop, step) — stop is exclusive. range(1,5) gives 1,2,3,4.',
      '12': 'break exits the loop immediately; continue skips to the next iteration.',
      '13': 'Nested loops: the inner loop completes fully for every single outer iteration.',
      '14': 'for-else: the else clause runs only if the loop was NOT terminated by break.',
      '15': 'Dictionaries map keys to values. Practice .get(), .update(), and .setdefault().',
      '16': 'Read the function signature carefully — positional vs keyword arguments matter.',
      '17': 'LEGB: Local → Enclosing → Global → Built-in. Python checks in that order.',
      '18': 'Every recursive call needs a base case, or the stack will overflow.',
      '19': 'map transforms; filter selects; reduce combines — think of them as a pipeline.',
      '20': 'List comprehensions: [expression for item in iterable if condition].',
      '21': 'try/except/else/finally — only else runs on success; finally always runs.',
      '22': 'Use with for files so the context manager closes it automatically.',
      '23': '@dataclass generates __init__ and __repr__ for you — read the generated code.',
      '24': 'yield pauses a generator and hands a value to the caller, keeping state.',
      '25': 'Bubble sort: after each pass the largest unsorted element is at the right end.',
    };
    return tips[id] || 'Revisit the simulator and step through the code line by line before answering.';
  }

  /* ── Public API ──────────────────────────────────────────────── */
  window.LoopLabAI = {
    async analyze(scores, username, isGuest) {
      // Try live API first
      const topicMap = {};
      (window.TOPICS || []).forEach(t => { topicMap[t.id] = t.title; });
      try {
        const live = await callCoachAPI(username, scores, topicMap);
        if (live) return live;
      } catch {}
      // Fall back to offline
      return offlineAnalysis(scores, username || 'Learner', isGuest);
    },

    /** Call this after each quiz answer so the system stays up to date */
    recordAnswer(topicId, correct, total) {
      if (window.LoopLabUser) {
        window.LoopLabUser.recordQuiz(topicId, correct, total);
      }
    }
  };
})();
