//加一个分号，防止别人的代码没有以
//分号结束时以下代码无法运行,
; (function ($, window, document, undefined) {

    //为window,document对象创建局部引用，
    //可以使这两个对象在函数体内最精简，以缩短
    //函数体内访问这两个对象的时间，低版本
    //的ECMAScript标准中可以对undefined重新
    //赋值，这样做可以确保undefined值不被修改

    var pluginName = 'zephyr';

    //jQuery 1.9以上版本移除了$.brower，这里加上以支持高版本
    //TODO 根据UA判断浏览器的版本不一定可靠，有更好的方法时移除此方法
    if ($.browser === undefined) {
        $.browser = (function () {
            var ua_match = function (ua) {
                ua = ua.toLowerCase();
                var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) ||
                    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                    [];

                return { browser: match[1] || "", version: match[2] || "0" };
            },
                matched = ua_match(navigator.userAgent),
                browser = {};

            if (matched.browser) {
                browser[matched.browser] = true;
                browser.version = matched.version;
            }

            if (browser.chrome) {
                browser.webkit = true;
            } else if (browser.webkit) {
                browser.safari = true;
            }
            return browser;
        })();
    }

    //构造函数
    function Plugin(element, options) {

        //<----------------成员变量开始----------------->        

        //默认设置
        this.defaults = {
            width: "700px",
            height: "300px",
            border: "#000000 1px solid",
            iframeClass: "zephyr-iframe",
            toolbarClass: "zephyr-toolbar",
            fontName: {
                "宋体": "SimSun",
                "隶书": "LiSu",
                "楷体": "KaiTi_GB2312",
                "幼圆": "YouYuan",
                "黑体": "SimHei",
                "雅黑": "Microsoft YaHei",
                "仿宋": "FabgSong",
                "Comic Sans MS": "Comic Sans MS"
            },
            fontSize: {
                "特小": 1,
                "很小": 2,
                "小": 3,
                "中": 4,
                "大": 5,
                "很大": 6,
                "特大": 7
            },
            buttons: {
                features: {
                    "removeformat": "还原",
                    "bold": "加粗",
                    "italic": "斜体",
                    "underline": "下划线",
                    "strikethrough": "删除线",
                    "justifyleft": "居左",
                    "justifycenter": "居中",
                    "justifyright": "居右",
                    "indent": "增加缩进",
                    "outdent": "减少缩进",
                    "insertorderedlist": "有序列表",
                    "insertunorderedlist": "无序列表",
                    "createlink": "超链接",
                    "insertimage": "插图",
                    "forecolor": "前景色",
                    "backcolor": "背景色",
                    "html": "查看"
                }
            }
        };

        this.element = element;
        this.editor = null;
        this.iframeDocument = null;
        //与界面相关的成员变量
        this.ui = {};
        this.ui.self = this;
        this.ui.toolbar = null;


        //$.extend能够合并两个或两个以上的objects并把合并结果
        //存储在第一个对象里面.第一个对象通常是{},因为不能让实例
        //对象修改默认的设置
        this.options = $.extend({}, this.defaults, options);


        //<----------------成员变量结束----------------->

        this.init(element, options);
    }

    //<----------------成员函数开始----------------->
    Plugin.prototype.init = function (element, options) {
        var self = this;

        this.initIFrame();
        this.initToolbar();
        //隐藏原有的textarea
        $(this.element)
            .css("display", "none")
            .after(this.editor)
            .after(this.ui.toolbar);

        //获取iframe的document
        this.iframeDocument = this.editor.prop("contentWindow").document
            || this.editor.prop("contentDocument");
        this.iframeDocument.designMode = "On";

        //适配FireFox
        this.editor.prop("contentWindow").document.body.setAttribute("contenteditable", true);
    }

    Plugin.prototype.initIFrame = function () {
        //设置iframe的默认样式
        this.editor =
            $("<iframe></iframe>")
                .addClass(this.options.iframeClass)
                .css({
                    border: this.options.border,
                    width: this.options.width,
                    height: this.options.height
                });
    }

    Plugin.prototype.initToolbar = function () {
        var self = this;
        this.ui.toolbar =
            $("<div><!-- --></div>")
                .addClass(this.options.toolbarClass);
        var $btn = $("<button></button>");
        var features = this.defaults.buttons.features
        //为toolbar添加功能按钮    
        for (var i in features) {
            $btn
                .clone()
                .appendTo(this.ui.toolbar)
                .text(features[i])
                .attr("title", i);
            this.ui.toolbar[i] = $btn;
        }
        //为toolbar绑定事件
        this.ui.toolbar.bind("click", function (event) {
            command = $(event.target).attr("title");
            switch (command) {
                case "createlink":
                case "insertimage":
                    var value = prompt("请输入URL地址", "http://");
                    _execute(command, value);
                    break;
                case "fontname":
                case "fontsize":
                case "forecolor":
                case "backcolor":
                    return;
                case "html":
                    (function () {
                        if (switchEditMode) {
                            _switchToHTML();
                            switchEditMode = false;
                        } else {
                            _switchToEditor();
                            switchEditMode = true;
                        }
                    })();
                default:
                    _execute(command, null);
                    break;
            }
        });

        //内部函数，用来执行命令
        function _execute(command, value) {
            //进入此函数之后this变成了window,所以事先把this变成self
            try {
                self.iframeDocument.execCommand(command, false, value);
                self.iframeDocument.contentWindow.focus();
            } catch (error) {

            }
        }

        //切换到HTML代码
        function _switchToHTML() {
            this.editor.css("display", "none");
            $textarea
                .css("display", "block")
                .val(this.iframeDocument.body.innerHTML)
                .focus();
        }

        //切换到富文本编辑模式
        function _switchToEditor() {
            this.editor.css("display", "block");
            $textarea.css("display", "none");
            this.iframeDocument.body.innerHTML = $textarea.val();
            this.editor.prop("contentWindow").focus();
        }

        //为查看按钮绑定点击事件
        var switchEditMode = true;
    }
    //<----------------成员函数结束----------------->

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
