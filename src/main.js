//加一个分号，防止别人的代码没有以
//分号结束时以下代码无法运行
; (function (window, $, undefined) {

    //构造函数
    var Zephyr = function (domEle, options) {
        this.$element = domEle;
        this.defaults = {
            "cols": "100",
            "rows": "10"
        }
        this.options = $.extend({}, this.defaults, options);
    }

    //私有公有函数
    Zephyr.prototype = {
        create: function () {
            return this.$element.attr({
                "cols": this.options.cols,
                "rows": this.options.rows
            });
        }
    }

    $.fn.zephyr = function (options) {
        var editor = new Zephyr(this, options);
        return editor.create();
    }
})(window, jQuery);