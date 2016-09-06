//加一个分号，防止别人的代码没有以
//分号结束时以下代码无法运行,
;(function ($, window, document, undefined) {

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

                    return {browser: match[1] || "", version: match[2] || "0"};
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
            toolbarBtnClass: "zephyr-button"
        };

        this.commands = {
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
            "html": "查看",
            "fontcolor": "字体颜色"
        };

        this.features = {
            removeFormat: {
                groupIndex: 0
            },
            bold: {
                groupIndex: 1,
                tags: ["b", "strong"],
                css: {
                    fontWeight: "bold"
                },
                tooltip: "Bold",
                hotkey: {
                    "ctrl": 1, "key": 66
                }
            },
            italic: {
                groupIndex: 2
            },
            underline: {
                groupIndex: 3
            },
            strikeThrough: {
                groupIndex: 4
            },
            justifyLeft: {
                groupIndex: 5
            },
            justifyCenter: {
                groupIndex: 6
            },
            justifyRight: {
                groupIndex: 7
            },
            indent: {
                groupIndex: 8
            },
            outdent: {
                groupIndex: 9
            },
            insertOrderedList: {
                groupIndex: 10
            },
            insertUnorderedList: {
                groupIndex: 11
            },
            createLink: {
                groupIndex: 12
            },
            insertImage: {
                groupIndex: 13
            },
            insertTable: {
                groupIndex: 14
            },
            html: {
                groupIndex: 15
            },
            fontColor: {
                groupIndex: 16
            }
        };

        this.element = element;
        this.editor = null;
        this.iframeDocument = null;
        //与界面相关的成员变量
        this.ui = {};
        this.ui.self = this;
        this.ui.toolbar = null;
        this.ui.font = {
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
            }
        };
        this.viewHTML = true;


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

        self.initIFrame();
        self.initToolbar();
        //隐藏原有的textarea
        $(self.element)
            .hide()
            .before(self.ui.toolbar)
            .before(self.editor)
            .css({
                border: self.options.border,
                width: self.options.width,
                height: self.options.height
            });
        self.addFeatures();
    };

    Plugin.prototype.initIFrame = function () {
        var self = this;

        //设置iframe的默认样式
        self.editor =
            $("<iframe></iframe>")
                .addClass(self.options.iframeClass)
                .css({
                    border: self.options.border,
                    width: self.options.width,
                    height: self.options.height
                })
                .on("load.zephyr", function () {
                    //获取iframe的document
                    self.iframeDocument = self.editor.prop("contentWindow").document
                        || self.editor.prop("contentDocument");
                    self.iframeDocument.designMode = "On";
                    self.iframeDocument.body.setAttribute("contenteditable", true);
                });
    };

    Plugin.prototype.initToolbar = function () {
        var self = this;

        //初始化toolbar的按钮
        self.ui.toolbar =
            $("<div></div>")
                .addClass(self.options.toolbarClass);
        var $btn =
            $("<button></button>")
                .addClass(self.options.toolbarBtnClass)
                .attr("type", "button");
        var features = self.commands;
        //为toolbar添加功能按钮
        for (var i in features) {
            $btn
                .clone()
                .appendTo(self.ui.toolbar)
                .text(features[i])
                .attr("title", i);
            self.ui.toolbar[i] = $btn;
        }
    };

    Plugin.prototype.addFeatures = function () {
        var self = this;
        self.ui.toolbar.bind("click.zephyr", function (event) {
            command = $(event.target).attr("title");
            switch (command) {
                case "createlink":
                case "insertimage":
                    var value = prompt("请输入URL地址");
                    self.execute(command, value);
                    break;
                case "fontname":
                case "fontsize":
                case "forecolor":
                case "backcolor":
                    return;
                case "fontcolor":
                    (function () {
                        self.initColorPicker();
                    })();
                    break;
                case "html":
                    (function () {
                        if (self.viewHTML) {
                            self.switchToHTML();
                            self.viewHTML = false;
                        } else {
                            self.switchToEditor();
                            self.viewHTML = true;
                        }
                    })();
                    break;
                default:
                    self.execute(command, null);
                    break;
            }
        });
    };

    Plugin.prototype.execute = function (command, value) {
        var self = this;
        try {
            self.iframeDocument.execCommand(command, false, value);
            self.iframeDocument.contentWindow.focus();
        } catch (error) {

        }
    };

    Plugin.prototype.switchToHTML = function () {
        var self = this;

        self.editor.hide();
        $(self.element)
            .show()
            .val(self.iframeDocument.body.innerHTML)
            .focus();
    };

    Plugin.prototype.switchToEditor = function () {
        var self = this;
        self.editor.show();
        $(self.element).hide();
        self.iframeDocument.body.innerHTML = $(self.element).val();
        self.editor.prop("contentWindow").focus();

    };

    Plugin.prototype.initColorPicker = function () {
        var self = this;

        var hex = ['FF', 'CC', '99', '66', '33', '00'];
        var $table = $("<table><tr><td>This is a table</td></tr></table>");
        $table
            .css("position", "relative")
            .after(this.toolbar)
            .toggle();
    };

    Plugin.prototype.drawColorPicker = function () {
        var _hex = ['FF', 'CC', '99', '66', '33', '00'],
            builder = [],
        // 呈现一个颜色格
            _drawCell = function (builder, red, green, blue) {
                builder.push('<td bgcolor="');
                builder.push('#' + red + green + blue);
                builder.push('" unselectable="on"></td>');
            },
        // 呈现一行颜色
            _drawRow = function (builder, red, blue) {
                builder.push('<tr>');
                for (var i = 0; i < 6; ++i) {
                    _drawCell(builder, red, _hex[i], blue)
                }
                builder.push('</tr>');
            },
        // 呈现六个颜色区之一
            _drawTable = function (builder, blue) {
                builder.push('<table class="cell" unselectable="on">');
                for (var i = 0; i < 6; ++i) {
                    _drawRow(builder, _hex[i], blue)
                }
                builder.push('</table>');
            };
        //开始创建
        builder.push('<div><table><tr>');
        for (var i = 0; i < 3; ++i) {
            builder.push('<td>');
            _drawTable(builder, _hex[i]);
            builder.push('</td>');
        }
        builder.push('</tr><tr>');
        for (var i = 3; i < 6; ++i) {
            builder.push('<td>');
            _drawTable(builder, _hex[i])
            builder.push('</td>');
        }
        builder.push('</tr></table>');
        builder.push('<table id="color_result"><tr><td id="color_view"></td><td id="color_code"></td></tr></table>');
        return builder.join('');
    };

    Plugin.prototype.drawTable = function () {
        var _drawInput = function (builder, name, value) {
                builder.push('<input id="');
                builder.push(name);
                builder.push('" value="');
                builder.push(value);
                builder.push('" />');
            },
            builder = [];
        builder.push('<table>');
        builder.push('<tr><td colspan="2" style="padding:2px" bgcolor="#D0E8FC">');
        builder.push('插入表格');
        builder.push('</td></tr>');
        builder.push('<tr><td>行数</td><td>');
        _drawInput(builder, 'rows', 3);
        builder.push('</td></tr>');
        builder.push('<tr><td>列数</td><td>');
        _drawInput(builder, 'cols', 5);
        builder.push('</td></tr>');
        builder.push('<tr><td>宽度</td><td>');
        _drawInput(builder, 'width', 300);
        builder.push('</td></tr>');
        builder.push('<tr><td colspan="2" style="padding-top:6px;">');
        builder.push('<input type="button" id="rte_submit" value="提交" unselectable="on" />');
        builder.push('<input type="button" id="rte_cancel" value="取消" unselectable="on" />');
        builder.push('</td></tr>');
        builder.push('</table>');
        return builder.join('');
    };
    
    Plugin.prototype.createTable = function () {
        var builder = [];
        builder.push('<table border="1" width="');
        builder.push(width);
        builder.push('">');
        for (var r = 0; r < rows; r++) {
            builder.push('<tr>');
            for (var c = 0; c < cols; c++) {
                builder.push('<td>&nbsp;</td>');
            }
            builder.push('</tr>');
        }
        builder.push('</table>');
        return builder.join('');
    };

    Plugin.prototype.initFontPicker = function () {
        var self = this;

    };

    Plugin.prototype.appendFeatures = function () {
        var self = this,
            features = this.features
            ;
    };

    Plugin.prototype.getRange = function () {
        var selection = this.getSelection();
        if (!selection) {
            return null;
        }
        if (selection.rangeCount && selection.rangeCount > 0) {
            selection.getRangeAt(0);
        } else if (selection.createRange) {
            return selection.createRange();
        }
        return null;
    };

    Plugin.prototype.getSelection = function () {
        return (
            window.getSelection &&
            window.getSelection() !== null &&
            window.getSelection().createRange
        ) ? window.getSelection() : window.document.selection;
    };

    Plugin.prototype.setContent = function (newContent) {
        this.iframeDocument.body.innerHTML = newContent;
        this.saveContent();
        return this;
    };

    Plugin.prototype.saveContent = function (filter) {
        if (this.viewHTML) {
            return;
        }
        var content, newContent;
        content = (typeof filter === "function")
            ? filter(this.getContent()) : this.getContent();
        var event = $.Event("change");
        event.source = this;
        $(this.element).val(content).trigger(event);
    };

    Plugin.prototype.getContent = function () {
        if (this.viewHTML) {
            this.saveContent(this.element.value);
        }
    };
    //<----------------成员函数结束----------------->

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            //查询$.data中存储的插件，避免重复实例化多个插件 
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };
    //传入jQuery可以确保$始终指向jQuery    
})(jQuery, window, document);
