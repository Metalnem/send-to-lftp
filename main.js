const chrome = require('chrome');
chrome.Cu.importGlobalProperties(['fetch']);

const contextMenu = require('sdk/context-menu');
const notifications = require('sdk/notifications');
const panels = require('sdk/panel');
const passwords = require('sdk/passwords');
const prefs = require('sdk/simple-prefs');

contextMenu.Item({
	contentScript: 'self.on("click", function(node) { self.postMessage(node.href); });',
	context: contextMenu.URLContext('ftp://*'),
	label: 'Send to LFTP',
	onMessage: onMenuItemClick
});

function onMenuItemClick(path) {
	return getSavedCredentials(path).then(credentials => onSendLink(path, credentials.username, credentials.password));
}

function onSendLink(path, username, password) {
	return sendLink(path, username, password)
		.then(response => onResponse(path, response))
		.catch(onError);
}

function onResponse(path, response) {
	if (response.status === 401) {
		return new Promise((resolve, reject) => {
			const panel = panels.Panel({
				contentURL: './password.html',
				contentScriptFile: './password.js',
				width: 250,
				height: 100,
				onHide: () => reject(new Error('Authentication failed.'))
			});

			panel.port.on('login', credentials => {
				resolve(onSendLink(path, credentials.username, credentials.password));
				panel.hide();
			});

			panel.port.on('cancel', () => panel.hide());
			panel.show();
		});
	}

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
	const message = error.message.endsWith('.') ? error.message : error.message + '.';

	notifications.notify({
		title: 'Error',
		text: message,
		iconURL: './error-64.png'
	});
}

function getSavedCredentials(url) {
	return new Promise(resolve => {
		passwords.search({
			url: url,
			onComplete: credentials => resolve(credentials[0] || {}),
			onError: () => resolve({})
		});
	});
}

function sendLink(path, username, password) {
	const server = prefs.prefs['path'];

	if (!server) {
		return Promise.reject(new Error('JSON-RPC path not configured.'));
	}

	const secret = prefs.prefs['token'];

	if (!secret) {
		return Promise.reject(new Error('RPC secret not configured.'));
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
