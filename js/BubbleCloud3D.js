var ONE_DEGREE = Math.PI / 180;

function BubbleCloud3D(options) {

    this.init(options);

    if (this.settings.distributeBubblesRandomly)
        this.createRandomlyDistributedBubbles();
    else this.createEvenlyDistributedBubbles();

    if (this.checkFrame()) {
        this.createFrameMask();
        this.attachEventHandlerToFrameMask();
        this.addBubblesToFrame();
    }
}

BubbleCloud3D.prototype.init = function(options) {
    this.settings = $.extend({
        angularSpeedMultiplier: 1,
        maxAngularSpeed: 8,
        distributeBubblesRandomly: false,
        showBubblesOutOfFrameBorders: true
    }, options);

    this.bubbles = [];

    this.settings.frameSelector = "#" + this.settings.frameId;

    var el = jQuery(this.settings.frameSelector)
    var frameSize = Math.max(Math.min(el.width(), el.height()), 320);
    this.settings.frameWidth = this.settings.frameHeight = this.settings.frameDepth = frameSize;
    el.css({
        "font-size": frameSize / 12
    }).height(frameSize).width(frameSize);
    console.log(frameSize);

    this.settings.origin = {};
    this.settings.origin.x = this.settings.origin.y = this.settings.origin.z = frameSize / 2;

    this.numberOfBubbles = el.children().size();
}

BubbleCloud3D.prototype.addBubblesToFrame = function() {
    // add bubbles to frame
    for (var i = this.bubbles.length - 1; i >= 0; i--) {
        jQuery(this.settings.frameSelector).append(this.bubbles[i].element);
    }
}
BubbleCloud3D.prototype.attachEventHandlerToFrameMask = function() {
    var that = this;

    // HAMMER JS
    var element = jQuery("#" + this.settings.frameId + "Mask")[0];
    var hammertime = new Hammer(element),
        startX, startY, direction;
    hammertime.on('panstart', function(ev) {
        initializeHammerJS(ev);
    });
    hammertime.on('pan', function(ev) {
        //reinitialize the starting points
        // when the direction changes
        if (ev.direction != direction)
            initializeHammerJS(ev);

        var pointer = ev.pointers[0];
        //set top angular speed to 10 degrees
        var x = (pointer.clientX - startX) / ev.deltaTime * 50 * that.settings.angularSpeedMultiplier;
        var y = -(pointer.clientY - startY) / ev.deltaTime * 50 * that.settings.angularSpeedMultiplier;
        var newSpeed = checkSpeed([x, y]);

        that.rotateBubbles(newSpeed[0], newSpeed[1]);
    });

    var initializeHammerJS = function(ev) {
        var pointer = ev.pointers[0];
        direction = ev.direction;
        startX = pointer.clientX;
        startY = pointer.clientY;
    }

    var checkSpeed = function(speed) {
        var topSpeed = that.settings.maxAngularSpeed; //degrees
        if (speed[0] > topSpeed) speed[0] = topSpeed;
        if (speed[0] < -topSpeed) speed[0] = -topSpeed;
        if (speed[1] > topSpeed) speed[1] = topSpeed;
        if (speed[1] < -topSpeed) speed[1] = -topSpeed;
        return speed;
    }

}
BubbleCloud3D.prototype.createFrameMask = function() {
    //create a frame mask to attach mouse move event
    jQuery(this.settings.frameSelector).html("")
        .parent().append(jQuery("<div>").attr("id", this.settings.frameId + "Mask")
            .css({
                zIndex: this.settings.frameDepth * 100,
                width: "100%",
                height: this.settings.frameHeight,
                position: "absolute",
                top: 0,
                left: 0
            }));
}
BubbleCloud3D.prototype.checkFrame = function() {
    //create frame if it does not exist
    var frame = jQuery(this.settings.frameSelector);
    var frameExists = (frame.size() != 0);
    if (!frameExists) {
        alert("frameId: \"" + this.settings.frameId + "\" could not be found!");
        return false;
    }
    if (!frame.addClass("object3d").parent().hasClass("scene3d")) {
        frame.wrap(jQuery("<div>").addClass("scene3d"));
    };
    return true;
}

BubbleCloud3D.prototype.fixSizeForSphereBoundries = function(edge) {
    // comes from the 3d vector equation:
    //   magnitude = sqrt(x^2 + y^2 + z^2)
    // so if i want to have my vectors to have the magnitude of "r"
    // equation becomes magnitude = sqrt(3*r^2)
    // Therefore; magnitude/sqrt(3) = r
    var r = edge / Math.sqrt(3);
    return r;
}

BubbleCloud3D.prototype.rotateBubbles = function(rotation_on_x, rotation_on_y) {
	this.bubbles.map(function(item){
		item.giveAngularRotationOnAxis(rotation_on_x, rotation_on_y);
	});
}

BubbleCloud3D.prototype.createEvenlyDistributedBubbles = function() {
    //create bubbles on the sphere's 8 equally devided parts
    var half = this.numberOfBubbles / 2;
    var quarter = half / 2;
    var halfQuarter = quarter / 2;

    //making the boundries a sphere
    var frameSize = this.fixSizeForSphereBoundries(this.settings.frameWidth);
    var extra = (this.settings.frameWidth - frameSize) / 2;

    for (var i = 0; i < this.numberOfBubbles; i++) {
        var x = (Math.random() + parseInt(i / half)) * frameSize / 2 + extra;
        var y = (Math.random() + parseInt((i / quarter) % 2)) * frameSize / 2 + extra;
        var z = (Math.random() + parseInt((i / halfQuarter) % 2)) * frameSize / 2 + extra;

        var content = jQuery(this.settings.frameSelector).children().eq(i).html();
        var vector = new Vector3D(x, y, z, this.settings);
        var bubble = new Bubble(vector, content, this.settings);
        this.bubbles.push(bubble);
    }
}

BubbleCloud3D.prototype.createRandomlyDistributedBubbles = function() {
    //making the boundries a sphere
    var frameSize = this.fixSizeForSphereBoundries(this.settings.frameWidth);
    var extra = this.settings.frameWidth - frameSize;
    //create bubbles randomly
    for (var i = 0; i < this.numberOfBubbles; i++) {
        var x = Math.random() * frameSize + extra / 2;
        var y = Math.random() * frameSize + extra / 2;
        var z = Math.random() * frameSize + extra / 2;

        var content = jQuery(this.settings.frameSelector).children().eq(i).html();
        var vector = new Vector3D(x, y, z, this.settings);
        var bubble = new Bubble(vector, content, this.settings);
        this.bubbles.push(bubble);
    }
}

function Bubble(vector, content, settings) {
    this.vector = vector;
    this.content = content || (vector.x + ", " + vector.y + ", " + vector.z);;

    this.normalizeVectorTo(settings.frameWidth / 2 * 0.75);

    var sizePercentage = ((settings.origin.z + this.vector.z) / settings.frameDepth);
    var size = (settings.frameWidth / 2) * sizePercentage;


    var sizePercentage = 0.5; //Math.max((settings.origin.z + this.vector.z) / settings.frameDepth, 0.2);
    var size = (settings.frameWidth / 2) * sizePercentage;

    this.element = jQuery("<div>").addClass("bubble noTextSelect").html(this.content)
        .css({
            top: (settings.frameHeight - size) / 2,
            left: (settings.frameWidth - size) / 2,
            width: size,
            height: size,
            "font-size": sizePercentage + "em",
            "line-height": size + "px"
        }).css(this.getNewLocationCSS());

}
Bubble.prototype.normalizeVectorTo = function(r) {
    var magnitude = this.vector.getMagnitude();
    var xHat = (this.vector.x / magnitude) * r;
    var yHat = (this.vector.y / magnitude) * r;
    var zHat = (this.vector.z / magnitude) * r;
    this.vector.x = xHat;
    this.vector.y = yHat;
    this.vector.z = zHat;
}

Bubble.prototype.updatePosition = function() {
    this.element.css(this.getNewLocationCSS());
}

Bubble.prototype.getNewLocationCSS(){
	//z is multiplied with 3 to create more depth to bubbles
	var pos = "translate3d(" + (this.vector.x) + "px, " + (this.vector.y) + "px, " + (this.vector.z * 3) + "px) ";
	return {
        transform: pos
    };
}
Bubble.prototype.giveAngularRotationOnAxis = function(x, y) {
    if (!x) x = 0;
    if (!y) y = 0;

    var rotation_on_x = y * ONE_DEGREE;
    var rotation_on_y = x * ONE_DEGREE;

    //rotate on X axis:
    var yHat = this.vector.y * Math.cos(rotation_on_x) - this.vector.z * Math.sin(rotation_on_x);
    var zHat = this.vector.y * Math.sin(rotation_on_x) + this.vector.z * Math.cos(rotation_on_x);
    this.vector.y = yHat;
    this.vector.z = zHat;

    //rotate on Y axis:
    var xHat2 = this.vector.x * Math.cos(rotation_on_y) + this.vector.z * Math.sin(rotation_on_y);
    var zHat2 = -this.vector.x * Math.sin(rotation_on_y) + this.vector.z * Math.cos(rotation_on_y);
    this.vector.x = xHat2;
    this.vector.z = zHat2;

    // round the values so human can read easily
    // this.vector.roundCoordinates();

    this.updatePosition();
}


function Vector3D(x, y, z, settings) {
    this.x = x - settings.origin.x;
    this.y = y - settings.origin.y;
    this.z = z - settings.origin.z;

    // round the values so human can read easily
    this.roundCoordinates();
}

Vector3D.prototype.roundCoordinates = function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
}

Vector3D.prototype.getMagnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}


// Set jQuery plugin.
jQuery.fn.to3DBubbleCloud = function(options) {
    return this.each(function(index, el) {
        if (!options) options = {};
        options.frameId = this.id = this.id || "frame" + index;
        var bubbleCloud = new BubbleCloud3D(options);
        jQuery(el).css({
                "position": "relative",
                "margin": "0 auto",
                "padding": 0,
            }).data("bubbles", bubbleCloud).removeClass("borderFrame")
            .parent().css({
                "overflow": (bubbleCloud.settings.showBubblesOutOfFrameBorders ? "visible" : "hidden")
            }).addClass("borderFrame");
    });
};
