var $carousels = [];

jQuery.fn.carousel = function() {
    var id = this.data('id');
    if (id != undefined) {
        if (!$carousels[id]) {
            $carousels[id] = new carousel(this);
        }
        return $carousels[id];
    } else {
        return new carousel(this);
    }
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
            $(ele).css('left', left + (x / ((duration / 1000) * 40)));
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
    var fps = 40;
    var timing = duration ? duration : 500;
    var begin = Date.now();
    var interval = 1000 / fps;
    var delta;
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    function tick() {　　
        var now = Date.now();　　　　
        story();
        if (now < begin + duration) {
            setTimeout(tick, interval);
        } else {
            callback();
        }
    }
    tick();
}

$(document).ready(function() {
    initTemplate();
    initCarousel();
    updateFlex();
    bindEvent();
    if ('undefined' != typeof Vue) {
        Vue.nextTick(updateFlex);
    };
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
        return current().prev(':not(.layer)').length == 0 ? $(element).children(':not(.layer)').last() : current().prev(':not(.layer)');
    }

    function next() {
        return current().next(':not(.layer)').length == 0 ? $(element).children(':not(.layer)').first() : current().next(':not(.layer)');
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
        if ($(element).children(':not(.layer)').length < 2) {
            return;
        }
        showPrev();
        var temp_current = current();
        var temp_prev = prev();
        var temp_next = next();
        element.children(':not(.hidden,.layer)').moveRight(width - currentLeft(), duration, function() {
            temp_current.removeClass('active').addClass('hidden');
            temp_prev.addClass('active');
            afterSlide.forEach(function(handler) {
                handler.apply(this);
            })
        })
        temp_next.addClass('hidden');
    }

    this.slideNext = function() {
        if ($(element).children(':not(.layer)').length < 2) {
            return;
        }
        showNext();
        var temp_current = current();
        var temp_prev = prev();
        var temp_next = next();
        element.children(':not(.hidden,.layer)').moveLeft(width + currentLeft(), duration, function() {
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
        var carousel = $(ele).carousel();
        initDom(index, ele, carousel);
        initTouch(ele, carousel);
    })

    function initDom(index, ele, carousel) {
        if (!$(ele).data('id')) {
            $(ele).data('id', index);
        }
        var itemNum = $(ele).children(':not(.layer)').length;
        if (itemNum < 2) {
            return;
        }
        if (itemNum == 2) {
            var first = $(ele).children(':not(.layer)').first();
            var second = $(ele).children(':not(.layer)').last();
            $(ele).append(first.prop('outerHTML')).append(second.prop('outerHTML'));
        }
        if ($(ele).children('.active').length < 1) {
            $(ele).children(':not(.layer)').first().addClass('active');
        }
        $(ele).children(':not(.active,.layer)').addClass('hidden');

        if ($(ele).hasClass('hasIndicator')) {
            if ($(ele).find('.indicator').length < 1) {
                if ($(ele).children('.layer').length < 1) {
                    $(ele).append('<div class="layer"></div>');
                }
                $(ele).children('.layer').append('<div class="indicator"></div>');
                var indicatorDom = '';
                for (var i = 0; i < itemNum; i++) {
                    indicatorDom += '<i></i>';
                }
                $(ele).find('.indicator').html(indicatorDom);
            }
        }
        initIndicator(ele, carousel, itemNum);
    }

    function initIndicator(ele, carousel, itemNum) {
        if ($(ele).find('.indicator').length > 0) {
            var indicators = $(ele).find('.indicator').children();
            if (!indicators.hasClass('active')) {
                var index = $(ele).children(':not(.layer)').index('.active');
                if (index < 0) {
                    $(indicators[0]).addClass('active');
                } else {
                    $(indicators[index]).addClass('active');
                }
            }
            carousel.afterSlide(function() {
                var index = $(ele).children(':not(.layer)').index(carousel.active());
                indicators.removeClass('active');
                if (itemNum == 2) {
                    $(indicators[index % 2]).addClass('active');
                } else {
                    $(indicators[index]).addClass('active');
                }
            });
        }
    }

    function initTouch(ele, carousel) {
        var currentX = 0;
        var startX = 0;
        var width = $(ele).width();
        var startPrevX = 0;
        var startActiveX = 0;
        var startNextX = 0;
        var touchFlag = true;
        var moveFlag = false;
        var endFlag = false;
        carousel.afterSlide(function() {
            touchFlag = true;
        });
        $(ele).on('touchstart', function(e) {
            if (!touchFlag) {
                return;
            }
            touchFlag = false;
            var x = e.targetTouches[0].clientX;
            startX = currentX = x;
            carousel.showPrev();
            carousel.showNext();
            startPrevX = parseFloat(carousel.prev().css('left'));
            startNextX = parseFloat(carousel.next().css('left'));
            moveFlag = true;
        });
        $(ele).on('touchmove', function(e) {
            if (!moveFlag) {
                return;
            }
            currentX = e.targetTouches[0].clientX;
            var delta = currentX - startX;
            carousel.prev().css('left', startPrevX + delta);
            carousel.active().css('left', startActiveX + delta);
            carousel.next().css('left', startNextX + delta);
            endFlag = true;
        });
        $(ele).on('touchend', function(e) {
            moveFlag = false;
            if (!endFlag) {
                touchFlag = true;
                return;
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
        });
    }
}

function pop(selector) {
    $(selector).removeClass('hidden');
    if ($(selector).hasClass('full')) {
        $('html,body').css('overflow', 'hidden');
    }
}

function hide(selector) {
    $(selector).addClass('hidden');
}

function bindEvent() {
    $('.tab-hover').on('mouseenter', switchTab);
    $('.tab-click').on('click', switchTab);
    $('[data-pop]').on('click', function(e) {
        var ele = e.currentTarget;
        var id = $(ele).data('pop');
        hide('.pop');
        pop('#' + id);
        return false;
    });
    $('html,body').on('click', function() {
        hide('.pop');
    })
    $('.pop').on('click', function() { return false; })
}

function initTemplate() {
    $('t').each(function() {
        var src = $(this).attr('src');
        $(this).load(src, function(res) {
            $(this).replaceWith(res);
        });
    })
}