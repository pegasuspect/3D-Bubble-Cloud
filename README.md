# 3D Bubble Cloud
A jQuery plugin for creating 3D bubble cloud with rotation ability.
Live demo and tests 
<a href="http://noge-commerce.com/projects/3D-Bubble-Cloud/" target="_blank">
    here.
    <img src="http://exchangeleads.io/wp-content/uploads/2015/06/demo.jpg">
</a>
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
With jQuery select elements and just use the method, to3DBubbleCloud()
####Example wrappers:
```html
<ul class="frame">
    <li>Lorem</li>
    <li>ipsum</li>
    <li>dolor</li>
    <li>sit</li>
    <li>amet,</li>
    <li>consectetur</li>
    <li>adipiscing</li>
    <li>elit,</li>
    <li>sed</li>
    <li>do</li>
    <li>eiusmod</li>
    <li>tempor</li>
    <li>incididunt</li>
    <li>ut</li>
    <li>labore</li>
    <li>et</li>
    <li>dolore</li>
    <li>magna</li>
    <li>aliqua.</li>
    <li>Ut</li>
</ul>
<div class="show bg-danger frame">
  <span>Hi</span>
  <span>This</span>
  <span>is</span>
  <span>a</span>
  <span>new</span>
  <span>frame</span>
</div>
```
####Javascript method to convert them:
```js
$(function(){
  //assuming wrapper of the list has "frame" class
  $(".frame").to3DBubbleCloud();
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
  $(".frame").to3DBubbleCloud(options);
});
```

#Credits
1. http://stackoverflow.com/a/14609567
