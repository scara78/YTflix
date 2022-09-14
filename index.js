#!/usr/bin/env node
'use strict';

var STATIC_OPTIONS = { maxAge: 3600000 };

var 

  http = require('http'),
  cors = require('cors'),
  api = require('./lib/api')
    .use(cors());

var server = http.createServer(api);
var port = process.env.PORT || 9500;

server.listen(port).on('error', function (e) {
  if (e.code !== 'EADDRINUSE' && e.code !== 'EACCES') {
    throw e;
  }
  console.error('Port ' + port + ' is busy. Trying the next available port...');
  server.listen(++port);
}).on('listening', function () {
  console.log('Listening on http://localhost:' + port);
});