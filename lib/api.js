const express = require('express'),
 fs = require('fs'),
 ytdl = require('ytdl-core'),
 base_url = "http://www.youtube.com/watch?v=",
 api = express(),
 pump = require('pump'),
 rangeParser = require('range-parser');

api.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

function validateLink(req, res, next){
  next();
}

async function checklink(id){
  var link = base_url+id;

  var info = await ytdl.getInfo(link);

  var format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

  //console.log(info);
}

//checklink("xdrgTAt6Qxs");

function findTorrent(req, res, next) {
  var torrent = req.torrent = store.get(req.params.infoHash);
  if (!torrent) {
    return res.sendStatus(404);
  }
  next();
}

api.get('')

// Api endpoint from straming any youtube video 
api.all('/youtube/:videoId',validateLink , async (req, res) => {
    

        var id = req.params.videoId;
        var link = base_url+id;

        var info = await ytdl.getInfo(link);

        var format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

        console.log(format);
        var totalSize = format.contentLength;

        var range = req.headers.range;
        range = range && rangeParser(totalSize, range)[0];
        res.setHeader('Accept-Ranges', 'bytes');
        res.type(format.mimeType);
        req.socket.setTimeout(3600000);

        if (!range) {
            res.setHeader('Content-Length', totalSize);
            if (req.method === 'HEAD') {
              return res.end();
            }
            return pump(ytdl(link , {quality : 'highest'}), res);
          }
        res.statusCode = 206;
        res.setHeader('Content-Length', range.end - range.start + 1);
        res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + totalSize);
        if (req.method === 'HEAD') {
            return res.end();
        }
        pump(ytdl(link , {range : {start : range.start , end : range.end} , quality : 'highest'}), res);
  
    
  });

  module.exports = api;