/**
 * @file overview demoTrack.js
* @Author: xuguanlong
* @Date:   2015-11-03 16:10:57
* @Last Modified by:   xuguanlong
* @Last Modified time: 2015-11-03 19:38:23
*/

$(document).ready(function () {
    function init() {
        var dataBox = require('track/demo');
        dataBox.initEvents();
        dataBox.getTraceDetail();
    }
    try {
        init();
    } catch (e) {
        setTimeout(function () {
            init();
        }, 1000);
    }

});