/// <reference path="node_modules/@types/jquery/index.d.ts" />

jQuery.fn.carousel = function() {
    var crs = new carousel(this);
    return crs;
}

jQuery.fn.moveRight = function(x, duration, callback) {
    var left = this.css('left') ? parseFloat(this.css('left')) : 0;
    var timing = duration ? duration : 0;
    callback ? this.animate({ left: left + x }, timing, function() { callback(this) }) : this.animate({ left: left + x }, timing);
}

$(document).ready(function() {
    updateFlex();
    if ('undefined' != typeof Vue) {
        Vue.nextTick(updateFlex);
    };

    $('.tab-hover').on('mouseenter', switchTab);
    $('.tab-click').on('click', switchTab);
})

function updateFlex() {
    $('.flex').each(function(index, ele) {
        if ($(ele).data('gap')) {
            var gap = parseFloat($(ele).data('gap')) / 2 + 'px';
            if ($(ele).hasClass('vertical')) {
                $(ele).children().css({ 'margin-top': gap, 'margin-bottom': gap });
                $(ele).children().first().css('margin-top', '0');
                $(ele).children().last().css('margin-bottom', '0');
            } else {
                $(ele).children().css({ 'margin-left': gap, 'margin-right': gap });
                $(ele).children().first().css('margin-left', '0');
                $(ele).children().last().css('margin-right', '0');
            }
        }
    });
}

function switchTab(e) {
    var ele = e.currentTarget;
    $(ele).siblings().removeClass('active');
    $(ele).addClass('active');
    var id = '#' + $(ele).data('target');
    $(id).siblings().addClass('hidden');
    $(id).removeClass('hidden');
}

function carousel(element) {
    this.prev = function() {
        if ($(element).children().length < 2) {
            return;
        }
        var width = $(element).width();
        var current = $(element).children('.active');
        var prev = current.prev().length == 0 ? $(element).children().last() : current.prev();
        prev.css('left', 0 - width).removeClass('hidden');
        $(current).moveRight(width, 1000, function() {
            $(current).removeClass('active').addClass('hidden');
        });
        $(prev).moveRight(width, 1000, function() {
            $(prev).addClass('active');
        })
    }
}