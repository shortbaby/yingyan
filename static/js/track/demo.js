/**
 * @file overview demo.js 鹰眼可视化实例js 主文件  文件依赖百度地图JSAPI 请使用高级版本浏览器 强烈推荐Chrome。
 * 基于Baidu Map API 2.0。
 * @Author: xuguanlong
 * @Date:   2015-11-03 16:10:24
 * @Last Modified by:   xuguanlong
 * @Last Modified time: 2015-11-09 15:41:26
 */
/**
 * 通用函数模块
 * @Author: xuguanlong
 */
define('track/util', function () {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    /*RGB颜色转换为16进制*/
    String.prototype.colorHex = function () {
        var that = this;
        if (/^(rgb|RGB)/.test(that)) {
            var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = that;
            }
            return strHex;
        } else if (reg.test(that)) {
            var aNum = that.replace(/#/, "").split("");
            if (aNum.length === 6) {
                return that;
            } else if (aNum.length === 3) {
                var numHex = "#";
                for (var i = 0; i < aNum.length; i += 1) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return that;
        }
    };
    /*16进制颜色转为RGB格式*/
    String.prototype.colorRgba = function (alpha) {
        var sColor = this.toLowerCase();
        var a = alpha || 1;
        a = a > 1 ? 1 : a;
        a = a < 0 ? 0 : a;
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return "rgba(" + sColorChange.join(",") + "," + a + ")";
        } else {
            return sColor;
        }
    };
    return {
        /**
         * 日期转时间戳
         * @Author: xuguanlong
         * @param   {[type]}   str_time [字符串日期 格式2014-08-29 00:00:00]
         * @return  {[type]}            [时间戳]
         */
        js_strto_time: function (str_time) {
            var new_str = str_time.replace(/:/g, '-');
            new_str = new_str.replace(/ /g, '-');
            var arr = new_str.split("-");
            var strtotime = 0;
            var datum = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
            if (datum != null && typeof datum != 'undefined') {
                strtotime = datum.getTime() / 1000;
            }
            return strtotime;
        },
        /**
         * 时间戳转日期
         * @Author: xuguanlong
         * @param   {[type]}   unixtime [时间戳]
         * @return  {[type]}            [时间戳对应的日期]
         */
        js_date_time: function (unixtime) {
            var timestr = new Date(parseInt(unixtime) * 1000);
            var datetime = this.date_format(timestr, 'yyyy-MM-dd hh:mm:ss');
            return datetime;
        },
        /**
         * 日期格式化  yyyy-MM-dd hh:mm:ss
         * @Author: xuguanlong
         * @param   {[type]}   date [description]
         * @return  {[type]}        [description]
         */
        date_format: function (date, format) {
            var o = {
                "M+": date.getMonth() + 1, //month
                "d+": date.getDate(), //day
                "h+": date.getHours(), //hour
                "m+": date.getMinutes(), //minute
                "s+": date.getSeconds(), //second
                "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
                "S": date.getMilliseconds() //millisecond
            }
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }

            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        },
        /**
         * 获取某范围内的随机数
         * @Author: xuguanlong
         * @param   {[type]}   min [最小值]
         * @param   {[type]}   max [最大值]
         * @return  {[type]}       [范围内的随机数]
         */
        random: function (min, max) {
            var r = min + Math.random() * (max - min);
            if (r < 1) {
                return r;
            }
            return Math.floor(min + Math.random() * (max - min));
        },
        colors: ['#3A3AD4', '#808000', '#FF4500', '#7b68ee', '#4169E1', '#2F4F4F', '#1E90FF', '#2E8B57',
            '#32CD32', '#2BAE18', '#8F502C', '#006400', '#6B8E23', '#8B4513', '#B22222',
            '#48525A', '#65723F', '#4F8848', '#965A25', '#264095', '#E8EDF2'
        ],
        _Linear: function (initPos, targetPos, currentCount, count) {
            var b = initPos,
                c = targetPos - initPos,
                t = currentCount,
                d = count;
            return c * t / d + b;
        }
    }
});
/*
 * 错误码定义
 */
define('track/message', function () {
    return {
        1: '请求服务出现错误，请稍后再试',
        2: '相关参数为空,无法查询轨迹信息',
        101: 'AK参数不存在,未查询到相关服务',
        200: 'AK参数错误，请检查在重试',
        201: 'AK被禁用,请到<a href="http://lbsyun.baidu.com/apiconsole/key" target="_blank">控制台</a>解禁',
        3003: '未查询到相关轨迹信息',
        4005: '未查询到相关鹰眼服务',
        9999: '<i class="fa fa-exclamation-triangle"></i>  最多同时选择10条记录'
    }
});
/**
 * 请求Url模块
 * @Author: xuguanlong
 */
define('track/urls', [], function () {
    return {
        get: function (url, params, success, before, fail, after) {
            if (before) {
                before();
            }
            fail = fail || function () {};
            after = after || function () {};
            $.ajax({
                url: url,
                data: params,
                dataType: 'json',
                success: success,
                error: fail,
                complete: after
            });
        }
    }
});
/**
 * 主模块 初始化页面 加载其他模块
 * @Author: xuguanlong
 */
define('track/demo', ['track/urls', 'track/message', 'track/track', 'track/draw', 'track/util', 'track/Timeline'], function (urls, message, trackModule, drawModule, Util, timeLineControl) {
    // 加载统计图eCharts 如果没有统计需求 可以忽略
    require.config({
        paths: {
            echarts: 'http://echarts.baidu.com/build/dist'
        }
    });
    var ctrl = $('.ctrl');
    var typeCtrs = $('.type-ctr');
    var dataPanel = $('.panel');
    var chevron = $('.ctrl i');
    var traceName = $('.name');
    var tip = $('.tip');
    var trackBtn = $('#track-btn-2');
    var trackBox = $('#track-box');
    var trackListPanel = $('#tracklist-panel');
    var dateBtn = $('#div_date');
    var date = $('#date');
    var mapZoomOut = $('.zoom-out');
    var mapZoomIn = $('.zoom-in')
    var hasLoaded = false;
    var hasLoaded_2 = false;
    var keyWord = ''; // 实时监控模式下的关键字
    var keyWord_2 = ''; // 历史轨迹模式下的关键字
    var curIndex = 1; // 实时监控模式下的分页索引
    var curIndex_2 = 1; // 历史轨迹模式下的分页索引
    var total = 0; // sevice下所有轨迹总数
    var tracklistTmpl = baidu.template('tracklist-tmpl'); // 轨迹列表的前端模板，依赖baiduTemplate
    var selTrackListTmpl = baidu.template('sel-tracklist-tmpl'); // 已选轨迹列表的前端模板，依赖baiduTemplate
    var selTracksPanel = $('#tracks-panel');
    var loadMask = $('.mask');
    var timeSpan = $('#time_span');
    var selectedTracks = {}; //存储实时监控模式下的已选track [Object 方便于查找]
    var selectedTracks_2 = {}; //存储历史轨迹模式下的已选track [Object 方便于查找]
    var selectedTrackArray = []; //存储实时监控模式下的已选track [Array 主要用于前端模板更新]
    var selectedTrackArray_2 = []; //存储历史轨迹模式下的已选track [Array 主要用于前端模板更新]
    var size = 0; //实时监控模式下的已选track 数量
    var size_2 = 0; //历史轨迹模式下的已选track 数量
    var drawer = null; //canvas绘制对象 负责所有绘制功能
    var map = null; //地图全局对象 需要在加载主模块之前初始化
    var mapMoving = false; //地图是否处于移动状态
    var selectDate = null; //选择日期
    var startTime = Util.date_format(new Date(), 'yyyy-MM-dd') + ' 00:00:00'; //查询历史轨迹的开始时间 初始状态从today 0点开始
    var endTime = Util.date_format(new Date(), 'yyyy-MM-dd') + ' 23:59:59'; //查询历史轨迹的终止时间 初始状态为today 23:59:59
    var datepicker = null; //日期选择控件对象 依赖jquery.datetimepicker.js 如果没有日期选择需求 可以忽略 或者换成其他日期选择库
    var type = 1; //模式切换类别 1:实时监控模式 2: 历史轨迹模式
    var playTimer = null; //轨迹回放的定时器
    var playing = false; // 轨迹回放的状态
    var showTime = startTime; // 时间轴 显示的时间
    var hasSetMapView = false; // 地图是否已经完成了viewport设置
    var chechSelectedTracks = false; //实时监控模式下 判断是否选择了已选按钮
    var chechSelectedTracks_2 = false; //历史轨迹模式下 判断是否选择了已选按钮
    var curTrack; //当前选中的track canvas浮动层绘制其属性
    var selTrack; //已选中的track 用于轨迹回放的时候判断当前的track
    var _colors = {}; //存储已经用了的color
    // 是否获取纠偏轨迹点 暂时用不着 忽略
    var is_processed = false;

    /**
     * [ctrlSlide 面板收起展开]
     * @Author: xuguanlong
     */
    function ctrlSlide(up) {
        if (!hasLoaded) {
            return;
        }
        if (up) {
            dataPanel.slideUp(400);
            chevron.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        } else {
            dataPanel.slideDown(400);
            chevron.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }
    }
    function changeType(tag, callback) {
        if (!drawer) {
            return;
        }
        callback = callback || function () {};
        callback.obj = callback.obj || this;
        tag = typeof (tag) == 'string' ? parseInt(tag, 10) : tag;
        if (tag) {
            type = 2;
            $('#track-btn-2').addClass('active');
            $('#track-btn').removeClass('active');
            dataPanel.hide();
            setTimeout(function () {
                dataPanel = $('#track-box');
                dataPanel.show();
                if (!hasLoaded_2) {
                    callback.call(callback.obj, curIndex_2);
                }
            }, 100);
            drawer.clearHoverLayer();
            for (var id in selectedTracks) {
                if (selectedTracks[id]._track_layer) {
                    selectedTracks[id]._track_layer.hide();
                }
                if (selectedTracks[id].aniLayer) {
                    selectedTracks[id].aniLayer.show();
                }
                if (selectedTracks[id].poiAnimation) {
                    selectedTracks[id].poiAnimation.pause();
                }
                if (selectedTracks[id].movePoiAnimation) {
                    selectedTracks[id].movePoiAnimation.pause();
                }
            }
            for (var id in selectedTracks_2) {
                if (selectedTracks_2[id]._track_layer) {
                    selectedTracks_2[id]._track_layer.hide();
                }
                if (selectedTracks_2[id].aniLayer) {
                    selectedTracks_2[id].aniLayer.show();
                }
                if (selectedTracks_2[id].poiAnimation) {
                    selectedTracks_2[id].poiAnimation.pause();
                }
                if (selectedTracks_2[id].movePoiAnimation) {
                    selectedTracks_2[id].movePoiAnimation.pause();
                }
            }
            //drawer.clearAllAnimation();
            drawer.lineCanvasLayer.show();
            drawer.canvasLayer.hide();
            $('.timeline-ctrl').addClass('show');
            $('#time_span').addClass('show');
            $('.chart-wrap').show();
            $('#time_span').html(showTime);
            $('.chart-ctrl').show();
        } else {
            type = 1;
            $('#track-btn').addClass('active');
            $('#track-btn-2').removeClass('active');
            dataPanel.hide();
            setTimeout(function () {
                dataPanel = $('.panel');
                dataPanel.show();
            }, 100);
            drawer.canvasLayer.show();
            for (var id in selectedTracks) {
                if (selectedTracks[id]._track_layer) {
                    selectedTracks[id]._track_layer.show();
                }
                if (selectedTracks[id].aniLayer) {
                    selectedTracks[id].aniLayer.hide();
                }
                if (selectedTracks[id].poiAnimation) {
                    selectedTracks[id].poiAnimation.restart();
                }
                if (selectedTracks[id].movePoiAnimation) {
                    //selectedTracks[id].poiAnimation.pause();
                    selectedTracks[id].movePoiAnimation.restart();
                }
            }
            for (var id in selectedTracks_2) {
                if (selectedTracks_2[id]._track_layer) {
                    selectedTracks_2[id]._track_layer.hide();
                }
                if (selectedTracks_2[id].aniLayer) {
                    selectedTracks_2[id].aniLayer.hide();
                }
                if (selectedTracks_2[id].poiAnimation) {
                    selectedTracks_2[id].poiAnimation.restart();
                }
                if (selectedTracks_2[id].movePoiAnimation) {
                    selectedTracks_2[id].poiAnimation.pause();
                    selectedTracks_2[id].movePoiAnimation.restart();
                }
            }
            drawer.lineCanvasLayer.hide();
            $('.timeline-ctrl').removeClass('show');
            $('#time_span').removeClass('show');
            $('.chart-wrap').hide();
            $('.chart-ctrl').hide();
            if (playing) {
                playing = false;
                clearInterval(playTimer);
                playTimer = null;
                $('.process').find('.fa').removeClass('fa-pause').addClass('fa-play');
            }
        }
    }
    /**
     * [logic 日期选择响应事件]
     * @Author: xuguanlong
     * @param   {[type]}   currentDateTime [选中的时间]
     * @return  {[type]}   null
     */
    function logic(currentDateTime) {
        var d = new Date();
        selectDate = currentDateTime;
        startTime = Util.date_format(currentDateTime, 'yyyy-MM-dd') + ' 00:00:00';
        if (currentDateTime.getFullYear() == d.getFullYear() && currentDateTime.getMonth() == d.getMonth() && currentDateTime.getDate() == d.getDate()) {
            endTime = Util.date_format(currentDateTime, 'yyyy-MM-dd') + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        } else {
            endTime = Util.date_format(currentDateTime, 'yyyy-MM-dd') + ' 23:59:59';
        }

        var startTimeStr = Util.date_format(currentDateTime, 'yyyy-MM-dd') + ' 00:00';
        var endTimeStr = Util.date_format(currentDateTime, 'yyyy-MM-dd') + ' 23:59';
        date.html(Util.date_format(currentDateTime, 'yyyy-MM-dd'));
        var start_time = timeLineControl.start_time = Util.js_strto_time(startTime);
        var end_time = timeLineControl.end_time = Util.js_strto_time(endTime);
        // 如果没有选中track 直接返回
        if (size_2 === 0) {
            return;
        }
        // 如果有选中track 则自动加载已选track的历史轨迹
        hasSetMapView = false;
        $('.chart-wrap').removeClass('max');
        $('#chart_mask').show();
        if (playing) {
            left = 0;
            ctrPlayFrame();
        }
        // 在已选的track中 循环加载
        for (id in selectedTracks_2) {
            var track = selectedTracks_2[id];
            var li = $('#seled-track-' + id);
            var cbks = {
                success: function (res) {
                    var track_id;
                    for (i in res) {
                        track_id = i;
                    }
                    var li = $('#seled-track-' + track_id);
                    li.find('.pro-bar').removeClass('progressing');
                    var track = selectedTracks_2[track_id];
                    track.pois = res[track_id] && res[track_id].pois;
                    delete track.index;
                    track.aniLayer && track.aniLayer.clearAll();
                    // 无数据
                    if (!track.pois || track.pois.length === 0) {
                        track.barBgColor = Util.colors[Util.colors.length - 1];
                    } else {
                        track.barBgColor = track.colors[0].colorRgba(1);
                    }
                    li.find('.pro-bar').css('background-color', track.barBgColor);
                    track.initTravels();
                    track.drawTravels();
                    //track.state = 2;
                    if (!track.pois || track.pois.length === 0) {
                        return;
                    }
                    if (!hasSetMapView) {
                        track.setViewMap();
                        hasSetMapView = true;
                    }
                },
                before: function () {
                    li.find('.pro-bar').addClass('progressing');
                },
                after: function () {
                    loadMask.hide();
                }
            };
            track.getHistory(start_time, end_time, cbks, is_processed);
        }
    }
    // 初始化时间轴的鼠标移动 拖拽事件
    function initTimeCtrDrag() {
        $(document).mousemove(function (e) {
            if (!!this.move) {
                var posix = !document.move_target ? {
                        'x': 0,
                        'y': 0
                    } : document.move_target.posix,
                    callback = document.call_down || function () {
                        $(this.move_target).css({
                            'top': e.pageY - posix.y,
                            'left': e.pageX - posix.x
                        });
                    };

                callback.call(this, e, posix);
            }
        }).mouseup(function (e) {
            if (!!this.move) {
                var callback = document.call_up || function () {};
                callback.call(this, e);
                $.extend(this, {
                    'move': false,
                    'move_target': null,
                    'call_down': false,
                    'call_up': false
                });
            }
        });
        var ctrMove = $('#timeCtr').mousedown(function (e) {
            var curleft = $(this).position().left;
            var me = $(this);
            var newLeft = 0;
            var startX = e.pageX;
            var percent = 0;
            playing = false;
            $.extend(document, {
                'move': true,
                'call_down': function (e) {
                    var diffX = e.pageX - startX;
                    newLeft = curleft + diffX;
                    newLeft = newLeft < 0 ? 0 : newLeft;
                    newLeft = newLeft > 1293 ? 1293 : newLeft;
                    left = newLeft;
                    ctrPlayFrame();
                },
                'call_up': function (e) {
                    if (playTimer) {
                        playing = true;
                    }
                }
            });
            return false;
        });
        $("body").keydown(function () {
            if (event.keyCode == '32' && type === 2 && playTimer) {
                var li;
                if (selTrack) {
                    li = $('#seled-track-' + selTrack.track_id);
                }
                if (playing) {
                    playing = false;
                    if (li) {
                        li.find('i').removeClass('fa-pause').addClass('fa-play');
                    }
                } else {
                    playing = true;
                    if (li) {
                        li.find('i').removeClass('fa-play').addClass('fa-pause');
                    }

                }
            }
        })
    }
    // 时间轴的总长度
    var totalLength = 768;
    var ctr = $('#timeCtr');
    // 时间轴左端移动的长度
    var left = 0;
    // 时间轴的总步数 50ms为一帧(定时器间隔时间)
    var step = totalLength / (60 * 1000 / 50);
    // 时间轴播放的时候 每一帧响应事件
    function ctrPlayFrame() {
        percent = left / totalLength;
        if (percent >= 1 && playTimer) {
            clearInterval(playTimer);
            playTimer = null;
            playing = false;
            percent = 1;
            left = totalLength;
        }
        ctr.css('left', left + 'px');
        var range = timeLineControl.endHour - timeLineControl.startHour;
        var ellapse = Math.floor((range * 60 * 60 * percent));
        var start_time = Util.js_strto_time(startTime) + timeLineControl.startHour * 60 * 60;
        var move_time = start_time + ellapse;
        showTime = Util.js_date_time(move_time);
        timeSpan.html(showTime);
        if (selTrack) {
            selTrack.play();
            // 根据时间轴时间 查找track的轨迹点
            var pos = selTrack.findPosition(move_time);
            if (!mapMoving) {
                selTrack.drawHistoryPoi(pos);
            }
        }
    }
    // 开始轨迹回放响应的事件
    function startPlayHistory() {
        // 如果已经在回放 直接返回
        if (playing) {
            return;
        }
        // 如果上次播放结束 已经完成100% 重新开始 时间轴恢复原位
        if (!playTimer && left === totalLength) {
            left = 0;
        }
        playing = true;
        playTimer = setInterval(function () {
            if (!playing) {
                return;
            }
            left += step;
            percent = left / totalLength;
            ctrPlayFrame();
        }, 50);
    }
    return {
        // 页面初始化
        initEvents: function () {
            var me = this;
            drawer = drawModule.init();
            ctrl.click(function (event) {
                var tag = dataPanel.css('display') == 'none' ? false : true;
                ctrlSlide(tag);
            });
            typeCtrs.click(function () {
                var tag = $(this).attr('data-tag');
                drawer.clearHoverLayer();
                var callback = null;
                if (tag) {
                    callback = me.loadData_2;
                    callback.obj = me;
                }
                changeType(tag, callback);
            });
            $('.filter').toggle(function () {
                $(this).html('所有');
                if (type === 1) {
                    chechSelectedTracks = true;
                    me.renderSelectedTracksPanel();
                    setTimeout(function () {
                        me.setViewMap();
                    }, 10)
                } else {
                    chechSelectedTracks_2 = true;
                    me.renderSelectedTracksPanel_2();
                }

            }, function () {
                $(this).html('已选');
                if (type === 1) {
                    chechSelectedTracks = false;
                    me.loadData(curIndex);
                } else {
                    chechSelectedTracks_2 = false;
                    me.loadData_2(curIndex_2);
                }
            });
            $('.clean').click(function () {
                if (type === 1) {
                    for (var id in selectedTracks) {
                        selectedTracks[id].dispose();
                        delete selectedTracks[id];
                    }
                    selectedTracks = {};
                    selectedTrackArray = [];
                    size = 0;
                    curTrack = null;
                    drawer.hoverLayer.clearAll();
                    if (chechSelectedTracks) {
                        me.renderSelectedTracksPanel();
                    } else {
                        me.loadData(curIndex);
                    }
                    me.seledTracksChange();
                    drawer.lineCanvasLayer.clearAll();
                } else {
                    for (var id in selectedTracks_2) {
                        selectedTracks_2[id].dispose();
                        delete selectedTracks_2[id];
                    }
                    selectedTracks_2 = {};
                    selectedTrackArray_2 = [];
                    size_2 = 0;
                    selTrack = null;
                    if (chechSelectedTracks_2) {
                        me.renderSelectedTracksPanel_2();
                    } else {
                        me.loadData_2(curIndex_2);
                    }
                    drawer.lineCanvasLayer.clearAll();
                }
            });
            trackListPanel.delegate('li', 'click', function (e) {
                var track_id = $(this).attr('data-id');
                var track_name = $(this).attr('data-name');
                var state = $(this).attr('data-state');
                if (!selectedTracks.hasOwnProperty(track_id)) {
                    me.selectTrack(track_id, track_name, state, $(e.target).hasClass('check-box'));
                } else {
                    curTrack = selectedTracks[track_id];
                    if ($(e.target).hasClass('check-box')) {
                        me.selectTrack(track_id, track_name, state, $(e.target).hasClass('check-box'));
                    } else {
                        map.centerAndZoom(selectedTracks[track_id].point, 13);
                    }
                }
                return false;
            });
            selTracksPanel.delegate('li', 'click', function (e) {
                var track_id = $(this).attr('data-id');
                var playClicked = $(e.target).hasClass('play') || $(e.target).hasClass('fa');
                var track_name = $(this).attr('data-name');
                var li = $(this);
                var start_time = Util.js_strto_time(startTime);
                var end_time = Util.js_strto_time(endTime);
                if (playClicked) {
                    if (playing && selTrack && selTrack.track_id === track_id) {
                        playing = false;
                        li.find('.fa').removeClass('fa-pause').addClass('fa-play');
                        return false;
                    }
                    if (playTimer && selTrack && selTrack.track_id === track_id && !playing) {
                        playing = true;
                        li.find('.fa').removeClass('fa-play').addClass('fa-pause');
                        return false;
                    }
                    if (selTrack && selTrack.track_id !== track_id) {
                        clearInterval(playTimer);
                        playTimer = null;
                        playing = false;
                        $('.process').find('.fa').removeClass('fa-pause').addClass('fa-play');
                    }
                }
                me.selectTrack_2(track_id, track_name, $(e.target).hasClass('check-box'));
                var track = selectedTracks_2[track_id];
                $('.seled-track').removeClass('selected');
                li.addClass('selected');
                var playClicked = $(e.target).hasClass('play') || $(e.target).hasClass('fa');
                if (track) {
                    var cbks = {
                        success: function (res) {
                            var li = $('#seled-track-' + track_id);
                            li.find('.pro-bar').removeClass('progressing');
                            selectedTracks_2[track_id].pois = res[track_id] && res[track_id].pois;
                            delete selectedTracks_2[track_id].index;
                            selectedTracks_2[track_id].aniLayer && selectedTracks_2[track_id].aniLayer.clearAll();
                            // 无数据
                            selectedTracks_2[track_id].colors[0] = _colors[track_id];
                            if (selectedTracks_2[track_id].pois.length > 0) {
                                selectedTracks_2[track_id].barBgColor = selectedTracks_2[track_id].colors[0].colorRgba(1);
                                li.find('.pro-bar').css('background-color', selectedTracks_2[track_id].barBgColor);
                            } else {
                                selectedTracks_2[track_id].barBgColor = li.find('.pro-bar').css('background-color');
                            }

                            selectedTracks_2[track_id].initTravels();
                            selectedTracks_2[track_id].drawTravels({
                                pt: true
                            });
                            selectedTracks_2[track_id].setViewMap();
                            timeLineControl.track = selectedTracks_2[track_id];
                            timeLineControl.drawTimeLineControl(timeLineControl.startHour, timeLineControl.endHour);
                            var start_time = Util.js_date_time(timeLineControl.track.travels[0][0][2]).substr(0, 10);
                            startTime = start_time + ' 00:00:00';
                            if (playClicked) {
                                if (!$('.timeline-ctrl').hasClass('show')) {
                                    $('.timeline-ctrl').addClass('show');
                                }
                                if (!$('#time_span').hasClass('show')) {
                                    $('#time_span').addClass('show')
                                }
                                li.find('.fa').removeClass('fa-play').addClass('fa-pause');
                                startPlayHistory();
                            }
                        },
                        before: function () {
                            loadMask.show();
                            li.find('.pro-bar').addClass('progressing');
                        },
                        after: function () {
                            loadMask.hide();
                            setTimeout(function () {
                                me.drawCharts();
                            }, 800)
                        }
                    }
                    trackModule.loadTrackHistory(track, start_time, end_time, cbks, is_processed);
                } else {
                    $(this).removeClass('selected');
                    if (playing) {
                        if (selTrack && selTrack.track_id === track_id) {
                            clearInterval(playTimer);
                            playTimer = null;
                            playing = false;
                            $('.process').find('.fa').removeClass('fa-pause').addClass('fa-play');
                        }
                    }
                }
                selTrack = track;
                return false;
            });
            trackBtn.click(function () {
                if (!datepicker) {
                    datepicker = dateBtn.datetimepicker({
                        timepicker: false,
                        yearStart: 1990,
                        yearEnd: new Date().getFullYear(),
                        onChangeDateTime: logic,
                        maxDate: Util.date_format(new Date(), 'yyyy/MM/dd'),
                        lang: 'ch'
                    });
                }
            });
            date.html(Util.date_format(new Date(), 'yyyy-MM-dd'));
            var canvasLayer = drawer.getLayer();
            map = window.map || new BMap.Map("mapContainer");
            drawer.hoverLayer.addEventListener('draw', function () {
                drawer.hoverLayer.clearAll();
                if (type === 2) {
                    return;
                }
                curTrack && curTrack.drawer.drawAttr(curTrack.poi, curTrack.drawer.drawObj.hoverCtx);
            });
            drawer.canvasLayer.addEventListener('draw', function () {
                drawer.canvasLayer.clearAll();
            });
            drawer.lineCanvasLayer.addEventListener('draw', function () {
                drawer.lineCanvasLayer.clearAll();
                for (var id in selectedTracks_2) {
                    if (selTrack && selectedTracks_2[id].track_id == selTrack.track_id) {
                        selectedTracks_2[id].drawTravels({
                            pt: true
                        });
                    } else {
                        selectedTracks_2[id].drawTravels();
                    }
                }
            });
            map.addEventListener('moving', function () {
                if (!mapMoving) {
                    drawer.pauseAllAnimation();
                }
                mapMoving = true;
            });
            map.addEventListener('moveend', function () {
                mapMoving = false;
                drawer.restartAllAnimation();
            });
            map.addEventListener('mousemove', function (e) {
                if (type === 2) {
                    return
                }
                var pt = {
                    x: e.offsetX,
                    y: e.offsetY
                }
                var track;
                for (var id in selectedTracks) {
                    if (selectedTracks[id].isPointIn(pt)) {
                        if (curTrack && curTrack.track_id === id) {
                            return;
                        }
                        curTrack = track = selectedTracks[id];
                        break;
                    }
                };
                drawer.hoverLayer.clearAll();
                curTrack && curTrack.drawer.drawAttr(curTrack.poi, curTrack.drawer.drawObj.hoverCtx);
            });
            map.addEventListener('zoomstart', function () {
                if (!mapMoving) {
                    drawer.pauseAllAnimation();
                }
                mapMoving = true;
            });
            map.addEventListener('zoomend', function () {
                mapMoving = false;
                drawer.restartAllAnimation();
            });
            map.addEventListener('click', function () {
                if ($('.chart-wrap').hasClass('max')) {
                    $('.chart-wrap').removeClass('max');
                }
            });
            initTimeCtrDrag();
            timeLineControl.start_time = Util.js_strto_time(startTime);
            timeLineControl.end_time = Util.js_strto_time(endTime);
            $('.search-i').click(function () {
                if (type === 1) {
                    keyWord = me.xssFilter($('#searchKey').val());
                    me.loadData(1);
                } else {
                    keyWord_2 = me.xssFilter($('#searchKey_2').val());
                    me.loadData_2(1);
                }

            });
            $('.chart-ctrl').click(function () {
                if (selectedTrackArray_2.length === 0) {
                    $('.no-track-tip').show();
                    setTimeout(function () {
                        $('.no-track-tip').hide();
                    }, 2000);
                    return;
                }
                if (!$('.chart-wrap').hasClass('max')) {
                    $('.chart-wrap').addClass('max');
                    setTimeout(function () {
                        me.drawCharts();
                    }, 800)
                }
            });
            timeLineControl.drawTimeLineControl(0, 24);
            var ctrFlag = false;
            $('#timeline').bind('mousewheel', function (event, delta, deltaX, deltaY) {
                ctrFlag = !ctrFlag;
                if (delta === 1) {
                    timeLineControl.zoomIn(ctrFlag);
                } else if (delta === -1) {
                    timeLineControl.zoomOut(ctrFlag);
                } else {
                    return;
                }
            });
            $('#timeline').mousedown(function (e) {
                var w = $(this).width();
                var x = e.pageX - $(this).offset().left;
                timeLineControl.mouseX = x;
                timeLineControl.clicked = true;
                if (x > w / 2) {
                    timeLineControl.direct = 1;
                }
                if (x < w / 2) {
                    timeLineControl.direct = 0;
                }
            })
            $('#timeline').mousemove(function (event) {
                if (timeLineControl.clicked) {
                    timeLineControl.moving = true;
                }
            });
            $('#timeline').mouseup(function (e) {
                var x = e.pageX - $(this).offset().left;
                if (x > timeLineControl.mouseX) {
                    if (timeLineControl.direct === 1 && Math.abs(timeLineControl.endHour - timeLineControl.startHour) > 1) {
                        timeLineControl.endHour--;
                    }
                    if (timeLineControl.direct === 0) {
                        timeLineControl.startHour--
                    }
                } else if (x < timeLineControl.mouseX) {
                    if (timeLineControl.direct === 1) {
                        timeLineControl.endHour++;
                    }
                    if (timeLineControl.direct === 0 && Math.abs(timeLineControl.endHour - timeLineControl.startHour) > 1) {
                        timeLineControl.startHour++
                    }
                }
                timeLineControl.startHour = timeLineControl.startHour < 0 ? 0 : timeLineControl.startHour;
                timeLineControl.endHour = timeLineControl.endHour > 24 ? 24 : timeLineControl.endHour;
                timeLineControl.drawTimeLineControl(timeLineControl.startHour, timeLineControl.endHour);
                timeLineControl.clicked = false;

            });
            mapZoomOut.click(function (event) {
                map.zoomTo(map.getZoom() + 1);
            });
            mapZoomIn.click(function (event) {
                map.zoomTo(map.getZoom() - 1);
            });
        },
        getTraceDetail: function () {
            var me = this;
            me._trace_id = me.getQueryString('i');
            me._ak = me.getQueryString('k');
            var params = {
                traceId: me._trace_id,
                ak: me._ak,
            }
            var sucCbk = function (res) {
                if (res.status === 0) {
                    me._trace = res.service;
                    me.actives = res.actives;
                    traceName.html(me._trace.name);
                    me.loadData(curIndex);
                } else {
                    tip.html(message[res.status]);
                    tip.show();
                }
            }
            tip.hide();
            urls.get('static/data/trace.json', params, sucCbk);
        },
        // 实时监控加载数据
        loadData: function (pageIndex, before, after) {
            var me = this;
            curIndex = pageIndex;
            var params = {
                traceId: me._trace_id,
                ak: me._ak,
                pageIndex: pageIndex,
                pageSize: 14
            }
            if (typeof keyWord == 'string' && keyWord.length > 0) {
                params.key = keyWord;
            }
            var time = new Date().setHours(0, 0, 0) / 1000;
            var before = before || function () {
                $('.panel-mask').show();
            };
            var after = after || function () {
                $('.panel-mask').hide();
            };
            tip.hide();
            urls.get('static/data/list.json', params, function (res) {
                if (res.status === 0) {
                    me._trace.size = res.total;
                    traceName.html(me._trace.name + '  (<span class="circle"></span>' + me.actives + '/' + res.total + ')');
                    me._trace.tracks = res.pois;
                    for (i in me._trace.tracks) {
                        if (selectedTracks.hasOwnProperty(me._trace.tracks[i].track_id)) {
                            me._trace.tracks[i].checked = true;
                        } else {
                            me._trace.tracks[i].checked = false;
                        }
                        if (me._trace.tracks[i].loc_time < time) {
                            me._trace.tracks[i].state = 'off';
                            me._trace.tracks[i].stateTxt = '离线';
                        } else if (me._trace.tracks[i].loc_time > (new Date().getTime() / 1000) - 600) {
                            me._trace.tracks[i].state = 'on';
                            me._trace.tracks[i].stateTxt = '在线';
                        } else {
                            me._trace.tracks[i].state = 'leave';
                            me._trace.tracks[i].stateTxt = '暂停';
                        }
                    }
                    hasLoaded = true;
                    me.renderPanel();
                    if (type === 1) {
                        ctrlSlide(false);
                    }
                } else {
                    if (type === 1) {
                        tip.html(message[res.status]);
                        tip.show();
                    }
                }
            }, before, null, after);
        },
        // 历史轨迹加载数据
        loadData_2: function (pageIndex, before, after) {
            var me = this;
            curIndex_2 = pageIndex;
            var params = {
                traceId: me._trace_id,
                ak: me._ak,
                pageIndex: pageIndex,
                pageSize: 10
            }
            if (typeof keyWord_2 == 'string' && keyWord_2.length > 0) {
                params.key = keyWord_2;
            }
            var time = new Date().setHours(0, 0, 0) / 1000;
            var before = before || function () {
                $('.panel-mask').show();
            };
            var after = after || function () {
                $('.panel-mask').hide();
            };
            tip.hide();
            urls.get('static/data/list.json', params, function (res) {
                if (res.status === 0) {
                    me._trace.size = res.total;
                    me._trace.tracks_2 = res.pois;
                    for (i in me._trace.tracks_2) {
                        if (selectedTracks_2.hasOwnProperty(me._trace.tracks_2[i].track_id)) {
                            me._trace.tracks_2[i].checked = true;
                        } else {
                            me._trace.tracks_2[i].checked = false;
                        }
                    }
                    hasLoaded_2 = true;
                    me.renderSeledPanel();
                } else {
                    tip.html(message[res.status]);
                    tip.show();
                }
            }, before, null, after);
        },
        // 实时监控模式下选择track 响应事件
        selectTrack: function (track_id, track_name, state, setView) {
            var checkBox = $('#cbtest_' + track_id);
            var me = this;
            if (!selectedTracks.hasOwnProperty(track_id)) {
                if (size === 10) {
                    tip.html(message['9999']);
                    tip.show();
                    setTimeout(function () {
                        tip.hide();
                    }, 1500);
                    return;
                }
                checkBox.attr("checked", "checked");
                var track = trackModule.createTrack(this._trace_id, this._ak, track_id, track_name);
                track.setChecked(true);
                track.setState(state);
                selectedTracks[track_id] = track;
                curTrack = track;
                selectedTrackArray.splice(0, 0, track);
                var cbk = null;
                if (track.timer) {
                    cbk = function () {
                        if (setView) {
                            me.setViewMap();
                        } else {
                            track.map.centerAndZoom(track.point, 13);
                        }

                    }
                } else {
                    cbk = function () {
                        if (setView) {
                            me.setViewMap();
                        } else {
                            track.map.centerAndZoom(track.point, 13);
                        }
                        track.drawPoi();
                        setTimeout(function () {
                            track.monitor();
                        }, 100);
                    }
                }
                track.getPoi(cbk);
                size++;
            } else {
                if (curTrack.track_id == track_id) {
                    curTrack = null;
                    drawer.hoverLayer.clearAll();
                }
                selectedTracks[track_id].dispose();
                selectedTrackArray.splice(selectedTrackArray.indexOf(selectedTracks[track_id]), 1);
                delete selectedTracks[track_id];
                size--;
                checkBox.attr("checked", false);
                if (setView) {
                    me.setViewMap();
                }
            }
            if (chechSelectedTracks) {
                me.renderSelectedTracksPanel();
            }
        },
        // 历史轨迹模式下选择track 响应事件
        selectTrack_2: function (track_id, track_name, del) {
            var checkBox = $('#cbtest2_' + track_id);
            var me = this;
            if (!selectedTracks_2.hasOwnProperty(track_id)) {
                if (size_2 === 10) {
                    tip.html(message['9999']);
                    tip.show();
                    setTimeout(function () {
                        tip.hide();
                    }, 1500);
                    return;
                }
                checkBox.attr("checked", "checked");
                var track = trackModule.createTrack(this._trace_id, this._ak, track_id, track_name);
                track.setChecked(true);
                selectedTracks_2[track_id] = track;
                selectedTrackArray_2.splice(0, 0, track);
                size_2++;
                if (chechSelectedTracks_2) {
                    me.renderSelectedTracksPanel_2();
                }
            } else {
                if (del) {
                    selectedTracks_2[track_id].dispose();
                    selectedTrackArray_2.splice(selectedTrackArray_2.indexOf(selectedTracks_2[track_id]), 1);
                    delete selectedTracks_2[track_id];
                    size_2--;
                    checkBox.attr("checked", false);
                    if (chechSelectedTracks_2) {
                        me.renderSelectedTracksPanel_2();
                    }
                }
            }

        },
        // 实时监控模式下 按照已选的所有track 自适应地图区域
        setViewMap: function () {
            this.bPoints = [];
            for (var s in selectedTracks) {
                this.bPoints.push(selectedTracks[s].point);
            }
            var fitView = map.getViewport(this.bPoints, {
                margins: [10, 10, 10, 10]
            });
            map.setViewport(fitView);
        },
        seledTracksChange: function () {
            var me = this;
            var obj = {};
            obj.size = size;
            obj.trackList = selectedTrackArray;
            var html = selTrackListTmpl(obj);
            selTracksPanel.html(html);
            drawer.refresh();
        },
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r !== null) return (this.xssFilter(r[2]));
            return null;
        },
        xssFilter: function (s) {
            var pattern = new RegExp("[%--`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]") //格式 RegExp("[在中间定义特殊过滤字符]")
            var rs = "";
            for (var i = 0; i < s.length; i++) {
                rs = rs + s.substr(i, 1).replace(pattern, '');
            }
            return rs;
        },
        renderPanel: function () {
            var me = this;
            if (me._trace && me._trace.tracks) {
                var obj = {};
                obj.size = me._trace.tracks.length;
                obj.trackList = me._trace.tracks;
                var html = tracklistTmpl(obj);
                trackListPanel.html(html);
                me.pagination(me._trace.size);
            }

        },
        renderSeledPanel: function () {
            var me = this;
            if (me._trace && me._trace.tracks_2) {
                var obj = {};
                obj.size = me._trace.tracks_2.length;
                obj.trackList = me._trace.tracks_2;
                var html = selTrackListTmpl(obj);
                selTracksPanel.html(html);
                me.pagination_2(me._trace.size);
                me.loadTrackHistory();
            }
        },
        loadTrackHistory: function () {
            var me = this;
            for (var k = 0, l = me._trace.tracks_2.length; k < l; k++) {
                var li = $('#seled-track-' + me._trace.tracks_2[k].track_id);
                var start_time = Util.js_strto_time(startTime);
                var end_time = Util.js_strto_time(endTime);
                var params = {
                    traceId: me._trace_id,
                    ak: me._ak,
                    ids: me._trace.tracks_2[k].track_id,
                    start_time: start_time,
                    end_time: end_time,
                    is_processed: is_processed
                }
                var cbks = {
                    success: function (res) {
                        var track_id;
                        for (d in res) {
                            track_id = d;
                        }
                        var history = res[track_id];
                        var li = $('#seled-track-' + track_id);
                        li.find('.pro-bar').removeClass('progressing');
                        if (!history.pois || history.pois.length === 0) {
                            li.find('.pro-bar').css('width', '0px');
                            return;
                        }
                        var activeTime = me.calculate(history.pois);
                        // 根据track的活跃度设置进度条长度
                        if (activeTime <= 1 * 60 * 60) {
                            li.find('.pro-bar').css('width', '10px');
                        }
                        if ((activeTime > 1 * 60 * 60) && (activeTime <= 2 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '20px');
                        }
                        if ((activeTime > 2 * 60 * 60) && (activeTime <= 3 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '30px');
                        }
                        if ((activeTime > 3 * 60 * 60) && (activeTime <= 4 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '40px');
                        }
                        if ((activeTime > 4 * 60 * 60) && (activeTime <= 5 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '50px');
                        }
                        if ((activeTime > 5 * 60 * 60) && (activeTime <= 6 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '60px');
                        }
                        if ((activeTime > 6 * 60 * 60) && (activeTime <= 7 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '70px');
                        }
                        if ((activeTime > 7 * 60 * 60) && (activeTime <= 8 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '80px');
                        }
                        if ((activeTime > 8 * 60 * 60) && (activeTime <= 9 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '90px');
                        }
                        if ((activeTime > 9 * 60 * 60) && (activeTime <= 10 * 60 * 60)) {
                            li.find('.pro-bar').css('width', '100px');
                        }
                        if (activeTime > 10 * 60 * 60) {
                            li.find('.pro-bar').css('width', '110px');
                        }
                        if (selectedTracks_2.hasOwnProperty(track_id)) {
                            li.find('.pro-bar').css('background-color', _colors[track_id]);
                        } else {
                            var color = me.pickColor();
                            _colors[track_id] = color;
                        }
                    },
                    before: function () {
                        li.find('.pro-bar').css('width', '110px').addClass('progressing');
                    },
                    after: function () {
                    }
                };
                urls.get('static/data/' + me._trace.tracks_2[k].track_id + '.json', params, cbks.success, cbks.before, cbks.fail, cbks.after);
            }
        },
        // 根据历史轨迹点计算活跃度(计算活跃时长)
        calculate: function (pois) {
            var activeTime = 0;
            for (var k = 0, l = pois.length; k < l - 1; k++) {
                var diffTime = pois[k][2] - pois[k + 1][2];
                if (diffTime < 600) {
                    activeTime += diffTime;
                }
            }
            return activeTime;
        },
        pickColor: function () {
            var color = Util.colors[0];
            for (var k = 0, l = Util.colors.length; k < l; k++) {
                color = Util.colors[k];
                var find = false;
                for (var s in _colors) {
                    if (_colors[s] === color) {
                        find = true;
                        break;
                    }
                }
                if (find) {
                    continue;
                } else {
                    break;
                }
            }
            return color;
        },
        // 历史轨迹模式下分页 依赖jquery.pagination.js 如果没有分页需求可以忽略 也可切换其它分页控件
        pagination_2: function (total, size) {
            var size = size || 10;
            var me = this;
            $('#tracks-pager-ul-2').hide();
            if (!total) {
                return;
            }
            var pageNums = Math.ceil(total / size);
            if (pageNums > 1) {
                var opt = {
                    items_per_page: size,
                    next_text: ">>",
                    num_display_entries: 2,
                    num_edge_entries: 1,
                    current_page: curIndex_2 - 1,
                    prev_text: "<<",
                    callback: function (curIndex) {
                        me.loadData_2(curIndex + 1);
                    }
                };
                $('#tracks-pager-ul-2').show().pagination(total, opt);
            }
        },
        // 实时监控模式下分页
        pagination: function (total, size) {
            var size = size || 14;
            var me = this;
            $('#tracks-pager-ul').hide();
            if (!total) {
                return;
            }
            var pageNums = Math.ceil(total / size);
            if (pageNums > 1) {
                var opt = {
                    items_per_page: size,
                    next_text: ">>",
                    num_display_entries: 2,
                    num_edge_entries: 1,
                    current_page: curIndex - 1,
                    prev_text: "<<",
                    callback: function (curIndex) {
                        me.loadData(curIndex + 1);
                    }
                };
                $('#tracks-pager-ul').show().pagination(total, opt);
            }
        },
        // 实时监控模式下渲染已选track列表模板
        renderSelectedTracksPanel: function () {
            var me = this;
            if (selectedTracks) {
                var obj = {};
                obj.size = size;
                obj.trackList = selectedTrackArray;
                var html = tracklistTmpl(obj);
                trackListPanel.html(html);
                $('#tracks-pager-ul').hide();
            }
        },
        // 历史轨迹模式下渲染已选track列表模板
        renderSelectedTracksPanel_2: function () {
            var me = this;
            if (selectedTracks_2) {
                var obj = {};
                obj.size = size_2;
                obj.trackList = selectedTrackArray_2;
                var html = selTrackListTmpl(obj);
                selTracksPanel.html(html);
                $('#tracks-pager-ul-2').hide();
            }
        },
        // 绘制统计图
        drawCharts: function () {
            if (selectedTrackArray_2.length === 0) {
                $('.no-track-tip').show();
                setTimeout(function () {
                    $('.no-track-tip').hide();
                }, 2000);
                return;
            }
            var option = this.genChartOption();
            if (this.myChart) {
                this.myChart.setOption(option);
            } else {
                require(
                    [
                        'echarts',
                        'echarts/chart/line'
                    ],
                    function (ec) {
                        // 基于准备好的dom，初始化echarts图表
                        this.myChart = ec.init(document.getElementById('chart'), 'macarons');
                        // 为echarts对象加载数据
                        this.myChart.setOption(option);
                    }
                );
            }
        },
        // 设置eCharts的配置项
        genChartOption: function () {
            var option = {
                title: {
                    text: '轨迹活跃度',
                    textStyle: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                backgroundColor: 'rgba(0,0,0,0.7)',
                legend: {
                    data: []

                },
                calculable: false,
                toolbox: {
                    show: true,
                    feature: {
                        restore: {
                            show: true
                        }
                    }
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['0:00~1:00', '1:00~2:00', '2:00~3:00', '3:00~4:00', '4:00~5:00', '5:00~6:00', '6:00~7:00', '7:00~8:00', '8:00~9:00', '9:00~10:00', '10:00~11:00', '11:00~12:00', '12:00~13:00', '13:00~14:00', '14:00~15:00', '15:00~16:00',
                        '16:00~17:00', '17:00~18:00', '18:00~19:00', '19:00~20:00', '20:00~21:00', '21:00~22:00', '22:00~23:00', '23:00~24:00'
                    ],
                    axisLabel: {
                        textStyle: {
                            color: '#ffffff'
                        },
                        interval: 2
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(91,91,91,0.6)'
                        }
                    }
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        textStyle: {
                            color: '#ffffff'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(91,91,91,0.6)'
                        }
                    }
                }],
                grid: {
                    x: 50,
                    y: 60,
                    x2: 10,
                    y2: 50

                },
                series: []
            };
            for (var k = 0, length3 = selectedTrackArray_2.length; k < length3; k++) {
                var track = selectedTrackArray_2[k];
                var xData = track.calculate();
                if (!xData) {
                    continue;
                }
                var l = {
                    name: track.track_name,
                    textStyle: {
                        color: track.colors[0]
                    }
                }
                option.legend.data.push(l);
                var data = {
                    name: track.track_name,
                    type: 'line',
                    data: xData,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                color: track.colors[0]
                            }
                        }
                    },
                    markPoint: {
                        data: [{
                            type: 'max',
                            name: '最大值'
                        }]
                    }
                }
                option.series.push(data);
            }
            return option;
        }
    }
});
define('track/track', ['track/urls', 'track/draw', 'track/canvasLayer', 'track/util'], function (urls, drawModule, CanvasLayer, Util) {
    var colorId = 0;
    var MaxLat = 60;
    var MinLat = 4;
    var MaxLng = 135;
    var MinLng = 73;
    // 在大陆范围内 检查经纬度
    function checkLngLat(lng, lat) {
        return lng < MaxLng && lng > MinLng && lat < MaxLat && lat > MinLat;
    }

    // 二分查找
    function binarySearch(array, value) {
        var startIndex = 0,
            stopIndex = array.length - 1,
            middle = (stopIndex + startIndex) >>> 1;
        while (array[middle][2] != value && startIndex < stopIndex) {
            if (value < array[middle][2]) {
                startIndex = middle + 1;

            } else if (value > array[middle][2]) {
                stopIndex = middle - 1;

            }
            middle = (stopIndex + startIndex) >>> 1;
        }
        return (array[middle][2] != value) ? middle : middle;
    }

    //Track 对象
    function Track() {
        var me = this;
        if (arguments.length < 3) {
            return null;
        }
        this._trace_id = arguments[0];
        this._ak = arguments[1];
        this.track_id = arguments[2];
        this.track_name = arguments[3];
        this._version = 2;
        this.poi = null;
        this.map = window.map || new BMap.Map("mapContainer");
        this.drawer = drawModule.init();
        this._track_layer = new CanvasLayer({
            map: this.map,
            id: '_layer_' + this.track_id
        });
        this._track_layer.addEventListener('draw', function () {
            me.redraw();
        })
        this._ctx = this._track_layer.canvas.getContext('2d');
        this._ctx.lineJoin = 'round';
        this._ctx.lineCap = 'round';
        this.colors = [Util.colors[colorId]];
        this.tmpPoints = [];
        colorId++;
        if (colorId === 19) {
            colorId = 0;
        }
        this.barBgColor = this.colors[0].colorRgba(1);
    }
    Track.prototype.setChecked = function (check) {
        this.checked = check;
    }
    Track.prototype.setState = function (state) {
        this.state = state;
        if (state === 'on') {
            this.stateTxt = '在线';
        } else if (state === 'off') {
            this.stateTxt = '离线';
        } else {
            this.stateTxt = '暂停';
        }
    }
    Track.prototype.isPointIn = function (pt) {
        if (!this.point) {
            return false;
        }
        var pixel = this.map.pointToPixel(this.point);
        var diffX = pixel.x - pt.x;
        var diffY = pixel.y - pt.y;
        if (Math.abs(diffX) < 25 && Math.abs(diffY) < 25) {
            return true;
        }
        return false;
    }
    // 获取track最新轨迹点 POI
    Track.prototype.getPoi = function (callback) {
        var me = this;
        var time = new Date().setHours(0, 0, 0) / 1000;
        var params = {
            traceId: me._trace_id,
            ak: me._ak,
            track_id: me.track_id,
            version: me._version
        }
        urls.get('static/data/list.json', params, function (res) {
            if (res.status === 0) {
                for (var k = 0, l = res.pois.length; k < l; k++) {
                    if (res.pois[k].track_id == me.track_id) {
                        me.poi = res.pois[k];
                    }
                }
                if (me.poi.loc_time < time) {
                    me.setState('off');
                } else if (me.poi.loc_time > (new Date().getTime() / 1000) - 600) {
                    me.setState('on');
                } else {
                    me.setState('leave');
                }
                me.point = new BMap.Point(me.poi.location[0], me.poi.location[1]);
                me.tmpPoints.push(me.point);
            }
            if (callback) {
                callback.call(me);
            }
        })
    }
    // track 绘制POI动画 为了性能 没有启动动画 可以忽略
    Track.prototype.drawPoiAnimation = function () {
        var pixel = this.map.pointToPixel(this.point);
        var me = this;
        if (!this.poiAnimation) {
            this.poiAnimation = this.drawer.drawPointAnimation(me, this._ctx, {
                color: this.colors[0]
            });
        }
        return this.poiAnimation;

    }
    Track.prototype.drawPoi = function () {
        if (!this.poi) {
            return;
        }
        this.drawer.drawPoint(this.point, this._ctx, {
            color: this.colors[0]
        });
    }

    Track.prototype.drawTravels = function (options) {
        if (!this.travels || this.travels.length <= 0) {
            return;
        }
        var options = options || {};
        var index = 0;
        for (var i = 0; i < this.travels.length; i++) {
            var alpha = Util.random(0.3, 0.7);
            var color = this.colors[0];
            var opts = {
                color: color,
            }
            index++;
            this.drawer.drawLine(this.travels[i], this.drawer.drawObj.lineCtx, opts);
            if (this.travels[i].length >= 2) {
                if (options.pt) {
                    this.drawer.drawExtremePoint(this.travels[i][0], {
                        title: index,
                        color: 'rgba(98,181,0,0.8)'
                    });
                    this.drawer.drawExtremePoint(this.travels[i][this.travels[i].length - 1], {
                        title: index,
                        color: 'rgba(245,67,54,0.8)'
                    });
                }
            } else {
                var point = new BMap.Point(this.travels[i][0][0], this.travels[i][0][1]);
                this.drawer.drawPoint(point, this.drawer.drawObj.lineCtx, {
                    color: this.colors[0],
                    radius: 3
                })
            }
        }
    }
    // 获取track的历史轨迹信息
    Track.prototype.getHistory = function () {
        var me = this;
        var cbks = arguments[2] || {};
        var is_processed = arguments[3] || false;
        var params = {
            traceId: me._trace_id,
            ak: me._ak,
            ids: me.track_id,
            start_time: arguments[0],
            end_time: arguments[1],
            is_processed: is_processed
        }
        urls.get('static/data/' + me.track_id + '.json', params, cbks.success, cbks.before, cbks.fail, cbks.after);
    }
    // track历史轨迹 预处理行程化 按照轨迹点时间进行切分 将轨迹点切分成一条条行程
    Track.prototype.initTravels = function () {
        this.travels = [];
        this.activeTimes = 0;
        if (this.pois && this.pois.length > 0) {
            var preTime = this.pois[this.pois.length - 1][2];
            var diffTime = 0;
            // 倒序处理
            var tmpTravel = [];
            for (var i = this.pois.length - 1; i >= 0; i--) {
                var locTime = this.pois[i][2];
                diffTime = locTime - preTime;
                // 两点之间相隔10分钟 进行分段处理
                if (!(diffTime < 600)) {
                    this.travels.push(tmpTravel);
                    tmpTravel = [];
                }
                if (checkLngLat(this.pois[i][0], this.pois[i][1])) {
                    tmpTravel.push(this.pois[i]);
                }
                preTime = locTime;
            };
            if (tmpTravel.length > 0) {
                this.travels.push(tmpTravel);
            }
        }

    }
    // 当前map 根据track的历史轨迹进行setViewPort 包含当前track的所有轨迹点
    Track.prototype.setViewMap = function () {
        this.bPoints = [];
        if (this.pois && this.pois.length > 0) {
            for (var i = 0; i < this.pois.length; i++) {
                var pt = new BMap.Point(this.pois[i][0], this.pois[i][1]);
                this.bPoints.push(pt);
            };
            var fitView = this.map.getViewport(this.bPoints, {
                margins: [10, 10, 10, 10]
            });
            this.map.setViewport(fitView);
            return;
        }
    }
    // 根据时间戳查找 历史轨迹点
    Track.prototype.findPosition = function (curTime) {
        if (this.pois && this.pois.length > 1) {
            if (curTime > this.pois[0][2]) {
                this.index = 0;
                return this.pois[0];
            }
            if (curTime < this.pois[this.pois.length - 1][2]) {
                this.index = this.pois.length - 1;
                return this.pois[this.pois.length - 1]
            }
            var index = binarySearch(this.pois, curTime);
            this.index = index;
            if (index > 0 && index < this.pois.length - 2) {
                if (curTime === this.pois[index][2]) {
                    return this.pois[index];
                } else {
                    return this.createEncytPoi(index, curTime);
                }
            } else {
                return this.pois[index];
            }

        }
    }
    // 查找轨迹点 不一定能找到对应的poi 需要对查找的相邻的轨迹点进行插值计算
    Track.prototype.createEncytPoi = function (index, time) {
        var pre = index;
        if (time > this.pois[index][2]) {
            index = index - 1;
        }
        if (time < this.pois[index][2]) {
            pre = index + 1;
        }
        if (this.pois[index][2] - this.pois[pre][2] < 600) {
            var tpoi = [0, 0, time];
            var d = this.pois[index][2] - this.pois[pre][2];
            var c = time - this.pois[pre][2];
            var x = Util._Linear(this.pois[pre][0], this.pois[index][0], c, d);
            var y = Util._Linear(this.pois[pre][1], this.pois[index][1], c, d);
            tpoi[0] = x;
            tpoi[1] = y;
            return tpoi;
        }
        return this.pois[index];
    }
    // track进行历史回放
    Track.prototype.play = function () {
        var me = this;
        if (!this.aniLayer) {
            this.aniLayer = new CanvasLayer({
                map: this.map,
                id: '_anilayer_' + this.track_id
            });
            this.aniLayer.addEventListener('draw', function () {
                me.drawHistoryPoi();
            });
            this._aniCtx = this.aniLayer.canvas.getContext('2d');
            this._aniCtx.lineJoin = 'round';
            this._aniCtx.lineCap = 'round';
        }

    }
    // track回放时绘制点
    Track.prototype.drawHistoryPoi = function (poi) {
        if (this._aniCtx && this.aniLayer) {
            if (typeof this.index == 'undefined') {
                return;
            }
            var point = poi;
            if (!point) {
                point = this.pois[this.index];
            }
            point = new BMap.Point(point[0], point[1]);
            this.aniLayer.clearAll();
            this.drawer.drawPoint(point, this._aniCtx, {
                color: this.colors[0],
                radius: 7
            })
        }
    }
    Track.prototype.redraw = function () {
        var me = this;
        if (me.movePoiAnimation) {
            me.movePoiAnimation.pause();
            setTimeout(function () {
                me.movePoiAnimation.restart();
            }, 1);
        }
        //this.movePoiAnimation&&this.movePoiAnimation.pause();
        this._track_layer.clearAll();
        this.drawPoi();
        if (this.tmpPoints.length > 1) {
            this.drawer.drawLine(this.tmpPoints, null, {
                color: this.colors[0]
            })
        }

    }
    // 实时监控模式下 定时去获取最新轨迹点
    Track.prototype.monitor = function () {
        // 添加track_layer
        var me = this;
        // 间隔 25秒更新一次
        me.timer = setInterval(function () {
            var params = {
                traceId: me._trace_id,
                ak: me._ak,
                track_id: me.track_id,
                version: me._version
            }
            urls.get(urls.trackDetail, params, function (res) {
                if (res && res.status === 0) {
                    // 实时点没有更新
                    if (me.poi.loc_time === res.poi.loc_time) {
                        // me.poiAnimation.restart();
                        return;
                    }
                    // 模拟动画测试
                    me.poi = res.poi;
                    me.point = new BMap.Point(me.poi.location[0], me.poi.location[1]);
                    me.tmpPoints.push(me.point);
                    if (me.tmpPoints.length > 100) {
                        me.tmpPoints.splice(0, 1);
                    }
                    if (me.tmpPoints.length > 1) {
                        // 轨迹点如果有更新 移动监控点 移动动画
                        me.movePoiAnimation = me.drawer.drawMovePoiAnimation(me._ctx, {
                            path: me.tmpPoints,
                            before: function () {
                                // me.poiAnimation.pause();
                            },
                            after: function () {
                                // me.poiAnimation.restart();
                            },
                            steps: 500,
                            color: me.colors[0],
                            radius: 8
                        });
                    }
                }
            });
        }, 25000);

    }
    // 根据统计图需求 计算 24小时 每个时间段内的 轨迹点数 如果没有统计图需求 可以忽略
    Track.prototype.calculate = function () {
        var xData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (this.pois) {
            for (var k = 0, length3 = this.pois.length; k < length3; k++) {
                var time = new Date(parseInt(this.pois[k][2]) * 1000);
                var hour = time.getHours();
                xData[hour] ++;
            }
        }
        return xData;
    }
    // track 销毁
    Track.prototype.dispose = function () {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (this.poiAnimation) {
            this.poiAnimation.destroy();
        }
        if (this.movePoiAnimation) {
            this.movePoiAnimation.destroy();
        }
        this._track_layer.clearAll();
        this._track_layer.destroy();
        if (this.aniLayer) {
            this.aniLayer.clearAll();
            this.aniLayer.destroy();
        }
    }
    var trackModule = {
        createTrack: function (trace_id, ak, track_id, track_name) {
            return new Track(trace_id, ak, track_id, track_name);
        },
        loadTrackHistory: function (track, startTime, endTime, callbacks, is_processed) {
            track.getHistory(startTime, endTime, callbacks, is_processed);
        }
    }
    return trackModule;
});
// canvas 绘制模块
define('track/draw', ['track/canvas', 'track/animation', 'track/util'], function (CanvasModule, AnimationModule, Util) {
    return {
        init: function () {
            // 分层绘制提高效率
            this.canvasLayer = CanvasModule.init();
            // 动画图层
            this.animationLayer = CanvasModule.initAnimationLayer();
            // 浮动图层 主要绘制track的属性信息
            this.hoverLayer = CanvasModule.initHoverLayer();
            // 历史轨迹线图层
            this.lineCanvasLayer = CanvasModule.initLineCanvasLayer();
            // 画笔对象
            this.drawObj = CanvasModule.getDrawingObj();
            this.map = CanvasModule.map;
            return this;
        },
        drawAttr: function (poi, ctx) {
            if (!poi) {
                return;
            }
            var props = {
                locTime: poi.loc_time,
                location: poi.location,
                name: poi.track_name
            }
            var txt1 = props.name;
            var txt2_1 = '最新位置 :  经度  ( ' + props.location[0].toFixed(6) + ' )';
            var txt2_2 = '纬度  ( ' + poi.location[1].toFixed(6) + ' )';
            var txt3 = '定位时间 : ' + Util.js_date_time(props.locTime);
            var point = point = new BMap.Point(poi.location[0], poi.location[1]);
            var pixel = this.map.pointToPixel(point);
            var width = 194;
            var height = 90;
            var sx = pixel.x - width / 2;
            var sy = pixel.y - height - 18;
            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,1)";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "rgba(78,78,78,0.5)";
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx, sy + height);
            ctx.lineTo(sx + (width / 2 - 8), sy + height);
            ctx.lineTo(sx + width / 2, sy + height + 12);
            ctx.lineTo(sx + (width / 2 + 8), sy + height);
            ctx.lineTo(sx + width, sy + height);
            ctx.lineTo(sx + width, sy);
            ctx.closePath();
            ctx.fill();
            ctx.font = "14px 微软雅黑";
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.fillText(txt1, sx + 10, sy + 20);
            ctx.font = "12px 微软雅黑";
            ctx.fillText(txt2_1, sx + 10, sy + 45);
            ctx.fillText(txt2_2, sx + 71, sy + 60);
            ctx.fillText(txt3, sx + 10, sy + 78);
            ctx.restore();
        },
        getLayer: function () {
            return this.canvasLayer;
        },
        drawPoint: function (point, ctx, opts) {
            if (!ctx) {
                return;
            }
            var color = opts.color || 'rgba(0,145,255,1)';
            var radius = opts.radius || 5;
            var pixel = this.map.pointToPixel(point);
            ctx.save();
            ctx.beginPath();
            ctx.shadowBlur = 20;
            ctx.shadowColor = "black";
            ctx.fillStyle = color;
            ctx.lineWidth = 8;
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.arc(pixel.x, pixel.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        },
        drawExtremePoint: function (point, opts) {
            if (!this.drawObj.lineCtx) {
                return;
            }
            var title = opts.title || '';
            var ctx = this.drawObj.lineCtx;
            var point = new BMap.Point(point[0], point[1]);
            var pixel = this.map.pointToPixel(point);
            var r = 12;
            ctx.save();
            ctx.fillStyle = opts.color || "rgba(78,78,78,0.5)";
            ctx.beginPath();
            ctx.moveTo(pixel.x, pixel.y - 1);
            ctx.lineTo(pixel.x - r * 3 / 4, pixel.y - 1 - (r * 3 / 4) * Math.tan(Math.PI / 3));
            ctx.lineTo(pixel.x + r * 3 / 4, pixel.y - 1 - (r * 3 / 4) * Math.tan(Math.PI / 3));
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pixel.x, pixel.y - 1 - r * Math.tan(Math.PI / 3), r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.font = "14px 微软雅黑";
            if (title.toString().length > 1) {
                ctx.fillText(title, pixel.x - r + 5, pixel.y - 1 - r * Math.tan(Math.PI / 3) + 6);
            } else {
                ctx.fillText(title, pixel.x - r + 8, pixel.y - 1 - r * Math.tan(Math.PI / 3) + 6);
            }
            ctx.restore();
        },
        drawPointAnimation: function (obj, ctx, opts) {
            var me = this;
            if (!ctx) {
                return;
            }
            var Animation = AnimationModule.Animation;
            var duration = Util.random(1000, 1300);
            var radius = Util.random(15, 20);
            var animation = new Animation({
                track: obj,
                duration: duration,
                infinite: true,
                drawType: 'circle',
                ctx: ctx,
                blur: true,
                color: opts.color,
                blurColor: opts.color && opts.color.colorRgba(0.5),
                props: {
                    radius: radius
                },
                frame: function () {
                    var point = this._opts.track.point;
                    var path = this._opts.track.tmpPoints;
                    var color = this._opts.track.colors[0];
                    var timeDiff = new Date().getTime() - this.startTime;
                    var percent = timeDiff / this.duration;
                    if (percent > 1) {
                        this.end();
                        return;
                    }
                    point = this._map.pointToPixel(point);
                    if (!point) {
                        return;
                    }
                    var curRadius = this.endProps.radius * percent;
                    var color = this._opts.color || 'rgba(0,145,255,1)';
                    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = color;
                    this.ctx.lineWidth = 2;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = this._opts.blurColor;
                    this.ctx.arc(point.x, point.y, curRadius, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    me.drawPoint(this._opts.track.point, this.ctx, {
                        color: color
                    });
                    this.ctx.restore();
                }
            }).start();
            return animation;
        },
        drawMovePoiAnimation: function (ctx, opts) {
            var me = this;
            if (!ctx) {
                return;
            }
            var Animation = AnimationModule.Animation;
            var movePoiAnimation = new Animation({
                // 不是通过时间计时
                steps: opts.steps,
                infinite: false,
                path: opts.path,
                ctx: ctx,
                color: opts.color,
                before: opts.before,
                after: opts.after,
                radius: opts.radius,
                easing: 'linear',
                frame: function () {
                    var ctx = this.ctx;
                    var lineCtx = me.drawObj.ctx;
                    var w = ctx.canvas.width;
                    var h = ctx.canvas.height;
                    var l = this._opts.path.length;
                    var point = this._opts.path[l - 2];
                    if (!this.tmpPixel) {
                        this.tmpPixel = this._map.pointToPixel(point);
                    }
                    lineCtx.save();
                    lineCtx.fillStyle = this._opts.color;
                    lineCtx.strokeStyle = this._opts.color;
                    lineCtx.lineWidth = 4;
                    lineCtx.beginPath();
                    lineCtx.moveTo(this.tmpPixel.x, this.tmpPixel.y);
                    var init_pos = this._map.pointToPixel(this._opts.path[l - 2]);
                    var target_pos = this._map.pointToPixel(this._opts.path[l - 1]);
                    this.tmpPixel.x = Util._Linear(init_pos.x, target_pos.x, this.curStep, this.totalSteps);
                    this.tmpPixel.y = Util._Linear(init_pos.y, target_pos.y, this.curStep, this.totalSteps);
                    lineCtx.lineTo(this.tmpPixel.x, this.tmpPixel.y);
                    lineCtx.stroke();
                    lineCtx.closePath();
                    ctx.clearRect(0, 0, w, h);
                    ctx.beginPath();
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = "black";
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "rgba(255,255,255,0.9)";
                    ctx.fillStyle = this._opts.color;
                    ctx.arc(this.tmpPixel.x, this.tmpPixel.y, 10, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.fill();
                    //ctx.restore();
                    if (this.curStep >= this.totalSteps) {
                        this.end();
                        this.tmpPixel = null;
                        return;
                    }
                    this.curStep++;
                }
            }).start();
            return movePoiAnimation;

        },
        drawLine: function (pointsArray, ctx, opts) {
            if (!ctx) {
                ctx = this.drawObj.ctx;
            }
            if (pointsArray.length < 2) {
                return;
            }
            var color = opts.color || 'rgba(0,145,255,1)';
            ctx.save();
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = opts.lineWidth || 4;
            var point;
            if (pointsArray[0] instanceof BMap.Point) {
                point = pointsArray[0];
            } else {
                point = new BMap.Point(pointsArray[0][0], pointsArray[0][1]);
            }
            var pixel = this.map.pointToPixel(point);
            ctx.moveTo(pixel.x, pixel.y);
            for (var i = 1; i < pointsArray.length; i++) {
                if (pointsArray[i] instanceof BMap.Point) {
                    point = pointsArray[i];
                } else {
                    point = new BMap.Point(pointsArray[i][0], pointsArray[i][1]);
                }
                pixel = this.map.pointToPixel(point);
                ctx.lineTo(pixel.x, pixel.y);
            };
            ctx.stroke();
            ctx.restore();
        },
        pauseAllAnimation: function () {
            AnimationModule.TimeLine.pause();
        },
        clearAllAnimation: function () {
            this.drawObj.aniCtx && this.drawObj.aniCtx.clearRect(0, 0, this.drawObj.aniCtx.canvas.width, this.drawObj.aniCtx.canvas.height);
            this.drawObj.tmpCtx && this.drawObj.tmpCtx.clearRect(0, 0, this.drawObj.tmpCtx.canvas.width, this.drawObj.tmpCtx.canvas.height);
        },
        restartAllAnimation: function () {
            AnimationModule.TimeLine.restart();
        },
        clearHoverLayer: function () {
            this.hoverLayer.clearAll();
        },
        cancelTimeline: function () {
            AnimationModule.TimeLine.cancel();
        },
        refresh: function () {
            this.clearAllAnimation();
            AnimationModule.TimeLine.refresh();
        }
    }
});
define('track/canvas', ['track/canvasLayer'], function (CanvasLayer) {
    var map = null;
    var hasLayer = false;
    var canvasLayer = null;
    var ctx = null;
    var animationLayer = null;
    var lineCanvasLayer = null;
    var aniCtx = null;
    var tmpLayer = null;
    var tmpCtx = null;
    var hoverLayer = null;
    var hoverCtx = null;
    var lineCtx = null;
    return {
        init: function () {
            if (hasLayer && canvasLayer) {
                return canvasLayer;
            }
            map = this.map = window.map || new BMap.Map("mapContainer");
            canvasLayer = new CanvasLayer({
                map: map
            });
            ctx = canvasLayer.canvas.getContext('2d');
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            hasLayer = true;
            return canvasLayer;
        },
        initAnimationLayer: function () {
            map = this.map = window.map || new BMap.Map("mapContainer");
            var animationLayer = new CanvasLayer({
                map: map
            });
            return animationLayer;

        },
        initHoverLayer: function () {
            if (hoverLayer) {
                return hoverLayer;
            }
            map = this.map = window.map || new BMap.Map("mapContainer");
            hoverLayer = new CanvasLayer({
                map: map,
                zIndex: 10000
            });
            hoverCtx = hoverLayer.canvas.getContext('2d');
            return hoverLayer;
        },
        initLineCanvasLayer: function () {
            if (lineCanvasLayer) {
                return lineCanvasLayer;
            }
            map = this.map = window.map || new BMap.Map("mapContainer");
            lineCanvasLayer = new CanvasLayer({
                map: map
            });
            lineCtx = lineCanvasLayer.canvas.getContext('2d');
            lineCtx.lineJoin = "round";
            lineCtx.lineCap = "round";
            return lineCanvasLayer;
        },
        getCanvasLayer: function () {
            return canvasLayer;
        },
        getDrawingObj: function () {
            return {
                canvasLayer: canvasLayer,
                ctx: ctx,
                animationLayer: animationLayer,
                aniCtx: aniCtx,
                tmpLayer: tmpLayer,
                tmpCtx: tmpCtx,
                hoverLayer: hoverLayer,
                hoverCtx: hoverCtx,
                lineCanvasLayer: lineCanvasLayer,
                lineCtx: lineCtx
            }
        }
    }
});
define('track/animation', ['track/canvas'], function (CanvasModule) {
    var guid = 0;
    var cacheCtx = null;
    // 缓存canvas 离屏绘制
    function createCacheImage(width, height) {
        var cacheCanvas = document.createElement('canvas');
        cacheCanvas.width = width;
        cacheCanvas.height = height;
        var cacheCtx = cacheCanvas.getContext('2d');
        cacheCtx.globalAlpha = 0.95;
        cacheCtx.globalCompositeOperation = 'copy';
        return cacheCtx;
    }

    function Animation(opts) {
        this._opts = {
            easing: 'Linear',
            color: opts.color || 'rgba(0,107,187,1)'
        }
        for (var id in opts) {
            this._opts[id] = opts[id];
        }
        if (this._opts.steps && this._opts.steps > 0) {
            this.curStep = 0;
            this.totalSteps = this._opts.steps;
        }
        this.guid = '_animate_' + guid;
        guid++;
        this.running = false;
        this.duration = this._opts.duration;
        this.infinite = !!this._opts.infinite;
        this.easing = this._opts.easing;
        this.endProps = this._opts.props;
        this.timer = null;
        this.ctx = this._opts.ctx;
        this.queues = [];
        this.drawObj = CanvasModule.getDrawingObj();
        this._map = CanvasModule.map;
        this.frame = this._opts.frame;
    };
    Animation.prototype.start = function () {
        if (this._opts.before) {
            this._opts.before();
        }
        this.running = true;
        this.cancelled = false;
        this.startTime = (new Date()).getTime();
        timeline.add(this);
        return this;
    };
    Animation.prototype.pause = function () {
        this.running = false;
    }
    Animation.prototype.restart = function () {
        this.running = true;
    }
    Animation.prototype.frame = function () {};
    Animation.prototype.end = function () {
        this.cancelled = true;
        this.running = false;
        if (this.infinite) {
            this.cancelled = false;
            this.start();
        }
        if (this._opts.after) {
            this._opts.after();
        }
        return this;
    };
    Animation.prototype.destroy = function () {
        this.cancelled = true;
        this.running = false;
        timeline.remove(this);
    }
    // 动画 时间 控制器
    var timeline = {
        clips: {},
        animationSize: 0,
        add: function (animation) {
            if (!this.clips.hasOwnProperty(animation.guid)) {
                this.animationSize++;
            }
            this.clips[animation.guid] = animation;
            if (this.animationSize === 1) {
                this.start();
            }
        },
        remove: function (animation) {
            if (!(typeof (this.clips[animation.guid]) == "undefined")) {
                delete this.clips[animation.guid];
            }
            this.animationSize--;
            if (this.animationSize === 0) {
                this.stop();
            }
        },
        cancel: function () {
            this.stop();
            for (var id in this.clips) {
                this.clips[id].destroy();
            }
        },
        start: function () {
            this.running = true;
            this.tick();
        },
        stop: function () {
            this.running = false;
            clearTimeout(this.timer);
        },
        pause: function () {
            this.running = false;
        },
        restart: function () {
            this.start();
        },
        refresh: function () {
            var me = this;
            this.stop();
            setTimeout(function () {
                me.start();
            }, 1);
        },
        tick: function () {
            var me = this;
            if (!me.running) {
                return;
            }
            if (this.animationSize === 0) {
                this.stop();
                return;
            }
            me.timer = setTimeout(function () {
                me.tick();
            }, 30);

            var clips = me.clips;
            var animation = null;
            for (var id in clips) {
                animation = clips[id];
                if (!animation) {
                    delete clips[id];
                    continue;
                }
                if (animation.cancelled) {
                    me.remove(animation);
                    continue;
                }
                if (animation.running) {
                    animation.frame();
                }
            };

        }

    };
    return {
        TimeLine: timeline,
        Animation: Animation
    }
});
// map的canvas自定义覆盖物 参考百度地图JSAPI开发文档
define('track/canvasLayer', function () {
    var guid = 0;

    function CanvasLayer(options) {
        this.options = options || {};
        this.paneName = this.options.paneName || 'labelPane';
        this.zIndex = this.options.zIndex || 0;
        this._map = options.map;
        this.id = options.id || '_canvaslayer_' + guid;
        guid++;
        this.show();
    }
    CanvasLayer.prototype = new BMap.Overlay();

    CanvasLayer.prototype.initialize = function (map) {
        this._map = map;
        var canvas = this.canvas = document.createElement("canvas");
        canvas.id = this.id;
        canvas.style.cssText = "position:absolute;" + "left:0;" + "top:0;" + "z-index:" + this.zIndex + ";";
        this.adjustSize();
        map.getPanes()[this.paneName].appendChild(canvas);
        var me = this;
        map.addEventListener('resize', function () {
            me.adjustSize();
            me.draw();
        });
        return this.canvas;
    }

    CanvasLayer.prototype.adjustSize = function () {
        var size = this._map.getSize();
        var canvas = this.canvas;
        canvas.width = size.width;
        canvas.height = size.height;
        canvas.style.width = canvas.width + "px";
        canvas.style.height = canvas.height + "px";
    }

    CanvasLayer.prototype.draw = function () {
        var map = this._map;
        var bounds = map.getBounds();
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        var pixel = map.pointToOverlayPixel(new BMap.Point(sw.lng, ne.lat));
        this.canvas.style.left = pixel.x + "px";
        this.canvas.style.top = pixel.y + "px";
        this.dispatchEvent('draw');
        this.options.update && this.options.update.call(this);
    }
    CanvasLayer.prototype.clearAll = function () {
        var ctx = this.canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    CanvasLayer.prototype.getContainer = function () {
        return this.canvas;
    }

    CanvasLayer.prototype.show = function () {
        if (!this.canvas) {
            this._map.addOverlay(this);
        }
        this.canvas.style.display = "block";
    }

    CanvasLayer.prototype.hide = function () {
        this.canvas.style.display = "none";
        //this._map.removeOverlay(this);
    }
    CanvasLayer.prototype.destroy = function () {
        this._map.removeOverlay(this);
    }
    CanvasLayer.prototype.setZIndex = function (zIndex) {
        this.canvas.style.zIndex = zIndex;
    }

    CanvasLayer.prototype.getZIndex = function () {
        return this.zIndex;
    }
    return CanvasLayer;
})
// 时间轴
define('track/Timeline', ['track/util'], function (Util) {
    var dM = 9,
        dN = 7,
        pL = 7,
        pR = 7,
        di = 4,
        timelineCanvas = document.getElementById('timeline'),
        timeCtrlCanvas = document.getElementById('timeCtr'),
        ctrCtx = timeCtrlCanvas.getContext('2d'),
        ctx = timelineCanvas.getContext('2d');


    function genData(start, end) {
        var d = end - start;
        var data = [];
        if (d < 17 && d > 6) {
            for (var i = 0; i < d; i++) {
                data.push(i + start);
                data.push(i + start + ':30');
            }
            data.push(end);
        } else if (d <= 6 && d > 4) {
            for (var i = 0; i < d; i++) {
                data.push(i + start);
                data.push(i + start + ':15');
                data.push(i + start + ':30');
                data.push(i + start + ':45');
            }
            data.push(end);
        } else if (d <= 4 && d > 0) {
            for (var i = 0; i < d; i++) {
                data.push(i + start);
                data.push(i + start + ':10');
                data.push(i + start + ':20');
                data.push(i + start + ':30');
                data.push(i + start + ':40');
                data.push(i + start + ':50');
            }
            data.push(end);
        } else {
            for (var i = 0; i < d; i++) {
                data.push(i + start);
                data.push('');
            }
            data.push(end);
        }
        return data;
    }

    function drawTimeCoord(start, end) {
        var data = genData(start, end);
        var h = ctx.canvas.height;
        var w = ctx.canvas.width;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255,1)';
        ctx.fillStyle = 'rgba(255, 255, 255,1)';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.font = "normal 100 6pt arial";
        ctx.beginPath();
        ctx.moveTo(pL, h / 2 + 2);
        ctx.lineTo(w - pR, h / 2 + 2);
        ctx.stroke();
        var l = data.length;
        var stepA = (w - pR - pL) / (l - 1);
        var stepB = (w - pR - pL) / (l * 5);
        for (var i = 0; i < l; i++) {
            var x = i * stepA + pL,
                y = h / 2 + 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - dM);
            ctx.stroke();
            var s = data[i] + '';
            if (s.length == 1) {
                ctx.fillText(s, x - 3, y + 13);
            } else if (s.length === 5) {
                ctx.fillText(s, x - 15, y + 13);
            } else {
                ctx.fillText(s, x - 9, y + 13);
            }
            if (i == l - 1) {
                return;
            }
        };
    }
    // 绘制时间轴游标
    function drawTimeCtrl() {
        var h = ctrCtx.canvas.height;
        var w = ctrCtx.canvas.width;
        ctrCtx.fillStyle = 'rgba(255,255,255,1)';
        ctrCtx.beginPath();
        ctrCtx.arc(w / 2, (h / 2) + 1, w / 2, 0, 2 * Math.PI);
        ctrCtx.fill();
        ctrCtx.closePath();
        ctrCtx.beginPath();
        ctrCtx.fillStyle = 'rgba(22,68,101,1)';
        ctrCtx.arc(w / 2, (h / 2) + 1, 3, 0, 2 * Math.PI);
        ctrCtx.fill();
        ctrCtx.closePath();
    };
    drawTimeCtrl();
    return {
        drawTimeLineControl: function (start, end) {
            var me = this;
            me.startHour = start;
            me.endHour = end;
            drawTimeCoord(start, end);
            me.fillTrackRange(me.track);
        },
        getTimeRange: function () {
            var me = this;
            return {
                start: me.startHour || 0,
                end: me.endHour || 24
            }
        },
        zoomIn: function (tag) {
            var me = this;
            if ((me.endHour - me.startHour) === 1) {
                return false;
            }
            if (tag) {
                me.startHour++;
            } else {
                me.endHour--;
            }

            me.drawTimeLineControl(me.startHour, me.endHour);
        },
        zoomOut: function (tag) {
            var me = this;
            if (tag) {
                me.startHour--;
            } else {
                me.endHour++;
            }
            me.startHour = me.startHour < 0 ? 0 : me.startHour;
            me.endHour = me.endHour > 24 ? 24 : me.endHour;
            me.drawTimeLineControl(me.startHour, me.endHour);
        },
        fillTrackRange: function (track) {
            var me = this;
            if (!track || !track.travels || track.travels.length === 0) {
                return;
            }
            me.track = track;
            var w = ctx.canvas.width;
            var h = ctx.canvas.height;
            // 每一秒占的像素
            var d = (w - pL - pR) / ((me.endHour - me.startHour) * 60 * 60);
            var start_time = Util.js_date_time(track.travels[0][0][2]).substr(0, 10);
            start_time = Util.js_strto_time(start_time + ' 00:00:00');
            var startTime = start_time + me.startHour * 60 * 60;
            ctx.save();
            ctx.fillStyle = 'rgba(100,100,100,0.8)';
            ctx.fillStyle = track.colors[0].colorRgba(0.5);
            for (var k = 0, length3 = track.travels.length; k < length3; k++) {
                var pois = track.travels[k];
                var startPoi = pois[0];
                var endPoi = pois[pois.length - 1];
                var startPixel = (startPoi[2] - startTime) * d + pL;
                var endPixel = (endPoi[2] - startTime) * d + pL;
                ctx.fillRect(startPixel, 0, endPixel - startPixel, ctx.canvas.height);
            }
            ctx.restore();
        }
    }
});
