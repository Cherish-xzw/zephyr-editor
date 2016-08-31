# What is Zephyr-Editor ?
  Zephyr-Editor is a  lightweight rich text editor . Based on jQuery.
# Getting Started
```bash
git clone https://github.com/Cherish-xzw/zephyr-editor.git
cd zephyr-editor
npm install
gulp
```
# How to use ?
First of all , you need to create a dom element called textarea.
``` html
<textarea id="text"></textarea>
```
Then , add the zephyr.js to your HTML script tag . Note that , you need to import jQuery first.
``` javascript
<script src="jquery.js"></script>
<script src="jquery.zephyr.js"></script>
<script>
    $(document).ready(function(){
        $("#text").zephyr();
    });
</script>
```
