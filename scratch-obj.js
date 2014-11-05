'use strict';
(function (global) {
    //loadd css
    var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = 'http://t2.dpfile.com/t/jsnew/app/events/tpcommon/scratch/scratch.min.css';
        document.getElementsByTagName("head")[0].appendChild(link);

    var Scratch = function (options) {
            options = options || {};
            this.container = options.container || document.getElementById('scratch-container');
            this.width = options.width || 280;
            this.height = options.height || 140;
            this.imgPath = options.imgPath || '';
            this.prizeClass = options.prizeClass;
            this.scratchCoverColor = options.scratchCoverColor;

            this.keyPointList = options.keyPointList || [
                {x: this.width*0.35, y: this.height*0.35},
                {x: this.width*0.65, y: this.height*0.35},
                {x: this.width*0.35, y: this.height*0.65},
                {x: this.width*0.65, y: this.height*0.65},
                {x: this.width*0.5, y: this.height*0.5}
            ];

            this.DEBUG = options.debugMode || false;

            this.onScratchReady = options.onScratchReady || function(){};
            this.onScratchDiscovered = options.onScratchDiscovered || function(){};

            this.init();
        },
        fn = Scratch.prototype;

    fn.constructor = Scratch;
    fn.init = function () {
        var canvas = document.createElement('canvas');

        if (!canvas.getContext) {
            return this;
        }

        var commonStyles = "width:"+this.width+"px;height:"+this.height+"px;";
        this.drawState = false;
        this.canvas = canvas;
        this.canvas.setAttribute("width",this.width);
        this.canvas.setAttribute("height",this.height);

        this.image = document.createElement('div');
        this.image.setAttribute("class","prize"+(this.prizeClass?' '+this.prizeClass:''));
        this.image.setAttribute("style",commonStyles);

        this.container.setAttribute("class","scratch-card");
        this.container.setAttribute("style",commonStyles);
        this.container.appendChild(this.image);
        this.container.appendChild(this.canvas);

        /*this.keyPointList = [
            {x: 100, y: 50},
            {x: 180, y: 50},
            {x: 100, y: 90},
            {x: 180, y: 90},
            {x: 140, y: 70}
        ];*/

        if(!this.scratchCoverColor){
            this.initScratchImage();
        }
        this.initEvents();

        this.bindCustomEvents(this.onScratchReady, this.onScratchDiscovered);

        return this;
    };
    fn.setPrizeImage = function(prizeImg){
        this.image.style.backgroundImage = "url("+ this.imgPath + prizeImg +")";
    };
    fn.setPrizeText = function(prizeText){
        this.image.innerHTML = prizeText;
    };
    fn.initScratchImage = function () {
        var _this = this;
        this.scratchImage = new Image();
        this.scratchImage.onload = function () {
            _this.resetScratch();
        };
        this.scratchImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAAEYCAMAAAB1ODybAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Mzc2NDIxQ0E1MDBGMTFFMzkyRThBODA1Mzk3MTAxQ0UiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Mzc2NDIxQ0I1MDBGMTFFMzkyRThBODA1Mzk3MTAxQ0UiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozNzY0MjFDODUwMEYxMUUzOTJFOEE4MDUzOTcxMDFDRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNzY0MjFDOTUwMEYxMUUzOTJFOEE4MDUzOTcxMDFDRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pu+KKWgAAAMAUExURbi4uCAgIP7h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';

        return true;
    };
    fn.trigger = function (event, data) {
        $(this.canvas).trigger(event, data);
    };
    fn.bindCustomEvents = function (startCallback, endCallback) {
        var _this = this;
        $(this.canvas).on({
            'scratchReady': function () {
                _this.DEBUG && window.console && console.log('scratch ready');
                _this.drawState = false;
                _this.resetScratch();
            },
            'scratchStart': function () {
                _this.DEBUG && window.console && console.log('scratch start');
                _this.drawState = true;
                _this.resetInterval();
                startCallback && startCallback.call(_this, arguments);
            },
            'scratchEnd': function () {
                _this.DEBUG && window.console && console.log('scratch end');
                // _this.drawState = false;
                endCallback && endCallback.call(_this, arguments)
            }
        });
    };
    fn.initEvents = function () {
        var _this = this;
        var ctx = this.canvas.getContext('2d');
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        this.lastPoint = {
            x: null,
            y: null
        };
        this.touchState = false;

        $(window).on({
            'touchstart mousedown': function (event) {
                var x, y,
                    offset = $(_this.canvas).offset();
                if (_this.drawState && event.target == _this.canvas) {
                    if (event.pageX) {
                        x = event.pageX - offset.left;
                        y = event.pageY - offset.top;
                    }
                    else {
                        x = event.originalEvent.touches[0].pageX - offset.left;
                        y = event.originalEvent.touches[0].pageY - offset.top;
                    }
                    _this.touchState = true;
                    _this.lastPoint.x = x;
                    _this.lastPoint.y = y;
                    return false;
                }
                return true;
            },
            'touchmove mousemove': function (event) {
                var x, y,
                    offset = $(_this.canvas).offset();

                if (_this.drawState && _this.touchState && event.target == _this.canvas) {
                    if (event.pageX) {
                        x = event.pageX - offset.left;
                        y = event.pageY - offset.top;
                    }
                    else {
                        x = event.originalEvent.touches[0].pageX - offset.left;
                        y = event.originalEvent.touches[0].pageY - offset.top;
                    }
                    ctx.globalCompositeOperation = "destination-out";
                    ctx.beginPath();
                    ctx.moveTo(_this.lastPoint.x, _this.lastPoint.y);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    _this.canvas.style.opacity = 0.99;
                    setTimeout(function() {
                        _this.canvas.style.opacity = 1;
                    }, 1);

                    _this.lastPoint.x = x;
                    _this.lastPoint.y = y;
                    return false;
                }
                return true;
            },
            'touchend mouseup': function () {
                if (_this.drawState && _this.touchState) {
                    _this.touchState = false;
                    return false;
                }
                return true;
            }
        });

        return true;
    };
    fn.getPixelAlpha = function (x, y) {
        var ctx = this.canvas.getContext('2d');

        var ImageData = ctx.getImageData(x, y, 1, 1);
        return ImageData.data[3];
    };
    fn.checkScratch = function () {
        var keys = this.keyPointList,
            count = 0;
        if (keys) {
            for (var i = 0; i < keys.length; i++) {
                if (this.getPixelAlpha(keys[i].x, keys[i].y) !== 255) {
                    count += 1;
                }
            }
        }
        return keys && count >= 4;
    };
    fn.resetInterval = function () {
        var _this = this;
        this.interval = setInterval(function () {
            if (_this.checkScratch()) {
                _this.trigger('scratchEnd');
                clearInterval(_this.interval);
            }
        }, 1000);
        return this;
    };
    fn.resetScratch = function () {
        var _this = this,
            ctx = this.canvas.getContext('2d');
        ctx.globalCompositeOperation = "source-over";

        ctx.clearRect(0, 0, this.width, this.height);
        if(!this.scratchCoverColor){
            ctx.drawImage(this.scratchImage, 0, 0, this.width, this.height);
        }else{
            ctx.fillStyle = this.scratchCoverColor;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        _this.canvas.style.opacity = 0.99;
        setTimeout(function() {
            _this.canvas.style.opacity = 1;
        }, 1);

        return this;
    };

    global.Scratch = global.Scratch || Scratch;

})(this);

