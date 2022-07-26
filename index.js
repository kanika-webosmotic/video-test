const express = require('express');
const dotenv = require('dotenv');
const app = express();
const fs = require('fs');
dotenv.config();
// var https = require('https');
// var privateKey = fs.readFileSync('./sslcert/selfsigned.key', 'utf8');
// var certificate = fs.readFileSync('./sslcert/selfsigned.crt', 'utf8');

// var httpsServer = https.createServer(
//   { key: privateKey, cert: certificate },
//   app
// );

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/video.mp4', function (req, res) {
  console.log('got video', {
    req: req,
    res: res,
  });
  // Ensure there is a range given for the video
  const range = req.headers.range || '0-';
  if (!range) {
    res.status(400).send('Requires Range header');
  }

  const videoPath = 'download.mp4';
  const videoSize = fs.statSync('download.mp4').size;

  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(process.env.PORT || 5000, function () {
  console.log('Listening on port 5000!', process.env.PORT);
});

// httpsServer.listen(8443, function () {
//   console.log('https');
// });
