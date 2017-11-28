# Send to LFTP [![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/metalnem/send-to-lftp/master/LICENSE)

This Firefox extension captures HTTP and FTP download links and sends them to [LFTP server](https://github.com/Metalnem/lftp-server). You can download it [here](https://addons.mozilla.org/en-US/firefox/addon/send-to-lftp/).

## Usage

Right click the link that you want to download, and select "Send to LFTP" option. If the link requires authentication, you will be presented with the popup where you can enter your credentials. Warning: because your credentials are sent in plaintext across the network, it is **strongly recommended** that you run your LFTP server behind TLS termination proxy (like nginx or HAProxy).

## Client Configuration

For this extension to work, you have to specify both JSON-RPC Path and RPC Secret in the extensions preferences. If you are running your LFTP server on a domain [www.example.org](www.example.org) with default port, your JSON-RPC Path should look like this:

```
http://www.example.org:7800/jsonrpc
```

## Server Configuration

To start LFTP server, run the following command:

```
lftp-server --rpc-secret=some_secret_token
```
