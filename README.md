# What is Zephyr-Editor ?
  Zephyr-Editor is a  lightweight rich text editor . Based on jQuery.
# How to use ?
First of all , you need to create a dom element called textarea.
``` html
<textarea id="text"></textarea>
```
Then , add the zephyr.js to your HTML script tag . Note that , you need to import jQuery first.
``` javascript
<script src="../external/jquery/jquery.js"></script>
<script src="../src/main.js"></script>
<script>
    $(document).ready(function(){
        $("#text").zephyr({"cols":"200","rows":"20"});
    });
</script>
```
