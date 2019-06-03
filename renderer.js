// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var fs = require('fs')
var counterfolder=1;
var recordingPath = "./Recordings/";



if (!fs.existsSync(recordingPath))
{
    fs.mkdirSync(recordingPath);
}

var webcamCounter = 0;
var mediaDeviceInfos = []; //Stores the avaliable media devices
var mediaObjects = []; //A list of the created media recorders
var selectedcam = 1;



//var stopBtn = document.getElementById("stopBtn");
//stopBtn.disabled = true;
  var currentvalue = "";
function recordingbutton(){
  currentvalue = document.getElementById('recordBtn').value;
  if(currentvalue === "Start"){
    document.getElementById("recordBtn").value="Stop";
    document.getElementById("State").innerHTML="Stop";
    document.getElementById("recordBtn").className = "stoprecordBtn";
    startRecording();
  }
  else{
    document.getElementById("recordBtn").value="Start";
    document.getElementById("State").innerHTML="Start";
    document.getElementById("recordBtn").className = "startrecordBtn";
    stopRecording();
  }
}

var recordbutton = document.getElementById("recordBtn");
recordbutton.onclick= recordingbutton ;

function startRecording(){

//Check input content
//var fileCreationTimestamp = convertUTCDateToLocalDate(new Date(date_string_you_received));
var fileCreationTimestamp = new Date();
 var recordingName = "";
 var inputFolderElement = document.getElementById("foldername");
 if(inputFolderElement && inputFolderElement.value !== "")
 {
   recordingName = inputFolderElement.value + "_";
 }

  for(var i = 0; i !== mediaObjects.length; i++){
    mediaObjects[i].outFile = recordingPath+fileCreationTimestamp+'_'+recordingName+"Recording_Webcam_"+webcamCounter;
    console.log(mediaObjects[i]);
    var mediaRecorder = mediaObjects[i].recorder;
    mediaRecorder.start(1000);
    webcamCounter += 1; //Increment the global media recorder counter

  }

  //recordBtn.style.background = "";
  //recordBtn.style.color = "";
  //recordBtn.disabled = true;
  //recordBtn.innerHTML = "Recording";

  //stopBtn.disabled = false;

  console.log("Recordings started");


  //Json file creation and data saving

let  dataset= {  
    Time: fileCreationTimestamp,
    Name: recordingName, 
    Folder_name: inputFolderElement,
    department: 'English',
    car: 'Honda' 
};

let data = JSON.stringify(dataset, null, 2);  
fs.writeFileSync('dataset1.json', data);





}
//recordBtn.onclick = startRecording;

function stopRecording(){
  for(var i = 0; i !== mediaObjects.length; i++){
    var mediaRecorder = mediaObjects[i].recorder;
    mediaRecorder.stop();
  }
  //recordBtn.style.background = "";
  //recordBtn.style.color = "";
  //recordBtn.disabled = false;
  //recordBtn.innerHTML = "Record";

  //stopBtn.disabled = true
}
//stopBtn.onclick = stopRecording;

function gotDevices(deviceInfos) {
  mediaDeviceInfos  = deviceInfos;
  createMediaObject();
}
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(
  function(err) {
     console.log('The following getUserMedia error occured: ' + err);
   }
);

function onMediaSourceChanged(ev){
  for(var i = 0; i !== mediaObjects.length; i++){
    if(mediaObjects[i].videoSelector === ev.target || mediaObjects[i].audioSelector === ev.target){
     //newcont.deviceId = mediaObjects[i].videoSelector.value;
      console.log("Refreshing media after changes");
      //console.log("After changes "+ newcont.deviceId);
      setupMediaRecorder(mediaObjects[i]);
      break;
    }
  }
}

//Creates HTML elements to display and select video and audio options for recording
function createMediaObject(){
  //Create a container for the new MediaRecorder
  var videoRecorderDiv = document.createElement("DIV");
  videoRecorderDiv.classList.add("listing");
  //Create the element to display and record a video feed
  var videoElement = document.createElement("VIDEO"); //The new Video element
    videoElement.classList.add("videos");
  videoElement.muted = true; //Mute the video otherwise we get a feedback loop while recording if sound is on
  //Append the media options to the video container
  videoRecorderDiv.appendChild(videoElement);
  var mediaObject = {};

  //Create the elements to select video and audio sources
  var mediaOptionsDiv = document.createElement("DIV"); //Create a container for the new MediaRecorder
  var videoSourceSelector = document.createElement("SELECT");
  videoSourceSelector.classList.add("select-style");
  videoSourceSelector.addEventListener("change", onMediaSourceChanged.bind(mediaObject));
  mediaOptionsDiv.appendChild(videoSourceSelector);
  var audioSourceSelector = document.createElement("SELECT");
  audioSourceSelector.classList.add("select-style");
  audioSourceSelector.addEventListener("change", onMediaSourceChanged.bind(mediaObject));
  mediaOptionsDiv.appendChild(audioSourceSelector);


  //Populate the selection options
  fillMediaRecorderSelectorOptions(videoSourceSelector, audioSourceSelector);

  //Append the media options to the video container
  videoRecorderDiv.appendChild(mediaOptionsDiv);

  //Create a media object that has the information we need to operate on the video stream later
  mediaObject.videoElement = videoElement;
  mediaObject.videoSelector = videoSourceSelector;
  mediaObject.audioSelector = audioSourceSelector;
  mediaObject.recordingNmb = 0;

  mediaObjects.push(mediaObject);


  //Append the created elements to the document
  document.getElementById("mediaContainerDiv").appendChild(videoRecorderDiv);
  console.log(mediaObject.videoSelector);
  //Initial setup of the media recorder

if (selectedcam === mediaObject.videoSelector.length){

   console.log(mediaObject.videoSelector.selectedIndex);
  //newcont.deviceId = mediaObject.videoSelector.options[mediaObject.videoSelector.selectedIndex].value;
  //console.log(newcont);
   setupMediaRecorder(mediaObject);
 }
else if (selectedcam < mediaObject.videoSelector.length)
{
  mediaObject.videoSelector.selectedIndex = selectedcam ;
  selectedcam += 1;
  console.log(mediaObject.videoSelector.selectedIndex);

  //newcont.deviceId = mediaObject.videoSelector.options[mediaObject.videoSelector.selectedIndex].value;
  //console.log(newcont);
  setupMediaRecorder(mediaObject);
  createMediaObject();

}
}


//Sets up the preview and prepares the recording of the media object
function setupMediaRecorder(mediaObject){
  var videoConstraints = {};
  var audioConstraints = {};
  //Setup the video constraints

  videoConstraints.deviceId = mediaObject.videoSelector.options[mediaObject.videoSelector.selectedIndex].value//newcont.deviceId;
  console.log(videoConstraints.deviceId);
  //videoConstraints.videoFrameRate = 30;
  //videoConstraints.videoEncodingBitRate = 3000000;
  //Setup the audio constraints
  var bitDepth = 16;
  var sampleRate = 44100;
  var bitRate = sampleRate * bitDepth;
  audioConstraints.deviceId = mediaObject.audioSelector.options[mediaObject.audioSelector.selectedIndex].value;
  //audioConstraints.encodingBitRate = bitRate;
  //audioConstraints.samplingRate = sampleRate;

  navigator.mediaDevices.getUserMedia(
    { video: videoConstraints,
      audio: audioConstraints}).then(function(stream) {

      const blobs = [];

      const blob_reader = new FileReader();

      var storage_stream = null;
      var first = true;

      blob_reader.addEventListener("load", function(ev) {
          if(first){
            storage_stream = require("fs").createWriteStream(mediaObject.outFile+"_rec"+mediaObject.recordingNmb+".webm");
            mediaObject.stream = storage_stream;
            first = false;
          }

          storage_stream.write(Buffer.from(ev.currentTarget.result));
          if(blobs.length) {
              ev.currentTarget.readAsArrayBuffer(blobs.shift());
          }
      });

      var types = ["video/webm",
             "audio/webm",
             "video/webm\;codecs=vp8", //Seems to work well, can fix the header in a second
             "video/webm\;codecs=daala", //Not supported (My machine)
             "video/webm\;codecs=h264", //Works, but can't fix header without transcoding the whole video (Takes a long time)
             "audio/webm\;codecs=opus",
             "video/mpeg"]; //Not supported (My machine)

      for (var i in types) {
        console.log( "Is " + types[i] + " supported? " + (MediaRecorder.isTypeSupported(types[i]) ? "Maybe!" : "Nope :("));
      }

      const codec = "video/webm\;codecs=vp8";
      const recorder = new MediaRecorder(stream, {
        mimeType: codec,
      });
      mediaObject.recorder = recorder;
      recorder.addEventListener("dataavailable", function(ev) {
          if(blob_reader.readyState != 1) {
            console.log(ev.data);
            blob_reader.readAsArrayBuffer(ev.data);
          } else {
            blobs.push(ev.data);
          }
      });

      recorder.addEventListener("stop", mediaRecorderStopped.bind(event, mediaObject));

      //Stream preview
      mediaObject.videoElement.srcObject = stream;
      mediaObject.videoElement.load();
      mediaObject.videoElement.play();
  });
}

var stoppedRecordings = 0;
//called when the attached media recorder stops recording
function mediaRecorderStopped(mediaObject, ev){
  console.log("Recording stopped");

  stoppedRecordings += 1;
  //All recordings have been stopped
  if(stoppedRecordings === mediaObjects.length){
    allRecordersStopped();
    stoppedRecordings = 0;
  }
}

var transcodingsCompleted = 0;
function allRecordersStopped(){
  console.log("All recordings stopped, beginning transcoding of recordings");
  //We use FFMPEG to fix the video header as it is not saved correctly by th media recorder
  var ffmpeg = require('fluent-ffmpeg');
  var command = ffmpeg();

  //iterate over all the media recorder objects, transcode, save and delete old file
  for(var i = 0; i !== mediaObjects.length; i++){
    var mediaObject = mediaObjects[i];
    var savePath = mediaObject.outFile+"_rec"+mediaObject.recordingNmb+"_T.webm"; //.replace(".webm", "T.webm");

    ffmpeg(mediaObject.outFile+"_rec"+mediaObject.recordingNmb+".webm")
    .inputOptions('-sn')
    .outputOptions('-c copy')
    .format('webm')
    .save(savePath)
    .on('end', function(stdout, stderr)
    {
      console.log('Transcoding succeeded !');
      transcodingsCompleted+=1;
      if(transcodingsCompleted === mediaObjects.length){
        transcodingsCompleted = 0;
        //All the transcodings are finished so let's cleanup the tmp video files
        cleanTmpFiles();
      }
    });
  }
}

function cleanTmpFiles(){
  //Reset the media objects in case we want to start a new recording
  for(var i = 0; i !== mediaObjects.length; i++){
    mediaObjects[i].videoElement.pause();
    mediaObjects[i].stream.end();

    fs.unlink(mediaObjects[i].outFile+"_rec"+mediaObjects[i].recordingNmb+".webm", (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    mediaObjects[i].recordingNmb += 1;
    setupMediaRecorder(mediaObjects[i]);
  }
}

function fillMediaRecorderSelectorOptions(videoSelector, audioSelector){
  for (var i = 0; i !== mediaDeviceInfos.length; ++i) {
    var deviceInfo = mediaDeviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;

    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'Camera ' +
        (videoSelector.length + 1);
      videoSelector.appendChild(option);
    }
    else if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label ||
        'Microphone ' + (audioSelector.length + 1);
      audioSelector.appendChild(option);
    }
  }
}

function recordEventRecievedCallback(args){
  console.log(args);
  if(args[0] === "Recording"){
    startRecording();
  }
  else if(args[0] === "Stopped Recording")
  {
    stopRecording();
  }
}

//WAMP
const wamp = require('./wamp.js');
config = {
  ip: "127.0.0.1",
  port: 8080,
  realm: "realm1"
};
wamp.restartWAMP(config, recordEventRecievedCallback);
