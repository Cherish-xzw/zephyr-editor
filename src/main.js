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
            border: "#000000 1px solid",
            buttons: {
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
                features: {
                    "removeformat": "还原",
                    "bold": "加粗",
                    "italic": "斜体",
                    "underline": "下划线",
                    "strikethrough": "删除线",
                    "justifyleft": "居左",
                    "justifycenter": "居中",
                    "justifyright": "居右",
                    "indent": "缩进",
                    "outdent": "悬挂",
                    "forecolor": "前景色",
                    "backcolor": "背景色",
                    "createlink": "超链接",
                    "insertimage": "插图",
                    "insertorderlist": "有序列表",
                    "insertunorderlist": "无序列表",
                    "html": "查看"
                }
            }
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

    Plugin.prototype.init = function () {
        this.createEditor();
    }

    Plugin.prototype.createEditor = function () {

        //创建相应的DOM节点
        var $textarea = $(this.element),
            $toolbar = $("<div></div>"),
            $iframe = $("<iframe></iframe>"),
            $br = $("</br>"),
            $btn = $("<button></button>");

        //隐藏原有的textarea
        $textarea
            .css("display", "none")
            .before($toolbar)
            .before($br)
            .before($iframe);

        //设置iframe的默认样式
        $iframe
            .css({
                border: this.options.border,
                width: this.options.width,
                height: this.options.height
            })
            .attr("id", "zephyr-iframe");

        $toolbar
            .addClass("zephyr-toolbar")
            .attr("id", "zephyr-toolbar");

        //获取iframe的document
        var iframeDocument = $iframe.prop("contentWindow").document
            || $iframe.prop("contentDocument");
        iframeDocument.designMode = "On";
        console.log("------ 3 -----", $iframe[0].contentWindow.document.body);
        setTimeout(function () {
            $iframe[0].contentWindow.document.body.setAttribute("contenteditable", true);
        }, 0);

        var fragment = document.createDocumentFragment();
        var features = this._defaults.buttons.features
        //为toolbar添加功能按钮    
        for (var i in features) {
            $btn
                .clone()
                .appendTo($toolbar)
                .text(features[i])
                .attr("title", i);
            // $toolbar[i] = $btn;
            // fragment.appendChild($btn[0]);
        }
        // $toolbar.append($(fragment));

        //为toolbar绑定事件
        this.addEvent($toolbar, "click", function (event) {
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
                case "html":
                    return;
                default:
                    _execute(command, null);
                    break;
            }
        });

        //内部函数，用来执行命令
        function _execute(command, value) {
            try {
                iframeDocument.execCommand(command, false, value);
                iframeDocument.contentWindow.focus();
            } catch (error) {

            }
        }
    }

    Plugin.prototype.addEvent = function ($ele, type, fn) {
        $ele.bind(type, fn);
    };

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
