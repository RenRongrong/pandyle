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

jQuery.fn.moveLeft = function(x, duration, callback) {
    var left = this.css('left') ? parseFloat(this.css('left')) : 0;
    var timing = duration ? duration : 0;
    callback ? this.animate({ left: left - x }, timing, function() { callback(this) }) : this.animate({ left: left - x }, timing);
}

$(document).ready(function() {
    initCarousel();
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
    var width = $(element).width();
    var duration = $(element).data('timing') ? $(element).data('timing') : 1000;
    var current = $(element).children('.active');
    var prev = current.prev().length == 0 ? $(element).children().last() : current.prev();
    var next = current.next().length == 0 ? $(element).children().first() : current.next();
    var currentLeft = current.css('left') ? parseFloat(current.css('left')) : 0;

    function showPrev() {
        if (prev.hasClass('hidden')) {
            prev.css('left', 0 - width).removeClass('hidden');
        }
    }

    function showNext() {
        if (next.hasClass('hidden')) {
            next.css('left', width).removeClass('hidden');
        }
    }

    this.prev = prev;
    this.active = current;
    this.next = next;
    this.showPrev = showPrev;
    this.showNext = showNext;

    this.slidePrev = function() {
        if ($(element).children().length < 2) {
            return;
        }
        showPrev();
        $(current).moveRight(width - currentLeft, 1000, function() {
            $(current).removeClass('active').addClass('hidden');
        });
        $(prev).moveRight(width - currentLeft, 1000, function() {
            $(prev).addClass('active');
        });
        $(next).addClass('hidden');
    }

    this.slideNext = function() {
        if ($(element).children().length < 2) {
            return;
        }
        showNext();
        $(current).moveLeft(width + currentLeft, duration, function() {
            $(current).removeClass('active').addClass('hidden');
        });
        $(next).moveLeft(width + currentLeft, duration, function() {
            $(next).addClass('active');
        });
        $(prev).addClass('hidden');
    }
}

function initCarousel() {
    $('.carousel').each(function(index, ele) {
        if ($(ele).children().length < 2) {
            return;
        }
        var currentX = 0;
        var startX = 0;
        var width = $(ele).width();
        var carousel;
        var startPrevX = 0;
        var startActiveX = 0;
        var startNextX = 0;
        $(ele).on('touchstart', function(e) {
            var x = e.targetTouches[0].clientX;
            startX = currentX = x;
            carousel = $(ele).carousel();
            carousel.showPrev();
            carousel.showNext();
            startPrevX = parseFloat(carousel.prev.css('left'));
            startNextX = parseFloat(carousel.next.css('left'));
        })
        $(ele).on('touchmove', function(e) {
            currentX = e.targetTouches[0].clientX;
            var delta = currentX - startX;
            carousel.prev.css('left', startPrevX + delta);
            carousel.active.css('left', startActiveX + delta);
            carousel.next.css('left', startNextX + delta);
        })
        $(ele).on('touchend', function(e) {
            if (currentX - 5 > startX) {
                $(ele).carousel().slidePrev();
            } else if (currentX + 5 < startX) {
                $(ele).carousel().slideNext();
            }
        })
    })
}