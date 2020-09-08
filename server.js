const https = require('https')
const http = require('http')
const express = require('express')
const fs = require('fs')
const app = require('express')();
const path = require('path')
const host = '127.0.0.1';
const port = 5000;

app.set('views', path.join(__dirname, '/'))
app.set('view engine', 'html');

app.use(express.static('public'));

//ssl 인증서 적용시
// const options = {
//     key  : fs.readFileSync('./ssl/ktgenie.key'),
//     cert : fs.readFileSync('./ssl/ktgenie_cert.pem'),
//     ca: fs.readFileSync('./ssl/RootCA.crt'),
//     passphrase: 'kpoint'
// };

// https.createServer(options, app).listen(port, host, () => {
    http.createServer(app).listen(port, host, () => {
    console.log(`Server running at https://${host}:${port}/`)
});
