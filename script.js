const app = document.getElementById('app');

const imageBase = 'assets/images/';
const soundBase = 'assets/sounds/';

const state = {
  stageIndex: 0,
  currentQuestion: 0,
  score: 0,
  timer: null,
  timeLeft: 0,
  pendingContinue: null,
  fuelValue: 0
};

const narratives = [
  { image: 'narrativa-1', text: 'Vocês são jovens cadetes da Academia Estelar, enviados para explorar o planeta Marte.' },
  { image: 'narrativa-2', text: 'Durante a viagem, um campo magnético misterioso desvia a nave, deixando a tripulação presa em uma enorme nebulosa.' },
  { image: 'narrativa-3', text: 'Agora vocês têm que encarar altos desafios para consertar a nave, escapar da nebulosa e continuar a missão.' },
  { image: 'narrativa-4', text: 'Quando a nave é sugada pelo campo magnético, a central de energia é danificada. É preciso consertá-la, descobrindo qual das operações abaixo tem como resultado o número do painel:' },
  { image: 'narrativa-5', text: 'O mapa estelar foi danificado pelo campo magnético. É preciso reconstruí-lo, encontrando as estrelas perdidas.' },
  { image: 'narrativa-6', text: 'O tanque de combustível foi avariado. É preciso acertar as operações que recuperam o combustível, deixando o tanque 100% cheio.' },
  { image: 'narrativa-7', text: 'A saída da nebulosa aparece, através de um portal misterioso que está trancado por códigos numéricos. Resolva os enigmas, junte as pistas e descubra o código.' }
];

const level1 = [
  { panel: 9, options: ['A) 4 + 5', 'B) 6 + 2', 'C) 5 + 3', 'E) 8 + 0'], correct: 0 },
  { panel: 10, options: ['A) 4 + 5', 'B) 6 + 2', 'C) 5 + 3', 'E) 8 + 2'], correct: 3 },
  { panel: 8, options: ['A) 4 + 5', 'B) 6 + 2', 'C) 5 + 3', 'E) 8 + 0'], correct: 1 },
  { panel: 12, options: ['A) 6 + 5', 'B) 6 + 3', 'C) 7 + 7', 'E) 8 + 0'], correct: -1 },
  { panel: 15, options: ['A) 9 + 5', 'B) 7 + 8', 'C) 8 + 8', 'E) 8 + 4'], correct: 1 }
];

const level2 = [
  {
    prompt: 'Se o astronauta andar 3 casas para cima e 2 casas para a esquerda, ele vai ficar na mesma posição do(a):',
    grid: { markers: [{ row: 4, col: 5, symbol: '🧑‍🚀' }, { row: 1, col: 1, symbol: '☀️' }, { row: 2, col: 2, symbol: '⭐' }, { row: 2, col: 4, symbol: '🌜' }, { row: 3, col: 3, symbol: '☄️' }] },
    options: ['A) SOL', 'B) LUA', 'C) ASTEROIDE', 'E) ESTRELA'],
    correct: 1
  },
  {
    prompt: 'Qual é a localização da estrela Alfa?',
    grid: { markers: [{ row: 1, col: 5, symbol: '🌟' }] },
    options: ['A) A1', 'B) D5', 'C) B5', 'E) C3'],
    correct: 2
  },
  {
    prompt: 'Se o foguete avançar 4 casas para cima e 2 casas à direita, em que posição ele vai ficar?',
    grid: { markers: [{ row: 4, col: 2, symbol: '🚀' }] },
    options: ['A) A4', 'B) D5', 'C) B4', 'E) A5'],
    correct: 0
  },
  {
    prompt: 'Qual é a posição do astronauta?',
    grid: { markers: [{ row: 0, col: 3, symbol: '🧑‍🚀' }] },
    options: ['A) A4', 'B) A3', 'C) C4', 'E) B1'],
    correct: 0
  },
  {
    prompt: 'Se o astronauta avançar duas casas para baixo e três casas à esquerda, ele vai ficar em qual posição?',
    grid: { markers: [{ row: 0, col: 3, symbol: '🧑‍🚀' }] },
    options: ['A) A3', 'B) D1', 'C) C1', 'E) B1'],
    correct: 1
  }
];

const level3 = [
  { options: ['A) 55 + 45', 'B) 55 + 55', 'C) 45 + 45', 'D) 60 + 45'], correct: 0 },
  { options: ['A) 45 + 50', 'B) 60 + 35', 'C) 35 + 75', 'D) 50 + 45'], correct: -1 },
  { options: ['A) 78 + 21', 'B) 77 + 34', 'C) 33 + 77', 'D) 65 + 15'], correct: -1 },
  { options: ['A) 98 + 1', 'B) 95 + 6', 'C) 84 + 26', 'D) 94 + 6'], correct: 3 },
  { options: ['A) 38 + 45', 'B) 54 + 26', 'C) 63 + 37', 'D) 92 + 7'], correct: 2 }
];

function sound(name) {
  const audio = new Audio(`${soundBase}${name}.mp3`);
  audio.play().catch(() => {});
}

function imageTag(name, alt = '') {
  return `<img src="${imageBase}${name}.png" alt="${alt || name}" />`;
}

function formatTime(s) {
  const min = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function startTimer(seconds, onTimeout) {
  stopTimer();
  state.timeLeft = seconds;
  const timerNode = document.querySelector('[data-timer]');
  if (timerNode) timerNode.textContent = formatTime(state.timeLeft);
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    const node = document.querySelector('[data-timer]');
    if (node) node.textContent = formatTime(Math.max(0, state.timeLeft));
    if (state.timeLeft <= 0) {
      stopTimer();
      showFeedback('tempo esgotado', 'tempo-esgotado', () => onTimeout());
    }
  }, 1000);
}

function showFeedback(kind, soundName, next) {
  stopTimer();
  const messages = {
    acerto: 'Resposta correta!',
    erro: 'Resposta incorreta!',
    'tempo esgotado': 'Tempo esgotado!'
  };
  app.innerHTML = `
    <section class="card feedback">
      <h2>${messages[kind]}</h2>
      <div class="image-wrap">${imageTag(kind.replace(' ', '-'), kind)}</div>
      <button id="continue">Continuar</button>
    </section>
  `;
  sound(soundName);
  document.getElementById('continue').onclick = next;
}

function showIntro() {
  stopTimer();
  app.innerHTML = `
    <section class="two-column">
      <div class="card">
        <h1>PERDIDOS NO ESPAÇO</h1>
        <p>Jogo pedagógico de Matemática para o 3º ano do Ensino Fundamental</p>
        <p>Criado por Edneia Angélica Gomes</p>
        <button id="start">COMEÇAR</button>
      </div>
      <div class="card image-wrap">${imageTag('tela-inicial', 'Tela inicial')}</div>
    </section>
  `;
  document.getElementById('start').onclick = () => showNarrative(0, () => showNarrative(1, () => showNarrative(2, () => showNarrative(3, startLevel1))));
}

function showNarrative(index, next) {
  stopTimer();
  const n = narratives[index];
  app.innerHTML = `
    <section class="two-column">
      <div class="card image-wrap">${imageTag(n.image, `Narrativa ${index + 1}`)}</div>
      <div class="card">
        <h2>Narrativa ${index + 1}</h2>
        <p>${n.text}</p>
        <button id="next">AVANÇAR</button>
      </div>
    </section>
  `;
  document.getElementById('next').onclick = next;
}

function startLevel1() {
  state.currentQuestion = 0;
  state.score = 0;
  renderLevel1Question();
}

function renderLevel1Question() {
  const q = level1[state.currentQuestion];
  app.innerHTML = `
    <section class="two-column">
      <div class="card">
        <div class="timer">Tempo: <span data-timer></span></div>
        <h3>Questão ${state.currentQuestion + 1} de 5</h3>
        <p>Número do painel</p>
        <div class="panel-number">${q.panel}</div>
      </div>
      <div class="card">
        <h3>Escolha a operação correta:</h3>
        <div class="options">
          ${q.options.map((opt, idx) => `<button data-idx="${idx}">${opt}</button>`).join('')}
        </div>
      </div>
    </section>
  `;
  startTimer(60, handleWrongLevel1);
  app.querySelectorAll('[data-idx]').forEach((btn) => {
    btn.onclick = () => {
      stopTimer();
      const idx = Number(btn.dataset.idx);
      const correct = idx === q.correct;
      if (correct) state.score += 1;
      showFeedback(correct ? 'acerto' : 'erro', correct ? 'acerto' : 'erro', () => nextLevel1());
    };
  });
}

function handleWrongLevel1() {
  nextLevel1();
}

function nextLevel1() {
  state.currentQuestion += 1;
  if (state.currentQuestion >= level1.length) return endLevel1();
  renderLevel1Question();
}

function endLevel1() {
  const win = state.score >= 4;
  app.innerHTML = `
    <section class="card feedback">
      <div class="image-wrap">${imageTag(win ? 'nivel1-vitoria' : 'nivel1-derrota', win ? 'Vitória nível 1' : 'Derrota nível 1')}</div>
      <h2>${win ? 'Vocês conseguiram! As luzes da nave voltaram a se acender!' : 'Vocês fracassaram, é preciso escalar outra equipe para tentar fazer o trabalho.'}</h2>
      <button id="level1-action">${win ? 'AVANÇAR' : 'TENTAR NOVAMENTE'}</button>
    </section>
  `;
  document.getElementById('level1-action').onclick = () => {
    if (!win) return startLevel1();
    showNarrative(4, startLevel2);
  };
}

function buildGrid(markers) {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const rows = [0, 1, 2, 3, 4].map((r) => {
    const cells = [1, 2, 3, 4, 5].map((c) => {
      const marker = markers.find((m) => m.row === r && m.col === c);
      return `<td>${marker ? marker.symbol : ''}</td>`;
    }).join('');
    return `<tr><th>${letters[r]}</th>${cells}</tr>`;
  }).join('');

  const footer = `<tr><th></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>`;
  return `<table class="grid-board">${rows}${footer}</table>`;
}

function startLevel2() {
  state.currentQuestion = 0;
  state.score = 0;
  renderLevel2Question();
}

function renderLevel2Question() {
  const q = level2[state.currentQuestion];
  app.innerHTML = `
    <section class="two-column">
      <div class="card">
        <h3>Questão ${state.currentQuestion + 1} de 5</h3>
        <p>${q.prompt}</p>
        ${buildGrid(q.grid.markers)}
      </div>
      <div class="card">
        <div class="timer">Tempo: <span data-timer></span></div>
        <h3>Alternativas</h3>
        <div class="options">
          ${q.options.map((opt, idx) => `<button data-idx="${idx}">${opt}</button>`).join('')}
        </div>
      </div>
    </section>
  `;
  startTimer(60, () => nextLevel2());
  app.querySelectorAll('[data-idx]').forEach((btn) => {
    btn.onclick = () => {
      stopTimer();
      const correct = Number(btn.dataset.idx) === q.correct;
      if (correct) state.score += 1;
      showFeedback(correct ? 'acerto' : 'erro', correct ? 'acerto' : 'erro', () => nextLevel2());
    };
  });
}

function nextLevel2() {
  state.currentQuestion += 1;
  if (state.currentQuestion >= level2.length) return endLevel2();
  renderLevel2Question();
}

function endLevel2() {
  const win = state.score >= 4;
  app.innerHTML = `
    <section class="card feedback">
      <div class="image-wrap">${imageTag(win ? 'nivel2-vitoria' : 'nivel2-derrota', win ? 'Vitória nível 2' : 'Derrota nível 2')}</div>
      <h2>${win ? 'O mapa foi reconstruído, agora vocês já podem se orientar!' : 'Vocês fracassaram, é preciso escalar outra equipe para tentar fazer o trabalho.'}</h2>
      <button id="level2-action">${win ? 'AVANÇAR' : 'TENTAR NOVAMENTE'}</button>
    </section>
  `;
  document.getElementById('level2-action').onclick = () => {
    if (!win) return startLevel2();
    showNarrative(5, startLevel3);
  };
}

function parseSum(text) {
  return text.replace(/^[A-Z]\)\s*/, '').split('+').map((x) => Number(x.trim())).reduce((a, b) => a + b, 0);
}

function startLevel3() {
  state.currentQuestion = 0;
  state.score = 0;
  state.fuelValue = 0;
  renderLevel3Question();
}

function renderLevel3Question() {
  const q = level3[state.currentQuestion];
  app.innerHTML = `
    <section class="two-column">
      <div class="card">
        <div class="timer">Tempo: <span data-timer></span></div>
        <h3>Questão ${state.currentQuestion + 1} de 5</h3>
        <div class="fuel-panel">Tanque: ${state.fuelValue}%</div>
        <p class="status ${state.fuelValue === 100 ? 'success' : state.fuelValue < 0 ? 'error' : ''}">
          ${state.fuelValue === 100 ? 'Vocês conseguiram. Agora já podem avançar' : ''}
        </p>
      </div>
      <div class="card">
        <h3>Escolha a operação:</h3>
        <div class="options">
          ${q.options.map((opt, idx) => `<button data-idx="${idx}">${opt}</button>`).join('')}
        </div>
      </div>
    </section>
  `;
  startTimer(60, () => nextLevel3());
  app.querySelectorAll('[data-idx]').forEach((btn) => {
    btn.onclick = () => {
      stopTimer();
      const selected = q.options[Number(btn.dataset.idx)];
      const sum = parseSum(selected);
      const correct = sum === 100;
      if (correct) {
        state.score += 1;
        state.fuelValue = 100;
      } else {
        state.fuelValue = -sum;
      }
      showFeedback(correct ? 'acerto' : 'erro', correct ? 'acerto' : 'erro', () => nextLevel3());
    };
  });
}

function nextLevel3() {
  state.currentQuestion += 1;
  if (state.currentQuestion >= level3.length) return endLevel3();
  renderLevel3Question();
}

function endLevel3() {
  const win = state.score >= 4;
  app.innerHTML = `
    <section class="card feedback">
      <div class="image-wrap">${imageTag(win ? 'nivel3-vitoria' : 'nivel3-derrota', win ? 'Vitória nível 3' : 'Derrota nível 3')}</div>
      <h2>${win ? 'Vocês conseguiram! O tanque está cheio e já podem avançar!' : 'Vocês fracassaram, é preciso escalar outra equipe para tentar fazer o trabalho.'}</h2>
      <button id="level3-action">${win ? 'AVANÇAR' : 'TENTAR NOVAMENTE'}</button>
    </section>
  `;
  document.getElementById('level3-action').onclick = () => {
    if (!win) return startLevel3();
    showNarrative(6, showFinalClues);
  };
}

function showFinalClues() {
  app.innerHTML = `
    <section class="two-column">
      <div class="card">
        <h3>Pistas</h3>
        <ol>
          <li>Quantos números pares há entre o 1 e o 17?</li>
          <li>Quantos números ímpares há entre o 0 e o 10?</li>
          <li>Quantas vezes o número 1 aparece entre o 0 e o 13?</li>
          <li>Número que corresponde à letra I.</li>
        </ol>
        <button id="to-pin">AVANÇAR</button>
      </div>
      <div class="card">
        <div class="timer">Tempo: <span data-timer></span></div>
        <div class="image-wrap">${imageTag('pistas', 'Pistas')}</div>
      </div>
    </section>
  `;
  startTimer(300, () => showPinEntry());
  document.getElementById('to-pin').onclick = () => {
    stopTimer();
    showPinEntry();
  };
}

function showPinEntry() {
  app.innerHTML = `
    <section class="card feedback">
      <h2>Digite o código final</h2>
      <div class="pin-inputs">
        <input maxlength="1" inputmode="numeric" />
        <input maxlength="1" inputmode="numeric" />
        <input maxlength="1" inputmode="numeric" />
        <input maxlength="1" inputmode="numeric" />
      </div>
      <button id="check-pin">CONFIRMAR CÓDIGO</button>
    </section>
  `;

  const inputs = [...app.querySelectorAll('input')];
  inputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
      if (input.value && inputs[i + 1]) inputs[i + 1].focus();
    });
  });

  document.getElementById('check-pin').onclick = () => {
    const pin = inputs.map((i) => i.value).join('');
    const win = pin === '8569';
    app.innerHTML = `
      <section class="card feedback">
        <div class="image-wrap">${imageTag(win ? 'vitoria-final' : 'derrota-final', win ? 'Vitória final' : 'Derrota final')}</div>
        <h2>${win ? 'Código correto! Missão cumprida!' : 'Código incorreto. Missão falhou.'}</h2>
        <button id="restart">JOGAR NOVAMENTE</button>
      </section>
    `;
    sound(win ? 'vitoria-final' : 'vitoria-final');
    document.getElementById('restart').onclick = showIntro;
  };
}

showIntro();
