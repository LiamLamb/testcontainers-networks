# Overview

This repo aims to demonstrate an intermittent issue with port mapping when a given container is part of more than one network.

The setup is the following:
* I have two networks; `network-a` and `network-b`
* I am running a ping-pong server in a container, exposing port `80`, which is part of both networks
* An axios client performs a simple `ping` request on the port from `getMappedPort(80)` and should expect a `pong` response

### Expected Behaviour
When I perform a `ping` request to the server using the `getMappedPort(80)`, I expect a `pong` response. 

### Actual Behaviour
Sometimes I get the `pong` response, sometimes the http client throws an `ECONNRESET` error as the client is trying to ping the wrong port. 

### Experiment
To investigate this, I put together a small experiment in [src/index.ts](./src/index.ts), where you will find:

* `runExp`: A function for running an individual experiement. It creates the networks, the container, performs the get request and cleans up after itself.
* `main`: Runs the experiment 10 times to attempt to reproduce the issue. 

### Observations

It looks like adding the container to a second network is what is causing the problem. If I comment out:

```typescript
await client.container.connectToNetwork(containerRef, networkBRef, []);
```

The experiment runs fine without any errors from the Axios client. 

Whenever an experiment fails (e.g. the client couldn't get a `pong` response), I log the port I used from `getMappedPort(80)` and the port from the docker inspect response and always notice a mismatch, e.g.:

```
Expected port: 55491 vs actual port: 55490
```

## Getting Started

1. Install Dependencies:
```
npm install
```

2. Run the `start` script:
```
npm run start
```