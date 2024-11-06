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

Sample output:
```
Run 8
Creating network a
Creating network b
Starting ping-pong container
Connecting container to network b
AxiosError: read ECONNRESET
    at Function.AxiosError.from (/Users/liam/Projects/Github/testcontainers-network/node_modules/axios/lib/core/AxiosError.js:92:14)
    at RedirectableRequest.handleRequestError (/Users/liam/Projects/Github/testcontainers-network/node_modules/axios/lib/adapters/http.js:620:25)
    at RedirectableRequest.emit (node:events:518:28)
    at RedirectableRequest.emit (node:domain:489:12)
    at ClientRequest.eventHandlers.<computed> (/Users/liam/Projects/Github/testcontainers-network/node_modules/follow-redirects/index.js:49:24)
    at ClientRequest.emit (node:events:518:28)
    at ClientRequest.emit (node:domain:489:12)
    at emitErrorEvent (node:_http_client:103:11)
    at Socket.socketErrorListener (node:_http_client:506:5)
    at Socket.emit (node:events:518:28)
    at Axios.request (/Users/liam/Projects/Github/testcontainers-network/node_modules/axios/lib/core/Axios.js:45:41)
    at processTicksAndRejections (node:internal/process/task_queues:105:5) {
  syscall: 'read',
  code: 'ECONNRESET',
  errno: -54,
  config: {
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    },
    adapter: [ 'xhr', 'http', 'fetch' ],
    transformRequest: [ [Function: transformRequest] ],
    transformResponse: [ [Function: transformResponse] ],
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    env: { FormData: [Function], Blob: [class Blob] },
    validateStatus: [Function: validateStatus],
    headers: Object [AxiosHeaders] {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': undefined,
      'User-Agent': 'axios/1.7.7',
      'Accept-Encoding': 'gzip, compress, deflate, br'
    },
    baseURL: 'http://localhost:55490',
    method: 'get',
    url: '/ping',
    data: undefined
  },
  request: <ref *1> Writable {
    _events: {
      close: undefined,
      error: [Function: handleRequestError],
      prefinish: undefined,
      finish: undefined,
      drain: undefined,
      response: [Function: handleResponse],
      socket: [Function: handleRequestSocket]
    },
    _writableState: WritableState {
      highWaterMark: 65536,
      length: 0,
      corked: 0,
      onwrite: [Function: bound onwrite],
      writelen: 0,
      bufferedIndex: 0,
      pendingcb: 0,
      [Symbol(kState)]: 17580812,
      [Symbol(kBufferedValue)]: null
    },
    _maxListeners: undefined,
    _options: {
      maxRedirects: 21,
      maxBodyLength: Infinity,
      protocol: 'http:',
      path: '/ping',
      method: 'GET',
      headers: [Object: null prototype],
      agents: [Object],
      auth: undefined,
      family: undefined,
      beforeRedirect: [Function: dispatchBeforeRedirect],
      beforeRedirects: [Object],
      hostname: 'localhost',
      port: '55490',
      agent: undefined,
      nativeProtocols: [Object],
      pathname: '/ping'
    },
    _ended: true,
    _ending: true,
    _redirectCount: 0,
    _redirects: [],
    _requestBodyLength: 0,
    _requestBodyBuffers: [],
    _eventsCount: 3,
    _onNativeResponse: [Function (anonymous)],
    _currentRequest: ClientRequest {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      destroyed: false,
      _last: true,
      chunkedEncoding: false,
      shouldKeepAlive: true,
      maxRequestsOnConnectionReached: false,
      _defaultKeepAlive: true,
      useChunkedEncodingByDefault: false,
      sendDate: false,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      strictContentLength: false,
      _contentLength: 0,
      _hasBody: true,
      _trailer: '',
      finished: true,
      _headerSent: true,
      _closed: false,
      _header: 'GET /ping HTTP/1.1\r\n' +
        'Accept: application/json, text/plain, */*\r\n' +
        'User-Agent: axios/1.7.7\r\n' +
        'Accept-Encoding: gzip, compress, deflate, br\r\n' +
        'Host: localhost:55490\r\n' +
        'Connection: keep-alive\r\n' +
        '\r\n',
      _keepAliveTimeout: 0,
      _onPendingData: [Function: nop],
      agent: [Agent],
      socketPath: undefined,
      method: 'GET',
      maxHeaderSize: undefined,
      insecureHTTPParser: undefined,
      joinDuplicateHeaders: undefined,
      path: '/ping',
      _ended: false,
      res: null,
      aborted: false,
      timeoutCb: [Function: emitRequestTimeout],
      upgradeOrConnect: false,
      parser: null,
      maxHeadersCount: null,
      reusedSocket: false,
      host: 'localhost',
      protocol: 'http:',
      _redirectable: [Circular *1],
      [Symbol(shapeMode)]: false,
      [Symbol(kCapture)]: false,
      [Symbol(kBytesWritten)]: 0,
      [Symbol(kNeedDrain)]: false,
      [Symbol(corked)]: 0,
      [Symbol(kChunkedBuffer)]: [],
      [Symbol(kChunkedLength)]: 0,
      [Symbol(kSocket)]: [Socket],
      [Symbol(kOutHeaders)]: [Object: null prototype],
      [Symbol(errored)]: null,
      [Symbol(kHighWaterMark)]: 65536,
      [Symbol(kRejectNonStandardBodyWrites)]: false,
      [Symbol(kUniqueHeaders)]: null
    },
    _currentUrl: 'http://localhost:55490/ping',
    [Symbol(shapeMode)]: true,
    [Symbol(kCapture)]: false
  },
  cause: Error: read ECONNRESET
      at TCP.onStreamRead (node:internal/stream_base_commons:216:20) {
    errno: -54,
    code: 'ECONNRESET',
    syscall: 'read'
  }
}
Expected port: 55491 vs actual port: 55490
--------------------------------------------------------------------------------
Run 9
Creating network a
Creating network b
Starting ping-pong container
Connecting container to network b
pong
--------------------------------------------------------------------------------
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