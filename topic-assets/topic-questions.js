/**
 * Loop Lab — Extended Topic Question Bank
 * 5-8 questions per topic. On each page load a random subset is selected.
 * Replaces the single quiz question with a multi-question quiz panel.
 */
(() => {
  const topicId = document.body.dataset.topic;
  if (!topicId) return;

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ── Question Bank ─────────────────────────────────────── */
  const BANK = {
    '01': [
      { q:'What does the function return?', o:['A formatted greeting','A list of names','A number'], a:0, e:'The function returns a personalized string using f-strings.' },
      { q:'What does .title() do to a string?', o:['Capitalizes the first letter of each word','Makes all letters uppercase','Reverses the string'], a:0, e:'.title() capitalizes the first letter of every word.' },
      { q:'What does def define?', o:['A reusable function','A variable','A loop'], a:0, e:'def creates a function you can call later.' },
      { q:'What does print() do?', o:['Displays output to the console','Saves data to a file','Creates a variable'], a:0, e:'print() sends its argument to the standard output (screen).' },
      { q:'Which keyword sends a value back from a function?', o:['return','print','yield'], a:0, e:'return exits the function and passes a value to the caller.' },
    ],
    '02': [
      { q:'Which line protects against an invalid rate?', o:['The guard clause','The print call','The return type'], a:0, e:'The guard clause raises an error when rate is outside 0 to 1.' },
      { q:'What character ends a function header or if statement?', o:['Colon :','Semicolon ;','Period .'], a:0, e:'Python uses : to start a new code block.' },
      { q:'How does Python define code blocks?', o:['Indentation (spaces)','Curly braces {}','Parentheses ()'], a:0, e:'Python uses consistent indentation to group statements.' },
      { q:'What does raise do?', o:['Stops execution with an error','Prints a warning','Continues the loop'], a:0, e:'raise triggers an exception, halting the current flow.' },
      { q:'What happens if indentation is inconsistent?', o:['IndentationError','The code runs anyway','Python auto-corrects it'], a:0, e:'Python requires consistent indentation; mismatches cause IndentationError.' },
    ],
    '03': [
      { q:'What is the total after 8% tax on 120?', o:['$129.60','$128.00','$120.08'], a:0, e:'120 × 1.08 = 129.60.' },
      { q:'What does = do in Python?', o:['Assigns a value to a variable','Compares two values','Defines a function'], a:0, e:'The single = is the assignment operator.' },
      { q:'Can you change a variable\'s value after creating it?', o:['Yes, by reassignment','No, variables are fixed','Only if it\'s a number'], a:0, e:'Variables can be reassigned to any new value at any time.' },
      { q:'Which is a valid variable name?', o:['total_price','2nd_place','my-var'], a:0, e:'Variable names can contain letters, digits, and underscores, but can\'t start with a digit or contain hyphens.' },
      { q:'What does round(value, 2) do?', o:['Rounds to 2 decimal places','Rounds to 2 digits total','Multiplies by 2'], a:0, e:'round(x, n) rounds x to n decimal places.' },
    ],
    '04': [
      { q:'What is the type of count after int("240")?', o:['int','float','str'], a:0, e:'int() converts the string to an integer.' },
      { q:'What does input() always return?', o:['A string','An integer','A boolean'], a:0, e:'input() returns whatever the user types as a string, always.' },
      { q:'What does type(3.14) return?', o:['float','int','str'], a:0, e:'3.14 is a decimal number, so its type is float.' },
      { q:'How do you convert "42" to a number for math?', o:['int("42")','num("42")','math("42")'], a:0, e:'int() converts a numeric string to an integer.' },
      { q:'What is "5" + "3" in Python?', o:['"53" (string concatenation)','8 (addition)','Error'], a:0, e:'Adding two strings concatenates them, not adds numerically.' },
    ],
    '05': [
      { q:'What is 19.99 × 3 + 4.00?', o:['63.97','64.00','59.97'], a:0, e:'Multiplication happens before addition: 59.97 + 4.00 = 63.97.' },
      { q:'What does ** do in Python?', o:['Exponentiation (power)','Multiplication','Floor division'], a:0, e:'2 ** 3 means 2 raised to the power of 3 = 8.' },
      { q:'What does 7 // 2 give?', o:['3','3.5','4'], a:0, e:'// is floor division — it rounds down to the nearest integer.' },
      { q:'What does 7 % 2 give?', o:['1','3','3.5'], a:0, e:'% is modulo — it gives the remainder: 7 ÷ 2 = 3 remainder 1.' },
      { q:'Which operation happens first: + or *?', o:['* (multiplication)','+ (addition)','Whichever comes first'], a:0, e:'Multiplication has higher precedence than addition (PEMDAS).' },
    ],
    '06': [
      { q:'Why convert input with int()?', o:['input() returns text, math needs numbers','int() makes it faster','It\'s optional'], a:0, e:'input() always returns a string; convert to int for numeric operations.' },
      { q:'What does .strip() do?', o:['Removes leading/trailing whitespace','Splits the string','Makes it uppercase'], a:0, e:'.strip() trims spaces, tabs, and newlines from both ends.' },
      { q:'What is an f-string?', o:['A string with embedded expressions','A file name','A float string'], a:0, e:'f"Hello {name}" lets you insert variable values directly into a string.' },
      { q:'What does input("Seats: ") show?', o:['The prompt "Seats: " then waits','Nothing','An error'], a:0, e:'The argument to input() is displayed as a prompt before waiting.' },
      { q:'What happens if you int("hello")?', o:['ValueError — can\'t convert','Returns 0','Returns "hello"'], a:0, e:'int() can only convert strings that contain valid numbers.' },
    ],
    '07': [
      { q:'What does True and False give?', o:['False','True','Error'], a:0, e:'and returns True only when BOTH sides are True.' },
      { q:'What does not True give?', o:['False','True','None'], a:0, e:'not flips the boolean value.' },
      { q:'What does True or False give?', o:['True','False','Error'], a:0, e:'or returns True when at least one side is True.' },
      { q:'What is 5 == 5?', o:['True','False','5'], a:0, e:'== compares values; since both are 5, it\'s True.' },
      { q:'What is 10 != 10?', o:['False','True','0'], a:0, e:'!= means "not equal"; since they are equal, it\'s False.' },
    ],
    '08': [
      { q:'What runs when no if/elif matches?', o:['The else block','Nothing','All blocks'], a:0, e:'else catches everything that didn\'t match any preceding condition.' },
      { q:'Can you have elif without if?', o:['No, elif needs an if first','Yes, elif stands alone','Only in loops'], a:0, e:'elif is an extension of an if statement; it can\'t exist on its own.' },
      { q:'How many branches can run in an if/elif/else chain?', o:['Exactly one','All of them','Two'], a:0, e:'Python executes only the first matching branch, then skips the rest.' },
      { q:'What does if x > 0: check?', o:['If x is positive','If x is zero','If x is negative'], a:0, e:'> checks if the left side is greater than the right side.' },
      { q:'Is else required in every if statement?', o:['No, it\'s optional','Yes, always required','Only in functions'], a:0, e:'else is optional; you can have if alone or if/elif without else.' },
    ],
    '09': [
      { q:'How many times does range(5) iterate?', o:['5 times (0,1,2,3,4)','6 times (0 to 5)','4 times (1 to 4)'], a:0, e:'range(5) produces 0,1,2,3,4 — five values, excluding 5.' },
      { q:'What does the loop variable hold?', o:['The current item from the sequence','The loop count','The total'], a:0, e:'Each iteration, the loop variable is set to the next item.' },
      { q:'Can you loop over a string with for?', o:['Yes, one character at a time','No, only lists','Only with while'], a:0, e:'for c in "hello": iterates over each character.' },
      { q:'What does for x in []: do?', o:['Nothing — empty list, zero iterations','Runs once','Error'], a:0, e:'An empty sequence means the loop body never executes.' },
      { q:'What is range(2, 8)?', o:['2,3,4,5,6,7','2,3,4,5,6,7,8','0,1,2,3,4,5,6,7'], a:0, e:'range(start,stop) goes from start up to but not including stop.' },
    ],
    '10': [
      { q:'When does a while loop stop?', o:['When its condition becomes False','After 10 iterations','When break is called only'], a:0, e:'A while loop checks its condition before each iteration; False means stop.' },
      { q:'What is an infinite loop?', o:['A loop whose condition never becomes False','A very fast loop','A loop with no body'], a:0, e:'If the condition is always True, the loop runs forever.' },
      { q:'What does while True: mean?', o:['Loop forever until break','Loop once','Error'], a:0, e:'True is always True, so only break or an exception can stop it.' },
      { q:'Which must change inside a while loop?', o:['Something that affects the condition','The loop keyword','The variable name'], a:0, e:'To avoid infinite loops, the body must eventually make the condition False.' },
      { q:'Can while replace for?', o:['Yes, but for is cleaner for sequences','No, they\'re different','Only for numbers'], a:0, e:'while can do anything for does, but for is more readable for iterating.' },
    ],
    '11': [
      { q:'What does range(1,10,2) produce?', o:['1,3,5,7,9','1,2,3,4,5,6,7,8,9','2,4,6,8,10'], a:0, e:'Start at 1, step by 2, stop before 10: 1,3,5,7,9.' },
      { q:'Is the stop value included in range()?', o:['No, range stops before it','Yes, always included','Only if step is 1'], a:0, e:'range() is exclusive of the stop value — a common gotcha!' },
      { q:'What does range(5,0,-1) produce?', o:['5,4,3,2,1','0,1,2,3,4,5','5,4,3,2,1,0'], a:0, e:'Counts down from 5 to 1 (stops before 0).' },
      { q:'How many items does range(3,3) produce?', o:['Zero — start equals stop','One','Three'], a:0, e:'When start == stop, there are no values to produce.' },
      { q:'What does len(range(10)) return?', o:['10','9','11'], a:0, e:'range(10) has 10 elements: 0 through 9.' },
    ],
    '12': [
      { q:'What does break do?', o:['Exits the entire loop','Skips one iteration','Pauses the loop'], a:0, e:'break immediately stops the loop and moves to the code after it.' },
      { q:'What does continue do?', o:['Skips to the next iteration','Exits the loop','Restarts the loop'], a:0, e:'continue jumps back to the loop header, skipping the rest of the body.' },
      { q:'Can break be used in a for loop?', o:['Yes','No, only while','Only with if'], a:0, e:'break works in both for and while loops.' },
      { q:'What happens after break?', o:['Code after the loop runs','The loop restarts','The program ends'], a:0, e:'After break, execution continues with the first line after the loop.' },
      { q:'Which stops more: break or continue?', o:['break stops the loop; continue skips one pass','They\'re the same','continue stops more'], a:0, e:'break ends the entire loop; continue only skips the current iteration.' },
    ],
    '13': [
      { q:'In a nested loop, which completes first?', o:['The inner loop','The outer loop','Both at the same time'], a:0, e:'The inner loop runs all its iterations for each single iteration of the outer.' },
      { q:'If outer runs 3× and inner runs 4×, how many total body runs?', o:['12','7','4'], a:0, e:'3 × 4 = 12 total executions of the innermost body.' },
      { q:'What is a nested loop useful for?', o:['Processing grids, tables, combinations','Simple counting','String formatting'], a:0, e:'Nested loops handle multi-dimensional data like rows and columns.' },
      { q:'Does break in the inner loop stop the outer loop?', o:['No, only the inner loop','Yes, both stop','It depends'], a:0, e:'break only exits the loop it\'s directly inside.' },
      { q:'Can you nest more than 2 loops?', o:['Yes, any depth','No, max is 2','Only 3'], a:0, e:'You can nest loops to any depth, though readability suffers after 2-3.' },
    ],
    '14': [
      { q:'When does the else in for-else run?', o:['When the loop finishes without break','Always','When break fires'], a:0, e:'The else block runs only if the loop completed all iterations without hitting break.' },
      { q:'If break fires, does else run?', o:['No','Yes','Sometimes'], a:0, e:'break skips the else clause entirely.' },
      { q:'What is for-else best used for?', o:['Search patterns — "did I find it?"','Counting items','Printing output'], a:0, e:'for-else cleanly handles the "searched but not found" pattern.' },
      { q:'Is for-else unique to Python?', o:['Mostly yes — few languages have it','No, all languages have it','Java has it too'], a:0, e:'for-else is a distinctive Python feature not common in other languages.' },
      { q:'Can while loops have else too?', o:['Yes, same rules apply','No, only for loops','Only with break'], a:0, e:'while-else works identically: else runs if the loop exits normally.' },
    ],
    '15': [
      { q:'What does .get("key", default) do?', o:['Returns the value or default if key missing','Always returns the default','Creates a new key'], a:0, e:'.get() safely retrieves a value without crashing on missing keys.' },
      { q:'What does .setdefault() do?', o:['Adds key only if absent','Always overwrites the value','Deletes a key'], a:0, e:'.setdefault() inserts the default only when the key doesn\'t exist.' },
      { q:'Can dictionary keys be lists?', o:['No, keys must be immutable','Yes, any type works','Only with tuples'], a:0, e:'Keys must be hashable (immutable): strings, numbers, tuples — not lists.' },
      { q:'What does .update() do?', o:['Adds or changes multiple keys','Removes all keys','Sorts the dictionary'], a:0, e:'.update() merges another dict or key=value pairs into the current one.' },
      { q:'How do you check if a key exists?', o:['"key" in d','d.has("key")','d.exists("key")'], a:0, e:'The in operator checks if a key is present in the dictionary.' },
    ],
    '16': [
      { q:'Why is fee keyword-only in this function?', o:['The * makes it require an explicit keyword','It has a default value','It\'s the last parameter'], a:0, e:'Parameters after * in the signature must be passed as keyword arguments.' },
      { q:'What does return do?', o:['Sends a value back to the caller','Prints output','Ends the program'], a:0, e:'return exits the function and passes the value to where it was called.' },
      { q:'What happens if a function has no return?', o:['It returns None','It returns 0','Error'], a:0, e:'Functions without an explicit return statement return None by default.' },
      { q:'Can a function call another function?', o:['Yes, functions can call each other','No','Only built-in functions'], a:0, e:'Functions can call any other function, including themselves (recursion).' },
      { q:'What is the difference between print() and return?', o:['print shows output; return sends a value back','They\'re the same','return also prints'], a:0, e:'print displays to screen; return passes a value to the caller.' },
    ],
    '17': [
      { q:'In LEGB, where does Python look first?', o:['Local scope','Global scope','Built-in scope'], a:0, e:'L = Local: Python first checks the current function\'s local variables.' },
      { q:'What is a closure?', o:['A function that remembers its enclosing scope','A closed file','A locked variable'], a:0, e:'Closures capture variables from their enclosing function scope.' },
      { q:'Can a local variable shadow a global?', o:['Yes','No','Only with the global keyword'], a:0, e:'A local variable with the same name hides the global one within that function.' },
      { q:'What does the global keyword do?', o:['Lets a function modify a global variable','Creates a new global','Deletes a local'], a:0, e:'global tells Python to use the global version of a variable, not create a local one.' },
      { q:'What does nonlocal do?', o:['Accesses a variable from an enclosing (not global) scope','Same as global','Creates a new variable'], a:0, e:'nonlocal is for nested functions to modify variables in their enclosing function.' },
    ],
    '18': [
      { q:'What stops recursive calls?', o:['The base case','The return type','The cache decorator'], a:0, e:'The base case is the condition that stops recursion by not making another call.' },
      { q:'What is a stack overflow?', o:['Too many recursive calls exhaust memory','A math error','A type error'], a:0, e:'Each recursive call uses stack space; too many calls crash the program.' },
      { q:'What does @lru_cache do?', o:['Caches function results to avoid re-computation','Makes functions faster by default','Limits recursion depth'], a:0, e:'lru_cache stores return values so repeated calls with the same args are instant.' },
      { q:'What is factorial(0)?', o:['1','0','Error'], a:0, e:'By mathematical definition, 0! = 1; this is typically the base case.' },
      { q:'Can every loop be written as recursion?', o:['Yes, but loops are usually clearer','No','Only for loops'], a:0, e:'Any iterative solution can be converted to recursion and vice versa.' },
    ],
    '19': [
      { q:'What does reduce() do?', o:['Combines all values into one result','Removes items','Counts items'], a:0, e:'reduce applies a function cumulatively, reducing the iterable to a single value.' },
      { q:'What is lambda x: x * 2?', o:['An anonymous function that doubles x','A variable assignment','A loop'], a:0, e:'lambda creates a small unnamed function with a single expression.' },
      { q:'What does map() return?', o:['A map object (iterator) of transformed values','A list directly','A dictionary'], a:0, e:'map() returns an iterator; wrap it in list() to see all values.' },
      { q:'What does filter() keep?', o:['Items where the function returns True','All items','Items where the function returns False'], a:0, e:'filter keeps elements that pass the test (return True).' },
      { q:'When should you use a regular def instead of lambda?', o:['When the logic is complex or multi-line','Never, lambda is always better','Only for recursion'], a:0, e:'Lambda is for simple one-expression functions; use def for anything complex.' },
    ],
    '20': [
      { q:'What does [x**2 for x in range(5)] produce?', o:['[0, 1, 4, 9, 16]','[1, 4, 9, 16, 25]','[0, 2, 4, 6, 8]'], a:0, e:'Squares each value in range(5): 0²=0, 1²=1, 2²=4, 3²=9, 4²=16.' },
      { q:'How do you add a filter to a list comprehension?', o:['Add if condition at the end','Use filter() instead','Add elif'], a:0, e:'[x for x in items if x > 0] keeps only positive values.' },
      { q:'What is {k:v for k,v in pairs}?', o:['A dictionary comprehension','A set comprehension','A list comprehension'], a:0, e:'Curly braces with key:value create a dictionary comprehension.' },
      { q:'Are comprehensions faster than for loops?', o:['Usually yes, for simple transforms','No, same speed','Only for strings'], a:0, e:'Comprehensions are optimized internally and are typically faster than equivalent loops.' },
      { q:'Can you nest comprehensions?', o:['Yes, like nested loops','No','Only two levels'], a:0, e:'[[col for col in row] for row in matrix] is a nested comprehension.' },
    ],
    '21': [
      { q:'Which block runs on success only?', o:['else','except','finally'], a:0, e:'else runs only when the try block completes without an exception.' },
      { q:'Does finally always run?', o:['Yes, always','Only on errors','Only on success'], a:0, e:'finally runs no matter what — success, exception, or even after return.' },
      { q:'What does except ValueError: catch?', o:['Only ValueError exceptions','All exceptions','Only TypeErrors'], a:0, e:'Naming a specific exception type catches only that type (and its subclasses).' },
      { q:'What is wrong with bare except:?', o:['It catches everything, hiding real bugs','It\'s fine','It\'s faster'], a:0, e:'Bare except catches SystemExit, KeyboardInterrupt, etc., masking real problems.' },
      { q:'Can you have multiple except blocks?', o:['Yes, one for each exception type','No, only one','Only two'], a:0, e:'You can chain except blocks to handle different exception types differently.' },
    ],
    '22': [
      { q:'Why use with for files?', o:['It closes the file automatically','It\'s faster','It encrypts the file'], a:0, e:'The context manager ensures the file is closed even if an error occurs.' },
      { q:'What does "w" mode do?', o:['Writes (overwrites existing content)','Reads only','Appends'], a:0, e:'"w" opens for writing and erases any existing content.' },
      { q:'What does "a" mode do?', o:['Appends to the end of the file','Reads only','Archives the file'], a:0, e:'"a" opens for writing but adds to the end without erasing.' },
      { q:'Why specify encoding="utf-8"?', o:['Ensures consistent text handling across platforms','It\'s faster','Required by Python'], a:0, e:'UTF-8 is the standard encoding; without it, behavior varies by OS.' },
      { q:'What is pathlib.Path?', o:['A modern way to handle file paths','A network protocol','A database connection'], a:0, e:'Path provides cross-platform, object-oriented file path handling.' },
    ],
    '23': [
      { q:'What does @dataclass add?', o:['Generated __init__, __repr__, etc.','A database','A loop'], a:0, e:'The decorator auto-generates common methods from the annotated fields.' },
      { q:'What does self refer to?', o:['The current object instance','The class itself','The module'], a:0, e:'self is the specific object the method is being called on.' },
      { q:'Can a class have multiple methods?', o:['Yes, as many as needed','No, only one','Only __init__'], a:0, e:'Classes can have any number of methods to operate on their data.' },
      { q:'What is an instance?', o:['An object created from a class','A type of variable','A function'], a:0, e:'An instance is a specific object built using a class as its blueprint.' },
      { q:'What does __init__ do?', o:['Initializes a new object with starting values','Destroys the object','Prints the object'], a:0, e:'__init__ is called when you create a new instance, setting up its initial state.' },
    ],
    '24': [
      { q:'What does yield do?', o:['Pauses the generator and returns a value','Ends the function','Prints output'], a:0, e:'yield sends a value to the caller and suspends the generator until next().' },
      { q:'What is the advantage of generators?', o:['Memory efficiency — values computed on demand','They\'re faster','They\'re simpler'], a:0, e:'Generators don\'t store all values in memory; they produce them one at a time.' },
      { q:'What does next(iterator) do?', o:['Gets the next value from the iterator','Skips a value','Resets the iterator'], a:0, e:'next() advances the iterator by one and returns the next value.' },
      { q:'What happens when a generator is exhausted?', o:['StopIteration is raised','It returns None','It restarts'], a:0, e:'When there are no more values, next() raises StopIteration.' },
      { q:'What does iter() create?', o:['An iterator from an iterable','A new list','A copy'], a:0, e:'iter() creates an iterator object from any iterable (list, range, etc.).' },
    ],
    '25': [
      { q:'After a Bubble Sort pass, where is the largest value?', o:['At the end of the unsorted portion','At the beginning','In the middle'], a:0, e:'Each pass bubbles the largest unsorted value to the right end.' },
      { q:'What is the time complexity of bubble sort?', o:['O(n²)','O(n)','O(n log n)'], a:0, e:'Bubble sort uses nested loops, making it O(n²) in the worst case.' },
      { q:'What does "swap" mean in sorting?', o:['Exchange the positions of two elements','Delete an element','Copy an element'], a:0, e:'Swapping uses a,b = b,a in Python to exchange two values.' },
      { q:'Is bubble sort good for large datasets?', o:['No, it\'s too slow','Yes, it\'s optimal','It depends on the data'], a:0, e:'O(n²) means performance degrades quickly; use merge sort or quick sort for large data.' },
      { q:'How many comparisons does bubble sort make on [5,2,4,1]?', o:['6 (3+2+1)','4','12'], a:0, e:'First pass: 3 comparisons, second: 2, third: 1 = total 6.' },
    ],
  };

  const questions = BANK[topicId];
  if (!questions || questions.length === 0) return;

  /* ── Shuffle and select 3 random questions ──────────────── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const selected = shuffle(questions).slice(0, 3);

  /* ── Render multi-question quiz ─────────────────────────── */
  const quizEl = document.querySelector('.quiz');
  if (!quizEl) return;

  let current = 0;
  let correctCount = 0;
  const total = selected.length;

  function renderQuestion(idx) {
    const q = selected[idx];
    quizEl.innerHTML = `
      <div class="quizhead">
        <i>TOPIC ${esc(topicId)} QUIZ</i>
        <span class="ll-quiz-progress">${idx + 1} / ${total}</span>
      </div>
      <span class="ll-quiz-q">${esc(q.q)}</span>
      <div class="answers" id="quizAnswers">
        ${q.o.map((opt, i) => `<button class="answer" type="button" data-idx="${i}">${esc(opt)}</button>`).join('')}
      </div>
      <div class="feedback" id="quizFeedback" aria-live="polite"></div>
    `;

    document.querySelectorAll('#quizAnswers .answer').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = Number(btn.dataset.idx);
        const correct = chosen === q.a;
        if (correct) correctCount++;

        document.querySelectorAll('#quizAnswers .answer').forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === q.a) b.classList.add('correct');
          else if (b === btn && !correct) b.classList.add('wrong');
        });

        const fb = document.getElementById('quizFeedback');
        fb.textContent = `${correct ? '✓ Correct!' : '✗ Not quite.'} ${q.e}`;
        fb.className = `feedback ${correct ? 'correct' : 'wrong'}`;

        // Show next button or results
        setTimeout(() => {
          if (idx + 1 < total) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn primary ll-quiz-next';
            nextBtn.textContent = 'Next Question →';
            nextBtn.addEventListener('click', () => renderQuestion(idx + 1));
            fb.appendChild(nextBtn);
          } else {
            showResults();
          }
        }, 600);
      });
    });
  }

  function showResults() {
    const pct = Math.round(correctCount / total * 100);
    const stars = pct >= 90 ? '⭐⭐⭐' : pct >= 60 ? '⭐⭐' : pct >= 30 ? '⭐' : '';
    quizEl.innerHTML = `
      <div class="quizhead"><i>QUIZ COMPLETE</i></div>
      <div class="ll-quiz-result">
        <div class="ll-quiz-score">${correctCount} / ${total}</div>
        <div class="ll-quiz-stars">${stars || 'Keep practicing!'}</div>
        <div class="ll-quiz-pct">${pct}% correct</div>
      </div>
      <button class="btn primary ll-quiz-retry" id="retryQuiz">Try New Questions ↻</button>
    `;
    document.getElementById('retryQuiz').addEventListener('click', () => {
      const newSet = shuffle(questions).slice(0, 3);
      selected.length = 0;
      newSet.forEach(q => selected.push(q));
      current = 0;
      correctCount = 0;
      renderQuestion(0);
    });

    // Record score
    if (window.LoopLabAI) {
      window.LoopLabAI.recordAnswer(topicId, correctCount, total);
    }

    // Auto-update topic completion when score is passing (>= 50%)
    if (pct >= 50) {
      try {
        const COMP_KEY = 'loop-lab-completed-topics';
        const raw = localStorage.getItem(COMP_KEY);
        const compList = raw ? JSON.parse(raw) : [];
        if (Array.isArray(compList) && !compList.includes(topicId)) {
          compList.push(topicId);
          localStorage.setItem(COMP_KEY, JSON.stringify(compList));
          const pc = document.getElementById('pathCompletion');
          if (pc) pc.textContent = `${compList.length} / 25 completed`;
          const activeMarker = document.querySelector('.topic-menu a.active .topic-marker');
          if (activeMarker) {
            activeMarker.textContent = '✓';
            activeMarker.setAttribute('aria-label', 'Completed');
          }
        }
      } catch (e) {}
    }
  }

  // Replace single-question quiz with multi-question version
  renderQuestion(0);
})();
