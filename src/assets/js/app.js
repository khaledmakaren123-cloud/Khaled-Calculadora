// Lógica de la calculadora: solo operaciones con dos operandos (uno operador), soporte de punto y límite de 2 dígitos por operando
(function(){
  const procedureEl = document.getElementById('procedure');
  const resultEl = document.getElementById('result');

  let operand1 = '';
  let operand2 = '';
  let operator = '';
  let lastResult = null;

  const maxDigits = 2; // máximo dígitos por operando (excluye el punto)

  function digitsCount(s){
    return s.replace(/\./g,'').replace(/-/g,'').length;
  }

  function updateDisplay(){
    // Build HTML for top display with styled operand/operator spans
    const a = operand1 ? `<span class="operand">${operand1}</span>` : '';
    const op = operator ? `<span class="operator">${operator}</span>` : '';
    const b = operand2 ? `<span class="operand">${operand2}</span>` : '';
    const procHtml = (a || op || b) ? `${a}${op?op:''}${b}` : '';
    procedureEl.innerHTML = procHtml;
    resultEl.textContent = lastResult === null ? '0' : String(lastResult);
  }

  function pressDigit(d){
    if(!operator){
      if(digitsCount(operand1) >= maxDigits) return;
      operand1 += d;
    } else {
      if(digitsCount(operand2) >= maxDigits) return;
      operand2 += d;
    }
    updateDisplay();
  }

  function pressDot(){
    if(!operator){
      if(operand1.includes('.')) return;
      if(digitsCount(operand1) >= maxDigits && operand1.indexOf('.')===-1) return;
      operand1 = operand1 === '' ? '0.' : operand1 + '.';
    } else {
      if(operand2.includes('.')) return;
      if(digitsCount(operand2) >= maxDigits && operand2.indexOf('.')===-1) return;
      operand2 = operand2 === '' ? '0.' : operand2 + '.';
    }
    updateDisplay();
  }

  function pressOp(op){
    if(!operand1) return;
    if(operator && operand2) return; // no encadenar operaciones
    operator = op;
    updateDisplay();
  }

  function pressEquals(){
    if(!operand1 || !operator || !operand2) return;
    const a = parseFloat(operand1);
    const b = parseFloat(operand2);
    let res = NaN;
    switch(operator){
      case '+': res = a + b; break;
      case '-': res = a - b; break;
      case '*': res = a * b; break;
      case '/': res = b === 0 ? NaN : a / b; break;
    }
     const formatted = (!isFinite(res)) ? 'Error' : parseFloat(res.toFixed(8)).toString();
     // Añadir al historial
     addHistoryEntry(`${operand1} ${operator} ${operand2} = ${formatted}`);
     lastResult = formatted;
     if(formatted !== 'Error'){
       operand1 = formatted;
       operator = '';
       operand2 = '';
     }
     updateDisplay();
  }

  function pressAC(){
    operand1 = '';
    operand2 = '';
    operator = '';
    lastResult = null;
    updateDisplay();
  }

  function pressDEL(){
    if(operand2){
      operand2 = operand2.slice(0,-1);
    } else if(operator){
      operator = '';
    } else if(operand1){
      operand1 = operand1.slice(0,-1);
    }
    updateDisplay();
  }

  // Event bindings
  document.querySelectorAll('.num').forEach(b=>b.addEventListener('click',e=>{
    pressDigit(e.currentTarget.dataset.num);
  }));

  document.getElementById('dot').addEventListener('click',pressDot);
  document.querySelectorAll('.op').forEach(b=>b.addEventListener('click',e=>{
    pressOp(e.currentTarget.dataset.op);
  }));
  document.getElementById('equals').addEventListener('click',pressEquals);
  document.getElementById('ac').addEventListener('click',pressAC);
  document.getElementById('del').addEventListener('click',pressDEL);

   // History UI bindings
   const historyBtn = document.getElementById('historyBtn');
   const historyPanel = document.getElementById('historyPanel');
   const historyListEl = document.getElementById('historyList');
   const closeHistory = document.getElementById('closeHistory');
   const clearHistoryBtn = document.getElementById('clearHistory');

   historyBtn.addEventListener('click', ()=>{
     renderHistory();
     historyPanel.classList.remove('hidden');
   });
   closeHistory.addEventListener('click', ()=> historyPanel.classList.add('hidden'));
   clearHistoryBtn.addEventListener('click', ()=>{
     history = [];
     saveHistory();
     renderHistory();
   });

   // History storage (last 10)
   let history = [];
   function loadHistory(){
     try{
       const raw = localStorage.getItem('calc_history_v1');
       if(raw) history = JSON.parse(raw) || [];
     }catch(e){ history = []; }
   }
   function saveHistory(){
     try{ localStorage.setItem('calc_history_v1', JSON.stringify(history)); }catch(e){}
   }
   function addHistoryEntry(entry){
     const timestamp = new Date().toISOString();
     history.push({entry, t: timestamp});
     // keep only last 100 internally but show last 10; we'll trim to 100 to avoid unbounded growth
     if(history.length > 100) history = history.slice(history.length-100);
     saveHistory();
   }
   function renderHistory(){
     // show last 10 most recent first
     historyListEl.innerHTML = '';
     const items = history.slice(-10).reverse();
     if(items.length === 0){
       historyListEl.innerHTML = '<div style="padding:12px;color:rgba(230,238,248,0.6)">Sin operaciones aún</div>';
       return;
     }
     items.forEach(it=>{
       const el = document.createElement('div');
       el.className = 'history-item';
       const left = document.createElement('div');
       left.className = 'entry';
       left.textContent = it.entry;
       const right = document.createElement('div');
       right.className = 'time';
       // show local time HH:MM
       const d = new Date(it.t);
       right.textContent = d.toLocaleString();
       el.appendChild(left);
       el.appendChild(right);
       historyListEl.appendChild(el);
     });
   }

   // load history on init
   loadHistory();

  // Inicializar display
  updateDisplay();

})();
