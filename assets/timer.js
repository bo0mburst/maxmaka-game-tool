
let timerInterval;
let btnStart = document.getElementById('btn-start-timer');
let btnPause = document.getElementById('btn-pause-timer');
let btnStop = document.getElementById('btn-end');
let btnSetDefault = document.getElementById('set-default-btn');
let timer = document.getElementById('timer');
let capturing = document.getElementById('capturing-text');
let time = 0;

btnStart.addEventListener('click', startTime);
btnPause.addEventListener('click', pause);
btnStop.addEventListener('click', stop);
btnSetDefault.addEventListener('click', setDefault);

function startTime(){
  const eligibles = window.MAXMAKA.eligibles;
	if ((eligibles && eligibles.length)) {
    if (!confirm('WARNING! \nThe Eligible list or entries is not yet cleared. Proceed if you know what you\'re doing :)')) return;
  };

  if (Number(timer.value) <= 0) timer.value = window.MAXMAKA.defaultTimer;
  time = Number(timer.value);
  
  if (time > 0) {
    window.MAXMAKA.isChatListenerActive = true;
    capturing.classList.add('text-success');
    capturing.innerText =  'Accepting...';
    timer.classList.remove('text-muted');
  }

  timerInterval = setInterval(start, 1000);
} 

function start(){
  if (time <= 0){
    stop();
  } else {
    time--;
  }
  timer.value = time;
}

function pause(){
  clearInterval(timerInterval);
  window.MAXMAKA.isChatListenerActive = false;
  capturing.innerText =  'Inactive';
  capturing.classList.remove('text-success');
  timer.classList.add('text-muted');
}

function stop() {
  pause();
  time = 0;
  timer.value = window.MAXMAKA.defaultTimer;
}


function setDefault() {
  const currentTimer = window.MAXMAKA.defaultTimer || 0;
  const defaultTimer = prompt('Set default timer', currentTimer);
  if (!defaultTimer || defaultTimer === currentTimer || isNaN(defaultTimer)) return;
  window.MAXMAKA.defaultTimer = defaultTimer;
  stop();
  saveState();
}