const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

const form = new FormData();
form.append('clientId', 'b459ccdb-afa9-4efb-9ced-69a3dfc1191d'); // Using a dummy valid UUID format
form.append('images', fs.createReadStream('test.jpg'));

const request = http.request({
  method: 'post',
  host: 'localhost',
  port: 5000,
  path: '/api/upload/client-images',
  headers: form.getHeaders()
});

form.pipe(request);

request.on('response', function(res) {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

request.on('error', function(error) {
  console.error('Error:', error);
});
