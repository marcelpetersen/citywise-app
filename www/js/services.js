app.service('addPhotoService', ['$cordovaCamera', '$http', function($cordovaCamera, $http) {
  var sv = this;
  //this method will open the camera app. after a photo is taken the user will crop it. It returns a promise with the data being the base64 encoded image
  sv.takePicture = function() {
    console.log('taking photo!');
    var options = {
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      allowEdit: 1,
      saveToPhotoAlbum: false,
	    correctOrientation:true
    };
    return $cordovaCamera.getPicture(options)
    .then(function(data) {
      return 'data:image/jpeg;base64,' + data;
      });
  };

  //this method uploads the image passed into it as base64 and returns a promise where the data is an object of information about the image. the url can be accessed at data.data.secure_url
  sv.uploadPicture = function(imageInfo) {
    return $http.post('https://api.cloudinary.com/v1_1/spogburn/auto/upload', {
        file: imageInfo,
        upload_preset: 'zt4pq0pu'
      })
      .then(function(data) {
        return data.data.secure_url;
      });
  };


  sv.takeAndSend = function() {
   var url;
     sv.takePicture()
       .then(function(image) {
         return sv.uploadPicture(image);
       })
       .then(function(_url) {
        url = _url;
        console.log('url:', _url);
      })
       .catch(function(err) {
         console.log('error', err);
       });
 };

}])

app.service('addMapService', ['$cordovaGeolocation', function($cordovaGeolocation){
  var sv = this;
  var lat = '';
  var long = ''
  var posOptions = {timeout: 10000, enableHighAccuracy: false};

  sv.getMap = function(){
    console.log('running get map');
    $cordovaGeolocation.getCurrentPosition(posOptions)
    .then(function(position){
     var positionNow = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
     console.log('positionNow1, ', positionNow);

     var mapOptions = {
        center: positionNow,
        zoom: 12,
        draggable: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      sv.map = new google.maps.Map(document.getElementById("map"), mapOptions)

      var marker = new google.maps.Marker({
        position: positionNow,
        title: "Pinpoint your WiseUp!",
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

    // To add the marker to the map, call setMap();
      marker.setMap(sv.map);
      marker.addListener('dragend', function(){
         lat = marker.getPosition().lat();
         long = marker.getPosition().lng()
         sv.map.setCenter(marker.getPosition());

         console.log('marker position:', marker.position);
        console.log('lat:', lat);
        console.log('long:',long);
      })
// });

    }, function(err){
      console.log('could not get location');
    })
  }
}])

app.service('submitService', ['$cordovaGeolocation', '$http', function($cordovaGeolocation, $http){
  var sv = this;
  var lat = '';
  var long = '';

  sv.submit = function(form){
    // get user location in lt and long
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
     $cordovaGeolocation
     .getCurrentPosition(posOptions)
     .then(function(position) {
       form.lat =  position.coords.latitude;;
       form.long = position.coords.longitude;
       console.log('form', form);
       $http.post('http://localhost:3000/api/say-something', form);
        console.log(lat + '   ' + long);
     }).catch(function(err){
       console.log('error in obtaining location or submitting form', err);
     })

  }


}])
