const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001; 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/src'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/src' + '/index.html');
});
app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/src' + '/404.html');
});


app.listen(port, () => console.log(`Listening on port ${port}`));