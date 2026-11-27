/**
 * Loop Lab — Beginner Guide System
 * Renders a friendly, collapsible "Learn this concept" guide at the top of each topic page.
 * Content is derived from the topic data + curated beginner tips.
 */
(() => {
  const topics = window.TOPICS || [];
  const id = document.body.dataset.topic;
  if (!id) return;
  const topic = topics.find(t => t.id === id);
  if (!topic) return;

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ── Curated beginner guides per topic ───────────────────── */
  const GUIDES = {
    '01': {
      title: 'What is Python?',
      emoji: '🐍',
      points: [
        'Python is a programming language — you write instructions and the computer follows them.',
        'A <strong>function</strong> is a reusable block of code. You define it once with <code>def</code>, then call it whenever you need it.',
        '<code>print()</code> shows output on the screen. It\'s how your program talks back to you.',
        'The code runs <em>top to bottom</em>, one line at a time.'
      ],
      tip: 'Read each line aloud and ask: "What does this line do?" That\'s how programmers think!',
      keyTerms: ['function', 'print()', 'return', 'argument']
    },
    '02': {
      title: 'Syntax & Structure',
      emoji: '🏗️',
      points: [
        'Python uses <strong>colons (:)</strong> and <strong>indentation</strong> (spaces) to define code blocks — no curly braces like other languages.',
        'An <code>if</code> statement checks a condition. If it\'s true, the indented code runs.',
        '<code>raise</code> stops the program with an error message when something is wrong.',
        'Indentation MUST be consistent — usually 4 spaces per level.'
      ],
      tip: 'If you get "IndentationError", check that every line inside a block has the same number of spaces.',
      keyTerms: ['colon :', 'indentation', 'if statement', 'raise']
    },
    '03': {
      title: 'Variables & Constants',
      emoji: '📦',
      points: [
        'A <strong>variable</strong> is a name that points to a value, like a label on a box.',
        'You create a variable with <code>=</code> (assignment): <code>price = 10</code>',
        'Variables can be <strong>reassigned</strong>: <code>price = 20</code> moves the label to a new value.',
        'Python has no built-in constants, but UPPER_CASE names signal "don\'t change this".'
      ],
      tip: 'Think of variables as sticky notes — you can peel them off one value and stick them onto another.',
      keyTerms: ['variable', 'assignment =', 'reassignment', 'naming']
    },
    '04': {
      title: 'Data Types',
      emoji: '🔢',
      points: [
        'Every value in Python has a <strong>type</strong>: <code>int</code> (whole number), <code>float</code> (decimal), <code>str</code> (text).',
        '<code>input()</code> always returns a <strong>string</strong>, even if the user types a number.',
        'Convert types with <code>int()</code>, <code>float()</code>, or <code>str()</code>.',
        '<code>type(x)</code> tells you what type a value is.'
      ],
      tip: 'When math doesn\'t work, check if your value is still a string! "5" + "3" gives "53", not 8.',
      keyTerms: ['int', 'float', 'str', 'type()', 'conversion']
    },
    '05': {
      title: 'Operators',
      emoji: '➕',
      points: [
        'Python follows <strong>PEMDAS</strong> — multiplication and division happen before addition and subtraction.',
        'Use <code>round(value, digits)</code> to control decimal places.',
        '<code>**</code> means power (exponent), <code>//</code> means integer division, <code>%</code> means remainder.',
        'Parentheses <code>()</code> override the default order — use them to be explicit.'
      ],
      tip: 'When in doubt, add parentheses. <code>(a + b) * c</code> is clearer than <code>a + b * c</code>.',
      keyTerms: ['+', '-', '*', '/', '//', '%', '**', 'round()']
    },
    '06': {
      title: 'Input & Output',
      emoji: '💬',
      points: [
        '<code>input("prompt")</code> pauses the program and waits for the user to type something.',
        'The result is ALWAYS a string — convert it with <code>int()</code> or <code>float()</code> for math.',
        '<code>.strip()</code> removes extra whitespace from both ends of a string.',
        'f-strings let you embed variables: <code>f"Hello {name}"</code>'
      ],
      tip: 'Always validate user input before using it. What if they type "abc" when you need a number?',
      keyTerms: ['input()', 'print()', '.strip()', 'f-string', 'validation']
    },
    '07': {
      title: 'Boolean Logic',
      emoji: '✅',
      points: [
        'A <strong>Boolean</strong> is either <code>True</code> or <code>False</code> — that\'s it!',
        '<code>and</code> → both must be True. <code>or</code> → at least one must be True. <code>not</code> → flips the value.',
        'Comparison operators: <code>==</code> (equal), <code>!=</code> (not equal), <code>></code>, <code><</code>, <code>>=</code>, <code><=</code>',
        'Python evaluates conditions left to right and stops early when possible ("short-circuit").'
      ],
      tip: 'Draw a truth table on paper: list all combinations of True/False and check each with and/or.',
      keyTerms: ['True', 'False', 'and', 'or', 'not', 'comparison']
    },
    '08': {
      title: 'Conditionals',
      emoji: '🔀',
      points: [
        '<code>if / elif / else</code> lets your program make decisions based on conditions.',
        'Only the FIRST matching branch runs — Python checks top to bottom and stops.',
        '<code>elif</code> means "else if" — it adds more conditions after the first <code>if</code>.',
        '<code>else</code> catches everything that didn\'t match any <code>if</code> or <code>elif</code>.'
      ],
      tip: 'Order matters! Put the most specific conditions first and the most general (else) last.',
      keyTerms: ['if', 'elif', 'else', 'condition', 'branching']
    },
    '09': {
      title: 'For Loops',
      emoji: '🔄',
      points: [
        'A <code>for</code> loop repeats code once for each item in a sequence (list, range, string).',
        '<code>for x in [1,2,3]:</code> → runs the body 3 times, with x set to 1, then 2, then 3.',
        '<code>range(n)</code> generates numbers from 0 up to (not including) n.',
        'The loop variable updates automatically — you don\'t need to change it yourself.'
      ],
      tip: 'Count iterations on your fingers: range(5) gives 0,1,2,3,4 — that\'s 5 items, NOT including 5.',
      keyTerms: ['for', 'in', 'range()', 'iteration', 'loop variable']
    },
    '10': {
      title: 'While Loops',
      emoji: '⏳',
      points: [
        'A <code>while</code> loop repeats as long as its condition stays <code>True</code>.',
        'If the condition never becomes False, you get an <strong>infinite loop</strong> — the program hangs!',
        'Always make sure something inside the loop changes the condition.',
        'Use <code>while True:</code> + <code>break</code> for loops that check the exit condition in the middle.'
      ],
      tip: 'Before writing a while loop, ask: "What will make this stop?" If you can\'t answer, reconsider.',
      keyTerms: ['while', 'condition', 'infinite loop', 'counter']
    },
    '11': {
      title: 'Range Function',
      emoji: '📏',
      points: [
        '<code>range(stop)</code> → 0, 1, 2, …, stop-1. The stop value is NOT included.',
        '<code>range(start, stop)</code> → start, start+1, …, stop-1.',
        '<code>range(start, stop, step)</code> → jumps by step each time.',
        'Negative step counts backwards: <code>range(10, 0, -1)</code> → 10, 9, 8, …, 1.'
      ],
      tip: 'Remember: range STOPS BEFORE the stop value. range(1,5) gives 1,2,3,4 — no 5!',
      keyTerms: ['range()', 'start', 'stop', 'step', 'exclusive end']
    },
    '12': {
      title: 'Break & Continue',
      emoji: '🛑',
      points: [
        '<code>break</code> exits the loop entirely — no more iterations.',
        '<code>continue</code> skips the rest of the current iteration and jumps to the next one.',
        'Both work inside <code>for</code> and <code>while</code> loops.',
        'Use <code>break</code> to exit early when you find what you\'re looking for.'
      ],
      tip: 'break = "I\'m done, stop the whole loop." continue = "Skip this one, try the next."',
      keyTerms: ['break', 'continue', 'early exit', 'skip iteration']
    },
    '13': {
      title: 'Nested Loops',
      emoji: '🔁',
      points: [
        'A loop inside another loop is called a <strong>nested loop</strong>.',
        'The inner loop runs completely for EACH iteration of the outer loop.',
        'If the outer runs 3 times and inner runs 4 times, the body runs 3 × 4 = 12 times.',
        'Use nested loops for grids, tables, combinations, and matrix operations.'
      ],
      tip: 'Trace through on paper: write the outer variable, then list all inner values for that iteration.',
      keyTerms: ['nested loop', 'inner loop', 'outer loop', 'multiplication effect']
    },
    '14': {
      title: 'For-Else',
      emoji: '🔍',
      points: [
        '<code>for...else</code>: the <code>else</code> block runs only if the loop finished WITHOUT hitting <code>break</code>.',
        'If <code>break</code> fires, the <code>else</code> is skipped entirely.',
        'This is useful for search patterns: "did I find it?"',
        'Think of it as: "for each item… else (if none matched)…"'
      ],
      tip: 'Read for-else as: "I checked everything. If I didn\'t break out, run the else."',
      keyTerms: ['for...else', 'break', 'search pattern', 'completion clause']
    },
    '15': {
      title: 'Dictionaries',
      emoji: '📖',
      points: [
        'A dictionary maps <strong>keys</strong> to <strong>values</strong>: <code>{"name": "Mia", "age": 25}</code>',
        'Access values with <code>d["key"]</code> or safely with <code>d.get("key", default)</code>.',
        '<code>.update()</code> adds or changes multiple keys at once.',
        '<code>.setdefault(key, val)</code> adds a key ONLY if it doesn\'t exist yet.'
      ],
      tip: 'Use .get() instead of d["key"] to avoid crashing when a key might be missing.',
      keyTerms: ['dict', 'key', 'value', '.get()', '.update()', '.setdefault()']
    },
    '16': {
      title: 'Functions',
      emoji: '🧩',
      points: [
        '<code>def function_name(params):</code> defines a reusable block of code.',
        '<code>return</code> sends a value back to whoever called the function.',
        'Arguments are inputs; the return value is the output.',
        'Keyword arguments (like <code>fee=4.00</code>) must come after positional ones.'
      ],
      tip: 'If you\'re copying the same code more than twice, put it in a function instead.',
      keyTerms: ['def', 'return', 'arguments', 'keyword argument', 'call']
    },
    '17': {
      title: 'Scope & Arguments',
      emoji: '🔭',
      points: [
        'Python looks up names in order: <strong>L</strong>ocal → <strong>E</strong>nclosing → <strong>G</strong>lobal → <strong>B</strong>uilt-in (LEGB).',
        'Variables inside a function are <strong>local</strong> — they don\'t exist outside.',
        'A <strong>closure</strong> is a function that remembers variables from its enclosing scope.',
        '<code>global</code> and <code>nonlocal</code> let you modify variables in outer scopes (use sparingly).'
      ],
      tip: 'If a variable seems to "disappear", check which scope it was defined in.',
      keyTerms: ['LEGB', 'local', 'global', 'enclosing', 'closure']
    },
    '18': {
      title: 'Recursion',
      emoji: '🪞',
      points: [
        'Recursion = a function that <strong>calls itself</strong> with a smaller problem.',
        'Every recursive function MUST have a <strong>base case</strong> that stops the recursion.',
        'Each call adds a frame to the <strong>call stack</strong>; too many = stack overflow.',
        '<code>@lru_cache</code> stores results to avoid recalculating the same input (memoization).'
      ],
      tip: 'Always write the base case FIRST, then the recursive case. Test with small inputs.',
      keyTerms: ['recursion', 'base case', 'call stack', 'memoization']
    },
    '19': {
      title: 'Lambda & Functional',
      emoji: '⚡',
      points: [
        '<code>lambda x: x * 2</code> is a tiny anonymous function — no name, one expression.',
        '<code>map(fn, iterable)</code> applies fn to every item.',
        '<code>filter(fn, iterable)</code> keeps items where fn returns True.',
        '<code>reduce(fn, iterable)</code> combines all items into one result.'
      ],
      tip: 'If a lambda gets longer than one line, write a regular def function instead — clarity wins.',
      keyTerms: ['lambda', 'map()', 'filter()', 'reduce()', 'anonymous function']
    },
    '20': {
      title: 'Comprehensions',
      emoji: '📝',
      points: [
        '<code>[expr for x in iterable]</code> creates a new list in one line.',
        'Add <code>if condition</code> at the end to filter: <code>[x for x in nums if x > 0]</code>',
        'Dict comprehensions: <code>{k: v for k, v in items}</code>',
        'Set comprehensions: <code>{x for x in items}</code>'
      ],
      tip: 'Read it as English: "give me [x squared] [for each x] [in numbers] [if x is positive]".',
      keyTerms: ['list comprehension', 'dict comprehension', 'set comprehension', 'filter']
    },
    '21': {
      title: 'Error Handling',
      emoji: '🛡️',
      points: [
        '<code>try</code> wraps code that might fail. <code>except</code> catches the error.',
        '<code>else</code> runs only if no exception occurred.',
        '<code>finally</code> ALWAYS runs — perfect for cleanup (closing files, connections).',
        'Catch specific exceptions: <code>except ValueError:</code> not just bare <code>except:</code>'
      ],
      tip: 'Never use bare except: — always name the exception type so you don\'t hide real bugs.',
      keyTerms: ['try', 'except', 'else', 'finally', 'exception type']
    },
    '22': {
      title: 'File Handling',
      emoji: '📄',
      points: [
        '<code>with open(file) as f:</code> opens a file and closes it automatically when done.',
        'Modes: <code>"r"</code> read, <code>"w"</code> write (overwrites), <code>"a"</code> append.',
        'Always specify encoding: <code>encoding="utf-8"</code>.',
        '<code>pathlib.Path</code> gives you a modern, cross-platform way to handle file paths.'
      ],
      tip: 'Always use "with" for files — it closes them even if an error occurs.',
      keyTerms: ['with', 'open()', 'read', 'write', 'Path', 'encoding']
    },
    '23': {
      title: 'Object-Oriented Programming',
      emoji: '🏛️',
      points: [
        'A <strong>class</strong> is a blueprint; an <strong>object</strong> (instance) is built from that blueprint.',
        '<code>self</code> refers to the current object — it\'s how methods access the object\'s data.',
        '<code>@dataclass</code> auto-generates <code>__init__</code>, <code>__repr__</code>, and more.',
        'Methods are functions defined inside a class that operate on the object\'s state.'
      ],
      tip: 'Think of a class like a cookie cutter and objects like the cookies — same shape, different decorations.',
      keyTerms: ['class', 'object', 'self', '@dataclass', 'method', 'instance']
    },
    '24': {
      title: 'Iterators & Generators',
      emoji: '🔗',
      points: [
        'An <strong>iterator</strong> produces values one at a time with <code>next()</code>.',
        '<code>yield</code> pauses a generator function and sends a value to the caller.',
        'Generators are memory-efficient — they compute values on demand, not all at once.',
        '<code>iter()</code> creates an iterator from any iterable (list, range, etc.).'
      ],
      tip: 'Use generators for large datasets — they don\'t load everything into memory at once.',
      keyTerms: ['yield', 'next()', 'iter()', 'generator', 'lazy evaluation']
    },
    '25': {
      title: 'Algorithms',
      emoji: '🧮',
      points: [
        'An <strong>algorithm</strong> is a step-by-step recipe for solving a problem.',
        'Bubble sort compares neighbors and swaps them — simple but slow for large lists.',
        'After each pass, the largest unsorted value "bubbles up" to its correct position.',
        'Better algorithms (merge sort, quick sort) are faster but more complex.'
      ],
      tip: 'Trace algorithms on paper with a small input before trying to code them.',
      keyTerms: ['algorithm', 'bubble sort', 'swap', 'comparison', 'pass']
    }
  };

  const guide = GUIDES[id];
  if (!guide) return;

  /* ── Render the guide ───────────────────────────────────── */
  const section = document.createElement('section');
  section.className = 'll-guide card';
  section.innerHTML = `
    <details class="ll-guide-details" open>
      <summary class="ll-guide-summary">
        <span class="ll-guide-emoji">${guide.emoji}</span>
        <span class="ll-guide-label">Beginner Guide</span>
        <span class="ll-guide-title">${esc(guide.title)}</span>
        <span class="ll-guide-chevron">▾</span>
      </summary>
      <div class="ll-guide-body">
        <ul class="ll-guide-points">
          ${guide.points.map(p => `<li>${p}</li>`).join('')}
        </ul>
        <div class="ll-guide-tip">
          <span class="ll-guide-tip-icon">💡</span>
          <span>${guide.tip}</span>
        </div>
        <div class="ll-guide-terms">
          <span class="ll-guide-terms-label">Key terms:</span>
          ${guide.keyTerms.map(t => `<code class="ll-term">${esc(t)}</code>`).join('')}
        </div>
      </div>
    </details>
  `;

  /* Insert before the main content area */
  const main = document.querySelector('.main');
  if (main) main.parentNode.insertBefore(section, main);
})();
