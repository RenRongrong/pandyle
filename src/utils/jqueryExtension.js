(function($) {
    $.fn.moveRight = function(x, duration, callback) {
        var elements = this;
        var timing = duration ? duration : 0;
        this.animate({ left: '+=' + x }, timing, function() {
            callback(this);
        })
    }

    $.fn.moveLeft = function(x, duration, callback) {
        this.moveRight(-x, duration, callback);
    }

    $.perform = function(story, frameNum, callback) {
        var num = frameNum ? frameNum : 60;
        var frame = 0;
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        function tick() {　　
            frame++;
            story();
            if (frame < num) {
                requestAnimationFrame(tick);
            } else {
                callback();
            }
        }
        tick();
    }

    $.urlQuery = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
})(jQuery)