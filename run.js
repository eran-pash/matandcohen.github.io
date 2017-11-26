Webcam.set({
  width: window.innerWidth,
  height: window.innerHeight,
  dest_width: 640,
  dest_height: 480,
  image_format: 'jpeg',
  jpeg_quality: 90,
  force_flash: false
});

Webcam.attach('#my_camera');

function take_snapshot() {
  Webcam.snap(function (imageCaptured) {
    readingTheImage(imageCaptured);
  });
}



setInterval(take_snapshot, 4000);
window.descriptorLength = 256;
window.matchesShown = 30;
window.blurRadius = 3;


makeblob = function (dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(',');
    var contentType = parts[0].split(':')[1];
    var raw = decodeURIComponent(parts[1]);
    return new Blob([raw], { type: contentType });
  }
  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

function readingTheImage(imageCaptured) {
  Jimp.read(imageCaptured).then(function (image1) {
    image1.resize(512, 512)
      .quality(60)
      .getBase64(Jimp.MIME_JPEG, function (err, src) {
        processImage(src);
      });
  });
}

function processImage(imageData) {
  var subscriptionKey = "5ce5036ddfdb4847b9f332c903d16261";

  var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";

  var params = {
    "visualFeatures": "Categories,Description,Color",
    "details": "",
    "language": "en"
  };

  // Perform the REST API call.
  $.ajax({
    url: uriBase + "?" + $.param(params),
    // Request headers.
    beforeSend: function (xhrObj) {
      xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
      xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
    },
    processData: false,
    type: "POST",

    // Request body.
    data: makeblob(imageData),
  })
    .done(function (data) {
      let description = "";

      console.log(data.description.captions["0"].text);

      if(data.description.captions["0"].text.includes("cell") || data.description.captions["0"].text.includes("phone") ){
        description = "Hey dude its impolite speaking in the phone while we lecturing. ";
      }

      if(data.description.captions["0"].text.includes("glasses")){
        description += "By the way you look better without glasses"
      }

      if (description !== "") {
        document.getElementById("arWrapper").style.visibility = "visible";
        document.getElementById("arWrapper").setAttribute("class", "fade-in");

        var div = document.getElementById("textInfoAr");
        div.innerHTML = description;
      }
      else {
        document.getElementById("arWrapper").style.visibility = "hidden";
      }

    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
      errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
      console.log(errorString);
    });
};