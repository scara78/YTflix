const express = require('express'),
 fs = require('fs'),
 ytdl = require('ytdl-core'),
 base_url = "http://www.youtube.com/watch?v=",
 api = express(),
 pump = require('pump'),
 rangeParser = require('range-parser'),
 cp = require('child_process'),
 stream = require('stream'),
 ffmpegPath = require('ffmpeg-static');


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

// Api endpoint for streaming any youtube video with seperate video/audio tracks
// provide no type to get duplex stream as an http response
// you need to combine video and audio on the client side 

api.all('/youtube/:videoId/:type',validateLink , async (req, res) => {
    

        var 
          id = req.params.videoId,
          type = req.params.type,
          link = base_url+id,
          params = {};


        var info = await ytdl.getInfo(link);
        var format;
        var title = info.videoDetails.videoId;  

        if (type) {
          if (type == 'video') {            
            params.quality = req.query.quality || "highestvideo";
          } 
          else if (type == 'audio'){ 
            params.quality = '140';
            params.dlChunkSize = 0;
            params.highWaterMark = 1024 * 1024 * 512;
          }

          try {
          
            format = ytdl.chooseFormat(info.formats, params);
            if (!format.contentLength) {
              quality = "highestvideo";
              format = ytdl.chooseFormat(info.formats, params);
            }
  
          } catch (error) {
            res.sendStatus(404)
          }
        }
        
        else {
          try {
          
            format = ytdl.chooseFormat(info.formats, params);
            if (!format.contentLength) {
              quality = "highest";
              format = ytdl.chooseFormat(info.formats, params);
            }
  
          } catch (error) {
            res.sendStatus(404)
          }
        } 

        

        var totalSize = format.contentLength;
        console.log(id);

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
            return pump(ytdl(link , params), res);
          }
        res.statusCode = 206;
        res.setHeader('Content-Length', range.end - range.start + 1);
        res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + totalSize);
        if (req.method === 'HEAD') {
            return res.end();
        }
        params.range = {start : range.start , end : range.end}
        pump(ytdl(link ,  params), res);
   
    
  });

api.all('/youtube/:videoId/',validateLink , async (req, res) => {
    

        var 
          id = req.params.videoId,
          type = req.query.type,
          link = base_url+id,
          params = {};


        var info = await ytdl.getInfo(link);
        var format;
        var title = info.videoDetails.videoId;

        if (type == 'video') {             
          params.quality = req.query.quality || "highestvideo";
        } 
        else if (type == 'audio'){ 
          params.quality = '140';
          params.dlChunkSize = 0;
          params.highWaterMark || 1024 * 512;
        }
        else {
          
        } 

        try {
          
          format = ytdl.chooseFormat(info.formats, params);
          if (!format.contentLength) {
            quality = "highestvideo";
            format = ytdl.chooseFormat(info.formats, params);
          }

        } catch (error) {
          res.sendStatus(404)
        }

        var totalSize = format.contentLength; 
        console.log(id);

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
            return pump(ytdl(link , params), res);
          }
        res.statusCode = 206;
        res.setHeader('Content-Length', range.end - range.start + 1);
        res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + totalSize);
        if (req.method === 'HEAD') {
            return res.end();
        }
        params.range = {start : range.start , end : range.end}
        pump(ytdl(link ,  params), res);
   
    
  });

/*
    ----- Download functionality is still on working progress
*/

/*api.get('/download/:videoId/' , validateLink , async (req , res)=>{
  const ytMixer = (link , options) =>{
  const result = new stream.PassThrough({ highWaterMark: (options)
    .highWaterMark || 1024 * 512 });
    ytdl.getInfo(link, options).then(info => {
        let audioStream = ytdl.downloadFromInfo(info, { ...options, quality: 
    'highestaudio' });
        let videoStream = ytdl.downloadFromInfo(info, { ...options, quality: 
    'highestvideo' });
        // create the ffmpeg process for muxing
        let ffmpegProcess = cp.spawn(ffmpegPath, [
            // supress non-crucial messages
            '-loglevel', '8', '-hide_banner',
            // input audio and video by pipe
            '-i', 'pipe:3', '-i', 'pipe:4',
            // map audio and video correspondingly
            '-map', '0:a', '-map', '1:v',
            // no need to change the codec
            '-c', 'copy',
            // output mp4 and pipe
            '-f', 'matroska', 'pipe:5'
        ], {
            // no popup window for Windows users
            windowsHide: true,
            stdio: [
                // silence stdin/out, forward stderr,
                'inherit', 'inherit', 'inherit',
                // and pipe audio, video, output
                'pipe', 'pipe', 'pipe'
            ]
        });
        audioStream.pipe(ffmpegProcess.stdio[3]);
        videoStream.pipe(ffmpegProcess.stdio[4]);
        ffmpegProcess.stdio[5].pipe(result);
    });
    return result;
  }

  var id = req.params.videoId;
  var link = base_url+id;

  res.type("video/mp4");
  pump(ytMixer(link , {}) , res)
})*/

  module.exports = api; 