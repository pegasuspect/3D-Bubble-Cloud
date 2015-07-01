(function ( $ ) {
	//settings = {}

	var ONE_DEGREE = Math.PI/180;

	$.fn.create3DBubbleCloud = function(options) {
		return this.each(function(index, el) {
			if(!options) options = {};
			options.frameId = this.id = this.id || "frame" + index;
			$(this).css({
				"position": "relative",
				"margin": "0 auto",
				"overflow": options.showBubblesOutOfFrameBorders ? "visible" : "hidden",
				"text-align": "center"
			});
	        new BubbleCloud3D(options);
	    });
    };

	function BubbleCloud3D(options){

		this.init(options);

		if(this.settings.distributeBubblesRandomly)
			this.createRandomlyDistributedBubbles();
		else this.createEvenlyDistributedBubbles();

		if(this.checkFrame()){
			this.createFrameMask();
			this.attachEventHandlerToFrameMask();
			this.addBubblesToFrame();
		}
	}

	BubbleCloud3D.prototype.init = function(options){
		this.settings = $.extend({
            angularSpeed: 0.5,
			distributeBubblesRandomly: false,
			showBubblesOutOfFrameBorders: true
        }, options );

		this.bubbles = [];
		
		this.settings.frameSelector = "#" + this.settings.frameId;

		var el = $(this.settings.frameSelector)
		var frameSize = Math.max(Math.min(el.width(), el.height()), 320);
		this.settings.frameWidth = this.settings.frameHeight = this.settings.frameDepth = frameSize;
		el.css({"font-size" : frameSize/12}).height(frameSize).width(frameSize);
		console.log(frameSize);

		var fixedLength = this.fixSizeForSphereBoundries(frameSize);
		var extra = frameSize - fixedLength;
		this.settings.origin = {};
		this.settings.origin.x = this.settings.origin.y = this.settings.origin.z = (fixedLength + extra)/2;
		 //= fixedLength/2;

		this.numberOfBubbles = el.children().size();
	}

	BubbleCloud3D.prototype.addBubblesToFrame = function(){
		// add bubbles to frame
		for (var i = this.bubbles.length - 1; i >= 0; i--) {
			$(this.settings.frameSelector).append(this.bubbles[i].element);
		}
	}
	BubbleCloud3D.prototype.attachEventHandlerToFrameMask = function(){
		var oldX, oldY;
		var that = this;
		// attach the event handler
		$("#"+this.settings.frameId+"Mask").mousemove(function( event ) {
			if (!oldX) oldX = event.offsetX;
			if (!oldY) oldY = event.offsetY;

			var deltaY = event.offsetY - oldY;
			var deltaX = event.offsetX - oldX;

			//console.log(deltaX, deltaY);
			that.rotateBubbles(-deltaX * that.settings.angularSpeed, deltaY * that.settings.angularSpeed);

			oldX = event.offsetX;
			oldY = event.offsetY;
		});
	}
	BubbleCloud3D.prototype.createFrameMask = function(){
		//create a frame mask to attach mouse move event
		$(this.settings.frameSelector).html("").parent().append($("<div>").attr("id", this.settings.frameId + "Mask").css({
			zIndex: this.settings.frameDepth * 100,
			width: "100%",
			height: this.settings.frameHeight * 4/3,
			//"padding-top": this.settings.frameHeight/3,
			position: "absolute",
			top: $(this.settings.frameSelector).position().top,
			left: 0
		}));
	}
	BubbleCloud3D.prototype.checkFrame = function(){
		//create frame if it does not exist
		if($(this.settings.frameSelector).size() == 0){
			alert("frameId: \""+this.settings.frameId+"\" could not be found!");
			return false;
		}
		return true;
	}

	BubbleCloud3D.prototype.fixSizeForSphereBoundries = function(edge){
		// comes from the 3d vector equation:
		//   magnitude = sqrt(x^2 + y^2 + z^2)
		// so if i want to have my vectors to have the magnitude of "r"
		// equation becomes magnitude = sqrt(3*r^2)
		// Therefore; magnitude/sqrt(3) = r
		var r = edge/Math.sqrt(3);
		return r;
	}

	BubbleCloud3D.prototype.rotateBubbles = function(rotation_on_x, rotation_on_y){
		for (var i = 0; i < this.bubbles.length; i++) {
			this.bubbles[i].giveAngularRotationOnAxis(rotation_on_x, rotation_on_y, this.settings);
		}
	}

	BubbleCloud3D.prototype.createEvenlyDistributedBubbles = function(){
		//create bubbles on the sphere's 8 equally devided parts
		var half = this.numberOfBubbles/2;
		var quarter = half/2;
		var halfQuarter = quarter/2;

		//making the boundries a sphere
		var frameSize = this.fixSizeForSphereBoundries(this.settings.frameWidth);
		var extra = (this.settings.frameWidth - frameSize)/2;
		
		for (var i = 0; i < this.numberOfBubbles; i++) {
			var x = (Math.random() + parseInt(i/half)) * frameSize/2 + extra;
			var y = (Math.random() + parseInt((i/quarter) % 2)) * frameSize/2 + extra;
			var z = (Math.random() + parseInt((i/halfQuarter) % 2)) * frameSize/2 + extra;

			var content = $(this.settings.frameSelector).children().eq(i).html();
			var vector = new Vector3D(x, y, z, this.settings);
			var bubble = new Bubble(vector, content, this.settings);
			this.bubbles.push(bubble);
		}
	}

	BubbleCloud3D.prototype.createRandomlyDistributedBubbles = function(){
		//making the boundries a sphere
		var frameSize = this.fixSizeForSphereBoundries(this.settings.frameWidth);
		var extra = this.settings.frameWidth - frameSize;
		//create bubbles randomly
		for (var i = 0; i < this.numberOfBubbles; i++) {
			var x = Math.random() * frameSize + extra/2;
			var y = Math.random() * frameSize + extra/2;
			var z = Math.random() * frameSize + extra/2;

			var content = $(this.settings.frameSelector).children().eq(i).html();
			var vector = new Vector3D(x, y, z, this.settings);
			var bubble = new Bubble(vector, content, this.settings);
			this.bubbles.push(bubble);
		}
	}

	function Bubble(vector, content, settings){
		this.vector = vector;
		this.content = content || (vector.x + ", " + vector.y + ", " + vector.z);;

		var sizePercentage = ((settings.origin.z + this.vector.z) / settings.frameDepth);
		var size = (settings.frameWidth/2) * sizePercentage;

		this.element = $("<div>").addClass("bubble")
			.css("position", "absolute")
			.html(this.content);

		this.animate(settings);
		this.refreshAngles();
	}

	var isAnimating = false;
	Bubble.prototype.animate = function(settings){
		//performance tweak
		if (isAnimating) return;
		isAnimating = true;

		var sizePercentage = Math.max((settings.origin.z + this.vector.z) / settings.frameDepth, 0.2);
		var size = (settings.frameWidth/2) * sizePercentage;
		
		//set elements position
		this.element.css({
			top: settings.origin.x + this.vector.x - size/2,
			left: settings.origin.y + this.vector.y - size/2,
			zIndex: settings.origin.z + this.vector.z,
			width: size,
			height: size,
			"border-radius": size*2/3,
			"font-size": sizePercentage + "em",
			"line-height": size + "px"
		})
		// uncomment following for debug
		//.text(size);
		//this.refreshAngles();
		isAnimating = false;
	}

	Bubble.prototype.refreshAngles = function(){
		this.vector.xAngle = Math.acos( this.vector.x / this.vector.getMagnitude() ) * 1/ONE_DEGREE;
		this.vector.yAngle = Math.acos( this.vector.y / this.vector.getMagnitude() ) * 1/ONE_DEGREE;
		this.vector.zAngle = Math.acos( this.vector.z / this.vector.getMagnitude() ) * 1/ONE_DEGREE;
	}

	Bubble.prototype.giveAngularRotationOnAxis = function(x, y, settings){
		if(!x) x = 0;
		if(!y) y = 0;

		var rotation_on_x = x * ONE_DEGREE;
		var rotation_on_y = y * ONE_DEGREE;

		//rotate on X axis:
		var yHat = this.vector.y * Math.cos(rotation_on_x) - this.vector.z * Math.sin(rotation_on_x);
		var zHat = this.vector.y * Math.sin(rotation_on_x) + this.vector.z * Math.cos(rotation_on_x);
		this.vector.y = yHat;
		this.vector.z = zHat;

		//rotate on Y axis:
		var xHat2 = this.vector.x * Math.cos(rotation_on_y) + this.vector.z  * Math.sin(rotation_on_y);
		var zHat2 = -this.vector.x * Math.sin(rotation_on_y) + this.vector.z * Math.cos(rotation_on_y);
		this.vector.x = xHat2;
		this.vector.z = zHat2;
		
		// round the values so human can read easily
		this.vector.roundCoordinates();

		this.animate(settings);

		this.refreshAngles();
	}


	function Vector3D(x, y, z, settings){
		this.x = x - settings.origin.x;
		this.y = y - settings.origin.y;
		this.z = z - settings.origin.z;
		
		// round the values so human can read easily
		this.roundCoordinates();
	}

	Vector3D.prototype.roundCoordinates = function(){
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
	}

	Vector3D.prototype.getMagnitude = function(){
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
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

























