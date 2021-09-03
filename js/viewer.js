let supports = navigator.mediaDevices.getSupportedConstraints();

if (!supports["width"] || !supports["height"]) {
    // We're missing needed properties, so handle that error.
} else {
    let constraints = {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080 },
        aspectRatio: 1.777777778};

    myTrack.applyConstraints(constraints).then(function() => {
        /* do stuff if constraints applied successfully */
    }).catch(function(reason) {
        /* failed to apply constraints; reason is why */
    });

var constraints = {audio: false, video: { facingMode: 'environment' }};
attachStream(constraints);

function attachStream(constraints) {
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        video.srcObject = stream;
        document.getElementById('entertainThePeasants').style.display = 'none'
        document.getElementById('viewer').style.display = 'block'
    })
    .catch(err => console.error(err));
}

var canvas = document.getElementById('display'),
    ctx = canvas.getContext('2d');

video.addEventListener('resize', function(e) {
    console.log('video resized');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
});

var lastDimmed = 0,
    msPerDim = 25;

video.addEventListener('playing', blendWithLast, false);
function blendWithLast() {

    var now = performance.now();

    if (lastDimmed == 0) {
        lastDimmed = now;  // Initialisation
    }
    var ptsToDim = Math.floor((now - lastDimmed) / msPerDim);

    if (ptsToDim > 3) {
        ptsToDim = Math.min(ptsToDim, 255);
        // dim old pixels slightly by overlaying slightly-transparent layer 
        ctx.fillStyle = 'RGBA(0,0,0,' + ptsToDim/255 + ')';
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        lastDimmed += ptsToDim * msPerDim;
    }

    // pix = max(new_pix, old_pix (maybe dimmed))
    ctx.globalCompositeOperation = 'lighten'

    // Get a new frame
    ctx.drawImage(video, 0, 0);

    requestAnimationFrame(blendWithLast);
}

takePhotoButton.addEventListener('click', takePhoto);
function takePhoto() {
    ctx.globalCompositeOperation = 'source-over'
    var dWidth = Math.max(canvas.width, canvas.height) * 0.17,
        dHeight = dWidth / logoWatermark.width * logoWatermark.height,
        dx = canvas.width * 0.98 - dWidth,
        dy = canvas.height * 0.98 - dHeight;
    ctx.drawImage(logoWatermark, dx, dy, dWidth, dHeight);
    download('cyclotron.png', canvas.toDataURL('image/png'));
}
takePhotoButton.addEventListener('mousedown', function(){
    takePhotoButton.firstElementChild.src = "img/shutter-pressed.png";
});
takePhotoButton.addEventListener('touchstart', function(){
    takePhotoButton.firstElementChild.src = "img/shutter-pressed.png";
});
window.addEventListener('mouseup', function(){
    takePhotoButton.firstElementChild.src = "img/shutter-button.png";
});
window.addEventListener('touchend', function(){
    takePhotoButton.firstElementChild.src = "img/shutter-button.png";
});

// recordVideoButton.addEventListener('click', recordVideo);
// function recordVideo() {
//     var options = {
//        type: 'canvas'
//     };
//     var recordRTC = RecordRTC(canvas, options);
//     recordRTC.setRecordingDuration(
//         5 * 1000, gifURL => recordRTC.save('bla.webm')
//     );
//     recordRTC.startRecording();
// }

function download(filename, dataURL) {
    var link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
