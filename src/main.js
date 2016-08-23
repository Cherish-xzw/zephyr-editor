//加一个分号，防止别人的代码没有以
//分号结束时以下代码无法运行,
; (function ($, window, document, undefined) {

    //为window,document对象创建局部引用，
    //可以使这两个对象在函数体内最精简，以缩短
    //函数体内访问这两个对象的时间，低版本
    //的ECMAScript标准中可以对undefined重新
    //赋值，这样做可以确保undefined值不被修改

    var pluginName = 'zephyr',
        defaults = {
            width: "700px",
            height: "300px",
            border: "#000000 1px solid"
        };

    //构造函数
    function Plugin(element, options) {
        this.element = element;

        //$.extend能够合并两个或两个以上的objects并把合并结果
        //存储在第一个对象里面.第一个对象通常是{},因为不能让实例
        //对象修改默认的设置
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    //创建工具栏和容器div以及iframe
    var editorContainer = document.createElement("div"),
        editorToolbar = document.createElement("div"),
        editorIframe = document.createElement("iframe"),
        boldBtn = document.createElement("input");

    //并将DOM对象转化成jQuery对象
    var $editorContainer = $(editorContainer),
        $editorToolbar = $(editorToolbar),
        $editorIframe = $(editorIframe),
        $boldBtn = $(boldBtn);

    var iframeDocument = {};

    Plugin.prototype.init = function () {
        //隐藏原有的textarea
        var $textarea = $(this.element);
        $textarea.css("display", "none");

        $editorContainer.addClass("zephyr-container");
        $editorToolbar.addClass("zephyr-toolbar");
        $editorIframe.attr("id", "zephyr-iframe");
        $boldBtn.attr({
            type: "button",
            value: "B"
        });

        $editorIframe.css({
            border: this.options.border,
            width: this.options.width,
            height: this.options.height
        });

        $textarea.before($editorToolbar);
        $textarea.before($editorIframe);

        $editorToolbar.append($boldBtn);

        iframeDocument = editorIframe.contentWindow.document;
        iframeDocument.designMode = "On";
        $boldBtn.bind("click", features.iBold(iframeDocument));

    }

    var features = {
        iBold: function (iDocument) {
            alert("clicked.")
            iDocument.execCommand("bold", false, null);
        }
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            //查询$.data中存储的插件，避免重复实例化多个插件 
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    }
    //传入jQuery可以确保$始终指向jQuery    
})(jQuery, window, document);
