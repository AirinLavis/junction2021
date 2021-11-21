const express = require('express')
const app = express()
const request = require('request');
var bodyParser = require('body-parser');
// const {PythonShell} = require('python-shell');
const fetch = require('node-fetch')

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const MIRO_URL = process.env.MIRO_URL || "https://api.miro.com/v2/boards/"

const authToken = process.env.TOKEN || "kd03LcLI2W0jaotIxTSrQyqeKq8"
const board_id = process.env.BOARD_ID || "o9J_lhrJgtU%3D"

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


app.get('/', (req, res) => {
  
  const options = {
    method: 'GET',
    url:MIRO_URL+board_id,
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

// app.get('/get_alltags', (req, res) => {
  // let options = {
  //   mode: 'text',
  //   pythonOptions: [], // get print results in real-time
  //     scriptPath: 'scripts', //If you are having python_test.py script in same folder, then it's optional.
  // };

  // PythonShell.run('test_requests.py', options, function (err, result){
  //     if (err) throw err;
  //     // result is an array consisting of messages collected
  //     //during execution of script.
  //     var jsonFile = "";
  //     result.forEach((row) => {
  //       jsonFile += row;
  //     })
  //     res.send(JSON.parse(jsonFile))
  // });
const tags = '[{"id": "3074457368034420360", "color": "red", "title": "bitcoin"}, {"id": "3074457368044185926", "color": "yellow", "title": "random"}, {"id": "3074457368044186172", "color": "yellow", "title": "test_tag_12"}, {"id": "3074457368045666083", "color": "yellow", "title": "2021-11-20 19:44:54"}, {"id": "3074457368045666128", "color": "yellow", "title": "2021-11-20 19:45:10"}, {"id": "3074457368045666556", "color": "yellow", "title": "2021-11-20 19:47:35"}, {"id": "3074457368045782101", "color": "yellow", "title": "2021-11-20 19:50:38"}, {"id": "3074457368046511484", "color": "red", "title": "Excuses"}, {"id": "3074457368046640692", "color": "yellow", "title": "random_other"}, {"id": "3074457368046641479", "color": "yellow", "title": "Irina"}, {"id": "3074457368046789263", "color": "red", "title": "3074457368031540864"}, {"id": "3074457368048468833", "color": "red", "title": "2021-11-20 22:13:2"}, {"id": "3074457368048469289", "color": "red", "title": "2021-11-20 22:16:22"}, {"id": "3074457368048469497", "color": "red", "title": "2021-11-20 22:17:53"}, {"id": "3074457368048577790", "color": "yellow", "title": "2021-11-20 22:18:52"}, {"id": "3074457368048578195", "color": "yellow", "title": "2021-11-20 22:20:36"}, {"id": "3074457368048578290", "color": "red", "title": "2021-11-20 22:21:12"}]'
//   res.send(JSON.parse(tags))
// })

app.get('/create/note_tn', async (req, res) => {

  // First, we create the sticky note
  var note = await createNote().then((note_data) => {
    var uid = note_data.createdBy.id;
    var noteId = note_data.id
    var createdAt = note_data.createdAt;
    getUserInfo(uid)
    .then((user_info) => {
      findTag(user_info.name)
      .then((tag_data) => {
        attachTagToNote(noteId, tag_data.id)
        .then(
          attachTagToNote(noteId, '3074457368046511484')
        )
        .then(res.send('Note created!'))
      })
    })
  })
})

async function fetchContent() {
  var ret = await fetch("http://programmingexcuses.com/")
    .then( async (res) => {
      var text = await res.text();
      var j = new JSDOM(text);
      var m = j.window.document.querySelector("center").textContent;
      return m;
    }).catch(err => console.log(err))
    return ret;
}

app.get('/fetch_content', async (req, res) => {
  var result = await fetchContent();
  console.log(result)
  res.send(result)
})

async function createNote() {
  var note_content = await fetchContent();
  const options = {
    method: 'POST',
    url:MIRO_URL+board_id+'/sticky_notes',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+authToken
    },
    body: {
      data: {content: note_content},
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
  // var resp = await fetchTags();
  var resp = JSON.parse(tags);
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
  var url = process.env.URL || "http://127.0.0.1"
  var tags = await fetch(url+'get_alltags')
  var data = await tags.text();

  return data;
}

function createTag(tag_title, is_date = false) {
  const options = {
    method: 'POST',
    url:MIRO_URL+board_id+'/tags',
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
    url:MIRO_URL+board_id+'/members/'+uid,
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
    url:MIRO_URL+board_id+'/widgets/'+item_id+'?tag_id='+tag_id,
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