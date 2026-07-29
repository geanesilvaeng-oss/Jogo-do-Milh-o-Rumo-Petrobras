const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarSom(tipo) {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const agora = audioCtx.currentTime;

    if (tipo === 'clique') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, agora);
        gainNode.gain.setValueAtTime(0.1, agora); gainNode.gain.exponentialRampToValueAtTime(0.01, agora + 0.1);
        osc.start(agora); osc.stop(agora + 0.1);
    } else if (tipo === 'suspense') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150, agora);
        osc.frequency.linearRampToValueAtTime(220, agora + 1.5);
        gainNode.gain.setValueAtTime(0.15, agora); gainNode.gain.exponentialRampToValueAtTime(0.01, agora + 1.5);
        osc.start(agora); osc.stop(agora + 1.5);
    } else if (tipo === 'acerto') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, agora);
        osc.frequency.setValueAtTime(659.25, agora + 0.15); osc.frequency.setValueAtTime(783.99, agora + 0.3);
        gainNode.gain.setValueAtTime(0.2, agora); gainNode.gain.exponentialRampToValueAtTime(0.01, agora + 0.8);
        osc.start(agora); osc.stop(agora + 0.8);
    } else if (tipo === 'erro') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, agora);
        osc.frequency.linearRampToValueAtTime(60, agora + 0.5);
        gainNode.gain.setValueAtTime(0.2, agora); gainNode.gain.exponentialRampToValueAtTime(0.01, agora + 0.5);
        osc.start(agora); osc.stop(agora + 0.5);
    }
}

const valoresPremios = [
    1000, 1500, 2500, 3500, 5000, 7500, 10000, 15000, 20000, 25000,
    30000, 40000, 50000, 60000, 80000, 100000, 150000, 200000, 250000, 300000,
    400000, 500000, 650000, 800000, 1000000
];

const frasesMotivacionaisPetrobras = [
    "Excelente! Sua competência técnica garante a segurança nas operações rumo à Petrobras!",
    "Mandou muito bem! Raciocínio exemplar alinhado aos padrões de excelência.",
    "Perfeito! Profissionais focados nas NRs constroem o futuro da nossa energia.",
    "Sensacional! A segurança vem em primeiro lugar no padrão Petrobras.",
    "Brilhante! Cada acerto te coloca mais perto do topo do Jogo do Milhão.",
    "Incrível! Domínio absoluto das normas que movem o Brasil com segurança.",
    "Exato! A energia para vencer vem da prevenção e do conhecimento técnico."
];

let perguntasPartida = [];
let indiceAtual = 0;
let dinheiroAcumulado = 0;
let travado = false;

const telaInicio = document.getElementById('inicio');
const telaJogo = document.getElementById('jogo');
const telaVitoria = document.getElementById('vitoria');
const telaDerrota = document.getElementById('derrota');

const textoPergunta = document.getElementById('textoPergunta');
const btsAlternativas = [
    document.getElementById('a'), document.getElementById('b'),
    document.getElementById('c'), document.getElementById('d')
];
const spanPremio = document.getElementById('premio');
const spanContador = document.getElementById('contador');
const barraProgresso = document.getElementById('progresso');
const boxMotivacao = document.getElementById('motivacao');
const spanValorFinal = document.getElementById('valorFinal');

function iniciarJogo() {
    tocarSom('clique');
    indiceAtual = 0;
    dinheiroAcumulado = 0;
    
    let copiaBanco = [...perguntasDB];
    copiaBanco.sort(() => Math.random() - 0.5);
    perguntasPartida = copiaBanco.slice(0, 25);

    telaInicio.style.display = 'none';
    telaJogo.style.display = 'block';
    carregarPergunta();
}

function carregarPergunta() {
    travado = false;
    
    if (indiceAtual >= 25 || indiceAtual >= perguntasPartida.length) {
        finalizarVitoria();
        return;
    }

    const p = perguntasPartida[indiceAtual];

    textoPergunta.innerText = p.pergunta;
    spanContador.innerText = `${indiceAtual + 1} / 25`;
    spanPremio.innerText = `R$ ${dinheiroAcumulado.toLocaleString('pt-BR')}`;
    
    const porcentagem = ((indiceAtual + 1) / 25) * 100;
    barraProgresso.style.width = `${porcentagem}%`;

    for (let i = 0; i < 4; i++) {
        btsAlternativas[i].innerText = p.alternativas[i];
        btsAlternativas[i].className = 'btn-alt';
        btsAlternativas[i].disabled = false;
    }

    atualizarEscadaLateral(indiceAtual + 1);
    boxMotivacao.innerText = frasesMotivacionaisPetrobras[Math.floor(Math.random() * frasesMotivacionaisPetrobras.length)];
}

function responder(escolhaIndex) {
    if (travado) return;
    travado = true;

    tocarSom('clique');
    const p = perguntasPartida[indiceAtual];
    const botaoEscolhido = btsAlternativas[escolhaIndex];

    botaoEscolhido.classList.add('selecionado');
    boxMotivacao.innerText = "Esta é a sua resposta definitiva? Valendo...";
    tocarSom('suspense');

    setTimeout(() => {
        if (escolhaIndex === p.correta) {
            botaoEscolhido.classList.remove('selecionado');
            botaoEscolhido.classList.add('correta');
            tocarSom('acerto');
            
            dinheiroAcumulado = valoresPremios[indiceAtual];
            spanPremio.innerText = `R$ ${dinheiroAcumulado.toLocaleString('pt-BR')}`;
            
            dispararEfeitoOuro();
            const fraseAleatoria = frasesMotivacionaisPetrobras[Math.floor(Math.random() * frasesMotivacionaisPetrobras.length)];
            boxMotivacao.innerText = `🌟 ${fraseAleatoria}`;

            setTimeout(() => {
                indiceAtual++;
                carregarPergunta();
            }, 2500);

        } else {
            botaoEscolhido.classList.remove('selecionado');
            botaoEscolhido.classList.add('errada');
            btsAlternativas[p.correta].classList.add('correta');
            tocarSom('erro');

            boxMotivacao.innerText = "Resposta incorreta! A segurança exige atenção plena.";

            setTimeout(() => {
                finalizarDerrota();
            }, 2000);
        }
    }, 1500);
}

function atualizarEscadaLateral(nivelAtual) {
    for (let i = 1; i <= 25; i++) {
        const item = document.getElementById(`nivel-${i}`);
        if (item) item.classList.remove('ativo');
    }
    const nivelAtivo = document.getElementById(`nivel-${nivelAtual}`);
    if (nivelAtivo) {
        nivelAtivo.classList.add('ativo');
        nivelAtivo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function dispararEfeitoOuro() {
    for (let i = 0; i < 40; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula-ouro';
        particula.innerText = '🪙';
        particula.style.left = Math.random() * window.innerWidth + 'px';
        particula.style.top = '-20px';
        particula.style.animationDuration = (Math.random() * 1 + 0.8) + 's';
        particula.style.fontSize = (Math.random() * 15 + 15) + 'px';
        document.body.appendChild(particula);

        setTimeout(() => { particula.remove(); }, 2000);
    }
}

function finalizarVitoria() {
    tocarSom('acerto');
    telaJogo.style.display = 'none';
    telaVitoria.style.display = 'block';
}

function finalizarDerrota() {
    telaJogo.style.display = 'none';
    telaDerrota.style.display = 'block';
    const premioConsolo = indiceAtual > 0 ? dinheiroAcumulado / 2 : 0;
    spanValorFinal.innerText = `R$ ${premioConsolo.toLocaleString('pt-BR')}`;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registrado com sucesso!', reg))
      .catch((err) => console.log('Erro ao registrar Service Worker:', err));
  });
}