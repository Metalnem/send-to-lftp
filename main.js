const chrome = require('chrome');
chrome.Cu.importGlobalProperties(['fetch']);

const contextMenu = require('sdk/context-menu');
const notifications = require('sdk/notifications');
const prefs = require('sdk/simple-prefs');

contextMenu.Item({
	contentScript: 'self.on("click", function(node) { self.postMessage(node.href); });',
	context: contextMenu.URLContext('ftp://*'),
	label: 'Send to LFTP',
	onMessage: onSendLink
});

function onSendLink(path) {
	return sendLink(path).then(onSuccess).catch(onError);
}

function onSuccess(response) {
	if (!response.ok) {
		return response.json().then(response => {
			throw new Error(response.message);
		});
	}

	notifications.notify({
		title: 'Success',
		text: 'Link successfully sent to LFTP.',
		iconURL: './success-64.png'
	});
}

function onError(error) {
	notifications.notify({
		title: 'Error',
		text: error.message,
		iconURL: './error-64.png'
	});
}

function sendLink(path, username, password) {
	const server = prefs.prefs['path'];

	if (!server) {
		throw new Error('JSON-RPC path not configured.');
	}

	const secret = prefs.prefs['token'];

	if (!secret) {
		throw new Error('RPC secret not configured.');
	}

	return fetch(server, {
		method: 'POST',
		body: makeJob(path, username, password, secret)
	}).catch(() => {
		throw new Error('Error sending link to LFTP.');
	});
}

function makeJob(path, username, password, secret) {
	const job = {
		'path': path,
		'username': username,
		'password': password,
		'secret': secret
	};

	return JSON.stringify(job);
}
