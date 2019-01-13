/**
 * Tytjs By BLACKKITTY 2018.02.25
 */
var $ = (id) => { return document.getElementById(id); };
var TY = {
    Prc: function () {
        var _this = this;

        /************** 常量 ***************/
        var FULLSPEED = 2000;       // 最高速度
        var SPACEKEY = '&nbsp;';    // 空格
        var SPACEKEYVISIBLE = '_';  // 空格显示
        var ENTERKEY = '↩';         // 回车显示
        var ROWMAXLEN = 56;         // 单行最大长度
        var ROWS = 2;               // 行数
        var BOOL_ON = "[✔]";
        var BOOL_OFF = "[✖]";
        var STR_clicktotype = 'Click to Type';
        var STR_practise = "Typing Practise";
        var STR_currention = "Miss Character Correction";

        /************** 绑定元素 ***************/
        this.etxt = $("prc_text");
        this.einp = $("prc_inp");
        this.einpdisplay = $("prc_inp_display");
        this.efulltext = $("fulltext");
        this.echart = $('chart');
        this.etstatus = $('tpyestatus');
        this.einfo = $('infoboard');
        this.etip = $('prc_tip');
        this.sounders = new Array();

        /************** 设置项 ***************/
        /*------- 数字值 -------*/
        this.sounderInx = 0;                // 当前音效发声器序号
        this.RT_Length = 200;               // 生成文本包含单词数量
        this.limitaccuracy = 0;             // 限制 正确率
        this.limitspeed = 0;                // 限制 速度
        this.chartselect = 1;               // 图表 显示范围 select
        this.chartoffset = 1;               // 图表 显示范围偏移量 offset
        this.chartbezierzoom = 0;           // 图表 贝塞尔缩放
        this.chartmaxlength = 300;          // 图表 贝塞尔曲线可计算数据最大长度，大于则进行缩放
        this.missranknum = 10;              // 错误榜显示条数
        this.charstyle = 1;                 // 当前字符样式序号 =0时为填字模式
        this.RT_Currention = 0;             // 纠错占比
        this.SpecialWordLength = 0;         // 特殊模式中生成的单词最小长度

        /*------- 枚举值 -------*/
        this.SpecialMode = "Normal";        // 特殊模式的子模式：Normal LeftHand RightHand InTurn
        this.chartitem = 'Speed';           // 图表显示项目：Speed Accuracy Spents BackspaceStrokes KeyStrokes
        this.missrankfilter = "all";        // 错误榜显示类型：all letter number symbol
        this.speedunit = "cpm";             // 当前速度显示单位：cpm wpm
        this.RT_MODE = 'English';           // 当前模式：English Pinyin Made-up Custom
        this.RT_ENGDIC = 'brief';           // 当前词典类型：brief detail

        /*------- 布尔值 -------*/
        this.RT_RandomFirstUpper = false;   // 随机首字母大写
        this.RT_RandomSymbol = false;       // 随机标点字符
        this.RT_RandomNumber = false;       // 随机数字
        this.RT_TipDisplay = false;         // 显示tip
        this.RT_TypeSound = false;          // 打字音效
        this.RT_Voice = false;              // 语音合成
        this.RT_Crossword = false;          // 拼写模式
        this.RT_Currenting = false;         // 纠错：true:打字数据会加入记录，使用正常文本  false:打字数据会不会加入记录，使用错误榜生成的文本            

        /*------- 对象值 -------*/
        this.chartbezier = null;                // 图表贝塞尔曲线
        this.WordAssembler = null;              // 单词生成器
        this.getChartColors = null;             // 获取图表色彩
        this.RT_PINYINLIST = ["✘ERROR"];        // 拼音列表
        this.RT_ENGLISHWORDLIST = ["✘ERROR"];   // 英文单词列表
        this.RT_ENGLISHDICTIONARY = {           // 英文单词词典
            brief: ["✘ERROR"],                 /* 简化 */
            detail: ["✘ERROR"]                    /* 完整释义 */
        };

        /************** 内部使用数据 ***************/
        this.txt = "";              // 当前文本全文
        this.txtGroups = [];        // 当前文本分段
        this.currentGroup = -1;     // 当前段落
        this.currentTxt = "";       // 当前段落文本
        this.currentWord = {
            word: "",               /* 当前单词   */
            begin: 0,               /* 单词左边界 */
            end: 0                  /* 单词右边界 */
        };
        this.inptxt = "";           // 当前已输入文本
        this.inppos = 0;            // 当前键入位置
        this.timer = 0;             // 计时器
        this.refresher = null;              // refresher
        this.refreshertimeinterval = 500;  // refresher时间间隔
        this.StateBoard = null;
        this.Data = null;
        this.lastpData = null;
        this.pData = null;
        this.pKeys = new Array();

        /************** 类 ***************/
        function _Data(data) {
            this.AvgSpeed = 0;
            this.Spents = 0;
            this.TextLength = 0;
            this.KeyStrokes = 0;
            this.BackspaceStrokes = 0;
            this.TopSpeed = 0;
            this.Accuracy = 0;
            this.keys = new Array();
            this.datas = new Array();
            var _this = this;
            if (data != undefined) {
                this.AvgSpeed = data.AvgSpeed;
                this.Spents = data.Spents;
                this.TextLength = data.TextLength;
                this.KeyStrokes = data.KeyStrokes;
                this.BackspaceStrokes = data.BackspaceStrokes;
                this.TopSpeed = data.TopSpeed;
                this.Paragraphs = data.Paragraphs;
                this.Accuracy = data.Accuracy;
                for (let k of data.keys) {
                    this.keys.push(new _Key(key = k));
                }
                for (let k of data.datas) {
                    this.datas.push(new _PData(k));
                }
            }

            this.clear = function () {
                _this.AvgSpeed = 0;
                _this.Spents = 0;
                _this.TextLength = 0;
                _this.KeyStrokes = 0;
                _this.BackspaceStrokes = 0;
                _this.TopSpeed = 0;
                _this.Paragraphs = 0;
                _this.Accuracy = 0;
                _this.keys = new Array();
                _this.datas = new Array();
            };

            this.refresh = function (pData) {
                _this.Spents += pData.Spents;
                _this.TextLength += pData.TextLength;
                _this.KeyStrokes += pData.KeyStrokes;
                _this.BackspaceStrokes += pData.BackspaceStrokes;
                _this.Paragraphs++;
                _this.Accuracy = _getAccuracy(_this.TextLength, _this.KeyStrokes);
                _this.AvgSpeed = _getSpeed(_this.TextLength, _this.Spents);
                _this.TopSpeed = Math.max(_this.TopSpeed, pData.Speed);
                _this.datas.push(new _PData(pData));
            };
        }
        function _PData(pdata) {
            this.Speed = 0;
            this.Spents = 0;
            this.TextLength = 0;
            this.KeyStrokes = 0;
            this.BackspaceStrokes = 0;
            this.Accuracy = 0;
            if (pdata != undefined) {
                this.Speed = pdata.Speed;
                this.Spents = pdata.Spents;
                this.TextLength = pdata.TextLength;
                this.KeyStrokes = pdata.KeyStrokes;
                this.BackspaceStrokes = pdata.BackspaceStrokes;
                this.Accuracy = pdata.Accuracy;
            }
            var __this = this;

            this.clear = function () {
                __this.Speed = 0;
                __this.Spents = 0;
                __this.TextLength = 0;
                __this.KeyStrokes = 0;
                __this.BackspaceStrokes = 0;
                __this.Accuracy = 0;
            };

            this.refresh = function (timer) {
                __this.Spents = Date.now() - timer;
                __this.Speed = _getSpeed(__this.TextLength, __this.Spents);
                __this.Accuracy = _getAccuracy(__this.TextLength, __this.KeyStrokes);
            };

            this.refreshwhentyping = function (timer) {
                __this.Spents = Date.now() - timer;
                let finishedtext = 0;
                for (let i = 0; i < __this.TextLength && i < _this.inptxt.length; i++) {
                    if (_this.currentTxt.charAt(i) === _this.inptxt.charAt(i)) {
                        finishedtext++;
                    }
                }
                __this.Speed = _getSpeed(finishedtext, __this.Spents);
                __this.Accuracy = _getAccuracy(finishedtext, __this.KeyStrokes);
                return __this.Speed >= _this.limitspeed && __this.Accuracy >= _this.limitaccuracy;
            };
        }
        function _Key(Key = null, KeyMisses = 0, KeyTimes = 0, key = undefined) {
            this.Key = Key;
            this.KeyMisses = KeyMisses;
            this.KeyTimes = KeyTimes;
            this.KeyMissRate = _getKeyMissRate(KeyMisses, KeyTimes);
            if (key != null) {
                this.Key = key.Key;
                this.KeyMisses = key.KeyMisses;
                this.KeyTimes = key.KeyTimes;
                this.KeyMissRate = key.KeyMissRate;
            }
            var _this = this;

            this.Add = function (e) {
                _this.KeyMisses += e.KeyMisses;
                _this.KeyTimes += e.KeyTimes;
                _this.KeyMissRate = _getKeyMissRate(_this.KeyMisses, _this.KeyTimes);
            };
        }
        // 状态板
        function StateBoard() {
            var StateBoard = this;
            function _set(id, val) {
                $(id).innerHTML = val;
            }
            // speed
            this.updateSpeed = function () {
                let speed = _this.pData.Speed;
                if (_this.pData.Spents == 0 && _this.lastpData)
                    speed = _this.lastpData.Speed;
                _set('val_speed', _this.SpeedDisplay(speed));
                _set('val_avgspeed', _this.SpeedDisplay(_this.Data.AvgSpeed));
                _set('val_topspeed', _this.SpeedDisplay(_this.Data.TopSpeed));
            };

            // backspace
            this.updateBackspace = function () {
                _set('val_backspace', _this.pData.BackspaceStrokes);
                _set('val_allbackspace', _this.Data.BackspaceStrokes);
            };
            // accuracy
            this.updateAccuracy = function () {
                _set('val_accuracy', _this.pData.Accuracy);
                _set('val_allaccuracy', _this.Data.Accuracy);
            };
            // spents
            this.updateSpents = function () {
                let allspents = Math.floor(_this.Data.Spents / 1000);
                allspents = Math.floor(allspents / 60) + "min " + (allspents % 60) + "s";
                let spents = Math.floor(_this.pData.Spents / 1000);
                _set('val_spents', spents);
                _set('val_allspents', allspents);
            }
            // other
            this.updateMode = function () {
                let mode = _this.RT_MODE;
                if (mode == 'Made-up') {
                    mode += '.' + _this.SpecialMode;
                }
                _set('val_mode', mode);
            };

            this.updateStruck = function () {
                _set('val_keystruck', _this.Data.KeyStrokes);
                let struckspeed = Math.floor(_this.Data.KeyStrokes / _this.Data.Spents * 1000 * 100) / 100;
                _set('val_struckspeed', struckspeed ? struckspeed : 0);
                _set('val_text', _this.Data.TextLength);
            };

            this.updateProgress = function () {
                // let t = Math.floor(_this.currentpos / _this.txt.length * 10000) / 100;
                let t = _this.currentGroup + "/" + _this.txtGroups.length;
                _set('val_progress', t ? t : 0);
            };

            this.update = function () {
                StateBoard.updateSpeed();
                StateBoard.updateMode();
                StateBoard.updateBackspace();
                StateBoard.updateAccuracy();
                StateBoard.updateSpents();
                StateBoard.updateMode();
                StateBoard.updateStruck();
                StateBoard.updateProgress();
                // 错误率排行
                _this.UpdateMissRank(_this.missrankfilter);
            };

            this.updateBigWith = function (pdata) {
                let tmp = _this.pData;
                _this.pData = pdata;
                _this.StateBoard.updateSpeed();
                _this.StateBoard.updateAccuracy();
                _this.StateBoard.updateSpents();
                _this.StateBoard.updateBackspace();
                _this.pData = tmp;
            };
        };

        /************** 数据处理 ***************/
        // 完整刷新prc_text
        function refreshFullDisplayHtml(txt, inp) {
            let html = "";
            let errs = new Map();
            let now = inp.length;
            for (let i = 0; i < inp.length && i < txt.length; i++) {
                if (inp.charAt(i) != txt.charAt(i)) {
                    errs[i] = true;
                }
            }
            let style = _this.charstyle;
            if (_this.RT_Crossword) style = 0;
            for (let i = 0; i < txt.length; i++) {
                let classname = "normal-" + style;
                if (errs[i]) classname = "err-" + style;
                else if (i === now) classname = "now-" + style;
                else if (i < now) classname = "past-" + style;
                let c = txt.charAt(i);
                if (c === "\n") {
                    html += '<span class="' + classname + '">' + ENTERKEY + "</span><br>";
                    continue;
                }
                if (c === " ") {
                    if (_this.RT_Crossword) classname += '" isspace="true';
                    c = errs[i] ? SPACEKEYVISIBLE : SPACEKEY;
                }
                html += '<span class="' + classname + '">' + c + "</span>";
            }
            _this.etxt.innerHTML = html;
        }
        // 快速刷新prc_text (v 4.0)
        function refreshDisplayHtml(txt, inp) {
            if (inp === txt) return true;
            let now = inp.length, style = _this.charstyle;
            if (_this.RT_Crossword) style = 0;
            function refresh(inx, state) {
                if (inx < 0 || inx >= _this.etxt.childElementCount) return;
                let e = _this.etxt.children[inx];
                let cinp = inp.charAt(inx), ctxt = txt.charAt(inx);
                if (inx >= now) cinp = ctxt;
                switch (((ctxt !== " ") << 1) | (cinp !== ctxt)) {
                    case 0:
                        e.innerHTML = SPACEKEY;
                        e.className = state + "-" + style;
                        break;
                    case 1:
                        e.innerHTML = SPACEKEYVISIBLE;
                        e.className = "err-" + style;
                        break;
                    case 2:
                        e.innerHTML = ctxt;
                        e.className = state + "-" + style;
                        break;
                    case 3:
                        e.innerHTML = ctxt;
                        e.className = "err-" + style;
                        break;
                    default: break;
                }
            }
            refresh(now, "now");
            refresh(now - 1, "past");
            refresh(now + 1, "normal");
            return false;
        }
        // 快速刷新prc_inp
        function refreshInpHtml(inp, pos) {
        }
        // 获取prc_inp的html格式字符串
        function _getInpHtml(inp, pos) {
            let html = "";
            let entercount = 0;
            for (let i = 0; i < inp.length; i++) {
                let c = inp.charAt(i);
                let span = "<span>";
                if (i === pos) span = '<span class="cursor">';
                if (c === "\n") {
                    html += span + ENTERKEY + "</span>";
                    if (++entercount < ROWS) html += "<br>";
                } else {
                    if (c === " ") c = SPACEKEY;
                    html += span + c + "</span>";
                }
            }
            if (pos === inp.length)
                html += '<span class="cursor">&nbsp;</span>';
            else
                html += '<span>&nbsp;</span>';
            return html;
        }
        // 速度计算 speed = floor( 60 * 1000 * TextLength / Spents)
        function _getSpeed(textlength, spents) {
            let ret = Math.floor(60000 * textlength / spents);
            return ret == Infinity ? NaN : (ret > FULLSPEED ? FULLSPEED : ret);
        }
        // 正确率计算 Accuracy = FinishedText / KeyStrucks
        function _getAccuracy(FinishedText, KeyStrucks) {
            let ret = Math.floor(FinishedText / KeyStrucks * 10000) / 100;
            return ret == Infinity ? NaN : ret;
        }
        // 误按率计算
        function _getKeyMissRate(keymisses, keytimes) {
            if (keytimes == 0) return 0;
            return Math.round(keymisses * 1000 / keytimes) / 1000;
        }
        // 指定区间的随机整数
        // [min, max), 若未指定max则范围为[0,min)
        function _rand(min, max) {
            if (max == undefined) {
                max = min;
                min = 0;
            }
            return Math.floor(Math.random() * (max - min) + min);
        }
        // 检测字符类型
        function _cType(c) {
            let code = c.charCodeAt(0);
            if (code >= "a".charCodeAt(0) && code <= "z".charCodeAt(0) ||
                code >= "A".charCodeAt(0) && code <= "Z".charCodeAt(0)
            ) return "letter";
            if (code >= "0".charCodeAt(0) && code <= "9".charCodeAt(0))
                return "number";
            if (code == " ".charCodeAt(0) || code == "\n".charCodeAt(0))
                return "whitespace";
            return "symbol";
        }
        // 根据单位转换显示速度
        this.SpeedDisplay = function (speed) {
            if (_this.speedunit == "cpm")
                return speed;
            else if (_this.speedunit == "wpm")
                return Math.floor(speed / 5);
            else
                return NaN;
        };

        /************** 文本生成 ***************/
        // 生成练习文本或纠错文本
        this.getRandomText = function (wordlist) {
            let len = Math.max(Math.floor(_this.RT_Length * _this.RT_Currention), 1);
            let range = { min: 4, max: 10 };
            let charset = new Array();

            let l = new Array();
            for (let i in _this.Data.keys) {
                l.push(_this.Data.keys[i]);
            }
            l.sort(function (a, b) { return b.KeyMissRate - a.KeyMissRate; });

            let c = _this.missranknum;
            for (let i = 0; i < l.length; i++) {
                let e = l[i];
                if (e.KeyMisses == 0) continue;
                if (_cType(e.Key) == "whitespace") continue;
                charset.push(e.Key);
                if (--c == 0) break;
            }

            // 小于3种失误字符时 或 纠错完成时 或 纠错关闭时，返回正常文本
            if (_this.RT_Currenting || _this.RT_Currention == 0 || charset.length < 3) {
                _this.RT_Currenting = false;
                _this.setStatus(STR_practise);
                switch (_this.RT_MODE) {
                    case "Pinyin": return _this.getRandomPinyinText(wordlist);
                    case "English": return _this.getRandomEnglishText(wordlist);
                    case "Made-up": return _this.getRandomSpecialText();
                    case "Custom": return _this.txt;
                    default: return _this.getRandomEnglishText(wordlist);
                }
            }
            _this.RT_Currenting = true;
            _this.setStatus(STR_currention);

            var ret = "";
            for (; len--;) {
                let t = _rand(range.min, range.max + 1);
                let word = "";
                for (; t--;)word += charset[_rand(charset.length)];
                ret += word;
                ret += " ";
            }
            ret = ret.substring(0, ret.length - 1).toLowerCase();
            return ret;
        };
        // 生成特制单词文本
        this.getRandomSpecialText = function () {
            let ret = "";
            let count = _this.RT_Length;
            if (_this.SpecialMode == "InTurn") {
                let flag = 0;
                let hands = [];
                hands[flag] = "LeftHand";
                hands[~flag] = "RightHand";
                while (count--) {
                    ret += _this.WordAssembler.Word(_this.SpecialWordLength, hands[flag]) + ' ';
                    flag = ~flag;
                }
            } else {
                while (count--) {
                    ret += _this.WordAssembler.Word(_this.SpecialWordLength, _this.SpecialMode) + ' ';
                }
            }
            ret = ret.substring(0, ret.length - 1).toLowerCase();
            return ret;
        };
        this.setSpecialMode = function (mode) {
            _this.SpecialMode = mode;
            _this.StateBoard.updateMode();
            if (_this.RT_MODE == "Made-up") {
                _this.RT_Currenting = true;
                _this.setStatus(STR_practise);
                _this.setRandomTextSource();
            }
        };
        this.setSpecialWordLength = function (val) {
            _this.SpecialWordLength = val;
            if (_this.RT_MODE == "Made-up") {
                _this.RT_Currenting = true;
                _this.setStatus(STR_practise);
                _this.setRandomTextSource();
            }
        };
        // 生成拼音文本
        this.getRandomPinyinText = function (wordlist) {
            if (wordlist == undefined) wordlist = _this.RT_PINYINLIST;
            let p = [1, 2, 2, 2, 3, 3, 4];
            let ret = "";
            let count = _this.RT_Length;
            while (count--) {
                let w = "";
                let t = p[_rand(p.length)];
                while (t--) {
                    w += wordlist[_rand(wordlist.length)];
                }
                ret += w + ' ';
            }
            ret = ret.substring(0, ret.length - 1);
            return ret;
        };
        // 生成英语单词文本
        this.getRandomEnglishText = function (wordlist) {
            if (wordlist === undefined)
                wordlist = _this.RT_ENGLISHWORDLIST;
            let pNormal = .5;
            let pUpper = .8;
            let pNum = .9;
            let pSymbol = 1;
            function __num() {
                let min = 0, max = 10000;
                return _rand(min, max);
            }
            function __symbol() {
                let min = 1, max = 4;
                let sy = "[]{}()<>'\":;,.?/\\|+-=_`~!@#$%^&*";
                let ret = "";
                let len = _rand(min, max + 1);
                while (len--) {
                    ret += sy.charAt(_rand(sy.length));
                }
                return ret;
            }
            function __upper(w) {
                return w.charAt(0).toUpperCase() + w.substr(1);
            }

            let ret = "";
            let count = _this.RT_Length;
            while (count--) {
                let q = Math.random();
                let w = wordlist[_rand(wordlist.length)];
                w = w.toLowerCase();
                if (q > pNormal && q < pUpper && _this.RT_RandomFirstUpper) {
                    w = __upper(wordlist[_rand(wordlist.length)]);
                }
                else if (q >= pUpper && q < pNum && _this.RT_RandomNumber) {
                    w = __num();
                }
                else if (q >= pNum && q < pSymbol && _this.RT_RandomSymbol) {
                    w = __symbol();
                }
                ret += w + " ";
            }
            ret = ret.substring(0, ret.length - 1);
            return ret;
        };

        /************** 内部操作 ***************/
        // 设置状态
        this.setStatus = function (HTMLstr) {
            _this.etstatus.innerHTML = HTMLstr;
        };
        // 重算文本区域最大字符数
        this.refreshROWMAXLEN = function () {
            let tmp = _this.etxt.innerHTML;
            _this.etxt.innerHTML = '<span>Z</span>';
            let w1 = _this.etxt.getBoundingClientRect().width;
            let w2 = _this.etxt.firstChild.getBoundingClientRect().width;
            ROWMAXLEN = Math.floor(w1 / w2);
            _this.etxt.innerHTML = tmp;
        };
        // 文本分段
        this.groupingText = function (text) {
            let groups = new Array();
            let v = 0, i = 0, j = 0;
            for (; i < text.length;) {
                // i 移至第一个非空白字符
                for (; i < text.length && _cType(text[i]) === "whitespace"; i++);
                // j 移至单组最大字符长度处
                j = i + ROWMAXLEN * ROWS;
                // j 向前移至文本末尾或第一个空白字符处
                if (j >= text.length) {
                    j = text.length;
                } else {
                    for (; j > i && _cType(text[j]) !== "whitespace"; j--);
                }
                // 若存在空白字符，则截取文本 i~j 加入组，否则直接截取最大长度
                if (j !== i) {
                    groups.push(text.substr(i, j - i));
                } else {
                    j = Math.min(text.length, i + ROWMAXLEN * 2);
                    groups.push(text.substr(i, j - i));
                }
                // i 移至j的下一位
                i = j + 1;
            }
            return groups;
        };
        // 设置当前段落
        this.setCurrentText = function () {
            _this.refreshROWMAXLEN();
            _this.currentGroup++;
            // 检查文本进度情况
            if (_this.currentGroup >= _this.txtGroups.length) {
                _this.setRandomTextSource();
                return;
            }
            _this.state = "running";
            _this.StateBoard.updateProgress();
            _this.currentTxt = _this.txtGroups[_this.currentGroup];
            _this.einp.maxLength = _this.currentTxt.length;
            _this.einp.value = "";
            _this.inptxt = "";
            _this.inppos = 0;
            _this.timer = 0;
            _this.pData.clear();
            if (_this.Data.datas.length > 0) {
                _this.lastpData = new _PData(_this.Data.datas[_this.Data.datas.length - 1]);
            } else {
                _this.lastpData = new _PData();
            }
            _this.pData.TextLength = _this.currentTxt.length;

            // 刷新当前段落字符统计初始数据
            _this.pKeys = [];
            for (var i = 0; i < _this.currentTxt.length; i++) {
                var c = _this.currentTxt.charAt(i).toUpperCase();
                if (_this.pKeys[c] == undefined) {
                    _this.pKeys[c] = new _Key(c);
                }
                _this.pKeys[c].KeyTimes++;
            }

            // 刷新显示
            //_this.etxt.innerHTML = _getDisplayHtml(_this.currentTxt, _this.inptxt).html;
            refreshFullDisplayHtml(_this.currentTxt, _this.inptxt);
            _this.einpdisplay.innerHTML = _getInpHtml(_this.inptxt);
            _this.efulltext.innerHTML = _this.txt;
            _this.einp.focus();
            _this.updateTip();

        };
        // 重置当前段落
        this.resetCurrentText = function () {
            _this.einp.value = "";
            _this.inptxt = "";
            _this.inppos = 0;
            _this.timer = 0;
            _this.pData.clear();
            if (_this.Data.datas.length > 0) {
                _this.lastpData = new _PData(_this.Data.datas[_this.Data.datas.length - 1]);
            } else {
                _this.lastpData = new _PData();
            }
            _this.pData.TextLength = _this.currentTxt.length;

            // 刷新当前段落字符统计初始数据
            _this.pKeys = [];
            for (var i = 0; i < _this.currentTxt.length; i++) {
                var c = _this.currentTxt.charAt(i).toUpperCase();
                if (_this.pKeys[c] == undefined) {
                    _this.pKeys[c] = new _Key(c);
                }
                _this.pKeys[c].KeyTimes++;
            }
            // 刷新显示
            //_this.etxt.innerHTML = _getDisplayHtml(_this.currentTxt, _this.inptxt).html;
            refreshFullDisplayHtml(_this.currentTxt, _this.inptxt);
            _this.einpdisplay.innerHTML = _getInpHtml(_this.inptxt);
            _this.StateBoard.updateBigWith(_this.lastpData);
            _this.updateTip();
        };
        // 设置随机文本源
        this.setRandomTextSource = function () {
            _this.txt = _this.getRandomText(undefined);
            _this.txtGroups = _this.groupingText(_this.txt);
            _this.currentTxt = "";
            _this.currentGroup = -1;
            _this.StateBoard.updateProgress();
            _this.setCurrentText();
            _this.StateBoard.updateBigWith(_this.lastpData);
        };
        // 设置随机文本生成器
        this.setTextMode = function (mode) {
            if (mode !== "English" && _this.RT_TipDisplay) {
                _this.tipToggle();
            }
            _this.RT_MODE = mode;
            _this.StateBoard.updateMode();
            _this.RT_Currenting = true;
            _this.setStatus(STR_practise);
            _this.setRandomTextSource();
        };
        // 设置文本源
        this.setTextSource = function (eid) {
            _this.txt = $(eid).value;
            _this.txt = _this.txt.replace(new RegExp('\t', 'g'), " ");
            _this.txt = _this.txt.replace(new RegExp('\n', 'g'), " ");
            _this.txtGroups = _this.groupingText(_this.txt);
            if (_this.txt == "") return;
            _this.setTextMode("Custom");
            _this.currentTxt = "";
            _this.currentGroup = -1;
            _this.StateBoard.updateProgress();
            _this.setCurrentText();
        };
        // 击键
        this.Typying = function (e) {
            _this.inptxt = _this.einp.value;
            _this.inppos = _this.einp.selectionStart;

            // 首个正确击键时开始计时
            if (_this.timer == 0 && _this.inptxt.charAt(0) === _this.currentTxt.charAt(0)) {
                _this.timer = Date.now() - 1;
            }

            // 更新inpdisplay
            _this.einpdisplay.innerHTML = _getInpHtml(_this.inptxt, _this.inppos);

            // 更新tip
            _this.updateTip();

            // 捕获退格键
            if (e.type == "keyup") {
                if (e.keyCode == 8) {
                    _this.pData.BackspaceStrokes++;
                } else {
                    var c = _this.currentTxt.charAt(_this.inppos - 1);
                    if (c != _this.inptxt.charAt(_this.inppos - 1)) {
                        _this.pKeys[c.toUpperCase()].KeyMisses++;
                    }
                }
            }

            // 更新段落显示，若本段完成则刷新
            if (e.type == "keyup") return;
            _this.pData.KeyStrokes++;
            if (refreshDisplayHtml(_this.currentTxt, _this.inptxt)) {
                _this.UpdateData();
                _this.StateBoard.update();
                _this.chartbezier = null;   // 重新计算bezier
                _this.RefreshChart();
                _this.SaveData();
                _this.setCurrentText();
                _this.pData.TextLength = _this.currentTxt.length;
            }
        };

        /************** 更新数据 ***************/
        // 更新统计数据
        this.UpdateData = function () {
            _this.pData.refresh(_this.timer);
            if (_this.RT_Currenting) return;
            _this.Data.refresh(_this.pData);

            for (let i in _this.pKeys) {
                var e = _this.pKeys[i];
                if (_this.Data.keys[e.Key] != null) {
                    _this.Data.keys[e.Key].Add(e);
                } else {
                    _this.Data.keys[e.Key] = new _Key(e.Key, e.KeyMisses, e.KeyTimes);
                }
            }
        };
        // 更新错误榜
        this.UpdateMissRank = function (filter = "all") {
            _this.missrankfilter = filter;
            var erank = $("prc_missrank");
            var l = [];
            var html = "";
            for (let i in _this.Data.keys) {
                l.push(_this.Data.keys[i]);
            }
            l.sort(function (a, b) { return b.KeyMissRate - a.KeyMissRate; });
            var count = _this.missranknum;
            for (var e of l) {
                if (e.KeyMissRate == 0) continue;
                if (filter == "number" && _cType(e.Key) != "number") continue;
                if (filter == "letter" && _cType(e.Key) != "letter") continue;
                if (filter == "symbol" && _cType(e.Key) != "symbol") continue;
                if (_cType(e.Key) == "whitespace") continue;
                var c = e.Key;
                if (c == "\n") c = ENTERKEY;
                if (c == " ") c = SPACEKEYVISIBLE;
                html += '<span><span class="miss">' + c + '</span>[' + e.KeyMissRate + ']</span>'
                if (--count == 0) break;
            }
            erank.innerHTML = html;
        };

        /************** 功能 ***************/
        // 暂停
        this.Pause = function () {
            _this.resetCurrentText();
            _this.einpdisplay.innerHTML = '<div class="info">' + STR_clicktotype + '</div>';
        };
        // 显示帮助信息
        this.info = function (e) {
            let Infoes = {
                info_mode: "Select the text pattern for the exercise.\
                <b>'English'</b>: Random English words.\
                <b>'Pinyin'</b>: Random Chinese Pinyin words.\
                <b>'Made-up'</b>: Random Made-up words with controllable character sets and lengths.",
                info_words: "Set the number of words in text.",
                info_style: "Set the style of text display.",
                info_currention: "Set the percentage of currention.\
                <b>'0%'</b> to deactivate currention.\
                <b>'currention'</b>: When you finish a piece of text, the new text will be based on the 'Miss Rank' for targeted practice.",
                info_enginclude: "What text contains in mode&nbsp;<b>'English'</b>.",
                info_madeupmode: "Select the mode in mode&nbsp;<b>'Made-up'</b>.\
                <b>'Normal'</b>: Words will be made up of alphabet.\
                <b>'LeftHand'</b>: Words will be made up of lefthand character set.\
                <b>'RightHand'</b>: Words will be made up of righthand character set.\
                <b>'In-Turn'</b>: Words are formed by alternating lefthand and righthand character sets.",
                info_madeupminwordlen: "Set the minimum length of words in mode&nbsp;<b>'Made-up'</b>.",
                info_leftcharset: "Set the lefthand character set, others will be the righthand character set.",
                info_customtext: "Use custom text for typing practise, text will automatic cycling.",
                prc_miss: "The&nbsp;<b>Top 10</b>&nbsp;by mistake rate highest character list.",
                prc_speedunit: "Switch the unit of speed.<br>\
                <b>'wpm'</b>: words per minute.<br>\
                <b>'cpm'</b>: characters per minute.<br>\
                <b>1</b>wpm = <b>5</b>cpm.",
                info: "<a href='https://github.com/Blackkkitty/TyT'><center>TyT<br><br>Make you type faster<br><br>By BLACKKITTY</center></a>"
            };
            if (!e || !Infoes[e.id]) _this.einfo.innerHTML = Infoes['info'];
            else _this.einfo.innerHTML = Infoes[e.id];
        };
        // 打字音效
        this.soundPlay = function () {
            if (_this.RT_TypeSound) {
                _this.sounderInx = (_this.sounderInx + 1) % _this.sounders.length;
                _this.sounders[_this.sounderInx].currentTime = 0;
                _this.sounders[_this.sounderInx].play();
            }
        };
        // 获取当前单词
        this.getCurrentWord = function () {
            let word, txt, i, w;
            txt = _this.currentTxt;
            w = _this.currentWord;
            i = _this.inppos;
            if (i >= w.begin && i < w.end && txt.substr(w.begin, w.end - w.begin) === w.word)
                return false;
            if (i < 0 || i >= txt.length || _cType(txt[i]) === "whitespace") word = "";
            else {
                let l = i, r = i;
                for (; l > 0 && _cType(txt[l]) !== "whitespace"; l--);
                for (; r < txt.length && _cType(txt[r]) !== "whitespace"; r++);
                if (_cType(txt[l]) === "whitespace") l++;
                word = txt.substr(l, r - l);
                _this.currentWord.begin = l;
                _this.currentWord.end = r;
            }
            let isnewword = _this.currentWord.word !== word;
            _this.currentWord.word = word;
            return isnewword;
        };
        // 刷新tip和语音
        this.updateTip = function () {
            // 单词变化时朗读
            if (_this.getCurrentWord()) _this.readWord();
            if (!_this.RT_TipDisplay && _this.RT_MODE !== "English") return;

            let tip = _this.RT_ENGLISHDICTIONARY[_this.RT_ENGDIC][_this.currentWord.word];
            if (!tip) tip = _this.currentWord.word;
            let tipx, tipy;

            let currentpos = _this.inppos;
            tipy = currentpos >= ROWMAXLEN ? "72%" : "97%";
            currentpos = currentpos % ROWMAXLEN;
            tipx = (currentpos * 100.) / ROWMAXLEN + "%";
            if (_this.charstyle.toString() === "5" && !_this.RT_Crossword) {
                tipx = "0%";
                tipy = "97%";
            }
            _this.etip.innerHTML = tip;
            _this.etip.style.left = tipx;
            _this.etip.style.bottom = tipy;
        };
        // 语音合成
        this.readWord = function () {
            if (
                _this.RT_Voice
                && _this.currentWord.word !== ''
                && _cType(_this.currentWord.word[0]) !== 'symbol'
            ) {
                let utterance = new SpeechSynthesisUtterance(_this.currentWord.word);
                utterance.voice = speechSynthesis.getVoices()[1];
                // 根据单词长度适当放慢语速
                utterance.rate = Math.max(.5, 1 - .1 * Math.floor(_this.currentWord.word.length / 8));
                speechSynthesis.cancel();
                speechSynthesis.speak(utterance);
            }
        };
        // 重新生成文本
        this.newText = function () {
            _this.RT_Currenting = !_this.RT_Currenting;
            _this.setRandomTextSource();
            _this.Pause();
        };

        //test
        // this.test = () => {
        //     let c = 650;
        //     _this.Data.datas = [];
        //     for (let i = 0; i < c; i++) {
        //         let a = new _PData();
        //         a = _random(a);
        //         _this.Data.refresh(a);
        //     }
        //     _this.chartbezier = null;
        //     _this.RefreshChart();
        //     function _random(a) {
        //         a.Speed = _rand(200, 400);
        //         a.Spents = _rand(18000, 30000);
        //         a.TextLength = _rand(90, 120);
        //         a.KeyStrokes = _rand(90, 140);
        //         a.BackspaceStrokes = _rand(0, 30);
        //         a.Accuracy = _rand(40, 100);
        //         return a;
        //     };
        // };

        /************** 图表 ***************/
        // 刷新图表
        this.RefreshChart = function (place, begin = 0, end = _this.Data.datas.length) {

            let ctx = _this.echart.getContext('2d');
            let width = 1050;
            let height = 200;
            let padding = 15;
            let multiBezierSteps = 2300;

            let facolor = _this.getChartColors().strong;
            let fbcolor = _this.getChartColors().text;
            let fccolor = "rgba(0,0,0,.2)";

            let vmin = Infinity;
            let vmax = -Infinity;
            end--;
            let len = Math.floor((end - begin) * _this.chartselect);
            end -= Math.floor((1 - _this.chartoffset) * (end - len));
            begin += end - len;

            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            let sourcedata = new Array();
            let markeddata = null;
            let charttext = "";

            let pos = {
                x: {
                    min: (0 + padding),
                    max: (width - padding)
                },
                y: {
                    min: height - padding,
                    max: padding
                },
                px: function (x) {
                    return pos.x.min + x / (end - begin) * (pos.x.max - pos.x.min);
                },
                py: function (y) {
                    return pos.y.min + (y - vmin) / (vmax - vmin) * (pos.y.max - pos.y.min);
                },
                vx: function (x) {
                    return (x - pos.x.min) / (pos.x.max - pos.x.min) * (end - begin) + begin;
                },
                vy: function (y) {
                    return (y - pos.y.min) / (pos.y.max - pos.y.min) * (vmax - vmin) + vmin;
                },
                p: function (v) {
                    return { x: pos.px(v.x), y: pos.py(v.y) };
                },
                v: function (p) {
                    return { x: pos.vx(p.x), y: pos.vy(p.y) };
                },
                ps: function (a) {
                    let ret = new Array();
                    for (let v of a) ret.push(pos.p(v));
                    return ret;
                }
            };

            // 显示文字
            function tprint(str) {
                let Xpos = { x: 0 + 2, y: 11 };
                ctx.font = "13px monospace";
                ctx.fillStyle = facolor;
                ctx.clearRect(Xpos.x, 0, width - Xpos.x, Xpos.y);
                ctx.fillText(str, Xpos.x, Xpos.y);
            }

            // 画点
            function dot(point, radius, color) {
                if (!radius) radius = 2;
                if (!color) color = ctx.strokeStyle;
                let t = ctx.fillStyle;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, true);
                ctx.fill();
                ctx.fillStyle = t;
            }

            // 标记点
            function markit(point, radius) {
                if (!radius) radius = 5;
                ctx.beginPath();
                ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, true);
                ctx.stroke();
            }

            // 计算平均值
            function getAvg(data, item) {
                let sum = 0;
                for (let v of data) sum += v[item];
                sum = data.length > 0 ? sum * 1. / data.length : 0;
                sum = sum.toFixed(1);
                return sum;
            }

            // 数据缩放
            function zoom(data, len) {
                if (data.length <= len) return data;
                let ret = new Array();
                let step = data.length * 1. / len;
                for (let i = 0; i < len; i++) {
                    let x = 0, y = 0;
                    let l = Math.floor(i * step);
                    let r = Math.min(Math.floor((i + 1) * step), data.length);
                    for (let j = l; j < r; j++) {
                        x += data[j].x;
                        y += data[j].y;
                    }
                    y = y * 1. / (r - l);
                    x = x * 1. / (r - l);
                    ret.push({ x: x, y: y });
                }
                return ret;
            }

            // 重新计算贝塞尔曲线
            function getMultiBezier(data) {
                let steps = multiBezierSteps;
                let step = 1. / steps;
                let z = new Array();
                let end = data[data.length - 1];
                if (!data || data.length < 1) return z;
                function _mov(pa, pb, prc) {
                    pa.x += (pb.x - pa.x) * 1. * prc;
                    pa.y += (pb.y - pa.y) * 1. * prc;
                    return pa;
                }
                function _bz(ds, prc) {
                    if (ds.length === 1)
                        return ds[0];
                    let a = [];
                    for (let i = 1; i < ds.length; i++)
                        a.push(_mov(ds[i - 1], ds[i], prc));
                    return _bz(a, prc);
                }
                let _avg = pos.py(avg);
                let dt = 0;
                if (data.length > 1) dt = (data.length / 10.) * (data[1].x - data[0].x);
                data[0].y = (_avg + data[0].y) / 2.;
                end.y = (_avg + end.y) / 2.;
                data = [{ x: data[0].x - dt, y: _avg }].concat(data);
                data.push({ x: data[data.length - 1].x + dt, y: _avg });

                for (let v of data) v.y += _this.chartbezierzoom * (v.y - _avg);

                for (let i = 0; i <= 1; i += step) {
                    let p = _bz(data, i);
                    if (Math.abs(p.x - end.x) < .001 && Math.abs(p.y - end.y) < .001)
                        break;
                    z.push({ x: p.x, y: p.y });
                }
                z.push(data[0]);
                return z;
            }

            // 点呈现数据
            function DotsDraw(data, color) {
                if (!data || data.length < 1) return;
                if (!color) color = ctx.strokeStyle;
                for (let v of data)
                    dot(v, 2, color);
            }

            // 平滑曲线呈现数据
            function SmoothDraw(data) {
                if (!data || data.length < 1) return;
                for (let i = 1; i < data.length; i++) {
                    let v = data[i], w = data[i - 1];
                    let cx = (v.x + w.x) / 2.;
                    ctx.beginPath();
                    ctx.moveTo(w.x, w.y);
                    ctx.bezierCurveTo(cx, w.y, cx, v.y, v.x, v.y);
                    ctx.stroke();
                }
            }

            // 直线线呈现数据
            function LineDraw(data) {
                if (!data || data.length < 1) return;
                let last = null;
                for (let val of data) {
                    ctx.beginPath();
                    if (last != null) ctx.moveTo(last.x, last.y);
                    ctx.lineTo(val.x, val.y);
                    ctx.stroke();
                    last = val;
                }
            }

            // 呈现鼠标位置
            function locate(place) {
                function crossline(p) {
                    ctx.strokeStyle = facolor;
                    ctx.beginPath();
                    ctx.moveTo(0, p.y);
                    ctx.lineTo(width, p.y);
                    ctx.moveTo(p.x, pos.y.min);
                    ctx.lineTo(p.x, pos.y.max);
                    ctx.stroke();
                }

                function mark(p) {
                    let radius = 30;
                    let mindis = Infinity;
                    for (let q of sourcedata) {
                        let d = Math.hypot(p.x - pos.px(q.x), p.y - pos.py(q.y));
                        if (d < radius && d < mindis) {
                            mindis = d;
                            markeddata = pos.p(q);
                        }
                    }
                }

                if (place.x < pos.x.min || place.x > pos.x.max || place.y < pos.y.max || place.y > pos.y.min) return;
                crossline(place);
                dot(place);
                mark(place);
                ctx.strokeStyle = fccolor;
                dot(place, 30);
                let vx = Math.floor(pos.vx(place.x) + .5);
                let vy = Math.floor(pos.vy(place.y) * 100) / 100;
                charttext += "  Cursor:[" + vx + ", " + vy + "]";
            }

            for (let i = begin; i <= end; i++) {
                vmax = Math.max(vmax, _this.Data.datas[i][_this.chartitem]);
                vmin = Math.min(vmin, _this.Data.datas[i][_this.chartitem]);
                sourcedata.push({ x: i - begin, y: _this.Data.datas[i][_this.chartitem] });
            }
            let avg = getAvg(sourcedata, "y");
            ctx.clearRect(0, 0, width, height);
            // 画坐标轴
            ctx.strokeStyle = fbcolor;
            ctx.beginPath();
            // x
            ctx.lineTo(width, height - 1);
            // min
            ctx.moveTo(0, pos.py(vmin));
            ctx.lineTo(width, pos.py(vmin));
            // max
            ctx.moveTo(0, pos.py(vmax));
            ctx.lineTo(width, pos.py(vmax));
            // avg
            if (avg > 0) {
                ctx.moveTo(0, pos.py(avg));
                ctx.lineTo(width, pos.py(avg));
            }
            ctx.stroke();
            // text avg min max
            charttext = _this.chartitem;
            charttext += "[" + begin + ", " + end + "]";
            charttext += "  Avg:" + avg + " Min:" + vmin + " Max:" + vmax;
            // cursor locate
            if (place) locate(place);

            let ps_sourcedata = pos.ps(sourcedata);
            ctx.strokeStyle = fbcolor;
            SmoothDraw(ps_sourcedata);
            DotsDraw(ps_sourcedata, facolor);
            ctx.strokeStyle = facolor;
            if (_this.chartbezier === null || _this.chartbezier.length < 1) {
                _this.chartbezier = getMultiBezier(zoom(ps_sourcedata, _this.chartmaxlength));
            }
            ctx.lineWidth = 2;
            LineDraw(_this.chartbezier, facolor);

            if (markeddata) {
                ctx.strokeStyle = facolor;
                dot(markeddata);
                markit(markeddata);
                charttext += "  Marked:[" + Math.floor(pos.vx(markeddata.x) + 0.5) + ", " + Math.floor(pos.vy(markeddata.y) * 100) / 100 + "]";
            }
            tprint(charttext);
        };
        // 设置图表
        this.SetChart = function (item, select, offset, bzoom) {
            _this.chartbezier = null;
            if (item) _this.chartitem = item;
            if (select) _this.chartselect = select;
            if (offset) _this.chartoffset = offset;
            if (bzoom) _this.chartbezierzoom = bzoom;
            _this.RefreshChart();
        };
        // 获取鼠标在图表上的位置
        this.getMousePosOnChart = function (evt) {
            let rect = _this.echart.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };

        /************** 数据 ***************/
        // 读取session数据
        this.LoadData = function () {
            let data = sessionStorage.getItem('Prc');
            if (data != null) {
                _this.Data = new _Data(JSON.parse(data));
                return true;
            }
            return false;
        };
        // 保存session数据
        this.SaveData = function () {
            sessionStorage.setItem('Prc', JSON.stringify(_this.Data));
        };
        // 重置全部数据
        this.ClearData = function () {
            sessionStorage.removeItem('Prc');
            _this.Data = new _Data();
            _this.pData = new _PData();
            _this.setRandomTextSource();
            _this.StateBoard.update();
            _this.RefreshChart();
            _this.Pause();
        };

        /************** 切换开关 ***************/
        // 打字音效开关
        this.soundToggle = (e) => {
            _this.RT_TypeSound = !_this.RT_TypeSound;
            if (_this.RT_TypeSound) {
                e.innerHTML = BOOL_ON + "Typing-Sound";
            } else {
                e.innerHTML = BOOL_OFF + "Typing-Sound";
            }
            if (_this.RT_TypeSound) _this.soundPlay();
        };
        // 切换速度单位
        this.speedToggle = (switchbtn) => {
            if (_this.speedunit == "cpm") {
                _this.speedunit = "wpm";

            } else if (_this.speedunit == "wpm") {
                _this.speedunit = "cpm";
            }
            switchbtn.innerHTML = _this.speedunit;
            _this.StateBoard.updateSpeed();
        };
        // 切换当前字符样式
        this.charStyleToggle = (val) => {
            _this.charstyle = val;
            //_this.etxt.innerHTML = _getDisplayHtml(_this.currentTxt, _this.inptxt).html;
            refreshFullDisplayHtml(_this.currentTxt, _this.inptxt);
            _this.updateTip();
        };
        // 切换tip显示
        this.tipToggle = (e) => {
            if (_this.RT_MODE !== "English") return;
            if (_this.RT_TipDisplay) {
                _this.RT_TipDisplay = false;
                _this.etip.hidden = "hidden";
                e.innerHTML = BOOL_OFF + "Tip";
            } else {
                _this.RT_TipDisplay = true;
                _this.etip.hidden = "";
                e.innerHTML = BOOL_ON + "Tip";
                _this.updateTip();
            }
        };
        // 切换英文词典
        this.dicToggle = (e) => {
            if (_this.RT_ENGDIC === "brief") {
                _this.RT_ENGDIC = "detail";
                _this.etip.className = "tip_dic_detail";
                e.innerHTML = "Detail";
            } else if (_this.RT_ENGDIC === "detail") {
                _this.RT_ENGDIC = "brief";
                _this.etip.className = "tip_dic_brief";
                e.innerHTML = "Brief";
            }
            _this.updateTip();
        };
        // 开关语音合成
        this.voiceToggle = (e) => {
            _this.RT_Voice = !_this.RT_Voice;
            if (_this.RT_Voice) {
                e.innerHTML = BOOL_ON + "Voice";
            } else {
                e.innerHTML = BOOL_OFF + "Voice";
            }
            _this.readWord();
        };
        // 切换拼写模式
        this.crosswordToggle = (e) => {
            _this.RT_Crossword = !_this.RT_Crossword;
            _this.charStyleToggle(_this.charstyle);
            e.innerHTML = _this.RT_Crossword ? BOOL_ON + "Crossword" : BOOL_OFF + "Crossword";
        };
        // 开关随机数字
        this.randomNumberToggle = (e) => {
            if (_this.RT_RandomNumber) {
                _this.RT_RandomNumber = false;
                e.innerHTML = BOOL_OFF + "Number";
            } else {
                _this.RT_RandomNumber = true;
                e.innerHTML = BOOL_ON + "Number";
            }
        };
        // 开关随机字符
        this.randomSymbolToggle = (e) => {
            if (_this.RT_RandomSymbol) {
                _this.RT_RandomSymbol = false;
                e.innerHTML = BOOL_OFF + "Symbol";
            } else {
                _this.RT_RandomSymbol = true;
                e.innerHTML = BOOL_ON + "Symbol";
            }
        };
        // 开关随机首字母大写
        this.randomCaptionToggle = (e) => {
            if (_this.RT_RandomFirstUpper) {
                _this.RT_RandomFirstUpper = false;
                e.innerHTML = BOOL_OFF + "Capital";
            } else {
                _this.RT_RandomFirstUpper = true;
                e.innerHTML = BOOL_ON + "Capital";
            }
        };

        // 设置限制器
        this.setLimiter = (accuracy, speed,eid) => {
            if (accuracy){
                _this.limitaccuracy = accuracy;
                $(eid).innerHTML = accuracy;
            } 
            if (speed){
                _this.limitspeed = speed;
                $(eid).innerHTML = speed;
            } 
            _this.Pause();
        };

        // refresher
        this.Refresher = function () {
            if (_this.timer > 0) {
                if (!_this.pData.refreshwhentyping(_this.timer)) {
                    _this.Pause();
                };
                _this.StateBoard.updateBigWith(_this.pData);
            }
        };
        // 初始化
        this.Init = function () {
            let n = $("sounders").childElementCount;
            for (let i = 0; i < n; i++) {
                _this.sounders.push($("sounder" + i));
            }
            _this.sounderInx = 0;
            _this.einp.addEventListener("keydown", _this.soundPlay);
            _this.einp.addEventListener("input", _this.Typying);
            _this.einp.addEventListener("keyup", _this.Typying);
            _this.einpdisplay.onclick = function () {
                _this.einp.focus();
                if (_this.einp.value != "") return;
                _this.einpdisplay.innerHTML = '<span class="cursor">&nbsp;</span>';
            };
            _this.Data = new _Data();
            _this.pData = new _PData();
            _this.StateBoard = new StateBoard();
            _this.echart.addEventListener('mousemove', function (evt) {
                _this.RefreshChart(_this.getMousePosOnChart(evt));
            }, false);
            _this.refresher = setInterval(_this.Refresher, _this.refreshertimeinterval);
        };

    },
    WordAssembler: function (additionalWordsList) {
        var unit = {
            prefixes: ["a", "ab", "abs", "ac", "ad", "af", "ag", "amphi", "an", "ana", "ante", "anti", "ap", "ar", "as", "at", "be", "bene", "bi", "by", "cata", "circum", "co", "col", "com", "con", "contra", "cor", "counter", "de", "deca", "deci", "demi", "di", "dia", "dif", "dis", "dys", "e", "ef", "em", "en", "endo", "epi", "eu", "ex", "exo", "extra", "fore", "hecto", "hemi", "hepta", "hetero", "hexa", "holo", "homo", "hyper", "hypo", "il", "im", "in", "inter", "intra", "intro", "ir", "iso", "kilo", "macro", "mal", "meta", "micro", "milli", "mini", "mis", "mono", "multi", "neo", "non", "ob", "octa", "omni", "out", "over", "paleo", "pan", "para", "pen", "penta", "per", "peri", "poly", "post", "pre", "pro", "pseudo", "quadri", "quadru", "quasi", "re", "retro", "se", "semi", "sept", "septi", "sex", "step", "stereo", "sub", "suc", "suf", "sup", "super", "supra", "sur", "sus", "sym", "syn", "tetra", "trans", "tri", "twi", "ultra", "un", "under", "uni", "vice", "with"],
            suffixes: ["ability", "able", "ably", "aceous", "acious", "acity", "acle", "acy", "ad", "ade", "age", "ain", "aire", "al", "ality", "ally", "an", "ance", "ancy", "aneity", "aneors", "ant", "ar", "ard", "arian", "arium", "ary", "ast", "aster", "atic", "ation", "ative", "ato", "atory", "cy", "dom", "ee", "eer", "el", "en", "ence", "ency", "enne", "ent", "eous", "er", "ern", "ery", "esque", "ess", "et", "etic", "ette", "ety", "faction", "fier", "fold", "form", "ful", "hood", "ia", "ial", "ian", "ibility", "ible", "ic", "ical", "ice", "ics", "id", "ie", "ier", "ific", "ification", "ile", "ine", "ing", "ion", "ior", "ious", "ise", "ish", "ism", "ist", "istic", "it", "ite", "ition", "itious", "itive", "itor", "itude", "ity", "ive", "ivity", "ization", "kin", "less", "like", "ling", "ly", "ment", "most", "ness", "o", "on", "oon", "or", "ory", "ose", "osity", "ot", "ous", "proof", "ress", "ry", "ship", "some", "ster", "th", "tic", "ture", "ular", "ule", "uous", "ward", "wise", "y"],
            rootwords: ["abol", "accoutr", "acid", "acm", "acri", "acrid", "act", "acu", "adip", "adjut", "advant", "aer", "aeri", "aero", "ag", "agger", "agog", "agon", "agr", "agri", "agro", "alacr", "alb", "ald", "alesc", "alg", "ali", "alt", "alter", "altern", "am", "amat", "ambul", "amen", "amic", "amor", "ampl", "anci", "anct", "andro", "angu", "anim", "ann", "anth", "anthrop", "antiq", "anx", "ap", "aper", "apex", "apt", "aqu", "aquil", "ar", "arbitr", "arbor", "arch", "archy", "ard", "ardu", "aren", "arm", "arom", "art", "arter", "articul", "asin", "asper", "aster", "asthm", "astro", "athl", "atmo", "atroc", "audi", "audit", "aug", "aur", "aur", "auster", "austr", "auxili", "av", "aval", "avar", "avi", "axi", "badin", "ball", "balm", "ban", "bank", "bar", "bard", "barr", "bas", "base", "bast", "bat", "beat", "bel", "bell", "bever", "bey", "bi", "bias", "bib", "biblio", "bili", "bio", "bird", "blanc", "blas", "blem", "bol", "bom", "bon", "bor", "bord", "bosc", "botan", "bouch", "bov", "brace", "brack", "braid", "brev", "bridg", "broch", "bry", "bu", "burl", "byss", "cad", "cadaver", "cal", "calam", "calc", "calend", "call", "calori", "camp", "can", "cand", "cant", "cap", "capr", "capt", "carchar", "card", "caric", "carn", "cas", "cast", "caten", "cathar", "cathol", "caul", "caust", "cav", "caval", "ceal", "ced", "ceed", "ceive", "cel", "celebr", "celer", "celib", "cem", "cens", "cent", "centr", "cephal", "cept", "ceram", "cerebr", "cern", "cert", "cess", "chame", "chondr", "chor", "chrom", "chron", "chrys", "cid", "cil", "cinct", "ciner", "cip", "cipit", "circ", "circle", "cis", "cist", "cit", "civ", "cla", "claim", "clair", "clam", "clandestin", "clar", "clear", "clin", "cliv", "clos", "clud", "clus", "clys", "cmul", "coct", "cogn", "col", "coll", "com", "cond", "contamin", "cop", "cord", "cori", "corn", "corp", "corpor", "corrig", "corusc", "cosm", "cost", "cours", "cracy", "cras", "crastin", "crat", "cre", "creas", "cred", "creed", "crepit", "cret", "crimin", "cris", "crit", "cruc", "crud", "crus", "crust", "crux", "crypt", "cub", "culin", "culmin", "culp", "cult", "cumb", "cumber", "cup", "cur", "curr", "curs", "curt", "cuss", "custod", "custom", "cycl", "cylind", "cyn", "dama", "de", "deb", "debil", "delect", "deleter", "delir", "demn", "demo", "dens", "dent", "derm", "dermat", "deterior", "dexter", "di", "didact", "digit", "dign", "dit", "doc", "doct", "dogm", "dole", "dom", "domin", "domit", "don", "dorm", "dors", "dot", "doub", "dox", "dra", "draw", "drom", "du", "dub", "dubi", "duc", "duct", "dur", "dyn", "dynam", "ebri", "ed", "ego", "eleg", "em", "emp", "empt", "emul", "ent", "entom", "equ", "equi", "erg", "erimper", "ero", "err", "ert", "esoter", "estim", "ethn", "etymo", "ev", "even", "exter", "extre", "fabl", "fabric", "fabul", "fac", "fact", "fader", "faith", "fam", "fan", "fascin", "fatig", "fatu", "febr", "fect", "fecund", "felic", "femin", "fend", "fens", "fer", "ferv", "fess", "fest", "fic", "fid", "fig", "fil", "fili", "fin", "firm", "fisc", "fiss", "fix", "flagell", "flagr", "flam", "flat", "flect", "flex", "flict", "flor", "flour", "flu", "fluctu", "foli", "for", "fore", "form", "fort", "found", "fract", "fratern", "fres", "frig", "friger", "front", "fruc", "fug", "fulg", "fulmin", "fum", "funct", "fund", "furc", "furt", "fus", "fusc", "gain", "galax", "gam", "gar", "garn", "garr", "gastr", "gen", "gener", "genit", "genu", "ger", "germ", "gest", "gister", "glac", "glomer", "gloss", "glot", "glut", "gnor", "gnost", "gon", "gorg", "grad", "grade", "gram", "gran", "graph", "grat", "grav", "gree", "greg", "gress", "griev", "gross", "gymn", "gyn", "gynec", "habit", "hal", "halit", "hap", "harm", "haught", "haust", "hav", "head", "hein", "helic", "helio", "hemo", "her", "hes", "hibit", "hilar", "hom", "horr", "hort", "hospit", "host", "hum", "hydro", "hydy", "hypno", "icon", "idea", "ident", "ideo", "idol", "ign", "imag", "imit", "incip", "insul", "integr", "intim", "isol", "isthm", "it", "jac", "jacul", "ject", "joc", "join", "journ", "jubil", "judg", "judic", "jug", "junct", "jur", "juris", "juven", "labor", "lacer", "lact", "langu", "lapid", "laps", "lass", "lat", "later", "laud", "lav", "lax", "lect", "leg", "legis", "lemma", "lent", "leth", "lev", "lex", "lexic", "liber", "libr", "lic", "licen", "lig", "lighten", "lign", "lim", "limin", "line", "lingu", "linqu", "lips", "liqu", "liter", "lith", "live", "loc", "locu", "loft", "log", "logu", "long", "lop", "loqu", "lubric", "luc", "lud", "lug", "lumin", "lun", "lup", "lus", "lust", "lustr", "lut", "luv", "lyr", "lyslyst", "mach", "maci", "macul", "maj", "mall", "mamm", "man", "mand", "manmain", "manner", "manu", "marin", "mark", "mascul", "mastic", "matern", "matin", "matr", "me", "meas", "mech", "med", "medit", "medl", "melan", "melior", "mell", "memor", "mend", "mendic", "mens", "ment", "mer", "merc", "merch", "merg", "mers", "meter", "metr", "migr", "milit", "min", "mini", "mir", "misc", "miser", "miso", "miss", "mit", "mnem", "mnes", "mob", "mod", "mol", "moll", "mon", "monit", "monstr", "mor", "morb", "mord", "morph", "mors", "mort", "mot", "mount", "mun", "muni", "mur", "mus", "mut", "myth", "narc", "nat", "naus", "naut", "naut", "nav", "nebul", "nec", "nect", "neg", "negat", "negr", "neur", "nex", "nigr", "nihil", "noble", "noc", "noct", "nom", "nomin", "norm", "nost", "not", "nounce", "nov", "nox", "nu", "nugator", "null", "numer", "numism", "nunci", "nupti", "nutri", "nutrit", "obed", "obes", "obit", "obliv", "obsol", "ocul", "od", "odi", "odyn", "ole", "olfact", "omin", "oner", "onym", "oper", "opl", "opt", "optim", "opto", "ora", "orat", "orbit", "ordin", "ori", "orig", "orn", "ornith", "oscul", "oss", "ostens", "ostrac", "oto", "ov", "pachy", "pact", "palp", "pan", "par", "parl", "part", "pass", "pat", "path", "patri", "ped", "pel", "pen", "pend", "pens", "per", "pet", "phan", "phem", "phen", "pher", "phob", "phobia", "phon", "phor", "phyto", "pict", "ping", "pinn", "pisc", "plac", "place", "plaint", "plais", "plant", "plas", "plat", "plaud", "ple", "pleb", "plen", "plet", "pleth", "plex", "pli", "plic", "plod", "plor", "ploy", "plum", "plumb", "ply", "pneumon", "point", "pol", "polic", "polis", "polit", "pond", "popul", "porc", "port", "posit", "post", "poster", "postul", "pot", "poten", "pound", "pragm", "prais", "preci", "prehend", "prehens", "press", "prim", "pris", "priv", "proach", "prob", "prol", "proper", "propri", "prov", "proxim", "psych", "publ", "pud", "puer", "pugn", "puls", "pulver", "pun", "punct", "pur", "purg", "push", "pusill", "put", "putr", "pyr", "quaint", "quarant", "quer", "quest", "qui", "quiet", "quir", "quis", "quit", "rab", "rad", "radi", "radic", "rage", "ram", "range", "rap", "rapt", "ras", "rat", "rav", "reg", "regn", "remn", "rend", "rept", "rest", "retic", "rever", "rhe", "rhin", "rhythm", "rid", "ris", "riv", "robor", "rod", "rog", "ros", "rot", "rud", "rug", "rupt", "rur", "rust", "sacchar", "sacr", "sag", "sal", "salu", "salv", "same", "san", "sanat", "sanguin", "sanit", "sarc", "sav", "scend", "scens", "scent", "sci", "scintill", "scrib", "script", "se", "sect", "secut", "see", "sembl", "semin", "sens", "sent", "sept", "sequ", "serr", "serv", "set", "sever", "sibil", "sid", "sider", "sight", "sign", "simil", "simul", "sinu", "sist", "soc", "sol", "solu", "solut", "solv", "som", "somn", "son", "soph", "sort", "speci", "spect", "sper", "spers", "spic", "spin", "spir", "splend", "spond", "spons", "st", "sta", "stall", "stan", "stant", "stat", "stell", "stetho", "stigm", "still", "stimul", "stin", "stinct", "sting", "stit", "stitut", "strain", "strat", "strict", "string", "struct", "succ", "sud", "sult", "sum", "summ", "sumpt", "sumptu", "sur", "surg", "tabul", "tach", "tact", "tag", "tail", "tain", "taph", "tard", "tauto", "techn", "tect", "tele", "temn", "temp", "temper", "templ", "tempor", "tempt", "ten", "tend", "tens", "tent", "tenu", "termin", "terr", "test", "text", "thea", "therm", "thesis", "thet", "tig", "tim", "tin", "ting", "tir", "toler", "tom", "torn", "torp", "torr", "tort", "touch", "tour", "tourn", "tox", "tract", "treat", "trem", "trench", "trepid", "tribut", "trit", "trop", "troph", "tru", "trud", "trus", "tum", "turb", "tuttuit", "twine", "typ", "uber", "ucor", "umbr", "und", "ununi", "up", "urb", "urinur", "usut", "vac", "vad", "vagvogr", "vailval", "vale", "van", "vapor", "vari", "vas", "veh", "veil", "velop", "venge", "vent", "venvent", "ver", "verd", "verert", "vest", "vestig", "veter", "vibr", "vict", "vid", "vid", "vig", "vil", "vinrc", "vir", "vis", "vit", "viti", "vituper", "viv", "vivia", "voc", "vok", "vol", "vol", "volt", "volunt", "volv", "vot", "voy", "vulg", "vuls", "vult", "ware", "zeal", "zoo", "zym", 'fe', 'fa', 'wa', 'we', 'ea', 'ax', 'ex', 'ev', 'av', 'ac', 'ec', 'as', 'es', 'ad', 'ed', 'ar', 'er', 'at', 'et', 'ol', 'il', 'ul', 'in', 'im', 'un', 'um', 'on', 'om', 'io', 'ui', 'ou', 'ju', 'ku', 'hu', 'bo', 'ob', 'pu']
        };
        var lefthand = /^[azwsxedcrfvtg]+$/;
        var righthand = /^[byhnujmikolp]+$/;
        var bannedlist = [/(\w)\1\1/, /([qwyuiahjkxbnm])\1/, /[aeiou]{3,}/, /[^aeiou]{3,}/, /(\w)\1(\w)\2/, /[zxvqwfy][yzxvqwf]/, /[jyg][jyg]/, /ae/];
        this.left_unit = { prefixes: [], suffixes: [], rootwords: [] };
        this.right_unit = { prefixes: [], suffixes: [], rootwords: [] };
        var _this = this;

        /* rules */
        function Rule(a, b) {
            let t = a + b;
            for (let rule of bannedlist) {
                if (rule.test(t)) return false;
            }
            return true;
        }
        function Random(list) {
            return list[Math.floor(Math.random() * list.length)];
        }
        this.Word = function (minlength = 0, hand) {
            var word = "";
            let t = "";
            let u = unit;
            if (hand == "LeftHand") {
                hand = lefthand;
                u = _this.left_unit;
            }
            else if (hand == "RightHand") {
                hand = righthand;
                u = _this.right_unit;
            }
            else {
                hand = undefined;
            }
            // prefixes
            if (u.prefixes.length > 0) {
                do t = Random(u.prefixes);
                while (!Rule(word, t));
                word += t;
            }
            // rootwords
            if (u.rootwords.length > 0) {
                do {
                    let last = "";
                    do t = Random(u.rootwords);
                    while ((!Rule(word, t)) && t != last);
                    last = t;
                    word += t;
                } while (word.length < minlength);
            }
            // suffixes
            if (u.suffixes.length > 0) {
                do t = Random(u.suffixes);
                while (!Rule(word, t));
                word += t;
            }
            return word === "" ? "✘ERROR" : word;
        };
        this.setLefthand = function (str = "azwsxedcrfvtg") {
            let s = "qazwsxedcrfvtgbyhnujmikolp";
            let t = new RegExp("[" + str + "]", 'g');
            let _lefthand = new RegExp("^[" + str + "]+$");
            let k = "";
            for (let i of s) {
                if (str.indexOf(i) < 0)
                    k += i;
            }
            let _righthand = new RegExp("^[" + k + "]+$");

            let l = 0, r = 0;
            let z = [unit.prefixes, unit.suffixes, unit.rootwords];
            for (let i = 0; i < z.length; i++) {
                if (l != i || r != i) break;
                for (let k of z[i]) {
                    if (_lefthand.test(k) && l == i) l++;
                    if (_righthand.test(k) && r == i) r++;
                }
            }
            if (l == z.length && r == z.length) {
                lefthand = _lefthand;
                righthand = _righthand;
                _this.Init();
            }
        };
        this.Init = function () {
            if (additionalWordsList) {
                for (let w of additionalWordsList) {
                    if (!unit.rootwords.includes(w)) {
                        unit.rootwords.push(w);
                    }
                }
            }
            let keys = ['prefixes', 'suffixes', 'rootwords'];
            for (let l of keys) {
                _this.left_unit[l] = [];
                for (let u of unit[l]) {
                    if (lefthand.test(u))
                        _this.left_unit[l].push(u);
                }
            }
            for (let l of keys) {
                _this.right_unit[l] = [];
                for (let u of unit[l]) {
                    if (righthand.test(u))
                        _this.right_unit[l].push(u);
                }
            }
        };
        this.Init();
    },
    Style: function () {
        var _this = this;
        var stylesheet = {
            Calm: {
                background: "#222",
                background_dark: "#171717",
                background_2dark: "#111",
                border: "#333",
                strong: "#007bff",
                text: "#777",
                text_dark: "#aaa",
                text_2dark: "#ddd",
                error: "red"
            },
            Mousse: {
                background: "rgb(240,235,215)",
                background_dark: "rgb(230,225,205)",
                background_2dark: "rgb(220,215,195)",
                border: "rgb(210,205,185)",
                strong: "#ca3000",
                text: "#868686",
                text_dark: "#565656",
                text_2dark: "#131313",
                error: "red"
            },
            Phaedra: {
                background: "#009C82",
                background_dark: "#00826D",
                background_2dark: "#006655",
                border: "#79BD8F",
                strong: "#FFFF9D",
                text: "#BEEB9F",
                text_dark: "#BEEB9F",
                text_2dark: "#FFFF9D",
                error: "#FF6138"
            },
            Vintage: {
                background: "#C77966",
                background_dark: "#965C4D",
                background_2dark: "#73463B",
                border: "#B56E5D",
                strong: "#E3CDA4",
                text: "#703030",
                text_dark: "#E3CDA4",
                text_2dark: "#F7DFB3",
                error: "red"
            },
            Tear: {
                background: "#000",
                background_dark: "#111",
                background_2dark: "#222",
                border: "#222",
                strong: "#80FA01",
                text: "#555",
                text_dark: "#75D307",
                text_2dark: "#80FA01",
                error: "white"
            },
            Midnight: {
                background: "#000",
                background_dark: "#060606",
                background_2dark: "#131313",
                border: "#000",
                strong: "#777",
                text: "#444",
                text_dark: "#555",
                text_2dark: "#777",
                error: "white"
            }
        };
        var StyleTemplate = "";
        this.stylenames = [];
        for (let name in stylesheet) this.stylenames.push(name);
        this.current = 0;
        this.getCharColors = function () {
            return stylesheet[_this.stylenames[_this.current]];
        };
        this.estyle = $('style');

        this.Apply = function () {
            let shtml = StyleTemplate;
            let style = stylesheet[_this.stylenames[_this.current]];
            shtml = shtml.replace(new RegExp('"@background_dark"', 'g'), style.background_dark);
            shtml = shtml.replace(new RegExp('"@background_2dark"', 'g'), style.background_2dark);
            shtml = shtml.replace(new RegExp('"@border"', 'g'), style.border);
            shtml = shtml.replace(new RegExp('"@strong"', 'g'), style.strong);
            shtml = shtml.replace(new RegExp('"@text_dark"', 'g'), style.text_dark);
            shtml = shtml.replace(new RegExp('"@text_2dark"', 'g'), style.text_2dark);
            shtml = shtml.replace(new RegExp('"@error"', 'g'), style.error);
            /* must be the last */
            shtml = shtml.replace(new RegExp('"@text"', 'g'), style.text);
            shtml = shtml.replace(new RegExp('"@background"', 'g'), style.background);
            _this.estyle.innerHTML = shtml;
        };

        this.Switch = function (e) {
            _this.current = _this.current + 1 === _this.stylenames.length ? 0 : _this.current + 1;
            e.innerHTML = "Theme[" + _this.stylenames[_this.current] + "]";
            _this.Apply();
        };

        function getCSS() {
            let css = $("css");
            css = css.contentDocument.documentElement.children[1].children[0].innerHTML;
            css = css.replace(new RegExp('&gt;', 'g'), ">");
            return css;
        };

        this.Init = function () {
            StyleTemplate = getCSS();
            _this.Apply();
        };
    },
    Folder: function (self, eid) {
        if (self.innerHTML == "+") {
            self.innerHTML = "-";
            $(eid).hidden = false;
        } else {
            self.innerHTML = "+";
            $(eid).hidden = true;
        }
    },
    Ranger: function (self, eid, fn) {
        $(eid).innerHTML = self.value;
        fn(self.value);
    }
};
var Prc = new TY.Prc();
var Style = new TY.Style();
window.onload = function () {
    Prc.RT_ENGLISHWORDLIST = ENGLISHWORDLIST;
    Prc.RT_ENGLISHDICTIONARY.detail = ENGLISHDICTIONARY_DETAIL;
    Prc.RT_ENGLISHDICTIONARY.brief = ENGLISHDICTIONARY_BRIEF;
    Prc.RT_PINYINLIST = PINYINLIST;
    Style.Init();
    setTimeout(() => {
        Prc.WordAssembler = new TY.WordAssembler(Prc.RT_ENGLISHWORDLIST);
        Prc.getChartColors = () => { return Style.getCharColors(); };
        Prc.Init();
        if (Prc.LoadData()) Prc.StateBoard.update();
        Prc.RefreshChart();
        Prc.setRandomTextSource();
        Prc.Pause();
    }, 1500);
};
