<h2 align="center">
  <a href="#readme" title="WebApp README.md"><img alt="WebApp Logo" src="https://bafybeigznseyukyehtkphkckbaebjixypvpesd7xkmyx2ryzlsjdexelyy.ipfs.infura-ipfs.io/" alt="WebApp Logo" width="160"/></a>
</h2>

<h3 align="center">
 This project is a API service to check and process events mined at chain to keep <a href="https://github.com/bepronetwork/web-network">Web Network</a> updated.<br> Learn more <a href="https://bepronetwork.medium.com/what-is-bepro-network-6ec4054d2020">about</a>.
</h3>

<p align="center">
  <a href="#2-quick-started">Quick Started</a> •
  <a href="#3-documentation">Documentation</a> •
  <a href="#4-contributing">Contributing</a> •
  <a href="#5-join-the-community">Community</a>
</p>

---

<h3 align="center">
  We are delighted to announce the release of <a href="https://app.bepro.network/">Bepro Network's v2 </a> protocol and we would invite to try it.
</h3>

---

This project is an API to listen events from blockchain and manage the database for keep [web-network](https://github.com/bepronetwork/web-network) updated.

It is able to run as `http server` and as a `cronjob`, and it's essential for running web-network correctly.

## 1. Prerequisites

- [NodeJS](https://nodejs.dev/) in v16.13 or newer.

## 2. Quick Started

Install project dependencies:

```bash
$ npm install
```

Create a new .env file based on the default example.

```console
$ cp .env.example .env
```

`Remember to fill in the .env with your enviroment values`

Run as http server:

```bash
$ npm run dev
```

Run as cronjob module:

```bash
$ npm run build
$ npm run start:cron
```

## 3. Documentation

### 3.1 Architecture

| Folder  | Description                                |
| ------- | ------------------------------------------ |
| db      | models and configuration                   |
| tools   | scripting tools                            |
| actions | event-reader actions to be consumed by cma |
| utils   | helpers for developers                     |

### 3.2 Scripts

| Script        | Description              |
| ------------- | ------------------------ |
| update-models | pull models from db      |
| dev           | run http server dev mode |
| start:server  | run http server          |
| start:cron    | run cronjob              |

## 4. Contributing

See [CONTRIBUTING.md](https://github.com/bepro/webapp/CONTRIBUTING.md) for our guide to contributing to web-network.

## 5. Join the community

- [Discord](https://discord.gg/9aUufhzhfm)
- [Telegram](https://t.me/betprotocol)
- [Medium](https://bepronetwork.medium.com)
- [WebSite](https://www.bepro.network)
