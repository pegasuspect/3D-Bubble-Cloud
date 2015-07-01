# 3D Bubble Cloud
A jQuery plugin for creating 3D bubble cloud with rotation ability.

#Installation
To use it simply download the `BubbleCloud3D.js` file with the `BubbleCloud3D.css` file. Then in your html file link to them use:
```html
<script src="js/BubbleCloud3D.js"></script>
<link rel="stylesheet" href="css/BubbleCloud3D.css">
```
#Usage
With jQuery select element(s) and just use the method, create3DBubbleCloud()

```js
$(function(){
  $(".frame").create3DBubbleCloud();
});
```

You may specify custom settings for:
- angularSpeed
- distributeBubblesRandomly
- showBubblesOutOfFrameBorders

```js
var options = {
  angularSpeed: 0.1, //defaults to 0.5
  distributeBubblesRandomly: true, // defaults to false
  showBubblesOutOfFrameBorders: false, // defaults to true
}
$(function(){
  $(".frame").create3DBubbleCloud(options);
});
```

#Credits
1. http://stackoverflow.com/a/14609567
