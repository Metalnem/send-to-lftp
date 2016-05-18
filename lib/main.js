const contextMenu = require('sdk/context-menu');
const notifications = require('sdk/notifications');
const http = require('./http.js');
const timeout = 10 * 1000;

contextMenu.Item({
	contentScript: 'self.on("click", function(node) { self.postMessage(node.href); });',
	context: contextMenu.URLContext('ftp://*'),
	label: 'Send to LFTP',
	onMessage: onSendLink
});

function onSendLink(path) {
	const username = 'username';
	const password = 'password';

	return sendLink(path, username, password).then(onSuccess).catch(onError);
}

function onSuccess() {
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
	return http.makeRequest({
		url: 'http://localhost:7800/jsonrpc',
		content: makeJob(path, username, password),
		method: 'post',
		timeout: timeout
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
