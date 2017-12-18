/// <reference path="node_modules/@types/jquery/index.d.ts" />

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