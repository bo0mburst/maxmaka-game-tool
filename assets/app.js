window.MAXMAKA = {
	isChatListenerActive: false,
	eligibles: [],
	leaderboard: {},
	channel: 'splinterlandstv',
	previews: [],
	defaultTimer: 30,
};

let ENTRIES = [];

const validEntries = /^([bt][1-6][bt])$/

const STATE_KEY =  'MAXMAKA';

const keywordInput = document.getElementById('keyword');
const keywordButton = document.getElementById('button-keyword');

const entriesLog = document.getElementById('entries-log');
const twitchChatEmbed = document.getElementById('twitch-chat-embed');
const eligiblesBox = document.getElementById('eligibles-box');
const leaderboardBox = document.getElementById('leaderboard-box');

const clearEligibles = document.getElementById('clear-eligibles');
const clearLeaderboard = document.getElementById('clear-leaderboard');
const buttonAddToLeaderboard = document.getElementById('add-to-leaderboard');

const buttonEligibleWinner = document.getElementById('button-eligible-winner');
const buttonSave = document.getElementById('button-save');

const channelEl = document.getElementById('channel');
const channelBtn = document.getElementById('channel-btn');

const searchName = document.getElementById('search-name');

const copyLbEl = document.getElementById('copy-leaderboard');

const buttonToggleBattleMode = document.getElementById('button-toggle-battle-mode');

const buttonClearEntries = document.getElementById('btn-clear-entries');

const buttonCopyWinner = document.getElementById('btn-copy-winner');

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
buttonToggleBattleMode.addEventListener('click', toggleBattleMode);
buttonAddToLeaderboard.addEventListener('click', addToLeaderboard);
buttonClearEntries.addEventListener('click', clearEntries);
buttonCopyWinner.addEventListener('click', copyWinner);

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
			previews: state.previews || [],
			defaultTimer: state.defaultTimer || 30,
		}
	}
	twitchChatEmbed.setAttribute('src',
		`https://www.twitch.tv/embed/${window.MAXMAKA.channel}/chat?darkpopout&parent=bo0mburst.github.io`)
	renderLeaderBoard();
	renderEligibles();

	loadPreview();

	stop();

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
		if(!window.MAXMAKA.isChatListenerActive) return;
		const msg = message.trim().toLowerCase();
		const key = String(keywordInput.value).trim().toLowerCase();
		const displayName = tags['display-name'];
		const valid = validEntries.test(msg);
		if (!key) return;
		if(msg === key && !(valid && ENTRIES.includes(displayName))) logEligibles(tags, message);
		if (valid || (key && message === key)) logEntries(tags, message);
	});
}

function saveState() {
	window.localStorage.setItem(STATE_KEY, JSON.stringify(window.MAXMAKA));
}

function getState() {
	return JSON.parse(window.localStorage.getItem(STATE_KEY));
}

function toggleBattleMode() {
	document.getElementById('left-box').classList.toggle('hide');
	document.getElementById('right-box').classList.toggle('hide');
	document.getElementById('controls').classList.toggle('hide');
	document.getElementById('preview-box').classList.toggle('show');
	document.getElementById('entries').classList.toggle('show');
	document.getElementById('preview-box-control').classList.toggle('d-none');
	document.getElementById('button-eligible-winner').parentElement.classList.toggle('d-none');
	document.getElementById('button-save').parentElement.classList.toggle('d-none');
	document.getElementById('battle-preview').classList.toggle('d-none');
	document.getElementById('back-to-dashboard').classList.toggle('d-none');

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
	if (!channel || channel === window.MAXMAKA.channel) return;
	window.MAXMAKA = {
		isChatListenerActive: false,
		eligibles: [],
		leaderboard: window.MAXMAKA.leaderboard,
		channel: channel,
		previews: window.MAXMAKA.previews,
		defaultTimer: window.MAXMAKA.defaultTimer,
	};
	saveState()
	location.reload(); 
}

function addToLeaderboard() {
	const username = prompt('Manually add name');
	if(username) {
		window.MAXMAKA.leaderboard[username] = window.MAXMAKA.leaderboard[username] || 0;
		updateLeaderBoard();
	}
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
		points = prompt('Enter number of points to add. 0-100.\nThis will also clear eligible and entries list.\n', 1);
	} while (isNaN(points));


	eligibles.forEach(user => {
		if (!lb[user]) lb[user] = 0;
		lb[user] = Number(lb[user]) + Number(points);
	});

	updateLeaderBoard();
	clearEligiblesList();
	clearEntries();
	this.disabled = true;
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
		scoreEl.addEventListener("keypress", function(event) {
			// If the user presses the "Enter" key on the keyboard
			if (event.key === "Enter") {
				event.preventDefault();
				event.target.blur();
			}
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
	
	if(!eligibles || !eligibles.length) return alert('No eligible users');

	const winnerWrapperElement = document.getElementById('winner-wrapper');
	const winnerElement = document.getElementById('winner-name');
	const spinner = document.getElementById('loading-spinner');
	const winnerMessage = document.getElementById('winner-message');

	spinner.classList.remove('d-none');
	winnerWrapperElement.classList.add('d-none');
	winnerMessage.classList.add('d-none');
	winnerModal.show();

	setTimeout(() => {
		winner = eligibles[Math.floor(Math.random()*eligibles.length)];
		winnerElement.innerText = winner;
		spinner.classList.add('d-none');
		winnerWrapperElement.classList.remove('d-none');
		winnerMessage.classList.remove('d-none');
	}, 3000);

	buttonSave.disabled = false;
}

function toggleKeyWordVisibility() {
	if (keywordInput.type === "password") {
    keywordInput.type = "text";
  } else {
    keywordInput.type = "password";
  }
}

function clearEligiblesListHandler () {
	if(!confirm('This will clear eligible list. This will alswo clear entries')) return;
	clearEligiblesList();
	clearEntries();
	buttonSave.disabled = true;
}

function clearEligiblesList () {
	eligiblesBox.innerHTML = '<div class="text-muted text-center mt-3">List will show here</div>';
	window.MAXMAKA.eligibles = [];
	saveState();
}

function logEntries (tags, message) {
	// twitch chat box
	const displayName = tags['display-name'];

	ENTRIES.push(displayName);
	
	const li = document.createElement('li');
	const nameEl = document.createElement('span');
	const messageEl = document.createElement('span');
	nameEl.classList.add('text-body');
	nameEl.innerText = displayName;
	messageEl.classList.add('text-white');
	messageEl.innerText =  `: ${message}`;

	li.classList.add('list-group-item', 'small');
	li.append(nameEl);
	li.append(messageEl);
	entriesLog.prepend(li);
}

function clearEntries () {
	entriesLog.innerHTML = '';
	ENTRIES = [];
}

function logEligibles (tags, message) {
	// eligibles
	const eligibles = window.MAXMAKA?.eligibles || [];
	const displayName = tags['display-name'];

	if (eligibles.includes(displayName)) return 

	eligibles.push(displayName);
	window.MAXMAKA.eligibles = eligibles;
	renderEligibles();
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

function copyWinner () {
	const winnerElement = document.getElementById('winner-name');
	navigator.clipboard.writeText(winnerElement.innerText);
}