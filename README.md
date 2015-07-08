# 3D Bubble Cloud
A jQuery plugin for creating 3D bubble cloud with rotation ability.
Live demo and tests [here.](http://noge-commerce.com/projects/3D-Bubble-Cloud/ "Test Page")

#Installation
To use it simply download the `BubbleCloud3D.js` file with the `BubbleCloud3D.css` file. Then in your html file link to them. For example:
```html
<!-- External Libraries -->
<script src="js/vendor/jquery-1.11.3.min.js"></script>
<script src="js/vendor/hammer.js"></script>

<!-- Bubble Cloud 3D -->
<script src="js/BubbleCloud3D.js"></script>
<link rel="stylesheet" href="css/BubbleCloud3D.css">
```
#Dependencies
- [jQuery](http://jquery.com/)
- [hammer.js](http://hammerjs.github.io/)

#Usage
With jQuery select elements and just use the method, create3DBubbleCloud()

```js
$(function(){
  //assuming wrapper of the list has "frame" class
  $(".frame").create3DBubbleCloud();
});
```

You may specify custom settings for:
- angularSpeedMultiplier
- maxAngularSpeed
- distributeBubblesRandomly
- showBubblesOutOfFrameBorders

```js
var options = {
    angularSpeedMultiplier: 3, // default is 1
    maxAngularSpeed: 24, // default is 8
    showBubblesOutOfFrameBorders: false, // default is true
    distributeBubblesRandomly: true // default is false
}
$(function(){
  //assuming wrapper of the list has "frame" class
  $(".frame").create3DBubbleCloud(options);
});
```

#Credits
1. http://stackoverflow.com/a/14609567
