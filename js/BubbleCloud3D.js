(function ( $ ) {
	settings = {}

	var ONE_DEGREE = Math.PI/180;

	$.fn.create3DBubbleCloud = function(options) {
		settings = $.extend({
            angularSpeed: 0.5,
			distributeBubblesRandomly: false,
			showBubblesOutOfFrameBorders: true
        }, options );

		return this.each(function(index, el) {
			settings.frameId = this.id = this.id || "frame" + index;
			$(this).css({
				"position": "relative",
				"margin": "0 auto",
				"overflow": settings.showBubblesOutOfFrameBorders ? "visible" : "hidden",
				"text-align": "center"
			});
	        new BubbleCloud3D(options);
	    });
    };

	function BubbleCloud3D(options){

		this.init(options);

		if(settings.distributeBubblesRandomly)
			this.createRandomlyDistributedBubbles();
		else this.createEvenlyDistributedBubbles();

		if(this.checkFrame()){
			this.createFrameMask();
			this.attachEventHandlerToFrameMask();
			this.addBubblesToFrame();
		}
	}

	BubbleCloud3D.prototype.addBubblesToFrame = function(){
		// add bubbles to frame
		for (var i = this.bubbles.length - 1; i >= 0; i--) {
			$(settings.frameSelector).append(this.bubbles[i].element);
		}
	}
	BubbleCloud3D.prototype.attachEventHandlerToFrameMask = function(){
		var oldX, oldY;
		var that = this;
		// attach the event handler
		$("#"+settings.frameId+"Mask").mousemove(function( event ) {
			if (!oldX) oldX = event.offsetX;
			if (!oldY) oldY = event.offsetY;

			var deltaY = event.offsetY - oldY;
			var deltaX = event.offsetX - oldX;

			//console.log(deltaX, deltaY);
			that.rotateBubbles(-deltaX * settings.angularSpeed, deltaY * settings.angularSpeed);

			oldX = event.offsetX;
			oldY = event.offsetY;
		});
	}
	BubbleCloud3D.prototype.createFrameMask = function(){
		//create a frame mask to attach mouse move event
		$(settings.frameSelector).html("").parent().append($("<div>").attr("id", settings.frameId + "Mask").css({
			zIndex: settings.frameDepth * 100,
			width: "100%",
			height: settings.frameHeight * 4/3,
			//"padding-top": settings.frameHeight/3,
			position: "absolute",
			top: $(settings.frameSelector).position().top,
			left: 0
		}));
	}
	BubbleCloud3D.prototype.checkFrame = function(){
		//create frame if it does not exist
		if($(settings.frameSelector).size() == 0){
			alert("frameId: \""+settings.frameId+"\" could not be found!");
			return false;
		}
		return true;
	}
	BubbleCloud3D.prototype.init = function(options){
		this.bubbles = [];
		
		if (options) {
			settings.angularSpeed = options.angularSpeed || settings.angularSpeed;
			if(options.distributeBubblesRandomly !== undefined)
				settings.distributeBubblesRandomly = options.distributeBubblesRandomly;
			settings.frameId = options.frameId || settings.frameId;
		}

		settings.frameSelector = "#" + settings.frameId;

		var el = $(settings.frameSelector)
		var frameSize = Math.max(Math.min(el.width(), el.height()), 320);
		settings.frameWidth = settings.frameHeight = settings.frameDepth = frameSize;
		el.css({"font-size" : frameSize/12}).height(frameSize).width(frameSize);
		console.log(frameSize);

		var fixedLength = this.fixSizeForSphereBoundries(frameSize);
		var extra = frameSize - fixedLength;
		settings.origin = {};
		settings.origin.x = settings.origin.y = settings.origin.z = (fixedLength + extra)/2;
		 //= fixedLength/2;

		this.numberOfBubbles = el.children().size();
	}

	BubbleCloud3D.prototype.fixSizeForSphereBoundries = function(edge){
		// comes from the equation magnitude = sqrt(x^2 + y^2 + z^2)
		// so if i want to have my vectors to have the magnitude of "r"
		// equation becomes magnitude = sqrt(3*r^2)
		// Therefore magnitude/sqrt(3) = r
		var r = edge/Math.sqrt(3);
		return r;
	}

	BubbleCloud3D.prototype.rotateBubbles = function(rotation_on_x, rotation_on_y){
		for (var i = 0; i < this.bubbles.length; i++) {
			this.bubbles[i].giveAngularRotationOnAxis(rotation_on_x, rotation_on_y);
		}
	}

	BubbleCloud3D.prototype.createEvenlyDistributedBubbles = function(){
		//create bubbles on the sphere's 8 equally devided parts
		var half = this.numberOfBubbles/2;
		var quarter = half/2;
		var halfQuarter = quarter/2;

		//making the boundries a sphere
		var frameSize = this.fixSizeForSphereBoundries(settings.frameWidth);
		var extra = (settings.frameWidth - frameSize)/2;
		
		for (var i = 0; i < this.numberOfBubbles; i++) {
			var x = (Math.random() + parseInt(i/half)) * frameSize/2 + extra;
			var y = (Math.random() + parseInt((i/quarter) % 2)) * frameSize/2 + extra;
			var z = (Math.random() + parseInt((i/halfQuarter) % 2)) * frameSize/2 + extra;

			var content = $(settings.frameSelector).children().eq(i).html();
			
			var vector = new Vector3D(x, y, z, content);
			this.bubbles.push(vector);
		}
	}

	BubbleCloud3D.prototype.createRandomlyDistributedBubbles = function(){
		//making the boundries a sphere
		var frameSize = this.fixSizeForSphereBoundries(settings.frameWidth);
		var extra = settings.frameWidth - frameSize;
		//create bubbles randomly
		for (var i = 0; i < this.numberOfBubbles; i++) {
			var x = Math.random() * frameSize + extra/2;
			var y = Math.random() * frameSize + extra/2;
			var z = Math.random() * frameSize + extra/2;

			var content = $(settings.frameSelector).children().eq(i).html();
			
			var vector = new Vector3D(x, y, z, content);
			this.bubbles.push(vector);
		}
	}


	function Vector3D(x, y, z, content){
		this.x = x - settings.origin.x;
		this.y = y - settings.origin.y;
		this.z = z - settings.origin.z;
		
		// round the values so human can read easily
		this.roundCoordinates();

		this.content = content || (this.x + ", " + this.y + ", " + this.z);

		var sizePercentage = ((settings.origin.z + this.z) / settings.frameDepth);
		var size = (settings.frameWidth/2) * sizePercentage;

		this.element = $("<div>").addClass("bubble")
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
		//performance tweak
		if (isAnimating) return;
		isAnimating = true;

		var sizePercentage = Math.max((settings.origin.z + this.z) / settings.frameDepth, 0.2);
		var size = (settings.frameWidth/2) * sizePercentage;
		
		//set elements position
		this.element.css({
			top: settings.origin.x + this.x - size/2,
			left: settings.origin.y + this.y - size/2,
			zIndex: settings.origin.z + this.z,
			width: size,
			height: size,
			"border-radius": size*2/3,
			"font-size": sizePercentage + "em",
			"line-height": size + "px"
		})
		//.text(size);
		isAnimating = false;
	}

	Vector3D.prototype.roundCoordinates = function(){
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
	}

}( jQuery ));


// var testData1 = [];
// var testData2 = [];

// function testRotation(x, y){

// 	var vector = new Vector3D(3,4,0);
// 	vector.giveAngularRotationOnAxis(x, y);
// 	testData2.push(vector);

// 	var asd = new Vector3D(3,4,0);
// 	testData1.push(asd);
// }

// testRotation(90);
// testRotation(-90);
// testRotation(0, 90);
// testRotation(0, -90);
// console.log(testData1,testData2);
// var newOptions = {
// 	origin: {
// 		x: 0,
// 		y: 0,
// 		z: 0
// 	}
// };
//var wordBubble = new BubbleCloud3D();
// setInterval(function(){ 
// 	wordBubble.rotateBubbles(15, 10);
//  }, 100);

























