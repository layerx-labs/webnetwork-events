<h2 align="center">
  <a href="#readme" title="WebApp README.md"><img alt="WebApp Logo" src="https://bafybeigznseyukyehtkphkckbaebjixypvpesd7xkmyx2ryzlsjdexelyy.ipfs.infura-ipfs.io/" alt="WebApp Logo" width="160"/></a>
</h2>

<h3 align="center">
 This project is a microservice to check and process events mined at chain for update <a href="https://github.com/bepronetwork/web-network">Web Network</a>. learn more <a href="https://bepronetwork.medium.com/what-is-bepro-network-6ec4054d2020">about</a>.
</h3>

<p align="center">
  <a href="#2-quick-started">Quick Started</a> •
  <a href="#3-environment-configuration">Enviroment</a> •
  <a href="#4-running">Running</a> •
  <a href="#5-contributing">Contributing</a> •
  <a href="#6-join-the-community">Community</a>
</p>

---

<br>

<h3 align="center">
  We are delighted to announce the release of <a href="https://app.bepro.network/">Bepro Network's v2 </a> protocol. Try it.
</h3>

<br>

#

## 1. Prerequisites

- [NodeJS](https://nodejs.dev/) in v16.13 or newer.

<br>

## 2. Quick Started

Install project dependencies:

```bash
$ npm install
```

Create a new .env file based on the default example.

```console
$ cp .env.exemple .env
```

Run http server:

```bash
$ npm run dev
```

Run cron module:

```bash
$ npm run build
$ npm run start:cron
```

<br>

## 3. Documentation

<br>

### 3.1 Architecture

| folder  | description                                |
| ------- | ------------------------------------------ |
| db      | models and configuration                   |
| tools   | scripting tools                            |
| actions | event-reader actions to be consumed by cma |
| utils   | helpers for developers                     |

<br>

### 3.2 Scripts

| Script        | description              |
| ------------- | ------------------------ |
| update-models | pull models from db      |
| dev           | run http server dev mode |
| start:server  | run http server          |
| start:cron    | run cron moduel          |

<br>

## 4. Contributing

See [CONTRIBUTING.md](https://github.com/bepro/webapp/CONTRIBUTING.md) for our guide to contributing to web-network.

<br>

## 5. Join the community

- [Discord](https://discord.gg/9aUufhzhfm)
- [Telegram](https://t.me/betprotocol)
- [Medium](https://bepronetwork.medium.com)
- [WebSite](https://www.bepro.network)

<br/>
