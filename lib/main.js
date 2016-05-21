const chrome = require('chrome');
chrome.Cu.importGlobalProperties(['fetch']);

const contextMenu = require('sdk/context-menu');
const notifications = require('sdk/notifications');

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
	return fetch('http://localhost:7800/jsonrpc', {
		method: 'POST',
		body: makeJob(path, username, password)
	}).catch(() => {
		throw new Error('Error sending link to LFTP.');
	});
}

function makeJob(path, username, password) {
	const job = {
		'path': path,
		'username': username,
		'password': password
	};

	return JSON.stringify(job);
}
