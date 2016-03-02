var xmlhttp;
if (window.XMLHttpRequest)
{// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
}
else
{// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}

//var loopCount = 0;
//var opDoor = false;
//var runtime = 1 * 60; // 1 Minutes * 60 seconds

//function operateDoor () {
  //opDoor=confirm("Are you sure?");
/*  opDoor = true;
  if (loopCount >= runtime) {
    loopCount = 0;
    restartClick();
  }
  loopCount = 0;
}
*/


xmlhttp.onreadystatechange=function()
{
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
  {
    document.getElementById("http_username").innerHTML=xmlhttp.responseText;
  }
};
xmlhttp.open("GET", "https_username.json?t" + Math.random(), true);
xmlhttp.send();


// FillMeIn
//var garageDoorImage = "http://YourExternalIP:YourCameraPortNumber/YourCamerasJPGFilename.jpg";
//var newImage = new Image();
//newImage.src = garageDoorImage;

//var int;

//function restartClick () {
/*  loopCount = 0;
  int=self.setInterval(function(){
    if (opDoor == true) {
      xmlhttp.open("GET","operateDoor.json?t=" + Math.random(),true);
      xmlhttp.send();
      opDoor = false;
    } else {
      xmlhttp.open("GET","getDoor.json?t=" + Math.random(),true);
      xmlhttp.send();
    }
    
    document.getElementById("Image").src = newImage.src;
    newImage = new Image();
    newImage.src = garageDoorImage + '?t=' + Math.random();

    loopCount++;
    if (loopCount >= runtime) {
      int=self.clearInterval(int);
      document.getElementById("restartButton").style.display = 'inline';
      document.getElementById("Image").className = "imgTrans";
    }
  },1000);

  document.getElementById("restartButton").style.display = 'none';
  document.getElementById("Image").className = "";
}

restartClick();
*/