window.MAXMAKA = {
	isChatListenerActive: false,
	eligibles: [],
	leaderboard: {},
	channel: 'splinterlandstv',
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

const channelEl = document.getElementById('channel');
const channelBtn = document.getElementById('channel-btn');

const searchName = document.getElementById('search-name');

const copyLbEl = document.getElementById('copy-leaderboard');

const winnerModal = new bootstrap.Modal(document.getElementById('winner-modal'), {
	backdrop: 'static',
  keyboard: false
});

clearEligibles.addEventListener('click', clearEligiblesListHandler);
clearLeaderboard.addEventListener('click', clearLeaderboardList);
keywordButton.addEventListener('click', toggleKeyWordVisibility);
buttonEligibleWinner.addEventListener('click', pickEligibleWinner);
buttonSave.addEventListener('click', saveToLeaderboard);
channelBtn.addEventListener('click', updateChannel);
searchName.addEventListener('input', filterLeaderboard);
copyLbEl.addEventListener('click', copyLeaderboard);

// load save state 
initialLoad();


// FUNCTIONS

function initialLoad() {
	const state = getState();
	if (state) {
		window.MAXMAKA = {
			isChatListenerActive: false,
			eligibles: state.eligibles || [],
			leaderboard: state.leaderboard || {},
			channel: state.channel || 'splinterlandstv',
		}
	}

	renderLeaderBoard();
	renderEligibles();

	const channel = window.MAXMAKA.channel;
	channelEl.innerText = channel;
	// twitch client
	const client = new tmi.Client({
		connetion: {
			secure: true,
			reconnect: true,
		},
		channels: [ channel ],
	});
	client.connect().catch(console.error);
	client.on('message', (channel, tags, message, self) => {
		logMessages(tags, message);
		logEligibles(tags, message);
	});
}

function saveState() {
	window.localStorage.setItem(STATE_KEY, JSON.stringify(window.MAXMAKA));
}

function getState() {
	return JSON.parse(window.localStorage.getItem(STATE_KEY));
}

function copyLeaderboard () {
	const lb  = window.MAXMAKA.leaderboard;
	let value = [];
	for(const name in lb) {
		value.push(`${name}\t${lb[name]}`);
	}

	let copyText = value.join('\n');

   // Copy the text inside the text field
  navigator.clipboard.writeText(copyText);

  // Alert the copied text
  alert('Leaderboard copied!');
}

function filterLeaderboard() {
	const filter = searchName.value.toLocaleLowerCase();
	const items = leaderboardBox.querySelectorAll('li');

	items.forEach((item) => {
    let name = item.id;
    if (String(name.toLocaleLowerCase()).startsWith(filter)) {
      item.classList.remove('d-none');
    } else {
      item.classList.add('d-none');
    }
	})
}

function updateChannel() {
	const channel = prompt('Change channel', window.MAXMAKA.channel);
	window.MAXMAKA = {
		isChatListenerActive: false,
		eligibles: [],
		leaderboard: {},
		channel: channel
	};
	saveState()
	location.reload(); 
}

function clearLeaderboardList () {
	if (!confirm('This will clear the leaderboard')) return;

	window.MAXMAKA.leaderboard;
	leaderboardBox.innerHTML = '';
	window.MAXMAKA.leaderboard = [];
	saveState();
}

function saveToLeaderboard () {
	const eligibles = window.MAXMAKA.eligibles;
	
	if (!eligibles || !eligibles.length) return; 

	const lb = window.MAXMAKA.leaderboard;
	let points;
	do{
		points = prompt('Enter number of points to add. 0-100', 1);
	} while (isNaN(points));


	eligibles.forEach(user => {
		if (!lb[user]) lb[user] = 0;
		lb[user] += Number(points);
	});

	updateLeaderBoard();
}

function updateLeaderBoard() {
	const lb = window.MAXMAKA.leaderboard;

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
	window.MAXMAKA.leaderboard = sortedLb;
	saveState();

	// render
	renderLeaderBoard();
}

function renderLeaderBoard() {
	const lb = window.MAXMAKA.leaderboard;
	leaderboardBox.innerHTML =  '';
	
	for (const user in lb) {
		const li = document.createElement('li');
		const nameEl = document.createElement('span');
		nameEl.innerText = user;

		const scoreEl = document.createElement('input');
		scoreEl.setAttribute('type', 'number');
		scoreEl.classList.add('text-warning', 'ms-2', 'float-end', 'border-0', 'bg-transparent', 'text-end');
		scoreEl.style.width = '50px';
		scoreEl.value = lb[user];
		scoreEl.addEventListener('blur', function (e) {
			lb[user] = e.target.value;
			updateLeaderBoard();
		});

		li.classList.add('list-group-item', 'small', 'text-body');
		li.setAttribute('id', user);
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
	}, 3000);

}

function toggleKeyWordVisibility() {
	if (keywordInput.type === "password") {
    keywordInput.type = "text";
  } else {
    keywordInput.type = "password";
  }
}

function clearEligiblesListHandler () {
	if(!confirm('This will clear eligible list.')) return;
	clearEligiblesList();
}

function clearEligiblesList () {
	eligiblesBox.innerHTML = '<div class="text-muted text-center mt-3">List will show here</div>';
	window.MAXMAKA.eligibles = [];
}

function logMessages (tags, message) {
	// twitch chat box
	const displayName = tags['display-name'];
	
	const li = document.createElement('li');
	const nameEl = document.createElement('span');
	const messageEl = document.createElement('span');
	nameEl.style.color = tags.color;
	nameEl.innerText = displayName;
	messageEl.classList.add('text-muted');
	messageEl.innerText =  `: ${message}`;

	li.classList.add('list-group-item', 'small', 'text-body');
	li.append(nameEl);
	li.append(messageEl);

	if (twitchChat.childNodes.length > 100) {
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
	const eligibles = window.MAXMAKA?.eligibles || [];
	if (key && msg.includes(key)) {
		const displayName = tags['display-name'];
		if (eligibles.includes(displayName)) return 

		eligibles.push(displayName);
		window.MAXMAKA.eligibles = eligibles;
		renderEligibles();
	}
}

function renderEligibles() {
	const eligibles = [...window.MAXMAKA.eligibles] || [];
	
	if (!eligibles.length) {
		clearEligiblesList();
		return;
	}

	eligiblesBox.innerHTML = '';
	
	eligibles.forEach(user => {
		const li = document.createElement('li');
		const nameEl = document.createElement('span');
		nameEl.innerText = user;

		li.classList.add('list-group-item', 'small', 'text-success');
		li.append(nameEl);

		eligiblesBox.append(li);
	});

	saveState();
}
