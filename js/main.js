var options = {
	origin: {
		x: 160,
		y: 160,
		z: 160
	},
	angularSpeed: 0.5,
	frameDepth: 320,
	frameWidth: 320,
	frameHeight: 320,
	isGenerateRandom: false,
	numberOfBubble: 20,
	frameSelector: "#frame"
}

var ONE_DEGREE = Math.PI/180;

function WordBubble3D(optionsOverride){

	this.bubbles = [];

	if (optionsOverride) {
		options.origin = optionsOverride.origin || options.origin;
		options.angularSpeed = optionsOverride.angularSpeed || options.angularSpeed;
		options.frameHeight = optionsOverride.frameHeight || options.frameHeight;
		options.frameWidth = optionsOverride.frameWidth || options.frameWidth;
		options.frameDepth = optionsOverride.frameDepth || options.frameDepth;
	}

	if (!options.isGenerateRandom)
		options.numberOfBubble = $(options.frameSelector).children().size();
	
	//generate bubbles on random locations
	for (var i = options.numberOfBubble - 1; i >= 0; i--) {
		this.bubbles.push(new Vector3D(
			Math.random() * options.frameWidth, 
			Math.random() * options.frameHeight, 
			Math.random() * options.frameDepth,
			options.isGenerateRandom ? false : $(options.frameSelector).children().eq(i).html()
			)
		);
	}
	//create frame if it does not exist
	if($(options.frameSelector).size() == 0){
		$("body").prepend($("<div>").attr("id", "frame"));
	}
	$(options.frameSelector).html("");
	$(options.frameSelector).parent().append($("<div>").attr("id", "frameMask").css({
		zIndex: options.frameDepth * 100,
		width: "100%",
		height: options.frameHeight + parseInt($(options.frameSelector).css("margin-bottom")),
		"margin-top": $(options.frameSelector).css("margin-top"),
		position: "absolute",
		top: $(options.frameSelector).position().top,
		left: 0
	}));
	// add bubbles to frame
	for (var i = this.bubbles.length - 1; i >= 0; i--) {
		$(options.frameSelector).append(this.bubbles[i].element);
	}
}

WordBubble3D.prototype.rotateBubbles = function(rotation_on_x, rotation_on_y){
	for (var i = 0; i < this.bubbles.length; i++) {
		this.bubbles[i].giveAngularRotationOnAxis(rotation_on_x, rotation_on_y);
	}
}

function Vector3D(x, y, z, content){
	this.x = x - options.origin.x;
	this.y = y - options.origin.y;
	this.z = z - options.origin.z;
	
	this.content = content || (this.x + ", " + this.y + ", " + this.z);

	// round the values so human can read easily
	this.roundCoordinates();

	var sizePercentage = ((options.origin.z + this.z) / options.frameDepth);
	var size = (options.frameWidth/2) * sizePercentage;

	this.element = $("<div>").addClass("bubble noTextSelect")
		.css("position", "absolute")
		.text(this.content);

	this.animate();

	this.refreshAngles();
}

Vector3D.prototype.refreshAngles = function(){
	this.xAngle = Math.acos( this.x / this.getMagnitude() ) * 1/ONE_DEGREE;
	this.yAngle = Math.acos( this.y / this.getMagnitude() ) * 1/ONE_DEGREE;
	this.zAngle = Math.acos( this.z / this.getMagnitude() ) * 1/ONE_DEGREE;
}

Vector3D.prototype.getMagnitude = function(){
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
}

Vector3D.prototype.giveAngularRotationOnAxis = function(x, y){
	if(!x) x = 0;
	if(!y) y = 0;

	var rotation_on_x = x * ONE_DEGREE;
	var rotation_on_y = y * ONE_DEGREE;

	//rotate on X axis:
	var yHat = this.y * Math.cos(rotation_on_x) - this.z * Math.sin(rotation_on_x);
	var zHat = this.y * Math.sin(rotation_on_x) + this.z * Math.cos(rotation_on_x);
	this.y = yHat;
	this.z = zHat;

	//rotate on Y axis:
	var xHat2 = this.x * Math.cos(rotation_on_y) + this.z  * Math.sin(rotation_on_y);
	var zHat2 = -this.x * Math.sin(rotation_on_y) + this.z * Math.cos(rotation_on_y);
	this.x = xHat2;
	this.z = zHat2;
	
	// round the values so human can read easily
	this.roundCoordinates();

	this.animate();

	this.refreshAngles();
}
var isAnimating = false;
Vector3D.prototype.animate = function(){
	if (isAnimating) return;
	isAnimating = true;

	var sizePercentage = ((options.origin.z + this.z) / options.frameDepth);
	var size = (options.frameWidth/2) * sizePercentage;
	
	//set elements position
	this.element.css({
		top: options.origin.x + this.x,
		left: options.origin.y + this.y,
		zIndex: options.origin.z + this.z,
		width: size,
		height: size,
		"border-radius": size*2/3,
		"font-size": sizePercentage + "em",
		"line-height": size + "px"
	});
	isAnimating = false;
}

Vector3D.prototype.roundCoordinates = function(){
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	this.z = Math.round(this.z);
}

var testData1 = [];
var testData2 = [];

function testRotation(x, y){

	var vector = new Vector3D(3,4,0);
	vector.giveAngularRotationOnAxis(x, y);
	testData2.push(vector);

	var asd = new Vector3D(3,4,0);
	testData1.push(asd);
}

// testRotation(90);
// testRotation(-90);
// testRotation(0, 90);
// testRotation(0, -90);

var wordBubble = new WordBubble3D();
// setInterval(function(){ 
// 	wordBubble.rotateBubbles(15, 10);
//  }, 100);

var oldX, oldY;
$("#frameMask").mousemove(function( event ) {
  if (!oldX) oldX = event.offsetX;
  if (!oldY) oldY = event.offsetY;

  var deltaY = event.offsetY - oldY;
  var deltaX = event.offsetX - oldX;
  
  //console.log(deltaX, deltaY);
  wordBubble.rotateBubbles(deltaX * options.angularSpeed, deltaY * options.angularSpeed);

  oldX = event.offsetX;
  oldY = event.offsetY;
});

console.log(testData1,testData2);

























