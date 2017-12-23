/// <reference path="node_modules/@types/jquery/index.d.ts" />

jQuery.fn.carousel = function() {
    var crs = new carousel(this);
    return crs;
}

jQuery.fn.moveRight = function(x, duration, callback) {
    var elements = this;
    var timing = duration ? duration : 0;
    var dests = [];
    elements.each(function(index, ele) {
        var left = $(ele).css('left') ? parseFloat($(ele).css('left')) : 0;
        dests[index] = left + x;
    })
    perform(function() {
        elements.each(function(index, ele) {
            var left = $(ele).css('left') ? parseFloat($(ele).css('left')) : 0;
            $(ele).css('left', left + (x / 30));
        })
    }, duration, function() {
        elements.each(function(index, ele) {
            $(ele).css('left', dests[index]);
        })
        if (callback) {
            callback(this);
        }
    })
}

jQuery.fn.moveLeft = function(x, duration, callback) {
    this.moveRight(-x, duration, callback);
}


function perform(story, duration, callback) {
    var fps = 30;
    var timing = duration ? duration : 500;
    var now;
    var begin = Date.now();
    var then = Date.now();
    var interval = 1000 / fps;
    var delta;
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    function tick() {
        now = Date.now();　　
        if (window.requestAnimationFrame) {　　　　　　
            delta = now - then;　　
            if (delta > interval) {　　　
                then = now - (delta);　　　　
                story();
            }
            if (now < begin + duration) {
                requestAnimationFrame(tick);
            } else {
                callback();
            }
        } else {
            story();
            if (now < begin + duration) {
                setTimeout(tick, interval);
            } else {
                callback();
            }
        }
    }
    tick();
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
    var duration = $(element).data('timing') ? $(element).data('timing') : 500;
    var afterSlide = [];

    function current() {
        return $(element).children('.active');
    }

    function prev() {
        return current().prev().length == 0 ? $(element).children().last() : current().prev();
    }

    function next() {
        return current().next().length == 0 ? $(element).children().first() : current().next();
    }

    function showPrev() {
        if (prev().hasClass('hidden')) {
            prev().css('left', 0 - width).removeClass('hidden');
        }
    }

    function showNext() {
        if (next().hasClass('hidden')) {
            next().css('left', width).removeClass('hidden');
        }
    }

    function currentLeft() {
        return current().css('left') ? parseFloat(current().css('left')) : 0;
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
        var temp_current = current();
        var temp_prev = prev();
        var temp_next = next();
        element.children(':not(.hidden)').moveRight(width - currentLeft(), duration, function() {
            temp_current.removeClass('active').addClass('hidden');
            temp_prev.addClass('active');
            afterSlide.forEach(function(handler) {
                handler.apply(this);
            })
        })
        temp_next.addClass('hidden');
    }

    this.slideNext = function() {
        if ($(element).children().length < 2) {
            return;
        }
        showNext();
        var temp_current = current();
        var temp_prev = prev();
        var temp_next = next();
        element.children(':not(.hidden)').moveLeft(width + currentLeft(), duration, function() {
            temp_current.removeClass('active').addClass('hidden');
            temp_next.addClass('active');
            afterSlide.forEach(function(handler) {
                handler.apply(this);
            })
        })
        temp_prev.addClass('hidden');
    }

    this.afterSlide = function(handler) {
        afterSlide.push(handler);
    }
}

function initCarousel() {
    $('.carousel').each(function(index, ele) {
        if ($(ele).children().length < 2) {
            return;
        }
        if ($(ele).children().length == 2) {
            var first = $(ele).children().first();
            var second = $(ele).children().last();
            $(ele).append(first.prop('outerHTML')).append(second.prop('outerHTML'));
        }
        if ($(ele).children('.active').length < 1) {
            $(ele).children().first().addClass('active');
        }
        $(ele).children(':not(.active)').addClass('hidden');
        var currentX = 0;
        var startX = 0;
        var width = $(ele).width();
        var carousel = $(ele).carousel();
        var startPrevX = 0;
        var startActiveX = 0;
        var startNextX = 0;
        var touchFlag = true;
        var moveFlag = false;
        var endFlag = false;
        carousel.afterSlide(function() {
            touchFlag = true;
        })

        $(ele).on('touchstart', function(e) {
            if (!touchFlag) {
                return false;
            }
            touchFlag = false;
            var x = e.targetTouches[0].clientX;
            startX = currentX = x;
            carousel.showPrev();
            carousel.showNext();
            startPrevX = parseFloat(carousel.prev().css('left'));
            startNextX = parseFloat(carousel.next().css('left'));
            moveFlag = true;

        })
        $(ele).on('touchmove', function(e) {
            if (!moveFlag) {
                return false;
            }
            currentX = e.targetTouches[0].clientX;
            var delta = currentX - startX;
            carousel.prev().css('left', startPrevX + delta);
            carousel.active().css('left', startActiveX + delta);
            carousel.next().css('left', startNextX + delta);
            endFlag = true;
        })
        $(ele).on('touchend', function(e) {
            moveFlag = false;
            if (!endFlag) {
                touchFlag = true;
                return false;
            }
            endFlag = false;
            if (currentX - 5 > startX) {
                carousel.slidePrev();
            } else if (currentX + 5 < startX) {
                carousel.slideNext();
            } else {
                carousel.active().css('left', 0);
                carousel.prev().addClass('hidden');
                carousel.next().addClass('hidden');
                touchFlag = true;
            }
        })
    })
}