// ==UserScript==
// @name         PixivPreviewer
// @namespace
// @version      1.00
// @description  在搜索页显示较大的预览图（请注意阅读详细信息）。Show preview of pictures in serach page.
// @author       Ocrosoft
// @match        https://www.pixiv.net/search.php*
// @match        https://www.pixiv.net/member_illust.php?mode=medium*
// @match        https://www.pixiv.net/member_illust.php?mode=ugoira_view*
// @match        https://www.pixiv.net/ranking.php*
// @grant        none
// @require      http://code.jquery.com/jquery-2.1.4.min.js
// @namespace
// ==/UserScript==

var mousePos;

function log(text) {
    console.log(text);
}

function activePreview() {
    $('._layout-thumbnail').parent().mouseover(function (e) {
        if (e.ctrlKey) {
            return;
        }
        var imgNode = this.children[0];
        // 鼠标位置
        mousePos = { x: e.pageX, y: e.pageY };
        // Div
        var previewDiv = document.createElement('div');
        $(previewDiv).css({ 'position': 'absolute', 'z-index': '999999' });
        $(previewDiv).addClass('pixivPreview');
        // 添加Div
        $('body')[0].appendChild(previewDiv);
        // 加载中图片
        var loadingImg = new Image();
        loadingImg.src = 'https://raw.githubusercontent.com/shikato/pixiv_sk/master/loading.gif';
        $(loadingImg).css('position', 'absolute');
        previewDiv.appendChild(loadingImg);
        // 要显示图片
        var loadImg = new Image();
        previewDiv.appendChild(loadImg);
        // 表示显示的是原图的图标
        var originIcon = new Image();
        originIcon.src = 'https://source.pixiv.net/www/images/pixivcomic-favorite.png';
        $(originIcon).css({ 'position': 'absolute', 'bottom': '0px', 'right': '0px', 'display': 'none' });
        previewDiv.appendChild(originIcon);
        // 点击图标新网页打开原图
        $(originIcon).click(function () {
            window.open($(previewDiv).children('img')[1].src);
        });
        $(previewDiv).css({ 'left': mousePos.x + 'px', 'top': mousePos.y + 'px' });

        function viewImages(imgs, index, imgsOrigin) {
            if (!imgs || imgs.length == 0) return;
            if (index < 0) return;
            if (!imgsOrigin || imgsOrigin.length == 0 || imgs.length != imgsOrigin.length) return;
            if (!index) index = 0;

            if ($(previewDiv).children('script').length == 0) {
                // 绑定点击事件，Ctrl+左键 单击切换原图
                loadImg.addEventListener('click', function (ev) {
                    // 按住 Ctrl 来回切换原图
                    if (ev.ctrlKey) {
                        if (loadImg.src.indexOf('origin') == -1) {
                            viewImages(allImgsOrigin, parseInt($($('.pixivPreview').children('img')[1]).attr('data-index')), allImgs);
                        } else {
                            viewImages(allImgs, parseInt($($('.pixivPreview').children('img')[1]).attr('data-index')), allImgsOrigin);
                        }
                    }
                    // 按住 Shift 点击图片新标签页打开原图
                    else if (ev.shiftKey) {
                        window.open(allImgsOrigin[parseInt($($('.pixivPreview').children('img')[1]).attr('data-index'))]);
                    }
                });
            }
            // 多图时绑定点击事件，点击图片切换到下一张
            if (index == 0 && imgs.length != 1 && $(previewDiv).children('._work').length == 0) {
                loadImg.addEventListener('click', function (e) {
                    if (e.ctrlKey || e.shiftKey) return;
                    var newIndex = parseInt($($('.pixivPreview').children('img')[1]).attr('data-index')) + 1;
                    if (newIndex == allImgs.length) newIndex = 0;
                    $('.pixivPreview').children('div').children('div').children('span')[0].innerHTML = (newIndex + 1) + '/' + allImgs.length;
                    if (loadImg.src.indexOf('origin') == -1) {
                        viewImages(allImgs, newIndex, allImgsOrigin);
                    } else {
                        viewImages(allImgsOrigin, newIndex, allImgs);
                    }
                });
            }

            // 右上角张数标记
            if (imgs.length != 1 && index == 0 && $(previewDiv).children('._work').length == 0) {
                var iconDiv = document.createElement('div');
                iconDiv.innerHTML = '<div class="page-count"><div class="icon"></div><span>1/' + imgs.length + '</span></div>';
                $(iconDiv).addClass('_work');
                $(iconDiv).css({ 'position': 'absolute', 'top': '0px', 'display': 'none' });
                previewDiv.appendChild(iconDiv);
            }

            // 预加载
            loadImg.src = '';
            $(loadImg).css({ 'width': '', 'height': '', 'display': 'none' });
            $(loadingImg).css('display', '');
            $(originIcon).css('display', 'none');
            $(iconDiv).css({ 'display': 'none' });
            loadImg.addEventListener('load', function () {
                if (loadImg.src.indexOf('githubusercontent') != -1) return;
                // 调整图片大小
                var width = loadImg.width, screenWidth = document.documentElement.clientWidth;
                var height = loadImg.height, screenHeight = document.documentElement.clientHeight;
                var viewHeight, viewWidth;
                // 长图
                if (height > width) {
                    viewHeight = screenHeight / 2;
                    viewWidth = viewHeight / height * width;
                    var scale = 1.0;
                    while (viewWidth * scale > screenWidth / 2) {
                        scale -= 0.01;
                    }
                }
                // 宽图
                else {
                    viewWidth = screenWidth / 2;
                    viewHeight = viewWidth / width * height;
                    var scale = 1.0;
                    while (viewHeight * scale > screenHeight / 2) {
                        scale -= 0.01;
                    }
                }
                $(loadImg).css({ 'height': viewHeight * scale + 'px', 'width': viewWidth * scale + 'px' });
                $(previewDiv).css({ 'height': viewHeight * scale + 'px', 'width': viewWidth * scale + 'px' });
                $(loadingImg).css({ 'left': viewWidth * scale / 2 - 24 + 'px', 'top': viewHeight * scale / 2 - 24 + 'px' });
                $(loadImg).css('display', '');
                $(loadingImg).css('display', 'none');
                $(iconDiv).css({ 'display': '' });
                if (loadImg.src.indexOf('origin') != -1) {
                    $(originIcon).css({ 'display': '' });
                } else {
                    $(originIcon).css({ 'display': 'none' });
                }
                // 调整图片位置
                var divX = mousePos.x, divY = mousePos.y;
                if (mousePos.x > screenWidth / 2) {
                    divX -= $(loadImg).css('width').split('px')[0];
                }
                if ((mousePos.y - document.body.scrollTop) >
                    screenHeight / 2) {
                    divY -= $(loadImg).css('height').split('px')[0];
                }
                $(previewDiv).css({ 'left': divX + 'px', 'top': divY + 'px' });
                // 第一次显示预览时将图片列表添加到末尾
                if ($(previewDiv).children('script').length == 0) {
                    var s = document.createElement('script');
                    // 输出预览图URL
                    var tmp = "var allImgs=['";
                    tmp += imgs[0];
                    for (var i = 1; i < imgs.length; ++i) {
                        tmp += "','" + imgs[i];
                    }
                    tmp += "'];";
                    // 输出原图URL
                    tmp += "var allImgsOrigin=['";
                    tmp += imgsOrigin[0];
                    for (var i = 1; i < imgsOrigin.length; ++i) {
                        tmp += "','" + imgsOrigin[i];
                    }
                    tmp += "'];";
                    // 输出
                    s.innerHTML = tmp;
                    previewDiv.appendChild(s);
                }
            });
            $(loadImg).attr('data-index', index);
            loadImg.src = imgs[index];
        }

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var resText = xmlHttp.responseText;
                // 单图
                try {
                    // 取得图片地址
                    // 预览图
                    var imgSource = RegExp('<div class="_layout-thumbnail ui-modal-trigger">[^>]*>').
                        exec(resText)[0].split('<')[2].split('\"')[1];
                    // 原图
                    var imgOrigin = RegExp('<div class="_illust_modal.*class="original-image').
                        exec(resText)[0].split('data-src="')[1].split('\"')[0];
                    viewImages([imgSource], 0, [imgOrigin]);
                    return;
                } catch (e) {
                    // empty
                }
                // 多图
                try {
                    var img, imgs = [];
                    var reg = new RegExp('https://i.pximg.net/img-master[^\"]*', 'g');
                    while ((img = reg.exec(resText.split('<section class=\"manga\">')[1].
                        split('</section>')[0])) !== null) {
                        imgs.push(img[0]);
                    }
                    // 推出来的原图URL，暂时没有想到效率高的办法（imgs.length 次xmlHttpRequest）
                    var imgsOrigin = [];
                    for (var i = 0; i < imgs.length; ++i) {
                        imgsOrigin.push(imgs[i].replace('img-master', 'img-original'));
                        imgsOrigin[i] = imgsOrigin[i].replace('_master1200', '');
                    }
                    viewImages(imgs, 0, imgsOrigin);
                } catch (e) {
                    // empty
                }
            }
        };
        // 动图
        if ($(this).hasClass('ugoku-illust')) {
            $(previewDiv).children().remove();
            previewDiv.innerHTML = '<iframe width="600px" height="50%" src="https://www.pixiv.net/member_illust.php?mode=ugoira_view&illust_id=' +
                $(imgNode.children[0]).attr('data-id') + '#animePreview"/>';
            $(previewDiv).children('iframe').css('display', 'none');
            var loadingImg = new Image();
            loadingImg.src = 'https://raw.githubusercontent.com/shikato/pixiv_sk/master/loading.gif';
            $(loadingImg).css('position', 'absolute');
            previewDiv.appendChild(loadingImg);
            return;
        }
        // 多图
        else if ($(imgNode.parentNode.parentNode).children('a').hasClass('multiple')) {
            xmlHttp.open('GET', 'https://www.pixiv.net/member_illust.php?mode=manga&illust_id=' +
                $(imgNode.children[0]).attr('data-id'), true);
        }
        // 单图
        else {
            xmlHttp.open('GET', 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=' +
                $(imgNode.children[0]).attr('data-id'), true);
        }
        xmlHttp.send(null);
    });
    $('._layout-thumbnail').parent().mouseout(function (e) {
        //if (true) return;
        // 鼠标移动到预览图上
        if ($(e.relatedTarget).hasClass('pixivPreview') || $(e.relatedTarget).parents().hasClass('pixivPreview')) {
            $('.pixivPreview').mouseleave(function () {
                $('.pixivPreview').remove();
            });
        }
        // 非预览图上
        else {
            $('.pixivPreview').remove();
        }
    });
    $('._layout-thumbnail').addClass('prev');
}

(function () {
    // 动图预览辅助
    if (location.href.indexOf('medium') != -1 && location.href.indexOf('animePreview') != -1) {
        location.href = location.href.replace('medium', 'ugoira_view');
        return;
    } else if (location.href.indexOf('ugoira_view') != -1 && location.href.indexOf('animePreview') != -1) {
        var height = parseInt($('canvas').css('height').split('px'));
        var width = parseInt($('canvas').css('width').split('px'));
        var newHeight = 580 / width * height;
        $('canvas').css({ 'height': newHeight + 'px', 'width': 580 + 'px' });
        window.parent.iframeLoaded(newHeight, 580);
    }
    // 主要功能
    setInterval(function () {
        var t = $('._layout-thumbnail');
        if (!$(t[t.length - 1]).hasClass('prev')) {
            activePreview();
        }
    }, 500);
})();

function iframeLoaded(height, width) {
    log('loaded');
    $('.pixivPreview').children('iframe').css({ 'width': width + 20 + 'px', 'height': height + 20 + 'px' });
    // 调整位置
    var divX = mousePos.x, divY = mousePos.y;
    var screenWidth = document.documentElement.clientWidth;
    var screenHeight = document.documentElement.clientHeight;
    if (mousePos.x > screenWidth / 2) {
        divX -= width;
    }
    if ((mousePos.y - document.body.scrollTop) >
        screenHeight / 2) {
        divY -= height;
    }
    $('.pixivPreview').css({ 'left': divX + 'px', 'top': divY + 'px' });
    $('.pixivPreview').children('iframe').css('display', '');
    $('.pixivPreview').children('img').remove();
}