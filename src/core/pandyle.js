// $(document).ready(function() {
//     Pandyle.initTemplate();

//     Pandyle.updateFlex();
//     Pandyle.bindEvent();
//     if ('undefined' != typeof Vue) {
//         Vue.nextTick(updateFlex);
//     };
// })

// function Pandyle() {}

// Pandyle.updateFlex = function() {
//     $('.flex').each(function(index, ele) {
//         if ($(ele).data('gap')) {
//             var gap = parseFloat($(ele).data('gap')) / 2 + 'px';
//             if ($(ele).hasClass('vertical')) {
//                 $(ele).children().css({ 'margin-top': gap, 'margin-bottom': gap });
//                 $(ele).children().first().css('margin-top', '0');
//                 $(ele).children().last().css('margin-bottom', '0');
//             } else {
//                 $(ele).children().css({ 'margin-left': gap, 'margin-right': gap });
//                 $(ele).children().first().css('margin-left', '0');
//                 $(ele).children().last().css('margin-right', '0');
//             }
//         }
//     });
// }

// Pandyle.pop = function(selector) {
//     $(selector).removeClass('hidden');
//     if ($(selector).hasClass('full')) {
//         $('html,body').css('overflow', 'hidden');
//     }
// }

// Pandyle.hide = function(selector) {
//     $(selector).addClass('hidden');
// }

// Pandyle.bindEvent = function() {

//     $('[data-pop]').on('click', function(e) {
//         var ele = e.currentTarget;
//         var id = $(ele).data('pop');
//         hide('.pop');
//         pop('#' + id);
//         return false;
//     });
//     $('html,body').on('click', function() {
//         hide('.pop');
//     })
//     $('.pop').on('click', function() { return false; })
// }

// Pandyle.initTemplate = function() {
//     $('t').each(function() {
//         var src = $(this).attr('src');
//         $(this).load(src, function(res) {
//             $(this).html(res);
//         });
//     })
// }