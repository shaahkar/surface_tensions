// This example uses MediaRecorder to record from an audio and video stream, and uses the
// resulting blob as a source for a video element.
//
// The relevant functions in use are:
//
// navigator.mediaDevices.getUserMedia -> to get the video & audio stream from user
// MediaRecorder (constructor) -> create MediaRecorder instance for a stream
// MediaRecorder.ondataavailable -> event to listen to when the recording is ready
// MediaRecorder.start -> start recording
// MediaRecorder.stop -> stop recording (this will generate a blob of data)
// URL.createObjectURL -> to create a URL from a blob, which we use as video src

//------FLAGS------
var dataSnapShotFlag = 0;
var consoleFlag = 1;
//-----------------
//------LOCATION-----
var lat, lon;

//------------------
var downloadVideoButton, downloadScriptButton, pauseButton, resumeButton,
filteredStream, liveVideo, liveStream, recorder, canvas;
var dataArray = [];
const FPS = 30;
const begin = Date.now();
//---------------------------------------------------

var recordButton, stopButton, recorder, liveStream;

//---------VIDEO NAMING VARIABLES--------------------

var originTimeStamp, endTimeStamp,
startLon, startLat, endLon, endLat;

//---------------------------------------------------


//-------CSV FILE HEADERS------
var headers = {
  vTime: 'VideoTime'.replace(/,/g, ''), // remove commas to avoid errors
  cDate: "Date",
  cTime: "Time",
  lat: "Latitude",
  lon: "Longitude"
};
var fileTitle = 'orders'; // or 'my-unique-title'
//---------------------------------------------------
//-----TIMER VARIABLE---
var time = 0;
var videoLengthTimerStartFlag = 0;
var videoLengthTimerStopFlag = 1;
//---------------------------------------------------

window.onload = function () {
  canvas = document.getElementById('canvas');
  
  recordButton = document.getElementById('record');
  stopButton = document.getElementById('stop');
  //------------
  downloadVideoButton = document.getElementById('downloadvideo');
  downloadScriptButton = document.getElementById('downloadscript');
  pauseButton = document.getElementById('pause');
  resumeButton = document.getElementById('resume');
  
  //------------

  // get video & audio stream from user
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
    mimeType: "video/mp4",
  })
  .then(function (stream) {
    liveStream = stream;

    liveVideo = document.getElementById('live');
    liveVideo.srcObject = stream;
    liveVideo.play();
    //--------
    setTimeout(snap, 0);
    setTimeout(dataSnapShot, 0);
    getLocation();
    //--------

    recordButton.disabled = false;
    recordButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);

    //-------------
    downloadVideoButton.addEventListener('click', downloadVideo);
    pauseButton.addEventListener('click', pause);
    resumeButton.addEventListener('click', resume);
    downloadScriptButton.addEventListener('click', function () {
      exportCSVFile(headers,dataArray,fileTitle )
    }, false);
    //-------------
  });
};

function startRecording() {
  //------------
  filteredStream = canvas.captureStream();
  // filteredStream.addTrack(liveStream.getAudioTracks()[0]);
  recorder = new MediaRecorder(filteredStream);
//---------------
  recorder.addEventListener('dataavailable', onRecordingReady);

  recordButton.disabled = true;
  stopButton.disabled = false;
  //---------------------
  downloadVideoButton.disabled = true;
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  //--------------------

  recorder.start();
  if(consoleFlag == 1){
    console.log("Recorder state at PLAY is " + recorder.state);
  }

  dataSnapShotFlag = 1;

  originTimestamp = offerDate();
  if(consoleFlag==1){
    console.log("originTimeStamp is " + originTimestamp);
  }

  startLon = lon;
  startLat = lat;
  if(consoleFlag==1){
    console.log("startLon is " + lon + " and startLat is " + lat);
  }

  videoLengthTimerStartFlag = 1;
  if(videoLengthTimerStartFlag==1){
    videoLengthTimerStopFlag = 0;
    timer();
  }
}

function stopRecording() {

  // Stopping the recorder will eventually trigger the 'dataavailable' event and we can complete the recording process
  recorder.stop();
  if(consoleFlag == 1){
    console.log("Recorder state at STOP is " + recorder.state);
  }

  dataSnapShotFlag = 0;

  endTimestamp = offerDate();
  if(consoleFlag==1){
    console.log("endTimeStamp is " + endTimestamp);
  }

  endLon = lon;
  endLat = lat;
  if(consoleFlag==1){
    console.log("endLon is " + lon + " and endLat is " + lat);
  }

  pauseButton.disabled = true;
  recordButton.disabled = false;
  stopButton.disabled = true;
  //---------------------
  downloadVideoButton.disabled = false;
  downloadScriptButton.disabled = false;
  //--------------------

  videoLengthTimerStartFlag = 0;
  if(videoLengthTimerStartFlag==0){
    time = 0;
    videoLengthTimerStopFlag = 1;
    
  }
  
}

function onRecordingReady(e) {
   video = document.getElementById('recording');
  // e.data contains a blob representing the recording
  video.src = URL.createObjectURL(e.data);
  // video.play();
}

//------------------------------------------------------
//------------------------------------------------------

function snap(){
  canvas = document.getElementById('canvas');
  canvas.srcObject = filteredStream;


  date = new Date();
   
  canvas.width = liveVideo.videoWidth;
  canvas.height = liveVideo.videoHeight;
  ctx = canvas.getContext('2d');

  //Text on Canvas
  ctx.font = "23px Arial";
  ctx.drawImage(liveVideo, 0, 0, canvas.width, canvas.height);
  ctx.fillText(String(date), 10, 25);
  ctx.fillText("LAT=" + String(lat), 10, 50);
  ctx.fillText("LON=" + String(lon), 200, 50);
  ctx.fillText("EPOH=" + Date.now(), 390, 50);
  

  //loopback
  const delay = 1000/FPS - (Date.now() - begin);
  setTimeout(snap, delay);

}

function dataSnapShot(){
  if(dataSnapShotFlag == 1){
    dataArray.push(generateDataObject());
    getLocation();
    if(consoleFlag == 1){
      console.log(dataArray);
    }
  }
  setTimeout(dataSnapShot, 3000);
}

function generateDataObject(){

  // var pFrame = $('#stopwatch').text();
  var datetime = new Date();
  
      var dateObj = {
                frame:null,
                date:null, 
                time:null,
                lat:null,
                lon:null
              };
    
       datee = datetime.getDate()
       month =datetime.getMonth() + 1 
       year = datetime.getFullYear()
       hours =datetime.getHours()
       mins = datetime.getMinutes()
       sec = datetime.getSeconds()
      jsondate = datee+'/'+month+'/'+year;
      jsonTime = hours+':'+mins+':'+sec;
      jsonLat = lat;
      jsonLon = lon;
      pFrame = time;
  
      dateObj = {
            frame : pFrame,
            date : jsondate,
            time : jsonTime,
            lat : lat,
            lon : lon
              };
  
      return dateObj; 
  
  }

function downloadVideo(){
  a = document.createElement('a');
  // a.style.display = 'none';
  a.href = video.src;
  a.download = 'newfile';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(video.src);
    //---------------------
  downloadVideoButton.disabled = true;
    //--------------------
  }, 100);

}

function pause(){
  recorder.pause();
  if(consoleFlag == 1){
    console.log("Recorder state at PAUSE is " + recorder.state);
  }
  dataSnapShotFlag = 0;
  pauseButton.disabled = true;
  resumeButton.disabled = false;
  stopButton.disabled = true;

  videoLengthTimerStartFlag = 0;
  if(videoLengthTimerStartFlag==0){
    videoLengthTimerStopFlag = 1;
  }

}

function resume(){
  recorder.resume();
  if(consoleFlag == 1){
    console.log("Recorder state at RESUME is " + recorder.state);
  }
  dataSnapShotFlag = 1;
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  stopButton.disabled = false;

  videoLengthTimerStartFlag = 1;
  if(videoLengthTimerStartFlag==1){
    videoLengthTimerStopFlag = 0;
    timer();
  }
}

//-----LOCATION------
function getLocation(){
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
     console.log('not suppored');
  }
}

function showPosition(position){
  lon = position.coords.longitude;
  lat = position.coords.latitude;
  if(consoleFlag==1){
    console.log("Latitude and Longitude is " + lat +' '+lon)
  }

}

//----------------------

function offerDate(){
  var datetime = new Date();
  var timeStamp;
  var datee = datetime.getDate()
  var month =datetime.getMonth() + 1 
  var year = datetime.getFullYear()
  var hours =datetime.getHours()
  var mins = datetime.getMinutes()
  var sec = datetime.getSeconds()
  timeStamp = '#'+datee+'/'+month+'/'+year+'_'+hours+':'+mins+':'+sec;
  return timeStamp;
}

//-------------EXPORTING VIDEO SCRIPT------------------


function exportCSVFile(headers, items, fileTitle) {
  if (headers) {
      dataArray.unshift(headers);
  }

  var csv = this.convertToCSV(items);
  // console.log('csv is ' + csv)

  var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilenmae);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          downloadScriptButton.disabled = true;
      }
  }
}

function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
          if (line != '') line += ','

          line += array[i][index];
      }

      str += line + '\r\n';
  }

  return str;
}

function timer(){
  time ++;
  console.log("time is " + time);
  if(videoLengthTimerStopFlag==0){
    setTimeout(timer,1000)
  }
  
}