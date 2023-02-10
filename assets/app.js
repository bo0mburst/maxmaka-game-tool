window.MAXMAKA = {
	isChatListenerActive: false,
	eligibles: [],
	leaderboard: {},
};

const STATE_KEY =  'MAXMAKA';

const keywordInput = document.getElementById('keyword');
const keywordButton = document.getElementById('button-keyword');

const twitchChat = document.getElementById('twitch-chat');
const eligiblesBox = document.getElementById('eligibles-box');
const leaderboardBox = document.getElementById('leaderboard-box');

const clearEligibles = document.getElementById('clear-eligibles');
const clearLeaderboard = document.getElementById('clear-leaderboard');

const buttonEligibleWinner = document.getElementById('button-eligible-winner');
const buttonSave = document.getElementById('button-save');

const winnerModal = new bootstrap.Modal(document.getElementById('winner-modal'), {
	backdrop: 'static',
  keyboard: false
});


clearEligibles.addEventListener('click', clearEligiblesList);
clearLeaderboard.addEventListener('click', clearLeaderboardList);
keywordButton.addEventListener('mousedown', toggleKeyWordVisibility);
keywordButton.addEventListener('mouseup', toggleKeyWordVisibility);
buttonEligibleWinner.addEventListener('click', pickEligibleWinner);
buttonSave.addEventListener('click', saveToLeaderboard);


// load save state 
initialLoad();

// twitch client
const client = new tmi.Client({
  connetion: {
    secure: true,
    reconnect: true,
  },
	channels: [ 'splinterlandstv' ],
});
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
	logMessages(tags, message);
	logEligibles(tags, message);
});


// FUNCTIONS

function initialLoad() {
	const state = getState();
	if (state) {
		window.MAXMAKA.leaderboard = state;
		renderLeaderBoard(state);
	}
}

function saveState(state = []) {
	window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function getState() {
	return JSON.parse(window.localStorage.getItem(STATE_KEY));
}

function clearLeaderboardList () {
	if (!confirm('This will clear the leaderboard')) return;

	window.MAXMAKA.leaderboard;
	leaderboardBox.innerHTML = '';
	window.MAXMAKA.leaderboard = [];
	saveState();
}

function saveToLeaderboard () {
	if (!confirm('This will clear the eligible list')) return;

	const lb = window.MAXMAKA.leaderboard;
	const eligibles = window.MAXMAKA.eligibles;
	eligibles.forEach(user => {
		if (!lb[user]) lb[user] = 0;
		lb[user] += 1;
	});

	// sort

	const sortedLb = Object.keys(lb)
  .sort((key1, key2) => lb[key2] - lb[key1] )
  .reduce(
    (obj, key) => ({
      ...obj,
      [key]: lb[key]
    }),
    {}
  );

	// save to storage
	saveState(sortedLb);

	// render
	
	renderLeaderBoard(sortedLb);


	clearEligiblesList();
}

function renderLeaderBoard(sortedLb) {
	if (!sortedLb) return;
	leaderboardBox.innerHTML =  '';

	for (const user in sortedLb) {
		const li = document.createElement('li');
		const nameEl = document.createElement('strong');
		const scoreEl = document.createElement('span');
		scoreEl.classList.add('badge', 'bg-secondary', 'ms-2');
		scoreEl.innerText = sortedLb[user];
		nameEl.innerText = user;

		li.classList.add('list-group-item', 'small', 'text-body');
		li.append(nameEl);
		li.append(scoreEl);

		leaderboardBox.append(li);
	}
}

function pickEligibleWinner () {
	const eligibles = window.MAXMAKA.eligibles;
	const winnerElement = document.getElementById('winner-name');
	const spinner = document.getElementById('loading-spinner');
	const winnerMessage = document.getElementById('winner-message');

	spinner.classList.remove('d-none');
	winnerElement.classList.add('d-none');
	winnerMessage.classList.add('d-none');
	winnerModal.show();

	setTimeout(() => {
		winner = eligibles[Math.floor(Math.random()*eligibles.length)];
		winnerElement.innerText = winner;
		spinner.classList.add('d-none');
		winnerElement.classList.remove('d-none');
		winnerMessage.classList.remove('d-none');
	}, 5000);

}

function toggleKeyWordVisibility() {
	if (keywordInput.type === "password") {
    keywordInput.type = "text";
  } else {
    keywordInput.type = "password";
  }
}

function clearEligiblesList () {
	eligiblesBox.innerHTML = '';
	window.MAXMAKA.eligibles = [];
}

function logMessages (tags, message) {
	// twitch chat box
	const displayName = tags['display-name'];
	
	const li = document.createElement('li');
	const nameEl = document.createElement('strong');
	const messageEl = document.createElement('span');
	nameEl.innerText = displayName;
	messageEl.innerText =  `: ${message}`;

	li.classList.add('list-group-item', 'small', 'text-body');
	li.append(nameEl);
	li.append(messageEl);

	if (twitchChat.childNodes.length > 20) {
		twitchChat.removeChild(twitchChat.getElementsByTagName('li')[0]);
	}

	twitchChat.append(li);
	twitchChat.scrollTop = twitchChat.scrollHeight;
}

function logEligibles (tags, message) {
	if(!window.MAXMAKA.isChatListenerActive) return;
	const msg = message.toLocaleLowerCase();
	const key = String(keywordInput.value).toLocaleLowerCase();
	// eligibles
	if (key && msg.includes(key)) {
		const displayName = tags['display-name'];
		const eligibles = window.MAXMAKA.eligibles || [];
		if (eligibles.includes(displayName)) return 

		eligibles.push(displayName);
	
		eligiblesBox.innerHTML = '';
	
		eligibles.forEach(user => {
			const li = document.createElement('li');
			const nameEl = document.createElement('strong');
			nameEl.innerText = user;
	
			li.classList.add('list-group-item', 'small', 'text-success');
			li.append(nameEl);
	
			eligiblesBox.append(li);
		});
	}
}
