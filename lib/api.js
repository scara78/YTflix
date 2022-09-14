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
  if (!ytdl.validateID(req.params.videoId)) {
    res.sendStatus(404)
  }
  next();
}


// Api endpoint from streaming any youtube video 

api.all('/youtube/:videoId',validateLink , async (req, res) => {
    

        var id = req.params.videoId;
        var link = base_url+id;

        var info = await ytdl.getInfo(link);

        var quality = req.query.quality || "140";
        
        var format = ytdl.chooseFormat(info.formats, { quality: quality });

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
            return pump(ytdl(link , {quality : quality}), res);
          }
        res.statusCode = 206;
        res.setHeader('Content-Length', range.end - range.start + 1);
        res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + totalSize);
        if (req.method === 'HEAD') {
            return res.end();
        }
        pump(ytdl(link , {range : {start : range.start , end : range.end} , quality : quality}), res);
  
    
  });



  module.exports = api;