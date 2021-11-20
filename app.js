const express = require('express')
const app = express()
const request = require('request');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


app.get('/', (req, res) => {
  // res.send('Hello World!')
  const options = {
    method: 'GET',
    url: 'https://api.miro.com/v2/boards/o9J_lhrJgtU%3D',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer T89n48o2pwdDCeMAovBY7_EJmBU'
    }
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  
    console.log(body);
  });
})


app.listen(process.env.PORT || 3787, 
	() => console.log("Server is running..."));