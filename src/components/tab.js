Pandyle.switchTab = function(e) {
    var ele = e.currentTarget;
    $(ele).siblings().removeClass('active');
    $(ele).addClass('active');
    var id = '#' + $(ele).data('target');
    $(id).siblings().addClass('hidden');
    $(id).removeClass('hidden');
}

Pandyle.initTab = function() {
    $('.tab-hover').on('mouseenter', switchTab);
    $('.tab-click').on('click', switchTab);
}

$(document).ready(function() {
    Pandyle.initTab();
})