var addSheet = function () {
    var doc, cssCode;
    if (arguments.length == 1) {
        doc = document;
        cssCode = arguments[0];
    } else if (arguments.length == 2) {
        doc = arguments[0];
        cssCode = arguments[1];
    } else {
        alert("addSheet函数最多接受两个参数!");
    }
    var headElement = doc.getElementsByTagName("head")[0];
    var styleElements = headElement.getElementsByTagName("style");
    if (styleElements.length == 0) {/*如果不存在style元素则创建*/
        if (!+"\v1") {    //ie
            doc.createStyleSheet();
        } else {
            var tempStyleElement = doc.createElement('style');//w3c
            tempStyleElement.setAttribute("type", "text/css");
            headElement.appendChild(tempStyleElement);
        }
    }
    var styleElement = styleElements[0];
    var media = styleElement.getAttribute("media");
    if (media != null && !/screen/.test(media.toLowerCase())) {
        styleElement.setAttribute("media", "screen");
    }
    if (!+"\v1") {    //ie
        styleElement.styleSheet.cssText += cssCode;
    } else if (/a/[-1] == 'a') {
        styleElement.innerHTML += cssCode;//火狐支持直接innerHTML添加样式表字串
    } else {
        styleElement.appendChild(doc.createTextNode(cssCode))
    }
}
var Class = {
    create: function () {
        return function () {
            this.initialize.apply(this, arguments);
        }
    }
}
var extend = function (destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
}


var RichTextEditor = Class.create();//我们的富文本编辑器类
RichTextEditor.prototype = {
    initialize: function (options) {
        this.setOptions(options);
        this.drawEditor(this.options.textarea_id);
    },
    setOptions: function (options) {
        this.options = { //这里集中设置默认属性
            id: 'jeditor_' + new Date().getTime(),
            textarea_id: null//用于textarea的ID,也就是我们的必选项
        }
        extend(this.options, options || {});//这里是用来重写默认属性
    },
    ID: function (id) { return document.getElementById(id) },//getElementById的快捷方式
    TN: function (tn) { return document.getElementsByTagName(tn) },//getElementsByTagName的快捷方式
    CE: function (s) { return document.createElement(s) },//createElement的快捷方式
    fontPickerHtml: function (type, array) {
        var builder = [];
        for (var i = 0, l = array.length; i & lt; l;i++){
            builder.push('&lt;a unselectable="on" style="');
            if (type == 'fontname') {
                builder.push('font-family');
                builder.push(':');
                builder.push(array[i]); /*呈现一行（一行就是一种字体）*/
                builder.push(';" href="javascript:void(0)"&gt;');
                builder.push(array[i]);
            } else if (type == 'fontsize') {
                /*呈现一行（一行就是一种字号）*/
                builder.push('font-size');
                builder.push(':');
                builder.push(array[i][1]);
                builder.push(';" sizevalue="');
                builder.push(array[i][0]);
                builder.push('" href="javascript:void(0)"&gt;');
                builder.push(array[i][2]);
            }
            builder.push("&lt;/a&gt;");
        }
        return builder.join('');
    },
    addEvent: function (el, type, fn) {
        if (!+"\v1") {
            el['e' + type + fn] = fn;
            el.attachEvent('on' + type, function () {
                el['e' + type + fn]();
            });
        } else {
            el.addEventListener(type, fn, false);
        }
    },
    drawEditor: function (id) {
        var $ = this,
            textarea = this.ID(id),
            toolbar = this.CE('div'),
            br = this.CE('br'),//用于清除浮动
            iframe = this.CE('iframe');
        textarea.style.display = "none";
        textarea.parentNode.insertBefore(toolbar, textarea);
        textarea.parentNode.insertBefore(br, textarea);
        textarea.parentNode.insertBefore(iframe, textarea);
        br.style.cssText = "clear:both";
        toolbar.setAttribute("id", "RTE_toolbar");
        iframe.setAttribute("id", "RTE_iframe");
        iframe.frameBorder = 0;
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        iframeDocument.designMode = "on";
        iframeDocument.open();
        iframeDocument.write('&lt;html&gt;&lt;head&gt;&lt;style type="text/css"&gt;body{ font-family:arial; font-size:13px;background:#DDF3FF;border:0; }&lt;/style&gt;&lt;/head&gt;&lt;/html&gt;');
        iframeDocument.close();

        var buttons = {//工具栏的按钮集合
            'removeFormat': '还原',
            'bold': '加粗',
            'italic': '斜体',
            'underline': '下划线',
            'strikethrough': '删除线',
            'justifyleft': '居左',
            'justifycenter': '居中',
            'justifyright': '居右',
            'indent': '缩进',
            'outdent': '悬挂',
            'forecolor': '前景色',
            'backcolor': '背景色',
            'createlink': '超链接',
            'insertimage': '插图',
            'fontname': '字体',
            'fontsize': '字码',
            'insertorderedlist': '有序列表',
            'insertunorderedlist': '无序列表',
            'html': '查看'
        };
        var fontFamilies = ['宋体', '经典中圆简', '微软雅黑', '黑体', '楷体', '隶书', '幼圆',
            'Arial', 'Arial Narrow', 'Arial Black', 'Comic Sans MS',
            'Courier New', 'Georgia', 'New Roman Times', 'Verdana']
        var fontSizes = [[1, 'xx-small', '最小'],
            [2, 'x-small', '特小'],
            [3, 'small', '小'],
            [4, 'medium', '中'],
            [5, 'large', '大'],
            [6, 'x-large', '特大'],
            [7, 'xx-large', '最大']];
        var buttonClone = $.CE("a"),
            fragment = document.createDocumentFragment();
        buttonClone.className = 'button';
        for (var i in buttons) {/*添加命令按钮的名字，样式*/
            var button = buttonClone.cloneNode("true");
            if (i == 'backcolor') {/*特殊处理背景色按钮*/
                if (!+"\v1") {
                    button.setAttribute("title", "background")
                } else {
                    button.setAttribute("title", "hilitecolor")
                }
            }
            button.setAttribute("title", i);/*把execCommand的命令参数放到title*/
            button.innerHTML = buttons[i];
            button.setAttribute("unselectable", "on");/*防止焦点转移到点击的元素上，从而保证文本的选中状态*/
            toolbar[i] = button;   /*★★★★把元素放进一个数组，用于下一个循环绑定事件！★★★★*/
            fragment.appendChild(button);
        }
        toolbar.appendChild(fragment);
        $.addEvent(toolbar, 'click', function () {
            var e = arguments[0] || window.event,
                target = e.srcElement ? e.srcElement : e.target,
                command = target.getAttribute("title");
            switch (command) {
                case 'createlink':
                case 'insertimage':
                    var value = prompt('请输入网址:', 'http://');
                    _format(command, value);
                    break;
                case 'fontname'://这六个特殊处理，不直接执行fontEdit命令！
                case 'fontsize':
                case 'forecolor':
                case 'backcolor':
                case 'html':
                    return;
                default://其他执行fontEdit(cmd, null)命令
                    _format(command, '');
                    break;
            }
        });

        var fontPicker = $.CE('div');
        fontPicker.setAttribute('unselectable', 'on');
        fontPicker.className = "fontpicker";
        toolbar.appendChild(fontPicker);
        $.addEvent(toolbar['fontname'], 'click', function () {
            fontPicker.innerHTML = $.fontPickerHtml('fontname', fontFamilies);
            fontPicker.style.width = "150px";
            bind_select_event(this, fontPicker);
        })
        $.addEvent(toolbar['fontsize'], 'click', function () {
            fontPicker.innerHTML = $.fontPickerHtml('fontsize', fontSizes);
            fontPicker.style.width = "100px";
            bind_select_event(this, fontPicker);
        })
        var bind_select_event = function (button, picker) {//显示或隐藏文字选择器
            button.style.position = 'relative';
            picker.setAttribute("title", button.getAttribute("title")) //转移命令
            if (picker.style.display == 'none') {
                picker.style.display = 'block';
                picker.style.left = button.offsetLeft + 'px';
                picker.style.top = (button.clientHeight + button.offsetTop) + 'px';
            } else {
                picker.style.display = 'none';
            }
        }
        $.addEvent(fontPicker, 'click', function () {
            var e = arguments[0] || window.event,
                target = e.srcElement ? e.srcElement : e.target,
                command = this.getAttribute("title");
            var nn = target.nodeName.toLowerCase();
            if (nn == 'a') {
                var value;
                if ('fontsize' == command) {
                    value = target.getAttribute('sizevalue');
                } else {
                    value = target.innerHTML;
                }
                _format(command, value);
                fontPicker.style.display = 'none';
            }
        });
        var _format = function (x, y) {//内部私有函数，处理富文本编辑器的格式化命令
            try {
                iframeDocument.execCommand(x, false, y);
                iframe.contentWindow.focus();
            } catch (e) { }
        }

        addSheet('\
          #RTE_iframe{width:600px;height:300px;}\
          #RTE_toolbar{float:left;width:600px;background:#D5F3F4;}\
          #RTE_toolbar .button{display:block;float:left;border:1px solid #CCC;margin-left:5px;\
               color:#000;background:#D0E8FC;height:20px;text-align:center;padding:0 10px;white-space: nowrap;}\
          #RTE_toolbar select{float:left;height:20px;width:60px;margin-right:5px;}\
          #RTE_toolbar .button:hover{color:#fff;border-color:#fff #aaa #aaa #fff;}\
          div.fontpicker{display:none;height:150px;overflow:auto;position:absolute;\
             border:2px solid #c3c9cf;background:#F1FAFA;}\
          div.fontpicker a{display:block;text-decoration:none;color:#000;background:#F1FAFA;padding:2px;}\
          div.fontpicker a:hover{color:#999;background:#e3e6e9;}');
    }
}

window.onload = function () {
    new RichTextEditor({
        id: 'editor',
        textarea_id: 'textarea'
    });
}
