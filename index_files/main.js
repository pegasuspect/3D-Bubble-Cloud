var options = {
	startingPoint: {
		x: 0,
		y: 0,
		z: 0
	}
}

var ONE_DEGREE = Math.PI/180;

function _3DVector(x, y, z){
	this.x = x - options.startingPoint.x;
	this.y = y - options.startingPoint.y;
	this.z = z - options.startingPoint.z;

	this.refreshAngles();
}

_3DVector.prototype.refreshAngles = function(){
	this.xAngle = Math.acos( this.x / this.getMagnitude() ) * 1/ONE_DEGREE;
	this.yAngle = Math.acos( this.y / this.getMagnitude() ) * 1/ONE_DEGREE;
	this.zAngle = Math.acos( this.z / this.getMagnitude() ) * 1/ONE_DEGREE;
}

_3DVector.prototype.getMagnitude = function(){
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
}

_3DVector.prototype.giveAngularRotationOnAxis = function(x, y){
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
	xHat = this.x * Math.cos(rotation_on_y) + this.z  * Math.sin(rotation_on_y);
	zHat = -this.x * Math.sin(rotation_on_y) + this.z * Math.cos(rotation_on_y);
	this.y = yHat;
	this.z = zHat;
	
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	this.z = Math.round(this.z);
	
	this.refreshAngles();
}

var testData1 = [];
var testData2 = [];

function testRotation(x, y){

	var vector = new _3DVector(3,4,0);
	vector.giveAngularRotationOnAxis(x, y);
	testData2.push(vector);

	var asd = new _3DVector(3,4,0);
	testData1.push(asd);
}

testRotation(90);
testRotation(-90);
testRotation(180);
testRotation(-180);


console.log(testData1,testData2);

























