(()=>{
 const topics=window.TOPICS||[],id=document.body.dataset.topic||'09',topic=topics.find(t=>t.id===id)||topics.find(t=>t.id==='09');
 const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const highlight=s=>{let x=esc(s);x=x.replace(/(".*?"|'.*?')/g,'<span class="str">$1</span>');x=x.replace(/(#.*)$/g,'<span class="comment">$1</span>');x=x.replace(/\b(for|in|if|else|elif|not|and|or|return|def|class|import|from|as|with|try|except|finally|raise|break|continue|yield|lambda|True|False|None)\b/g,'<span class="kw">$1</span>');x=x.replace(/\b(\d+(?:\.\d+)?)\b/g,'<span class="num">$1</span>');x=x.replace(/\b(print|input|int|str|float|len|type|range|list|set|dict|sum|next|iter|open|enumerate|round)\b(?=\()/g,'<span class="fn">$1</span>');return x};
 document.title=`${topic.title} — Loop Lab`;
 $('module').textContent=topic.module;$('footerTopic').textContent=`${topic.id} · ${topic.title}`;$('topicNumber').textContent=`TOPIC ${topic.id}`;$('title').textContent=topic.title;$('summary').textContent=topic.summary;
 $('codeTitle').textContent=topic.id==='09'?'Registration validation pipeline':`${topic.title} · worked example`;
 $('code').innerHTML=topic.code.map((line,i)=>`<div class="code-line" data-line="${i}"><span class="ln">${i+1}</span><span class="src">${highlight(line)}</span></div>`).join('');
 const exampleSource=topic.code.join('\n');$('codeEditor').value=exampleSource;
 $('editToggle').addEventListener('click',()=>{const editing=$('editorWrap').hidden;$('editorWrap').hidden=!editing;$('code').hidden=editing;$('codeHint').textContent=editing?'Edit the example, then compile it with Python.':'Current line highlights as the program runs';$('editToggle').textContent=editing?'Preview code':'Edit code'});
 $('resetCode').addEventListener('click',()=>{$('codeEditor').value=exampleSource;$('compileStatus').textContent='Example restored. Compile when ready.';$('compileStatus').classList.remove('error','success')});
 $('compile').addEventListener('click',async()=>{const button=$('compile');button.disabled=true;$('compileStatus').textContent='Compiling with Python…';$('compileStatus').classList.remove('error','success');try{const response=await fetch('/api/compile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:$('codeEditor').value})});const result=await response.json();if(result.ok){$('compileStatus').textContent=`Python ${result.python}: compiled successfully (${result.instructions} bytecode instructions). Code was not executed.`;$('compileStatus').classList.add('success')}else{$('compileStatus').textContent=`Compile error${result.line?` on line ${result.line}${result.column?`, column ${result.column}`:''}`:''}: ${result.message}`;$('compileStatus').classList.add('error')}}catch(error){$('compileStatus').textContent='Compiler unavailable. Start the local Python server with python3 server.py, then open http://127.0.0.1:8765.';$('compileStatus').classList.add('error')}finally{button.disabled=false}});
 $('codeEditor').addEventListener('input',()=>{$('compileStatus').textContent='Edited code is ready to compile.';$('compileStatus').classList.remove('error','success')});
 $('visualLabel').textContent=`${topic.items.length} stages in this visual`; $('items').innerHTML=topic.items.map((item,i)=>`<div class="item" data-i="${i}"><div class="node">${i+1}</div><div class="caption" title="${esc(item)}">${esc(item)}</div></div>`).join('');
 $('quizQuestion').textContent=topic.quiz[0];$('answers').innerHTML=topic.quiz[1].map((answer,i)=>`<button class="answer" data-index="${i}">${esc(answer)}</button>`).join('');
 $('topicMenu').innerHTML=topics.map(t=>`<a href="${t.id==='09'?'index.html':`topic-${t.id}.html`}" class="${t.id===topic.id?'active':''}"><span>${t.id}</span>${esc(t.title)}</a>`).join('');
 const events=topic.events;let step=0,timer=null;
 function render(){const ev=step?events[step-1]:null,done=step>=events.length?topic.items.length:(ev?Math.max(0,ev[0]):0);
  document.querySelectorAll('.item').forEach((el,i)=>{el.classList.toggle('done',i<done);el.classList.toggle('current',!!ev&&i===ev[0])});
  $('fill').style.width=`${step/events.length*100}%`;
  if(ev){const itemIndex=Math.max(0,Math.min(ev[0],topic.items.length-1)),node=document.querySelectorAll('.item .node')[itemIndex],track=$('items').parentElement.getBoundingClientRect(),rect=node.getBoundingClientRect();$('traveler').style.left=`${rect.left-track.left}px`;$('traveler').textContent=itemIndex+1;$('traveler').classList.add('visible');$('traveler').classList.toggle('to-console',Boolean(ev[3]));$('current').textContent=topic.items[itemIndex];$('state').textContent=ev[2]}
  else{$('traveler').classList.remove('visible');$('current').textContent='Ready';$('state').textContent='Press Next or Play to begin.'}
  $('iteration').textContent=step===0?'Ready':step>=events.length?'Complete':`Step ${step} of ${events.length}`;
  $('counter').textContent=`${step} / ${events.length} steps`;
  const logs=events.slice(0,step).filter(e=>e[3]).map(e=>e[3]);$('console').innerHTML=logs.length?`<span class="prompt">›</span>${logs.map(s=>`<span class="out-line">${esc(s)}</span>`).join('')}`:'<span class="prompt">›</span>Run the simulator to see the output.';
  document.querySelectorAll('.code-line').forEach((el,i)=>{const active=!!ev&&i===ev[1];el.classList.toggle('active',active);if(active)el.scrollIntoView({block:'nearest',behavior:'smooth'})});
  $('prev').disabled=step===0;$('next').disabled=step>=events.length;
 }
 function pause(){if(timer!==null){clearInterval(timer);timer=null}$('play').textContent='▶ Play'}
 function advance(){if(step<events.length){step++;render()}if(step>=events.length)pause()}
 function start(){if(timer!==null){pause();return}if(step>=events.length)step=0;render();$('play').textContent='Ⅱ Pause';timer=setInterval(advance,1750-(Number($('speed').value)-1)*300)}
 $('next').addEventListener('click',()=>{pause();advance()});$('prev').addEventListener('click',()=>{pause();step=Math.max(0,step-1);render()});$('play').addEventListener('click',start);$('reset').addEventListener('click',()=>{pause();step=0;render()});
 $('speed').addEventListener('input',()=>{$('speedOut').textContent=(.55+Number($('speed').value)*.25).toFixed(2).replace(/0$/,'')+'×';if(timer!==null){pause();start()}});
 document.querySelectorAll('.answer').forEach(button=>button.addEventListener('click',()=>{$('feedback').textContent=Number(button.dataset.index)===topic.quiz[2]?`Correct. ${topic.quiz[3]}`:`Not quite. ${topic.quiz[3]}`;$('feedback').classList.toggle('wrong',Number(button.dataset.index)!==topic.quiz[2])}));
 render();
})();
