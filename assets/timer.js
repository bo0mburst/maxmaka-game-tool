let timerInterval;
let btnStart = document.getElementById('btn-start-timer');
let btnPause = document.getElementById('btn-pause-timer');
let btnStop = document.getElementById('btn-end');
let timer = document.getElementById('timer');
let capturing = document.getElementById('capturing-text');
let time = 0;

btnStart.addEventListener('click', startTime);
btnPause.addEventListener('click', pause);
btnStop.addEventListener('click', stop);

function startTime(){
  time = Number(timer.value);

  if (time > 0) {
    window.MAXMAKA.isChatListenerActive = true;
    capturing.classList.add('text-success');
    capturing.innerText =  'Active';
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
}

function stop() {
  pause();
  time = 0;
  timer.value = 0;
}
