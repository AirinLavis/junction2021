const express = require('express')
const app = express()
const request = require('request');
var bodyParser = require('body-parser');
const { response } = require('express');
const {spawn} = require('child_process');
const {PythonShell} = require('python-shell');
const fetch = require('node-fetch')

const authToken = "kd03LcLI2W0jaotIxTSrQyqeKq8"
const board_id = "o9J_lhrJgtU%3D"

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


app.get('/', (req, res) => {
  
  const options = {
    method: 'GET',
    url: process.env.MIRO_URL+board_id,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer '+authToken
    }
  };
  
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
  
    // console.log(body);
    var resp = JSON.parse(body);
    res.send('Hello World! See your Miro board <a href='+resp.viewLink+' target="_blank">here</a>')
  });
})

// app.get('/test/findtag', async (req, res) => {
//   // console.log()
//   var r = await findTag('random_other').then((tag) => {
//     res.send(tag)
//     // resolve(tag)
//   });
  
// })

app.get('/get_tags', (req, res) => {
  let options = {
    mode: 'text',
    pythonOptions: [], // get print results in real-time
      scriptPath: 'scripts', //If you are having python_test.py script in same folder, then it's optional.
  };

  PythonShell.run('test_requests.py', options, function (err, result){
      if (err) throw err;
      // result is an array consisting of messages collected
      //during execution of script.
      var jsonFile = "";
      result.forEach((row) => {
        jsonFile += row;
      })
      res.send(JSON.parse(jsonFile))
  });
})

app.get('/create/note_tn', (req, res) => {

  // First, we create the sticky note
  var note = createNote().then((note_data) => {
    var uid = note_data.createdBy.id;
    var noteId = note_data.id
    var createdAt = note_data.createdAt;
    getUserInfo(uid)
    .then((user_info) => {
      findTag(user_info.name)
      .then((tag_data) => {
        attachTagToNote(noteId, tag_data.id)
      })
    })
  })
})

function createNote() {
  const options = {
    method: 'POST',
    url: process.env.MIRO_URL+board_id+'/sticky_notes',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+authToken
    },
    body: {
      data: {content: 'Created via API TEST'},
      style: {backgroundColor: 'green', textAlign: 'center', textAlignVertical: 'top'},
      geometry: {x: '0.0', y: '0.0', width: '200', rotation: '0'}
    },
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) reject(error);
      var resp = body;
      resolve(resp);
    });
  })
}

async function findTag(tag_title) {
  var resp = await fetchTags();
  return new Promise((resolve, reject) => {
    found = resp.find((tt) => {
      return tt.title == tag_title;
    })
    resolve(found);
  }).then((found) => {
    if (typeof(found) == 'undefined') {
      found = createTag(tag_title).then((tag_data) => {
        return tag_data
      })
    }
    return found
  })
}

async function fetchTags() {
  var tags = await fetch(process.env.URL+'get_tags')
  var data = await tags.json();
  return data;
}

function createTag(tag_title, is_date = false) {
  const options = {
    method: 'POST',
    url: process.env.MIRO_URL+board_id+'/tags',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+authToken
    },
    body: {color: is_date ? 'gray' : 'yellow', title: tag_title},
    json: true
  };
  return new Promise ((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) reject(error);
      resolve(JSON.parse(body));
    });
  })
}

function getUserInfo(uid) {
  const options = {
    method: 'GET',
    url: process.env.MIRO_URL+board_id+'/members/'+uid,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer '+authToken
    }
  };
  
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) reject(error);
      
      resolve(JSON.parse(body))
    });
  })
}

function attachTagToNote(item_id, tag_id) {
  const options = {
    method: 'POST',
    url: process.env.MIRO_URL+board_id+'/widgets/'+item_id+'?tag_id='+tag_id,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+authToken
    }
  };
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) reject(error);
      var resp = body;
      resolve(resp)
    });
  })
  
}


app.listen(process.env.PORT || 3787, 
	() => console.log("Server is running..."));