var e, n, t = t || function(e, n) {
    var t = {}
      , i = t.lib = {}
      , r = function() {}
      , s = i.Base = {
        extend: function(e) {
            r.prototype = this;
            var n = new r;
            return e && n.mixIn(e),
            n.hasOwnProperty("init") || (n.init = function() {
                n.$super.init.apply(this, arguments)
            }
            ),
            n.init.prototype = n,
            n.$super = this,
            n
        },
        create: function() {
            var e = this.extend();
            return e.init.apply(e, arguments),
            e
        },
        init: function() {},
        mixIn: function(e) {
            for (var n in e)
                e.hasOwnProperty(n) && (this[n] = e[n]);
            e.hasOwnProperty("toString") && (this.toString = e.toString)
        },
        clone: function() {
            return this.init.prototype.extend(this)
        }
    }
      , o = i.WordArray = s.extend({
        init: function(e, n) {
            e = this.words = e || [],
            this.sigBytes = null != n ? n : 4 * e.length
        },
        toString: function(e) {
            return (e || d).stringify(this)
        },
        concat: function(e) {
            var n = this.words
              , t = e.words
              , i = this.sigBytes;
            if (e = e.sigBytes,
            this.clamp(),
            i % 4)
                for (var r = 0; r < e; r++)
                    n[i + r >>> 2] |= (t[r >>> 2] >>> 24 - r % 4 * 8 & 255) << 24 - (i + r) % 4 * 8;
            else if (65535 < t.length)
                for (r = 0; r < e; r += 4)
                    n[i + r >>> 2] = t[r >>> 2];
            else
                n.push.apply(n, t);
            return this.sigBytes += e,
            this
        },
        clamp: function() {
            var n = this.words
              , t = this.sigBytes;
            n[t >>> 2] &= 4294967295 << 32 - t % 4 * 8,
            n.length = e.ceil(t / 4)
        },
        clone: function() {
            var e = s.clone.call(this);
            return e.words = this.words.slice(0),
            e
        },
        random: function(n) {
            for (var t = [], i = 0; i < n; i += 4)
                t.push(4294967296 * e.random() | 0);
            return new o.init(t,n)
        }
    })
      , a = t.enc = {}
      , d = a.Hex = {
        stringify: function(e) {
            var n = e.words;
            e = e.sigBytes;
            for (var t = [], i = 0; i < e; i++) {
                var r = n[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                t.push((r >>> 4).toString(16)),
                t.push((15 & r).toString(16))
            }
            return t.join("")
        },
        parse: function(e) {
            for (var n = e.length, t = [], i = 0; i < n; i += 2)
                t[i >>> 3] |= parseInt(e.substr(i, 2), 16) << 24 - i % 8 * 4;
            return new o.init(t,n / 2)
        }
    }
      , u = a.Latin1 = {
        stringify: function(e) {
            var n = e.words;
            e = e.sigBytes;
            for (var t = [], i = 0; i < e; i++)
                t.push(String.fromCharCode(n[i >>> 2] >>> 24 - i % 4 * 8 & 255));
            return t.join("")
        },
        parse: function(e) {
            for (var n = e.length, t = [], i = 0; i < n; i++)
                t[i >>> 2] |= (255 & e.charCodeAt(i)) << 24 - i % 4 * 8;
            return new o.init(t,n)
        }
    }
      , l = a.Utf8 = {
        stringify: function(e) {
            try {
                return decodeURIComponent(escape(u.stringify(e)))
            } catch (e) {
                throw Error("Malformed UTF-8 data")
            }
        },
        parse: function(e) {
            return u.parse(unescape(encodeURIComponent(e)))
        }
    }
      , c = i.BufferedBlockAlgorithm = s.extend({
        reset: function() {
            this._data = new o.init,
            this._nDataBytes = 0
        },
        _append: function(e) {
            "string" == typeof e && (e = l.parse(e)),
            this._data.concat(e),
            this._nDataBytes += e.sigBytes
        },
        _process: function(n) {
            var t = this._data
              , i = t.words
              , r = t.sigBytes
              , s = this.blockSize
              , a = r / (4 * s);
            if (n = (a = n ? e.ceil(a) : e.max((0 | a) - this._minBufferSize, 0)) * s,
            r = e.min(4 * n, r),
            n) {
                for (var d = 0; d < n; d += s)
                    this._doProcessBlock(i, d);
                d = i.splice(0, n),
                t.sigBytes -= r
            }
            return new o.init(d,r)
        },
        clone: function() {
            var e = s.clone.call(this);
            return e._data = this._data.clone(),
            e
        },
        _minBufferSize: 0
    });
    i.Hasher = c.extend({
        cfg: s.extend(),
        init: function(e) {
            this.cfg = this.cfg.extend(e),
            this.reset()
        },
        reset: function() {
            c.reset.call(this),
            this._doReset()
        },
        update: function(e) {
            return this._append(e),
            this._process(),
            this
        },
        finalize: function(e) {
            return e && this._append(e),
            this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(e) {
            return function(n, t) {
                return new e.init(t).finalize(n)
            }
        },
        _createHmacHelper: function(e) {
            return function(n, t) {
                return new v.HMAC.init(e,t).finalize(n)
            }
        }
    });
    var v = t.algo = {};
    return t
}(Math);
!function(e) {
    for (var n = t, i = (s = n.lib).WordArray, r = s.Hasher, s = n.algo, o = [], a = [], d = function(e) {
        return 4294967296 * (e - (0 | e)) | 0
    }, u = 2, l = 0; 64 > l; ) {
        var c;
        e: {
            c = u;
            for (var v = e.sqrt(c), g = 2; g <= v; g++)
                if (!(c % g)) {
                    c = !1;
                    break e
                }
            c = !0
        }
        c && (8 > l && (o[l] = d(e.pow(u, .5))),
        a[l] = d(e.pow(u, 1 / 3)),
        l++),
        u++
    }
    var f = [];
    s = s.SHA256 = r.extend({
        _doReset: function() {
            this._hash = new i.init(o.slice(0))
        },
        _doProcessBlock: function(e, n) {
            for (var t = this._hash.words, i = t[0], r = t[1], s = t[2], o = t[3], d = t[4], u = t[5], l = t[6], c = t[7], v = 0; 64 > v; v++) {
                if (16 > v)
                    f[v] = 0 | e[n + v];
                else {
                    var g = f[v - 15]
                      , m = f[v - 2];
                    f[v] = ((g << 25 | g >>> 7) ^ (g << 14 | g >>> 18) ^ g >>> 3) + f[v - 7] + ((m << 15 | m >>> 17) ^ (m << 13 | m >>> 19) ^ m >>> 10) + f[v - 16]
                }
                g = c + ((d << 26 | d >>> 6) ^ (d << 21 | d >>> 11) ^ (d << 7 | d >>> 25)) + (d & u ^ ~d & l) + a[v] + f[v],
                m = ((i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22)) + (i & r ^ i & s ^ r & s),
                c = l,
                l = u,
                u = d,
                d = o + g | 0,
                o = s,
                s = r,
                r = i,
                i = g + m | 0
            }
            t[0] = t[0] + i | 0,
            t[1] = t[1] + r | 0,
            t[2] = t[2] + s | 0,
            t[3] = t[3] + o | 0,
            t[4] = t[4] + d | 0,
            t[5] = t[5] + u | 0,
            t[6] = t[6] + l | 0,
            t[7] = t[7] + c | 0
        },
        _doFinalize: function() {
            var n = this._data
              , t = n.words
              , i = 8 * this._nDataBytes
              , r = 8 * n.sigBytes;
            return t[r >>> 5] |= 128 << 24 - r % 32,
            t[14 + (r + 64 >>> 9 << 4)] = e.floor(i / 4294967296),
            t[15 + (r + 64 >>> 9 << 4)] = i,
            n.sigBytes = 4 * t.length,
            this._process(),
            this._hash
        },
        clone: function() {
            var e = r.clone.call(this);
            return e._hash = this._hash.clone(),
            e
        }
    });
    n.SHA256 = r._createHelper(s),
    n.HmacSHA256 = r._createHmacHelper(s)
}(Math),
n = (e = t).enc.Utf8,
e.algo.HMAC = e.lib.Base.extend({
    init: function(e, t) {
        e = this._hasher = new e.init,
        "string" == typeof t && (t = n.parse(t));
        var i = e.blockSize
          , r = 4 * i;
        t.sigBytes > r && (t = e.finalize(t)),
        t.clamp();
        for (var s = this._oKey = t.clone(), o = this._iKey = t.clone(), a = s.words, d = o.words, u = 0; u < i; u++)
            a[u] ^= 1549556828,
            d[u] ^= 909522486;
        s.sigBytes = o.sigBytes = r,
        this.reset()
    },
    reset: function() {
        var e = this._hasher;
        e.reset(),
        e.update(this._iKey)
    },
    update: function(e) {
        return this._hasher.update(e),
        this
    },
    finalize: function(e) {
        var n = this._hasher;
        return e = n.finalize(e),
        n.reset(),
        n.finalize(this._oKey.clone().concat(e))
    }
}),
function() {
    var e = t
      , n = e.lib.WordArray;
    e.enc.Base64 = {
        stringify: function(e) {
            var n = e.words
              , t = e.sigBytes
              , i = this._map;
            e.clamp(),
            e = [];
            for (var r = 0; r < t; r += 3)
                for (var s = (n[r >>> 2] >>> 24 - r % 4 * 8 & 255) << 16 | (n[r + 1 >>> 2] >>> 24 - (r + 1) % 4 * 8 & 255) << 8 | n[r + 2 >>> 2] >>> 24 - (r + 2) % 4 * 8 & 255, o = 0; 4 > o && r + .75 * o < t; o++)
                    e.push(i.charAt(s >>> 6 * (3 - o) & 63));
            if (n = i.charAt(64))
                for (; e.length % 4; )
                    e.push(n);
            return e.join("")
        },
        parse: function(e) {
            var t = e.length
              , i = this._map;
            (r = i.charAt(64)) && (-1 != (r = e.indexOf(r)) && (t = r));
            for (var r = [], s = 0, o = 0; o < t; o++)
                if (o % 4) {
                    var a = i.indexOf(e.charAt(o - 1)) << o % 4 * 2
                      , d = i.indexOf(e.charAt(o)) >>> 6 - o % 4 * 2;
                    r[s >>> 2] |= (a | d) << 24 - s % 4 * 8,
                    s++
                }
            return n.create(r, s)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
}(),
function(e) {
    !function(e) {
        e[e.Undefined = 0] = "Undefined",
        e[e.Debug = 1] = "Debug",
        e[e.Info = 2] = "Info",
        e[e.Warning = 3] = "Warning",
        e[e.Error = 4] = "Error",
        e[e.Critical = 5] = "Critical"
    }(e.EGAErrorSeverity || (e.EGAErrorSeverity = {})),
    function(e) {
        e[e.Undefined = 0] = "Undefined",
        e[e.Start = 1] = "Start",
        e[e.Complete = 2] = "Complete",
        e[e.Fail = 3] = "Fail"
    }(e.EGAProgressionStatus || (e.EGAProgressionStatus = {})),
    function(e) {
        e[e.Undefined = 0] = "Undefined",
        e[e.Source = 1] = "Source",
        e[e.Sink = 2] = "Sink"
    }(e.EGAResourceFlowType || (e.EGAResourceFlowType = {})),
    function(e) {
        e[e.Undefined = 0] = "Undefined",
        e[e.Clicked = 1] = "Clicked",
        e[e.Show = 2] = "Show",
        e[e.FailedShow = 3] = "FailedShow",
        e[e.RewardReceived = 4] = "RewardReceived"
    }(e.EGAAdAction || (e.EGAAdAction = {})),
    function(e) {
        e[e.Undefined = 0] = "Undefined",
        e[e.Unknown = 1] = "Unknown",
        e[e.Offline = 2] = "Offline",
        e[e.NoFill = 3] = "NoFill",
        e[e.InternalError = 4] = "InternalError",
        e[e.InvalidRequest = 5] = "InvalidRequest",
        e[e.UnableToPrecache = 6] = "UnableToPrecache"
    }(e.EGAAdError || (e.EGAAdError = {})),
    function(e) {
        e[e.Undefined = 0] = "Undefined",
        e[e.Video = 1] = "Video",
        e[e.RewardedVideo = 2] = "RewardedVideo",
        e[e.Playable = 3] = "Playable",
        e[e.Interstitial = 4] = "Interstitial",
        e[e.OfferWall = 5] = "OfferWall",
        e[e.Banner = 6] = "Banner"
    }(e.EGAAdType || (e.EGAAdType = {})),
    function(e) {
        !function(e) {
            e[e.NoResponse = 0] = "NoResponse",
            e[e.BadResponse = 1] = "BadResponse",
            e[e.RequestTimeout = 2] = "RequestTimeout",
            e[e.JsonEncodeFailed = 3] = "JsonEncodeFailed",
            e[e.JsonDecodeFailed = 4] = "JsonDecodeFailed",
            e[e.InternalServerError = 5] = "InternalServerError",
            e[e.BadRequest = 6] = "BadRequest",
            e[e.Unauthorized = 7] = "Unauthorized",
            e[e.UnknownResponseCode = 8] = "UnknownResponseCode",
            e[e.Ok = 9] = "Ok",
            e[e.Created = 10] = "Created"
        }(e.EGAHTTPApiResponse || (e.EGAHTTPApiResponse = {}))
    }(e.http || (e.http = {})),
    function(e) {
        !function(e) {
            e[e.Undefined = 0] = "Undefined",
            e[e.EventValidation = 1] = "EventValidation",
            e[e.Database = 2] = "Database",
            e[e.Init = 3] = "Init",
            e[e.Http = 4] = "Http",
            e[e.Json = 5] = "Json"
        }(e.EGASdkErrorCategory || (e.EGASdkErrorCategory = {})),
        function(e) {
            e[e.Undefined = 0] = "Undefined",
            e[e.BusinessEvent = 1] = "BusinessEvent",
            e[e.ResourceEvent = 2] = "ResourceEvent",
            e[e.ProgressionEvent = 3] = "ProgressionEvent",
            e[e.DesignEvent = 4] = "DesignEvent",
            e[e.ErrorEvent = 5] = "ErrorEvent",
            e[e.InitHttp = 9] = "InitHttp",
            e[e.EventsHttp = 10] = "EventsHttp",
            e[e.ProcessEvents = 11] = "ProcessEvents",
            e[e.AddEventsToStore = 12] = "AddEventsToStore",
            e[e.AdEvent = 20] = "AdEvent"
        }(e.EGASdkErrorArea || (e.EGASdkErrorArea = {})),
        function(e) {
            e[e.Undefined = 0] = "Undefined",
            e[e.InvalidCurrency = 1] = "InvalidCurrency",
            e[e.InvalidShortString = 2] = "InvalidShortString",
            e[e.InvalidEventPartLength = 3] = "InvalidEventPartLength",
            e[e.InvalidEventPartCharacters = 4] = "InvalidEventPartCharacters",
            e[e.InvalidStore = 5] = "InvalidStore",
            e[e.InvalidFlowType = 6] = "InvalidFlowType",
            e[e.StringEmptyOrNull = 7] = "StringEmptyOrNull",
            e[e.NotFoundInAvailableCurrencies = 8] = "NotFoundInAvailableCurrencies",
            e[e.InvalidAmount = 9] = "InvalidAmount",
            e[e.NotFoundInAvailableItemTypes = 10] = "NotFoundInAvailableItemTypes",
            e[e.WrongProgressionOrder = 11] = "WrongProgressionOrder",
            e[e.InvalidEventIdLength = 12] = "InvalidEventIdLength",
            e[e.InvalidEventIdCharacters = 13] = "InvalidEventIdCharacters",
            e[e.InvalidProgressionStatus = 15] = "InvalidProgressionStatus",
            e[e.InvalidSeverity = 16] = "InvalidSeverity",
            e[e.InvalidLongString = 17] = "InvalidLongString",
            e[e.DatabaseTooLarge = 18] = "DatabaseTooLarge",
            e[e.DatabaseOpenOrCreate = 19] = "DatabaseOpenOrCreate",
            e[e.JsonError = 25] = "JsonError",
            e[e.FailHttpJsonDecode = 29] = "FailHttpJsonDecode",
            e[e.FailHttpJsonEncode = 30] = "FailHttpJsonEncode",
            e[e.InvalidAdAction = 31] = "InvalidAdAction",
            e[e.InvalidAdType = 32] = "InvalidAdType",
            e[e.InvalidString = 33] = "InvalidString"
        }(e.EGASdkErrorAction || (e.EGASdkErrorAction = {})),
        function(e) {
            e[e.Undefined = 0] = "Undefined",
            e[e.Currency = 1] = "Currency",
            e[e.CartType = 2] = "CartType",
            e[e.ItemType = 3] = "ItemType",
            e[e.ItemId = 4] = "ItemId",
            e[e.Store = 5] = "Store",
            e[e.FlowType = 6] = "FlowType",
            e[e.Amount = 7] = "Amount",
            e[e.Progression01 = 8] = "Progression01",
            e[e.Progression02 = 9] = "Progression02",
            e[e.Progression03 = 10] = "Progression03",
            e[e.EventId = 11] = "EventId",
            e[e.ProgressionStatus = 12] = "ProgressionStatus",
            e[e.Severity = 13] = "Severity",
            e[e.Message = 14] = "Message",
            e[e.AdAction = 15] = "AdAction",
            e[e.AdType = 16] = "AdType",
            e[e.AdSdkName = 17] = "AdSdkName",
            e[e.AdPlacement = 18] = "AdPlacement"
        }(e.EGASdkErrorParameter || (e.EGASdkErrorParameter = {}))
    }(e.events || (e.events = {}))
}(i || (i = {}));
var i;
i.EGAErrorSeverity,
i.EGAProgressionStatus,
i.EGAResourceFlowType;
!function(e) {
    !function(e) {
        var n;
        !function(e) {
            e[e.Error = 0] = "Error",
            e[e.Warning = 1] = "Warning",
            e[e.Info = 2] = "Info",
            e[e.Debug = 3] = "Debug"
        }(n || (n = {}));
        var t = function() {
            function e() {
                e.debugEnabled = !1
            }
            return e.setInfoLog = function(n) {
                e.instance.infoLogEnabled = n
            }
            ,
            e.setVerboseLog = function(n) {
                e.instance.infoLogVerboseEnabled = n
            }
            ,
            e.i = function(t) {
                if (e.instance.infoLogEnabled) {
                    var i = "Info/" + e.Tag + ": " + t;
                    e.instance.sendNotificationMessage(i, n.Info)
                }
            }
            ,
            e.w = function(t) {
                var i = "Warning/" + e.Tag + ": " + t;
                e.instance.sendNotificationMessage(i, n.Warning)
            }
            ,
            e.e = function(t) {
                var i = "Error/" + e.Tag + ": " + t;
                e.instance.sendNotificationMessage(i, n.Error)
            }
            ,
            e.ii = function(t) {
                if (e.instance.infoLogVerboseEnabled) {
                    var i = "Verbose/" + e.Tag + ": " + t;
                    e.instance.sendNotificationMessage(i, n.Info)
                }
            }
            ,
            e.d = function(t) {
                if (e.debugEnabled) {
                    var i = "Debug/" + e.Tag + ": " + t;
                    e.instance.sendNotificationMessage(i, n.Debug)
                }
            }
            ,
            e.prototype.sendNotificationMessage = function(e, t) {
                switch (t) {
                case n.Error:
                    console.error(e);
                    break;
                case n.Warning:
                    console.warn(e);
                    break;
                case n.Debug:
                    "function" == typeof console.debug ? console.debug(e) : console.log(e);
                    break;
                case n.Info:
                    console.log(e)
                }
            }
            ,
            e.instance = new e,
            e.Tag = "GameAnalytics",
            e
        }();
        e.GALogger = t
    }(e.logging || (e.logging = {}))
}(i || (i = {})),
function(e) {
    !function(n) {
        var i = e.logging.GALogger
          , r = function() {
            function e() {}
            return e.getHmac = function(e, n) {
                var i = t.HmacSHA256(n, e);
                return t.enc.Base64.stringify(i)
            }
            ,
            e.stringMatch = function(e, n) {
                return !(!e || !n) && n.test(e)
            }
            ,
            e.joinStringArray = function(e, n) {
                for (var t = "", i = 0, r = e.length; i < r; i++)
                    i > 0 && (t += n),
                    t += e[i];
                return t
            }
            ,
            e.stringArrayContainsString = function(e, n) {
                if (0 === e.length)
                    return !1;
                for (var t in e)
                    if (e[t] === n)
                        return !0;
                return !1
            }
            ,
            e.encode64 = function(n) {
                n = encodeURI(n);
                var t, i, r, s, o, a = "", d = 0, u = 0, l = 0;
                do {
                    r = (t = n.charCodeAt(l++)) >> 2,
                    s = (3 & t) << 4 | (i = n.charCodeAt(l++)) >> 4,
                    o = (15 & i) << 2 | (d = n.charCodeAt(l++)) >> 6,
                    u = 63 & d,
                    isNaN(i) ? o = u = 64 : isNaN(d) && (u = 64),
                    a = a + e.keyStr.charAt(r) + e.keyStr.charAt(s) + e.keyStr.charAt(o) + e.keyStr.charAt(u),
                    t = i = d = 0,
                    r = s = o = u = 0
                } while (l < n.length);
                return a
            }
            ,
            e.decode64 = function(n) {
                var t, r, s, o, a = "", d = 0, u = 0, l = 0;
                /[^A-Za-z0-9\+\/\=]/g.exec(n) && i.w("There were invalid base64 characters in the input text. Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='. Expect errors in decoding."),
                n = n.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                do {
                    t = e.keyStr.indexOf(n.charAt(l++)) << 2 | (s = e.keyStr.indexOf(n.charAt(l++))) >> 4,
                    r = (15 & s) << 4 | (o = e.keyStr.indexOf(n.charAt(l++))) >> 2,
                    d = (3 & o) << 6 | (u = e.keyStr.indexOf(n.charAt(l++))),
                    a += String.fromCharCode(t),
                    64 != o && (a += String.fromCharCode(r)),
                    64 != u && (a += String.fromCharCode(d)),
                    t = r = d = 0,
                    s = o = u = 0
                } while (l < n.length);
                return decodeURI(a)
            }
            ,
            e.timeIntervalSince1970 = function() {
                var e = new Date;
                return Math.round(e.getTime() / 1e3)
            }
            ,
            e.createGuid = function() {
                return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (function(e) {
                    return (+e ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +e / 4).toString(16)
                }
                ))
            }
            ,
            e.keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            e
        }();
        n.GAUtilities = r
    }(e.utilities || (e.utilities = {}))
}(i || (i = {})),
function(e) {
    !function(n) {
        var t = e.logging.GALogger
          , i = e.utilities.GAUtilities
          , r = e.events.EGASdkErrorCategory
          , s = e.events.EGASdkErrorArea
          , o = e.events.EGASdkErrorAction
          , a = e.events.EGASdkErrorParameter
          , d = function(e, n, t, i, r) {
            this.category = e,
            this.area = n,
            this.action = t,
            this.parameter = i,
            this.reason = r
        };
        n.ValidationResult = d;
        var u = function() {
            function n() {}
            return n.validateBusinessEvent = function(e, i, u, l, c) {
                return n.validateCurrency(e) ? i < 0 ? (t.w("Validation fail - business event - amount. Cannot be less than 0. Failed amount: " + i),
                new d(r.EventValidation,s.BusinessEvent,o.InvalidAmount,a.Amount,i + "")) : n.validateShortString(u, !0) ? n.validateEventPartLength(l, !1) ? n.validateEventPartCharacters(l) ? n.validateEventPartLength(c, !1) ? n.validateEventPartCharacters(c) ? null : (t.w("Validation fail - business event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + c),
                new d(r.EventValidation,s.BusinessEvent,o.InvalidEventPartCharacters,a.ItemId,c)) : (t.w("Validation fail - business event - itemId. Cannot be (null), empty or above 64 characters. String: " + c),
                new d(r.EventValidation,s.BusinessEvent,o.InvalidEventPartLength,a.ItemId,c)) : (t.w("Validation fail - business event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + l),
                new d(r.EventValidation,s.BusinessEvent,o.InvalidEventPartCharacters,a.ItemType,l)) : (t.w("Validation fail - business event - itemType: Cannot be (null), empty or above 64 characters. String: " + l),
                new d(r.EventValidation,s.BusinessEvent,o.InvalidEventPartLength,a.ItemType,l)) : (t.w("Validation fail - business event - cartType. Cannot be above 32 length. String: " + u),
                new d(r.EventValidation,s.BusinessEvent,o.InvalidShortString,a.CartType,u)) : (t.w("Validation fail - business event - currency: Cannot be (null) and need to be A-Z, 3 characters and in the standard at openexchangerates.org. Failed currency: " + e),
                new d(r.EventValidation,s.BusinessEvent,o.InvalidCurrency,a.Currency,e))
            }
            ,
            n.validateResourceEvent = function(u, l, c, v, g, f, m) {
                return u == e.EGAResourceFlowType.Undefined ? (t.w("Validation fail - resource event - flowType: Invalid flow type."),
                new d(r.EventValidation,s.ResourceEvent,o.InvalidFlowType,a.FlowType,"")) : l ? i.stringArrayContainsString(f, l) ? c > 0 ? v ? n.validateEventPartLength(v, !1) ? n.validateEventPartCharacters(v) ? i.stringArrayContainsString(m, v) ? n.validateEventPartLength(g, !1) ? n.validateEventPartCharacters(g) ? null : (t.w("Validation fail - resource event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + g),
                new d(r.EventValidation,s.ResourceEvent,o.InvalidEventPartCharacters,a.ItemId,g)) : (t.w("Validation fail - resource event - itemId: Cannot be (null), empty or above 64 characters. String: " + g),
                new d(r.EventValidation,s.ResourceEvent,o.InvalidEventPartLength,a.ItemId,g)) : (t.w("Validation fail - resource event - itemType: Not found in list of pre-defined available resource itemTypes. String: " + v),
                new d(r.EventValidation,s.ResourceEvent,o.NotFoundInAvailableItemTypes,a.ItemType,v)) : (t.w("Validation fail - resource event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + v),
                new d(r.EventValidation,s.ResourceEvent,o.InvalidEventPartCharacters,a.ItemType,v)) : (t.w("Validation fail - resource event - itemType: Cannot be (null), empty or above 64 characters. String: " + v),
                new d(r.EventValidation,s.ResourceEvent,o.InvalidEventPartLength,a.ItemType,v)) : (t.w("Validation fail - resource event - itemType: Cannot be (null)"),
                new d(r.EventValidation,s.ResourceEvent,o.StringEmptyOrNull,a.ItemType,"")) : (t.w("Validation fail - resource event - amount: Float amount cannot be 0 or negative. Value: " + c),
                new d(r.EventValidation,s.ResourceEvent,o.InvalidAmount,a.Amount,c + "")) : (t.w("Validation fail - resource event - currency: Not found in list of pre-defined available resource currencies. String: " + l),
                new d(r.EventValidation,s.ResourceEvent,o.NotFoundInAvailableCurrencies,a.Currency,l)) : (t.w("Validation fail - resource event - currency: Cannot be (null)"),
                new d(r.EventValidation,s.ResourceEvent,o.StringEmptyOrNull,a.Currency,""))
            }
            ,
            n.validateProgressionEvent = function(i, u, l, c) {
                if (i == e.EGAProgressionStatus.Undefined)
                    return t.w("Validation fail - progression event: Invalid progression status."),
                    new d(r.EventValidation,s.ProgressionEvent,o.InvalidProgressionStatus,a.ProgressionStatus,"");
                if (c && !l && u)
                    return t.w("Validation fail - progression event: 03 found but 01+02 are invalid. Progression must be set as either 01, 01+02 or 01+02+03."),
                    new d(r.EventValidation,s.ProgressionEvent,o.WrongProgressionOrder,a.Undefined,u + ":" + l + ":" + c);
                if (l && !u)
                    return t.w("Validation fail - progression event: 02 found but not 01. Progression must be set as either 01, 01+02 or 01+02+03"),
                    new d(r.EventValidation,s.ProgressionEvent,o.WrongProgressionOrder,a.Undefined,u + ":" + l + ":" + c);
                if (!u)
                    return t.w("Validation fail - progression event: progression01 not valid. Progressions must be set as either 01, 01+02 or 01+02+03"),
                    new d(r.EventValidation,s.ProgressionEvent,o.WrongProgressionOrder,a.Undefined,(u || "") + ":" + (l || "") + ":" + (c || ""));
                if (!n.validateEventPartLength(u, !1))
                    return t.w("Validation fail - progression event - progression01: Cannot be (null), empty or above 64 characters. String: " + u),
                    new d(r.EventValidation,s.ProgressionEvent,o.InvalidEventPartLength,a.Progression01,u);
                if (!n.validateEventPartCharacters(u))
                    return t.w("Validation fail - progression event - progression01: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + u),
                    new d(r.EventValidation,s.ProgressionEvent,o.InvalidEventPartCharacters,a.Progression01,u);
                if (l) {
                    if (!n.validateEventPartLength(l, !0))
                        return t.w("Validation fail - progression event - progression02: Cannot be empty or above 64 characters. String: " + l),
                        new d(r.EventValidation,s.ProgressionEvent,o.InvalidEventPartLength,a.Progression02,l);
                    if (!n.validateEventPartCharacters(l))
                        return t.w("Validation fail - progression event - progression02: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + l),
                        new d(r.EventValidation,s.ProgressionEvent,o.InvalidEventPartCharacters,a.Progression02,l)
                }
                if (c) {
                    if (!n.validateEventPartLength(c, !0))
                        return t.w("Validation fail - progression event - progression03: Cannot be empty or above 64 characters. String: " + c),
                        new d(r.EventValidation,s.ProgressionEvent,o.InvalidEventPartLength,a.Progression03,c);
                    if (!n.validateEventPartCharacters(c))
                        return t.w("Validation fail - progression event - progression03: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + c),
                        new d(r.EventValidation,s.ProgressionEvent,o.InvalidEventPartCharacters,a.Progression03,c)
                }
                return null
            }
            ,
            n.validateDesignEvent = function(e) {
                return n.validateEventIdLength(e) ? n.validateEventIdCharacters(e) ? null : (t.w("Validation fail - design event - eventId: Non valid characters. Only allowed A-z, 0-9, -_., ()!?. String: " + e),
                new d(r.EventValidation,s.DesignEvent,o.InvalidEventIdCharacters,a.EventId,e)) : (t.w("Validation fail - design event - eventId: Cannot be (null) or empty. Only 5 event parts allowed seperated by :. Each part need to be 64 characters or less. String: " + e),
                new d(r.EventValidation,s.DesignEvent,o.InvalidEventIdLength,a.EventId,e))
            }
            ,
            n.validateErrorEvent = function(i, u) {
                return i == e.EGAErrorSeverity.Undefined ? (t.w("Validation fail - error event - severity: Severity was unsupported value."),
                new d(r.EventValidation,s.ErrorEvent,o.InvalidSeverity,a.Severity,"")) : n.validateLongString(u, !0) ? null : (t.w("Validation fail - error event - message: Message cannot be above 8192 characters."),
                new d(r.EventValidation,s.ErrorEvent,o.InvalidLongString,a.Message,u))
            }
            ,
            n.validateAdEvent = function(i, u, l, c) {
                return i == e.EGAAdAction.Undefined ? (t.w("Validation fail - error event - severity: Severity was unsupported value."),
                new d(r.EventValidation,s.AdEvent,o.InvalidAdAction,a.AdAction,"")) : u == e.EGAAdType.Undefined ? (t.w("Validation fail - ad event - adType: Ad type was unsupported value."),
                new d(r.EventValidation,s.AdEvent,o.InvalidAdType,a.AdType,"")) : n.validateShortString(l, !1) ? n.validateString(c, !1) ? null : (t.w("Validation fail - ad event - message: Ad placement cannot be above 64 characters."),
                new d(r.EventValidation,s.AdEvent,o.InvalidString,a.AdPlacement,c)) : (t.w("Validation fail - ad event - message: Ad SDK name cannot be above 32 characters."),
                new d(r.EventValidation,s.AdEvent,o.InvalidShortString,a.AdSdkName,l))
            }
            ,
            n.validateSdkErrorEvent = function(e, i, a, d, u) {
                return !!n.validateKeys(e, i) && (a === r.Undefined ? (t.w("Validation fail - sdk error event - type: Category was unsupported value."),
                !1) : d === s.Undefined ? (t.w("Validation fail - sdk error event - type: Area was unsupported value."),
                !1) : u !== o.Undefined || (t.w("Validation fail - sdk error event - type: Action was unsupported value."),
                !1))
            }
            ,
            n.validateKeys = function(e, n) {
                return !(!i.stringMatch(e, /^[A-z0-9]{32}$/) || !i.stringMatch(n, /^[A-z0-9]{40}$/))
            }
            ,
            n.validateCurrency = function(e) {
                return !!e && !!i.stringMatch(e, /^[A-Z]{3}$/)
            }
            ,
            n.validateEventPartLength = function(e, n) {
                return !(!n || e) || !!e && !(e.length > 64)
            }
            ,
            n.validateEventPartCharacters = function(e) {
                return !!i.stringMatch(e, /^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}$/)
            }
            ,
            n.validateEventIdLength = function(e) {
                return !!e && !!i.stringMatch(e, /^[^:]{1,64}(?::[^:]{1,64}){0,4}$/)
            }
            ,
            n.validateEventIdCharacters = function(e) {
                return !!e && !!i.stringMatch(e, /^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}(:[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}){0,4}$/)
            }
            ,
            n.validateAndCleanInitRequestResponse = function(e, n) {
                if (null == e)
                    return t.w("validateInitRequestResponse failed - no response dictionary."),
                    null;
                var i = {};
                try {
                    var r = e.server_ts;
                    if (!(r > 0))
                        return t.w("validateInitRequestResponse failed - invalid value in 'server_ts' field."),
                        null;
                    i.server_ts = r
                } catch (n) {
                    return t.w("validateInitRequestResponse failed - invalid type in 'server_ts' field. type=" + typeof e.server_ts + ", value=" + e.server_ts + ", " + n),
                    null
                }
                if (n) {
                    try {
                        var s = e.configs;
                        i.configs = s
                    } catch (n) {
                        return t.w("validateInitRequestResponse failed - invalid type in 'configs' field. type=" + typeof e.configs + ", value=" + e.configs + ", " + n),
                        null
                    }
                    try {
                        var o = e.configs_hash;
                        i.configs_hash = o
                    } catch (n) {
                        return t.w("validateInitRequestResponse failed - invalid type in 'configs_hash' field. type=" + typeof e.configs_hash + ", value=" + e.configs_hash + ", " + n),
                        null
                    }
                    try {
                        var a = e.ab_id;
                        i.ab_id = a
                    } catch (n) {
                        return t.w("validateInitRequestResponse failed - invalid type in 'ab_id' field. type=" + typeof e.ab_id + ", value=" + e.ab_id + ", " + n),
                        null
                    }
                    try {
                        var d = e.ab_variant_id;
                        i.ab_variant_id = d
                    } catch (n) {
                        return t.w("validateInitRequestResponse failed - invalid type in 'ab_variant_id' field. type=" + typeof e.ab_variant_id + ", value=" + e.ab_variant_id + ", " + n),
                        null
                    }
                }
                return i
            }
            ,
            n.validateBuild = function(e) {
                return !!n.validateShortString(e, !1)
            }
            ,
            n.validateSdkWrapperVersion = function(e) {
                return !!i.stringMatch(e, /^(unity|unreal|gamemaker|cocos2d|construct|defold|godot|flutter) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/)
            }
            ,
            n.validateEngineVersion = function(e) {
                return !(!e || !i.stringMatch(e, /^(unity|unreal|gamemaker|cocos2d|construct|defold|godot) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/))
            }
            ,
            n.validateUserId = function(e) {
                return !!n.validateString(e, !1) || (t.w("Validation fail - user id: id cannot be (null), empty or above 64 characters."),
                !1)
            }
            ,
            n.validateShortString = function(e, n) {
                return !(!n || e) || !(!e || e.length > 32)
            }
            ,
            n.validateString = function(e, n) {
                return !(!n || e) || !(!e || e.length > 64)
            }
            ,
            n.validateLongString = function(e, n) {
                return !(!n || e) || !(!e || e.length > 8192)
            }
            ,
            n.validateConnectionType = function(e) {
                return i.stringMatch(e, /^(wwan|wifi|lan|offline)$/)
            }
            ,
            n.validateCustomDimensions = function(e) {
                return n.validateArrayOfStrings(20, 32, !1, "custom dimensions", e)
            }
            ,
            n.validateResourceCurrencies = function(e) {
                if (!n.validateArrayOfStrings(20, 64, !1, "resource currencies", e))
                    return !1;
                for (var r = 0; r < e.length; ++r)
                    if (!i.stringMatch(e[r], /^[A-Za-z]+$/))
                        return t.w("resource currencies validation failed: a resource currency can only be A-Z, a-z. String was: " + e[r]),
                        !1;
                return !0
            }
            ,
            n.validateResourceItemTypes = function(e) {
                if (!n.validateArrayOfStrings(20, 32, !1, "resource item types", e))
                    return !1;
                for (var i = 0; i < e.length; ++i)
                    if (!n.validateEventPartCharacters(e[i]))
                        return t.w("resource item types validation failed: a resource item type cannot contain other characters than A-z, 0-9, -_., ()!?. String was: " + e[i]),
                        !1;
                return !0
            }
            ,
            n.validateDimension01 = function(e, n) {
                return !e || !!i.stringArrayContainsString(n, e)
            }
            ,
            n.validateDimension02 = function(e, n) {
                return !e || !!i.stringArrayContainsString(n, e)
            }
            ,
            n.validateDimension03 = function(e, n) {
                return !e || !!i.stringArrayContainsString(n, e)
            }
            ,
            n.validateArrayOfStrings = function(e, n, i, r, s) {
                var o = r;
                if (o || (o = "Array"),
                !s)
                    return t.w(o + " validation failed: array cannot be null. "),
                    !1;
                if (0 == i && 0 == s.length)
                    return t.w(o + " validation failed: array cannot be empty. "),
                    !1;
                if (e > 0 && s.length > e)
                    return t.w(o + " validation failed: array cannot exceed " + e + " values. It has " + s.length + " values."),
                    !1;
                for (var a = 0; a < s.length; ++a) {
                    var d = s[a] ? s[a].length : 0;
                    if (0 === d)
                        return t.w(o + " validation failed: contained an empty string. Array=" + JSON.stringify(s)),
                        !1;
                    if (n > 0 && d > n)
                        return t.w(o + " validation failed: a string exceeded max allowed length (which is: " + n + "). String was: " + s[a]),
                        !1
                }
                return !0
            }
            ,
            n.validateClientTs = function(e) {
                return !(e < 0 || e > 99999999999)
            }
            ,
            n
        }();
        n.GAValidator = u
    }(e.validators || (e.validators = {}))
}(i || (i = {})),
function(e) {
    !function(e) {
        var n = function(e, n, t) {
            this.name = e,
            this.value = n,
            this.version = t
        };
        e.NameValueVersion = n;
        var t = function(e, n) {
            this.name = e,
            this.version = n
        };
        e.NameVersion = t;
        var i = function() {
            function e() {}
            return e.touch = function() {}
            ,
            e.getRelevantSdkVersion = function() {
                return e.sdkGameEngineVersion ? e.sdkGameEngineVersion : e.sdkWrapperVersion
            }
            ,
            e.getConnectionType = function() {
                return e.connectionType
            }
            ,
            e.updateConnectionType = function() {
                navigator.onLine ? "ios" === e.buildPlatform || "android" === e.buildPlatform ? e.connectionType = "wwan" : e.connectionType = "lan" : e.connectionType = "offline"
            }
            ,
            e.getOSVersionString = function() {
                return e.buildPlatform + " " + e.osVersionPair.version
            }
            ,
            e.runtimePlatformToString = function() {
                return e.osVersionPair.name
            }
            ,
            e.getBrowserVersionString = function() {
                var n, t = navigator.userAgent, i = t.match(/(opera|chrome|safari|firefox|ubrowser|msie|trident|fbav(?=\/))\/?\s*(\d+)/i) || [];
                if (0 == i.length && "ios" === e.buildPlatform)
                    return "webkit_" + e.osVersion;
                if (/trident/i.test(i[1]))
                    return "IE " + ((n = /\brv[ :]+(\d+)/g.exec(t) || [])[1] || "");
                if ("Chrome" === i[1] && null != (n = t.match(/\b(OPR|Edge|UBrowser)\/(\d+)/)))
                    return n.slice(1).join(" ").replace("OPR", "Opera").replace("UBrowser", "UC").toLowerCase();
                if (i[1] && "fbav" === i[1].toLowerCase() && (i[1] = "facebook",
                i[2]))
                    return "facebook " + i[2];
                var r = i[2] ? [i[1], i[2]] : [navigator.appName, navigator.appVersion, "-?"];
                return null != (n = t.match(/version\/(\d+)/i)) && r.splice(1, 1, n[1]),
                r.join(" ").toLowerCase()
            }
            ,
            e.getDeviceModel = function() {
                return "unknown"
            }
            ,
            e.getDeviceManufacturer = function() {
                return "unknown"
            }
            ,
            e.matchItem = function(e, n) {
                var i, r, s, o, a = new t("unknown","0.0.0"), d = 0, u = 0;
                for (d = 0; d < n.length; d += 1)
                    if (new RegExp(n[d].value,"i").test(e)) {
                        if (i = new RegExp(n[d].version + "[- /:;]([\\d._]+)","i"),
                        o = "",
                        (r = e.match(i)) && r[1] && (s = r[1]),
                        s) {
                            var l = s.split(/[._]+/);
                            for (u = 0; u < Math.min(l.length, 3); u += 1)
                                o += l[u] + (u < Math.min(l.length, 3) - 1 ? "." : "")
                        } else
                            o = "0.0.0";
                        return a.name = n[d].name,
                        a.version = o,
                        a
                    }
                return a
            }
            ,
            e.sdkWrapperVersion = "javascript 4.4.4",
            e.osVersionPair = e.matchItem([navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor].join(" "), [new n("windows_phone","Windows Phone","OS"), new n("windows","Win","NT"), new n("ios","iPhone","OS"), new n("ios","iPad","OS"), new n("ios","iPod","OS"), new n("android","Android","Android"), new n("blackBerry","BlackBerry","/"), new n("mac_osx","Mac","OS X"), new n("tizen","Tizen","Tizen"), new n("linux","Linux","rv"), new n("kai_os","KAIOS","KAIOS")]),
            e.buildPlatform = e.runtimePlatformToString(),
            e.deviceModel = e.getDeviceModel(),
            e.deviceManufacturer = e.getDeviceManufacturer(),
            e.osVersion = e.getOSVersionString(),
            e.browserVersion = e.getBrowserVersionString(),
            e
        }();
        e.GADevice = i
    }(e.device || (e.device = {}))
}(i || (i = {})),
function(e) {
    !function(e) {
        var n = function() {
            function e(n) {
                this.deadline = n,
                this.ignore = !1,
                this.async = !1,
                this.running = !1,
                this.id = ++e.idCounter
            }
            return e.idCounter = 0,
            e
        }();
        e.TimedBlock = n
    }(e.threading || (e.threading = {}))
}(i || (i = {})),
function(e) {
    !function(e) {
        var n = function() {
            function e(e) {
                this.comparer = e,
                this._subQueues = {},
                this._sortedKeys = []
            }
            return e.prototype.enqueue = function(e, n) {
                -1 === this._sortedKeys.indexOf(e) && this.addQueueOfPriority(e),
                this._subQueues[e].push(n)
            }
            ,
            e.prototype.addQueueOfPriority = function(e) {
                var n = this;
                this._sortedKeys.push(e),
                this._sortedKeys.sort((function(e, t) {
                    return n.comparer.compare(e, t)
                }
                )),
                this._subQueues[e] = []
            }
            ,
            e.prototype.peek = function() {
                if (this.hasItems())
                    return this._subQueues[this._sortedKeys[0]][0];
                throw new Error("The queue is empty")
            }
            ,
            e.prototype.hasItems = function() {
                return this._sortedKeys.length > 0
            }
            ,
            e.prototype.dequeue = function() {
                if (this.hasItems())
                    return this.dequeueFromHighPriorityQueue();
                throw new Error("The queue is empty")
            }
            ,
            e.prototype.dequeueFromHighPriorityQueue = function() {
                var e = this._sortedKeys[0]
                  , n = this._subQueues[e].shift();
                return 0 === this._subQueues[e].length && (this._sortedKeys.shift(),
                delete this._subQueues[e]),
                n
            }
            ,
            e
        }();
        e.PriorityQueue = n
    }(e.threading || (e.threading = {}))
}(i || (i = {})),
function(e) {
    !function(n) {
        var t, i, r = e.logging.GALogger;
        !function(e) {
            e[e.Equal = 0] = "Equal",
            e[e.LessOrEqual = 1] = "LessOrEqual",
            e[e.NotEqual = 2] = "NotEqual"
        }(t = n.EGAStoreArgsOperator || (n.EGAStoreArgsOperator = {})),
        function(e) {
            e[e.Events = 0] = "Events",
            e[e.Sessions = 1] = "Sessions",
            e[e.Progression = 2] = "Progression"
        }(i = n.EGAStore || (n.EGAStore = {}));
        var s = function() {
            function e() {
                this.eventsStore = [],
                this.sessionsStore = [],
                this.progressionStore = [],
                this.storeItems = {};
                try {
                    "object" == typeof localStorage ? (localStorage.setItem("testingLocalStorage", "yes"),
                    localStorage.removeItem("testingLocalStorage"),
                    e.storageAvailable = !0) : e.storageAvailable = !1
                } catch (e) {}
            }
            return e.isStorageAvailable = function() {
                return e.storageAvailable
            }
            ,
            e.isStoreTooLargeForEvents = function() {
                return e.instance.eventsStore.length + e.instance.sessionsStore.length > e.MaxNumberOfEntries
            }
            ,
            e.select = function(n, i, r, s) {
                void 0 === i && (i = []),
                void 0 === r && (r = !1),
                void 0 === s && (s = 0);
                var o = e.getStore(n);
                if (!o)
                    return null;
                for (var a = [], d = 0; d < o.length; ++d) {
                    for (var u = o[d], l = !0, c = 0; c < i.length; ++c) {
                        var v = i[c];
                        if (u[v[0]])
                            switch (v[1]) {
                            case t.Equal:
                                l = u[v[0]] == v[2];
                                break;
                            case t.LessOrEqual:
                                l = u[v[0]] <= v[2];
                                break;
                            case t.NotEqual:
                                l = u[v[0]] != v[2];
                                break;
                            default:
                                l = !1
                            }
                        else
                            l = !1;
                        if (!l)
                            break
                    }
                    l && a.push(u)
                }
                return r && a.sort((function(e, n) {
                    return e.client_ts - n.client_ts
                }
                )),
                s > 0 && a.length > s && (a = a.slice(0, s + 1)),
                a
            }
            ,
            e.update = function(n, i, r) {
                void 0 === r && (r = []);
                var s = e.getStore(n);
                if (!s)
                    return !1;
                for (var o = 0; o < s.length; ++o) {
                    for (var a = s[o], d = !0, u = 0; u < r.length; ++u) {
                        var l = r[u];
                        if (a[l[0]])
                            switch (l[1]) {
                            case t.Equal:
                                d = a[l[0]] == l[2];
                                break;
                            case t.LessOrEqual:
                                d = a[l[0]] <= l[2];
                                break;
                            case t.NotEqual:
                                d = a[l[0]] != l[2];
                                break;
                            default:
                                d = !1
                            }
                        else
                            d = !1;
                        if (!d)
                            break
                    }
                    if (d)
                        for (u = 0; u < i.length; ++u) {
                            var c = i[u];
                            a[c[0]] = c[1]
                        }
                }
                return !0
            }
            ,
            e.delete = function(n, i) {
                var r = e.getStore(n);
                if (r)
                    for (var s = 0; s < r.length; ++s) {
                        for (var o = r[s], a = !0, d = 0; d < i.length; ++d) {
                            var u = i[d];
                            if (o[u[0]])
                                switch (u[1]) {
                                case t.Equal:
                                    a = o[u[0]] == u[2];
                                    break;
                                case t.LessOrEqual:
                                    a = o[u[0]] <= u[2];
                                    break;
                                case t.NotEqual:
                                    a = o[u[0]] != u[2];
                                    break;
                                default:
                                    a = !1
                                }
                            else
                                a = !1;
                            if (!a)
                                break
                        }
                        a && (r.splice(s, 1),
                        --s)
                    }
            }
            ,
            e.insert = function(n, t, i, r) {
                void 0 === i && (i = !1),
                void 0 === r && (r = null);
                var s = e.getStore(n);
                if (s)
                    if (i) {
                        if (!r)
                            return;
                        for (var o = !1, a = 0; a < s.length; ++a) {
                            var d = s[a];
                            if (d[r] == t[r]) {
                                for (var u in t)
                                    d[u] = t[u];
                                o = !0;
                                break
                            }
                        }
                        o || s.push(t)
                    } else
                        s.push(t)
            }
            ,
            e.save = function(n) {
                e.isStorageAvailable() ? (localStorage.setItem(e.StringFormat(e.KeyFormat, n, e.EventsStoreKey), JSON.stringify(e.instance.eventsStore)),
                localStorage.setItem(e.StringFormat(e.KeyFormat, n, e.SessionsStoreKey), JSON.stringify(e.instance.sessionsStore)),
                localStorage.setItem(e.StringFormat(e.KeyFormat, n, e.ProgressionStoreKey), JSON.stringify(e.instance.progressionStore)),
                localStorage.setItem(e.StringFormat(e.KeyFormat, n, e.ItemsStoreKey), JSON.stringify(e.instance.storeItems))) : r.w("Storage is not available, cannot save.")
            }
            ,
            e.load = function(n) {
                if (e.isStorageAvailable()) {
                    try {
                        e.instance.eventsStore = JSON.parse(localStorage.getItem(e.StringFormat(e.KeyFormat, n, e.EventsStoreKey))),
                        e.instance.eventsStore || (e.instance.eventsStore = [])
                    } catch (n) {
                        r.w("Load failed for 'events' store. Using empty store."),
                        e.instance.eventsStore = []
                    }
                    try {
                        e.instance.sessionsStore = JSON.parse(localStorage.getItem(e.StringFormat(e.KeyFormat, n, e.SessionsStoreKey))),
                        e.instance.sessionsStore || (e.instance.sessionsStore = [])
                    } catch (n) {
                        r.w("Load failed for 'sessions' store. Using empty store."),
                        e.instance.sessionsStore = []
                    }
                    try {
                        e.instance.progressionStore = JSON.parse(localStorage.getItem(e.StringFormat(e.KeyFormat, n, e.ProgressionStoreKey))),
                        e.instance.progressionStore || (e.instance.progressionStore = [])
                    } catch (n) {
                        r.w("Load failed for 'progression' store. Using empty store."),
                        e.instance.progressionStore = []
                    }
                    try {
                        e.instance.storeItems = JSON.parse(localStorage.getItem(e.StringFormat(e.KeyFormat, n, e.ItemsStoreKey))),
                        e.instance.storeItems || (e.instance.storeItems = {})
                    } catch (n) {
                        r.w("Load failed for 'items' store. Using empty store."),
                        e.instance.progressionStore = []
                    }
                } else
                    r.w("Storage is not available, cannot load.")
            }
            ,
            e.setItem = function(n, t, i) {
                var r = e.StringFormat(e.KeyFormat, n, t);
                i ? e.instance.storeItems[r] = i : r in e.instance.storeItems && delete e.instance.storeItems[r]
            }
            ,
            e.getItem = function(n, t) {
                var i = e.StringFormat(e.KeyFormat, n, t);
                return i in e.instance.storeItems ? e.instance.storeItems[i] : null
            }
            ,
            e.getStore = function(n) {
                switch (n) {
                case i.Events:
                    return e.instance.eventsStore;
                case i.Sessions:
                    return e.instance.sessionsStore;
                case i.Progression:
                    return e.instance.progressionStore;
                default:
                    return r.w("GAStore.getStore(): Cannot find store: " + n),
                    null
                }
            }
            ,
            e.instance = new e,
            e.MaxNumberOfEntries = 2e3,
            e.StringFormat = function(e) {
                for (var n = [], t = 1; t < arguments.length; t++)
                    n[t - 1] = arguments[t];
                return e.replace(/{(\d+)}/g, (function(e, t) {
                    return n[t] || ""
                }
                ))
            }
            ,
            e.KeyFormat = "GA::{0}::{1}",
            e.EventsStoreKey = "ga_event",
            e.SessionsStoreKey = "ga_session",
            e.ProgressionStoreKey = "ga_progression",
            e.ItemsStoreKey = "ga_items",
            e
        }();
        n.GAStore = s
    }(e.store || (e.store = {}))
}(i || (i = {})),
function(e) {
    !function(n) {
        var t = e.validators.GAValidator
          , i = e.utilities.GAUtilities
          , r = e.logging.GALogger
          , s = e.store.GAStore
          , o = e.device.GADevice
          , a = e.store.EGAStore
          , d = e.store.EGAStoreArgsOperator
          , u = function() {
            function e() {
                this.availableCustomDimensions01 = [],
                this.availableCustomDimensions02 = [],
                this.availableCustomDimensions03 = [],
                this.currentGlobalCustomEventFields = {},
                this.availableResourceCurrencies = [],
                this.availableResourceItemTypes = [],
                this.configurations = {},
                this.remoteConfigsListeners = [],
                this.beforeUnloadListeners = [],
                this.sdkConfigDefault = {},
                this.sdkConfig = {},
                this.progressionTries = {},
                this._isEventSubmissionEnabled = !0,
                this.isUnloading = !1
            }
            return e.setUserId = function(n) {
                e.instance.userId = n,
                e.cacheIdentifier()
            }
            ,
            e.getIdentifier = function() {
                return e.instance.identifier
            }
            ,
            e.isInitialized = function() {
                return e.instance.initialized
            }
            ,
            e.setInitialized = function(n) {
                e.instance.initialized = n
            }
            ,
            e.getSessionStart = function() {
                return e.instance.sessionStart
            }
            ,
            e.getSessionNum = function() {
                return e.instance.sessionNum
            }
            ,
            e.getTransactionNum = function() {
                return e.instance.transactionNum
            }
            ,
            e.getSessionId = function() {
                return e.instance.sessionId
            }
            ,
            e.getCurrentCustomDimension01 = function() {
                return e.instance.currentCustomDimension01
            }
            ,
            e.getCurrentCustomDimension02 = function() {
                return e.instance.currentCustomDimension02
            }
            ,
            e.getCurrentCustomDimension03 = function() {
                return e.instance.currentCustomDimension03
            }
            ,
            e.getGameKey = function() {
                return e.instance.gameKey
            }
            ,
            e.getGameSecret = function() {
                return e.instance.gameSecret
            }
            ,
            e.getAvailableCustomDimensions01 = function() {
                return e.instance.availableCustomDimensions01
            }
            ,
            e.setAvailableCustomDimensions01 = function(n) {
                t.validateCustomDimensions(n) && (e.instance.availableCustomDimensions01 = n,
                e.validateAndFixCurrentDimensions(),
                r.i("Set available custom01 dimension values: (" + i.joinStringArray(n, ", ") + ")"))
            }
            ,
            e.getAvailableCustomDimensions02 = function() {
                return e.instance.availableCustomDimensions02
            }
            ,
            e.setAvailableCustomDimensions02 = function(n) {
                t.validateCustomDimensions(n) && (e.instance.availableCustomDimensions02 = n,
                e.validateAndFixCurrentDimensions(),
                r.i("Set available custom02 dimension values: (" + i.joinStringArray(n, ", ") + ")"))
            }
            ,
            e.getAvailableCustomDimensions03 = function() {
                return e.instance.availableCustomDimensions03
            }
            ,
            e.setAvailableCustomDimensions03 = function(n) {
                t.validateCustomDimensions(n) && (e.instance.availableCustomDimensions03 = n,
                e.validateAndFixCurrentDimensions(),
                r.i("Set available custom03 dimension values: (" + i.joinStringArray(n, ", ") + ")"))
            }
            ,
            e.getAvailableResourceCurrencies = function() {
                return e.instance.availableResourceCurrencies
            }
            ,
            e.setAvailableResourceCurrencies = function(n) {
                t.validateResourceCurrencies(n) && (e.instance.availableResourceCurrencies = n,
                r.i("Set available resource currencies: (" + i.joinStringArray(n, ", ") + ")"))
            }
            ,
            e.getAvailableResourceItemTypes = function() {
                return e.instance.availableResourceItemTypes
            }
            ,
            e.setAvailableResourceItemTypes = function(n) {
                t.validateResourceItemTypes(n) && (e.instance.availableResourceItemTypes = n,
                r.i("Set available resource item types: (" + i.joinStringArray(n, ", ") + ")"))
            }
            ,
            e.getBuild = function() {
                return e.instance.build
            }
            ,
            e.setBuild = function(n) {
                e.instance.build = n,
                r.i("Set build version: " + n)
            }
            ,
            e.getUseManualSessionHandling = function() {
                return e.instance.useManualSessionHandling
            }
            ,
            e.isEventSubmissionEnabled = function() {
                return e.instance._isEventSubmissionEnabled
            }
            ,
            e.getABTestingId = function() {
                return e.instance.abId
            }
            ,
            e.getABTestingVariantId = function() {
                return e.instance.abVariantId
            }
            ,
            e.prototype.setDefaultId = function(n) {
                this.defaultUserId = n || "",
                e.cacheIdentifier()
            }
            ,
            e.getDefaultId = function() {
                return e.instance.defaultUserId
            }
            ,
            e.getSdkConfig = function() {
                var n = 0;
                for (var t in e.instance.sdkConfig)
                    0 === n && (i = t),
                    ++n;
                if (i && n > 0)
                    return e.instance.sdkConfig;
                var i;
                n = 0;
                for (var t in e.instance.sdkConfigCached)
                    0 === n && (i = t),
                    ++n;
                return i && n > 0 ? e.instance.sdkConfigCached : e.instance.sdkConfigDefault
            }
            ,
            e.isEnabled = function() {
                return !!e.instance.initAuthorized
            }
            ,
            e.setCustomDimension01 = function(n) {
                e.instance.currentCustomDimension01 = n,
                s.setItem(e.getGameKey(), e.Dimension01Key, n),
                r.i("Set custom01 dimension value: " + n)
            }
            ,
            e.setCustomDimension02 = function(n) {
                e.instance.currentCustomDimension02 = n,
                s.setItem(e.getGameKey(), e.Dimension02Key, n),
                r.i("Set custom02 dimension value: " + n)
            }
            ,
            e.setCustomDimension03 = function(n) {
                e.instance.currentCustomDimension03 = n,
                s.setItem(e.getGameKey(), e.Dimension03Key, n),
                r.i("Set custom03 dimension value: " + n)
            }
            ,
            e.incrementSessionNum = function() {
                var n = e.getSessionNum() + 1;
                e.instance.sessionNum = n
            }
            ,
            e.incrementTransactionNum = function() {
                var n = e.getTransactionNum() + 1;
                e.instance.transactionNum = n
            }
            ,
            e.incrementProgressionTries = function(n) {
                var t = e.getProgressionTries(n) + 1;
                e.instance.progressionTries[n] = t;
                var i = {};
                i.progression = n,
                i.tries = t,
                s.insert(a.Progression, i, !0, "progression")
            }
            ,
            e.getProgressionTries = function(n) {
                return n in e.instance.progressionTries ? e.instance.progressionTries[n] : 0
            }
            ,
            e.clearProgressionTries = function(n) {
                n in e.instance.progressionTries && delete e.instance.progressionTries[n];
                var t = [];
                t.push(["progression", d.Equal, n]),
                s.delete(a.Progression, t)
            }
            ,
            e.setKeys = function(n, t) {
                e.instance.gameKey = n,
                e.instance.gameSecret = t
            }
            ,
            e.setManualSessionHandling = function(n) {
                e.instance.useManualSessionHandling = n,
                r.i("Use manual session handling: " + n)
            }
            ,
            e.setEnabledEventSubmission = function(n) {
                e.instance._isEventSubmissionEnabled = n
            }
            ,
            e.getEventAnnotations = function() {
                var n = {
                    v: 2
                };
                n.event_uuid = i.createGuid(),
                n.user_id = e.instance.identifier,
                n.client_ts = e.getClientTsAdjusted(),
                n.sdk_version = o.getRelevantSdkVersion(),
                n.os_version = o.osVersion,
                n.manufacturer = o.deviceManufacturer,
                n.device = o.deviceModel,
                n.browser_version = o.browserVersion,
                n.platform = o.buildPlatform,
                n.session_id = e.instance.sessionId,
                n[e.SessionNumKey] = e.instance.sessionNum;
                var r = o.getConnectionType();
                if (t.validateConnectionType(r) && (n.connection_type = r),
                o.gameEngineVersion && (n.engine_version = o.gameEngineVersion),
                e.instance.configurations) {
                    var s = 0;
                    for (var a in e.instance.configurations) {
                        s++;
                        break
                    }
                    s > 0 && (n.configurations = e.instance.configurations)
                }
                return e.instance.abId && (n.ab_id = e.instance.abId),
                e.instance.abVariantId && (n.ab_variant_id = e.instance.abVariantId),
                e.instance.build && (n.build = e.instance.build),
                n
            }
            ,
            e.getSdkErrorEventAnnotations = function() {
                var n = {
                    v: 2
                };
                n.event_uuid = i.createGuid(),
                n.category = e.CategorySdkError,
                n.sdk_version = o.getRelevantSdkVersion(),
                n.os_version = o.osVersion,
                n.manufacturer = o.deviceManufacturer,
                n.device = o.deviceModel,
                n.platform = o.buildPlatform;
                var r = o.getConnectionType();
                return t.validateConnectionType(r) && (n.connection_type = r),
                o.gameEngineVersion && (n.engine_version = o.gameEngineVersion),
                n
            }
            ,
            e.getInitAnnotations = function() {
                var n = {};
                return e.getIdentifier() || e.cacheIdentifier(),
                s.setItem(e.getGameKey(), e.LastUsedIdentifierKey, e.getIdentifier()),
                n.user_id = e.getIdentifier(),
                n.sdk_version = o.getRelevantSdkVersion(),
                n.os_version = o.osVersion,
                n.platform = o.buildPlatform,
                e.getBuild() ? n.build = e.getBuild() : n.build = null,
                n.session_num = e.getSessionNum(),
                n.random_salt = e.getSessionNum(),
                n
            }
            ,
            e.getClientTsAdjusted = function() {
                var n = i.timeIntervalSince1970()
                  , r = n + e.instance.clientServerTimeOffset;
                return t.validateClientTs(r) ? r : n
            }
            ,
            e.sessionIsStarted = function() {
                return 0 != e.instance.sessionStart
            }
            ,
            e.cacheIdentifier = function() {
                e.instance.userId ? e.instance.identifier = e.instance.userId : e.instance.defaultUserId && (e.instance.identifier = e.instance.defaultUserId)
            }
            ,
            e.ensurePersistedStates = function() {
                s.isStorageAvailable() && s.load(e.getGameKey());
                var n = e.instance;
                n.setDefaultId(null != s.getItem(e.getGameKey(), e.DefaultUserIdKey) ? s.getItem(e.getGameKey(), e.DefaultUserIdKey) : i.createGuid()),
                n.sessionNum = null != s.getItem(e.getGameKey(), e.SessionNumKey) ? Number(s.getItem(e.getGameKey(), e.SessionNumKey)) : 0,
                n.transactionNum = null != s.getItem(e.getGameKey(), e.TransactionNumKey) ? Number(s.getItem(e.getGameKey(), e.TransactionNumKey)) : 0,
                n.currentCustomDimension01 ? s.setItem(e.getGameKey(), e.Dimension01Key, n.currentCustomDimension01) : (n.currentCustomDimension01 = null != s.getItem(e.getGameKey(), e.Dimension01Key) ? s.getItem(e.getGameKey(), e.Dimension01Key) : "",
                n.currentCustomDimension01),
                n.currentCustomDimension02 ? s.setItem(e.getGameKey(), e.Dimension02Key, n.currentCustomDimension02) : (n.currentCustomDimension02 = null != s.getItem(e.getGameKey(), e.Dimension02Key) ? s.getItem(e.getGameKey(), e.Dimension02Key) : "",
                n.currentCustomDimension02),
                n.currentCustomDimension03 ? s.setItem(e.getGameKey(), e.Dimension03Key, n.currentCustomDimension03) : (n.currentCustomDimension03 = null != s.getItem(e.getGameKey(), e.Dimension03Key) ? s.getItem(e.getGameKey(), e.Dimension03Key) : "",
                n.currentCustomDimension03);
                var t = null != s.getItem(e.getGameKey(), e.SdkConfigCachedKey) ? s.getItem(e.getGameKey(), e.SdkConfigCachedKey) : "";
                if (t) {
                    var o = JSON.parse(i.decode64(t));
                    if (o) {
                        var d = s.getItem(e.getGameKey(), e.LastUsedIdentifierKey);
                        null != d && d != e.getIdentifier() && (r.w("New identifier spotted compared to last one used, clearing cached configs hash!!"),
                        o.configs_hash && delete o.configs_hash),
                        n.sdkConfigCached = o
                    }
                }
                var u = e.getSdkConfig();
                n.configsHash = u.configs_hash ? u.configs_hash : "",
                n.abId = u.ab_id ? u.ab_id : "",
                n.abVariantId = u.ab_variant_id ? u.ab_variant_id : "";
                var l = s.select(a.Progression);
                if (l)
                    for (var c = 0; c < l.length; ++c) {
                        var v = l[c];
                        v && (n.progressionTries[v.progression] = v.tries)
                    }
            }
            ,
            e.calculateServerTimeOffset = function(e) {
                return e - i.timeIntervalSince1970()
            }
            ,
            e.formatString = function(e, n) {
                for (var t = e, i = 0; i < n.length; i++) {
                    var r = new RegExp("\\{" + i + "\\}","gi");
                    t = t.replace(r, arguments[i])
                }
                return t
            }
            ,
            e.validateAndCleanCustomFields = function(n, t) {
                void 0 === t && (t = null);
                var s = {};
                if (n) {
                    var o = 0;
                    for (var a in n) {
                        var d = n[a];
                        if (a && d)
                            if (o < e.MAX_CUSTOM_FIELDS_COUNT) {
                                var u = new RegExp("^[a-zA-Z0-9_]{1," + e.MAX_CUSTOM_FIELDS_KEY_LENGTH + "}$");
                                if (i.stringMatch(a, u)) {
                                    var l = typeof d;
                                    if ("string" === l || d instanceof String) {
                                        var c = d;
                                        if (c.length <= e.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH && c.length > 0)
                                            s[a] = c,
                                            ++o;
                                        else {
                                            g = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its value is an empty string or exceeds the max number of characters (" + e.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH + ")",
                                            f = e.formatString(g, [a, d]);
                                            r.w(f),
                                            t && t(g, f)
                                        }
                                    } else if ("number" === l || d instanceof Number) {
                                        var v = d;
                                        s[a] = v,
                                        ++o
                                    } else {
                                        g = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its value is not a string or number",
                                        f = e.formatString(g, [a, d]);
                                        r.w(f),
                                        t && t(g, f)
                                    }
                                } else {
                                    g = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its key contains illegal character, is empty or exceeds the max number of characters (" + e.MAX_CUSTOM_FIELDS_KEY_LENGTH + ")",
                                    f = e.formatString(g, [a, d]);
                                    r.w(f),
                                    t && t(g, f)
                                }
                            } else {
                                g = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because it exceeds the max number of custom fields (" + e.MAX_CUSTOM_FIELDS_COUNT + ")",
                                f = e.formatString(g, [a, d]);
                                r.w(f),
                                t && t(g, f)
                            }
                        else {
                            var g = "validateAndCleanCustomFields: entry with key={0}, value={1} has been omitted because its key or value is null"
                              , f = e.formatString(g, [a, d]);
                            r.w(f),
                            t && t(g, f)
                        }
                    }
                }
                return s
            }
            ,
            e.validateAndFixCurrentDimensions = function() {
                t.validateDimension01(e.getCurrentCustomDimension01(), e.getAvailableCustomDimensions01()) || e.setCustomDimension01(""),
                t.validateDimension02(e.getCurrentCustomDimension02(), e.getAvailableCustomDimensions02()) || e.setCustomDimension02(""),
                t.validateDimension03(e.getCurrentCustomDimension03(), e.getAvailableCustomDimensions03()) || e.setCustomDimension03("")
            }
            ,
            e.getConfigurationStringValue = function(n, t) {
                return e.instance.configurations[n] ? e.instance.configurations[n].toString() : t
            }
            ,
            e.isRemoteConfigsReady = function() {
                return e.instance.remoteConfigsIsReady
            }
            ,
            e.addRemoteConfigsListener = function(n) {
                e.instance.remoteConfigsListeners.indexOf(n) < 0 && e.instance.remoteConfigsListeners.push(n)
            }
            ,
            e.removeRemoteConfigsListener = function(n) {
                var t = e.instance.remoteConfigsListeners.indexOf(n);
                t > -1 && e.instance.remoteConfigsListeners.splice(t, 1)
            }
            ,
            e.getRemoteConfigsContentAsString = function() {
                return JSON.stringify(e.instance.configurations)
            }
            ,
            e.populateConfigurations = function(n) {
                var t = n.configs;
                if (t) {
                    e.instance.configurations = {};
                    for (var i = 0; i < t.length; ++i) {
                        var r = t[i];
                        if (r) {
                            var s = r.key
                              , o = r.value
                              , a = r.start_ts ? r.start_ts : Number.MIN_VALUE
                              , d = r.end_ts ? r.end_ts : Number.MAX_VALUE
                              , u = e.getClientTsAdjusted();
                            s && o && u > a && u < d && (e.instance.configurations[s] = o)
                        }
                    }
                }
                e.instance.remoteConfigsIsReady = !0;
                var l = e.instance.remoteConfigsListeners;
                for (i = 0; i < l.length; ++i)
                    l[i] && l[i].onRemoteConfigsUpdated()
            }
            ,
            e.addOnBeforeUnloadListener = function(n) {
                e.instance.beforeUnloadListeners.indexOf(n) < 0 && e.instance.beforeUnloadListeners.push(n)
            }
            ,
            e.removeOnBeforeUnloadListener = function(n) {
                var t = e.instance.beforeUnloadListeners.indexOf(n);
                t > -1 && e.instance.beforeUnloadListeners.splice(t, 1)
            }
            ,
            e.notifyBeforeUnloadListeners = function() {
                for (var n = e.instance.beforeUnloadListeners, t = 0; t < n.length; ++t)
                    n[t] && n[t].onBeforeUnload()
            }
            ,
            e.CategorySdkError = "sdk_error",
            e.MAX_CUSTOM_FIELDS_COUNT = 50,
            e.MAX_CUSTOM_FIELDS_KEY_LENGTH = 64,
            e.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH = 256,
            e.instance = new e,
            e.DefaultUserIdKey = "default_user_id",
            e.SessionNumKey = "session_num",
            e.TransactionNumKey = "transaction_num",
            e.Dimension01Key = "dimension01",
            e.Dimension02Key = "dimension02",
            e.Dimension03Key = "dimension03",
            e.SdkConfigCachedKey = "sdk_config_cached",
            e.LastUsedIdentifierKey = "last_used_identifier",
            e
        }();
        n.GAState = u
    }(e.state || (e.state = {}))
}(i || (i = {})),
function(e) {
    !function(n) {
        var t = e.utilities.GAUtilities
          , i = e.logging.GALogger
          , r = function() {
            function e() {}
            return e.execute = function(n, r, s, o) {
                var a = new Date;
                if (e.timestampMap[r] || (e.timestampMap[r] = a),
                e.countMap[r] || (e.countMap[r] = 0),
                (a.getTime() - e.timestampMap[r].getTime()) / 1e3 >= 3600 && (e.timestampMap[r] = a,
                e.countMap[r] = 0),
                !(e.countMap[r] >= e.MaxCount)) {
                    var d = t.getHmac(o, s)
                      , u = new XMLHttpRequest;
                    u.onreadystatechange = function() {
                        if (4 === u.readyState) {
                            if (!u.responseText)
                                return;
                            if (200 != u.status)
                                return void i.w("sdk error failed. response code not 200. status code: " + u.status + ", description: " + u.statusText + ", body: " + u.responseText);
                            e.countMap[r] = e.countMap[r] + 1
                        }
                    }
                    ,
                    u.open("POST", n, !0),
                    u.setRequestHeader("Content-Type", "application/json"),
                    u.setRequestHeader("Authorization", d);
                    try {
                        u.send(s)
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
            ,
            e.MaxCount = 10,
            e.countMap = {},
            e.timestampMap = {},
            e
        }();
        n.SdkErrorTask = r
    }(e.tasks || (e.tasks = {}))
}(i || (i = {})),
function(e) {
    !function(n) {
        var t = e.state.GAState
          , i = e.logging.GALogger
          , r = e.utilities.GAUtilities
          , s = e.validators.GAValidator
          , o = e.tasks.SdkErrorTask
          , a = e.events.EGASdkErrorCategory
          , d = e.events.EGASdkErrorArea
          , u = e.events.EGASdkErrorAction
          , l = e.events.EGASdkErrorParameter
          , c = function() {
            function e() {
                this.protocol = "https",
                this.hostName = "api.gameanalytics.com",
                this.version = "v2",
                this.remoteConfigsVersion = "v1",
                this.baseUrl = this.protocol + "://" + this.hostName + "/" + this.version,
                this.remoteConfigsBaseUrl = this.protocol + "://" + this.hostName + "/remote_configs/" + this.remoteConfigsVersion,
                this.initializeUrlPath = "init",
                this.eventsUrlPath = "events",
                this.useGzip = !1
            }
            return e.prototype.requestInit = function(i, r) {
                var s = t.getGameKey()
                  , o = this.remoteConfigsBaseUrl + "/" + this.initializeUrlPath + "?game_key=" + s + "&interval_seconds=0&configs_hash=" + i
                  , a = t.getInitAnnotations()
                  , d = JSON.stringify(a);
                if (d) {
                    var u = this.createPayloadData(d, this.useGzip)
                      , l = [];
                    l.push(d),
                    e.sendRequest(o, u, l, this.useGzip, e.initRequestCallback, r)
                } else
                    r(n.EGAHTTPApiResponse.JsonEncodeFailed, null)
            }
            ,
            e.prototype.sendEventsInArray = function(i, r, s) {
                if (0 != i.length) {
                    var o = t.getGameKey()
                      , a = this.baseUrl + "/" + o + "/" + this.eventsUrlPath
                      , d = JSON.stringify(i);
                    if (d) {
                        var u = this.createPayloadData(d, this.useGzip)
                          , l = [];
                        l.push(d),
                        l.push(r),
                        l.push(i.length.toString()),
                        e.sendRequest(a, u, l, this.useGzip, e.sendEventInArrayRequestCallback, s)
                    } else
                        s(n.EGAHTTPApiResponse.JsonEncodeFailed, null, r, i.length)
                }
            }
            ,
            e.prototype.sendSdkErrorEvent = function(n, r, a, d, u, l, c) {
                if (t.isEventSubmissionEnabled() && s.validateSdkErrorEvent(l, c, n, r, a)) {
                    var v, g = this.baseUrl + "/" + l + "/" + this.eventsUrlPath, f = "", m = t.getSdkErrorEventAnnotations(), E = e.sdkErrorCategoryString(n);
                    m.error_category = E,
                    f += E;
                    var p = e.sdkErrorAreaString(r);
                    m.error_area = p,
                    f += ":" + p;
                    var h = e.sdkErrorActionString(a);
                    m.error_action = h;
                    var A = e.sdkErrorParameterString(d);
                    if (A.length > 0 && (m.error_parameter = A),
                    u.length > 0) {
                        var S = u;
                        if (u.length > e.MAX_ERROR_MESSAGE_LENGTH)
                            S = u.substring(0, e.MAX_ERROR_MESSAGE_LENGTH);
                        m.reason = S
                    }
                    var y = [];
                    y.push(m),
                    (v = JSON.stringify(y)) ? o.execute(g, f, v, c) : i.w("sendSdkErrorEvent: JSON encoding failed.")
                }
            }
            ,
            e.sendEventInArrayRequestCallback = function(i, r, s, o) {
                void 0 === o && (o = null);
                o[0],
                o[1];
                var c, v, g = o[2], f = parseInt(o[3]);
                c = i.responseText,
                v = i.status;
                var m = e.instance.processRequestResponse(v, i.statusText, c, "Events");
                if (m == n.EGAHTTPApiResponse.Ok || m == n.EGAHTTPApiResponse.Created || m == n.EGAHTTPApiResponse.BadRequest) {
                    var E = c ? JSON.parse(c) : {};
                    if (null == E)
                        return s(n.EGAHTTPApiResponse.JsonDecodeFailed, null, g, f),
                        void e.instance.sendSdkErrorEvent(a.Http, d.EventsHttp, u.FailHttpJsonDecode, l.Undefined, c, t.getGameKey(), t.getGameSecret());
                    n.EGAHTTPApiResponse.BadRequest,
                    s(m, E, g, f)
                } else
                    s(m, null, g, f)
            }
            ,
            e.sendRequest = function(e, n, i, s, o, a) {
                var d = new XMLHttpRequest
                  , u = t.getGameSecret()
                  , l = r.getHmac(u, n)
                  , c = [];
                for (var v in c.push(l),
                i)
                    c.push(i[v]);
                if (d.onreadystatechange = function() {
                    4 === d.readyState && o(d, e, a, c)
                }
                ,
                d.open("POST", e, !0),
                d.setRequestHeader("Content-Type", "application/json"),
                d.setRequestHeader("Authorization", l),
                s)
                    throw new Error("gzip not supported");
                try {
                    d.send(n)
                } catch (e) {
                    console.error(e.stack)
                }
            }
            ,
            e.initRequestCallback = function(i, r, o, c) {
                void 0 === c && (c = null);
                var v, g;
                c[0],
                c[1];
                v = i.responseText,
                g = i.status;
                var f = v ? JSON.parse(v) : {}
                  , m = e.instance.processRequestResponse(g, i.statusText, v, "Init");
                if (m == n.EGAHTTPApiResponse.Ok || m == n.EGAHTTPApiResponse.Created || m == n.EGAHTTPApiResponse.BadRequest) {
                    if (null == f)
                        return o(n.EGAHTTPApiResponse.JsonDecodeFailed, null, "", 0),
                        void e.instance.sendSdkErrorEvent(a.Http, d.InitHttp, u.FailHttpJsonDecode, l.Undefined, v, t.getGameKey(), t.getGameSecret());
                    if (m !== n.EGAHTTPApiResponse.BadRequest) {
                        var E = s.validateAndCleanInitRequestResponse(f, m === n.EGAHTTPApiResponse.Created);
                        E ? o(m, E, "", 0) : o(n.EGAHTTPApiResponse.BadResponse, null, "", 0)
                    } else
                        o(m, null, "", 0)
                } else
                    o(m, null, "", 0)
            }
            ,
            e.prototype.createPayloadData = function(e, n) {
                if (n)
                    throw new Error("gzip not supported");
                return e
            }
            ,
            e.prototype.processRequestResponse = function(e, t, i, r) {
                return i ? 200 === e ? n.EGAHTTPApiResponse.Ok : 201 === e ? n.EGAHTTPApiResponse.Created : 0 === e || 401 === e ? n.EGAHTTPApiResponse.Unauthorized : 400 === e ? n.EGAHTTPApiResponse.BadRequest : 500 === e ? n.EGAHTTPApiResponse.InternalServerError : n.EGAHTTPApiResponse.UnknownResponseCode : n.EGAHTTPApiResponse.NoResponse
            }
            ,
            e.sdkErrorCategoryString = function(e) {
                switch (e) {
                case a.EventValidation:
                    return "event_validation";
                case a.Database:
                    return "db";
                case a.Init:
                    return "init";
                case a.Http:
                    return "http";
                case a.Json:
                    return "json"
                }
                return ""
            }
            ,
            e.sdkErrorAreaString = function(e) {
                switch (e) {
                case d.BusinessEvent:
                    return "business";
                case d.ResourceEvent:
                    return "resource";
                case d.ProgressionEvent:
                    return "progression";
                case d.DesignEvent:
                    return "design";
                case d.ErrorEvent:
                    return "error";
                case d.InitHttp:
                    return "init_http";
                case d.EventsHttp:
                    return "events_http";
                case d.ProcessEvents:
                    return "process_events";
                case d.AddEventsToStore:
                    return "add_events_to_store"
                }
                return ""
            }
            ,
            e.sdkErrorActionString = function(e) {
                switch (e) {
                case u.InvalidCurrency:
                    return "invalid_currency";
                case u.InvalidShortString:
                    return "invalid_short_string";
                case u.InvalidEventPartLength:
                    return "invalid_event_part_length";
                case u.InvalidEventPartCharacters:
                    return "invalid_event_part_characters";
                case u.InvalidStore:
                    return "invalid_store";
                case u.InvalidFlowType:
                    return "invalid_flow_type";
                case u.StringEmptyOrNull:
                    return "string_empty_or_null";
                case u.NotFoundInAvailableCurrencies:
                    return "not_found_in_available_currencies";
                case u.InvalidAmount:
                    return "invalid_amount";
                case u.NotFoundInAvailableItemTypes:
                    return "not_found_in_available_item_types";
                case u.WrongProgressionOrder:
                    return "wrong_progression_order";
                case u.InvalidEventIdLength:
                    return "invalid_event_id_length";
                case u.InvalidEventIdCharacters:
                    return "invalid_event_id_characters";
                case u.InvalidProgressionStatus:
                    return "invalid_progression_status";
                case u.InvalidSeverity:
                    return "invalid_severity";
                case u.InvalidLongString:
                    return "invalid_long_string";
                case u.DatabaseTooLarge:
                    return "db_too_large";
                case u.DatabaseOpenOrCreate:
                    return "db_open_or_create";
                case u.JsonError:
                    return "json_error";
                case u.FailHttpJsonDecode:
                    return "fail_http_json_decode";
                case u.FailHttpJsonEncode:
                    return "fail_http_json_encode"
                }
                return ""
            }
            ,
            e.sdkErrorParameterString = function(e) {
                switch (e) {
                case l.Currency:
                    return "currency";
                case l.CartType:
                    return "cart_type";
                case l.ItemType:
                    return "item_type";
                case l.ItemId:
                    return "item_id";
                case l.Store:
                    return "store";
                case l.FlowType:
                    return "flow_type";
                case l.Amount:
                    return "amount";
                case l.Progression01:
                    return "progression01";
                case l.Progression02:
                    return "progression02";
                case l.Progression03:
                    return "progression03";
                case l.EventId:
                    return "event_id";
                case l.ProgressionStatus:
                    return "progression_status";
                case l.Severity:
                    return "severity";
                case l.Message:
                    return "message"
                }
                return ""
            }
            ,
            e.instance = new e,
            e.MAX_ERROR_MESSAGE_LENGTH = 256,
            e
        }();
        n.GAHTTPApi = c
    }(e.http || (e.http = {}))
}(i || (i = {})),
function(e) {
    var n, t, i, r, s, o, a, d, u, l, c;
    n = e.events || (e.events = {}),
    t = e.store.GAStore,
    i = e.store.EGAStore,
    r = e.store.EGAStoreArgsOperator,
    s = e.state.GAState,
    o = e.logging.GALogger,
    a = e.utilities.GAUtilities,
    d = e.http.EGAHTTPApiResponse,
    u = e.http.GAHTTPApi,
    l = e.validators.GAValidator,
    c = function() {
        function c() {}
        return c.customEventFieldsErrorCallback = function(n, t) {
            if (s.isEventSubmissionEnabled()) {
                var i = new Date;
                c.timestampMap[n] || (c.timestampMap[n] = i),
                c.countMap[n] || (c.countMap[n] = 0),
                (i.getTime() - c.timestampMap[n].getTime()) / 1e3 >= 3600 && (c.timestampMap[n] = i,
                c.countMap[n] = 0),
                c.countMap[n] >= c.MAX_ERROR_COUNT || e.threading.GAThreading.performTaskOnGAThread((function() {
                    c.addErrorEvent(e.EGAErrorSeverity.Warning, t, null, !0),
                    c.countMap[n] = c.countMap[n] + 1
                }
                ))
            }
        }
        ,
        c.addSessionStartEvent = function() {
            if (s.isEventSubmissionEnabled()) {
                var e = {};
                e.category = c.CategorySessionStart,
                s.incrementSessionNum(),
                t.setItem(s.getGameKey(), s.SessionNumKey, s.getSessionNum().toString()),
                c.addDimensionsToEvent(e);
                var n = s.instance.currentGlobalCustomEventFields;
                c.addCustomFieldsToEvent(e, s.validateAndCleanCustomFields(n, c.customEventFieldsErrorCallback)),
                c.addEventToStore(e),
                o.i("Add SESSION START event"),
                c.processEvents(c.CategorySessionStart, !1)
            }
        }
        ,
        c.addSessionEndEvent = function() {
            if (s.isEventSubmissionEnabled()) {
                var e = s.getSessionStart()
                  , n = s.getClientTsAdjusted() - e;
                n < 0 && (o.w("Session length was calculated to be less then 0. Should not be possible. Resetting to 0."),
                n = 0);
                var t = {};
                t.category = c.CategorySessionEnd,
                t.length = n,
                c.addDimensionsToEvent(t);
                var i = s.instance.currentGlobalCustomEventFields;
                c.addCustomFieldsToEvent(t, s.validateAndCleanCustomFields(i, c.customEventFieldsErrorCallback)),
                c.addEventToStore(t),
                o.i("Add SESSION END event."),
                c.processEvents("", !1)
            }
        }
        ,
        c.addBusinessEvent = function(e, n, i, r, a, d, v) {
            if (void 0 === a && (a = null),
            s.isEventSubmissionEnabled()) {
                var g = l.validateBusinessEvent(e, n, a, i, r);
                if (null == g) {
                    var f = {};
                    s.incrementTransactionNum(),
                    t.setItem(s.getGameKey(), s.TransactionNumKey, s.getTransactionNum().toString()),
                    f.event_id = i + ":" + r,
                    f.category = c.CategoryBusiness,
                    f.currency = e,
                    f.amount = n,
                    f[s.TransactionNumKey] = s.getTransactionNum(),
                    a && (f.cart_type = a),
                    c.addDimensionsToEvent(f);
                    var m = {};
                    if (d && Object.keys(d).length > 0)
                        for (var E in d)
                            m[E] = d[E];
                    else
                        for (var E in s.instance.currentGlobalCustomEventFields)
                            m[E] = s.instance.currentGlobalCustomEventFields[E];
                    if (v && d && Object.keys(d).length > 0)
                        for (var E in s.instance.currentGlobalCustomEventFields)
                            m[E] || (m[E] = s.instance.currentGlobalCustomEventFields[E]);
                    c.addCustomFieldsToEvent(f, s.validateAndCleanCustomFields(m, c.customEventFieldsErrorCallback)),
                    o.i("Add BUSINESS event: {currency:" + e + ", amount:" + n + ", itemType:" + i + ", itemId:" + r + ", cartType:" + a + "}"),
                    c.addEventToStore(f)
                } else
                    u.instance.sendSdkErrorEvent(g.category, g.area, g.action, g.parameter, g.reason, s.getGameKey(), s.getGameSecret())
            }
        }
        ,
        c.addResourceEvent = function(n, t, i, r, a, d, v) {
            if (s.isEventSubmissionEnabled()) {
                var g = l.validateResourceEvent(n, t, i, r, a, s.getAvailableResourceCurrencies(), s.getAvailableResourceItemTypes());
                if (null == g) {
                    n === e.EGAResourceFlowType.Sink && (i *= -1);
                    var f = {}
                      , m = c.resourceFlowTypeToString(n);
                    f.event_id = m + ":" + t + ":" + r + ":" + a,
                    f.category = c.CategoryResource,
                    f.amount = i,
                    c.addDimensionsToEvent(f);
                    var E = {};
                    if (d && Object.keys(d).length > 0)
                        for (var p in d)
                            E[p] = d[p];
                    else
                        for (var p in s.instance.currentGlobalCustomEventFields)
                            E[p] = s.instance.currentGlobalCustomEventFields[p];
                    if (v && d && Object.keys(d).length > 0)
                        for (var p in s.instance.currentGlobalCustomEventFields)
                            E[p] || (E[p] = s.instance.currentGlobalCustomEventFields[p]);
                    c.addCustomFieldsToEvent(f, s.validateAndCleanCustomFields(E, c.customEventFieldsErrorCallback)),
                    o.i("Add RESOURCE event: {currency:" + t + ", amount:" + i + ", itemType:" + r + ", itemId:" + a + "}"),
                    c.addEventToStore(f)
                } else
                    u.instance.sendSdkErrorEvent(g.category, g.area, g.action, g.parameter, g.reason, s.getGameKey(), s.getGameSecret())
            }
        }
        ,
        c.addProgressionEvent = function(n, t, i, r, a, d, v, g) {
            if (s.isEventSubmissionEnabled()) {
                var f = c.progressionStatusToString(n)
                  , m = l.validateProgressionEvent(n, t, i, r);
                if (null == m) {
                    var E, p = {};
                    E = i ? r ? t + ":" + i + ":" + r : t + ":" + i : t,
                    p.category = c.CategoryProgression,
                    p.event_id = f + ":" + E;
                    var h = 0;
                    d && n != e.EGAProgressionStatus.Start && (p.score = Math.round(a)),
                    n === e.EGAProgressionStatus.Fail && s.incrementProgressionTries(E),
                    n === e.EGAProgressionStatus.Complete && (s.incrementProgressionTries(E),
                    h = s.getProgressionTries(E),
                    p.attempt_num = h,
                    s.clearProgressionTries(E)),
                    c.addDimensionsToEvent(p);
                    var A = {};
                    if (v && Object.keys(v).length > 0)
                        for (var S in v)
                            A[S] = v[S];
                    else
                        for (var S in s.instance.currentGlobalCustomEventFields)
                            A[S] = s.instance.currentGlobalCustomEventFields[S];
                    if (g && v && Object.keys(v).length > 0)
                        for (var S in s.instance.currentGlobalCustomEventFields)
                            A[S] || (A[S] = s.instance.currentGlobalCustomEventFields[S]);
                    c.addCustomFieldsToEvent(p, s.validateAndCleanCustomFields(A, c.customEventFieldsErrorCallback)),
                    o.i("Add PROGRESSION event: {status:" + f + ", progression01:" + t + ", progression02:" + i + ", progression03:" + r + ", score:" + a + ", attempt:" + h + "}"),
                    c.addEventToStore(p)
                } else
                    u.instance.sendSdkErrorEvent(m.category, m.area, m.action, m.parameter, m.reason, s.getGameKey(), s.getGameSecret())
            }
        }
        ,
        c.addDesignEvent = function(e, n, t, i, r) {
            if (s.isEventSubmissionEnabled()) {
                var a = l.validateDesignEvent(e);
                if (null == a) {
                    var d = {};
                    d.category = c.CategoryDesign,
                    d.event_id = e,
                    t && (d.value = n),
                    c.addDimensionsToEvent(d);
                    var v = {};
                    if (i && Object.keys(i).length > 0)
                        for (var g in i)
                            v[g] = i[g];
                    else
                        for (var g in s.instance.currentGlobalCustomEventFields)
                            v[g] = s.instance.currentGlobalCustomEventFields[g];
                    if (r && i && Object.keys(i).length > 0)
                        for (var g in s.instance.currentGlobalCustomEventFields)
                            v[g] || (v[g] = s.instance.currentGlobalCustomEventFields[g]);
                    c.addCustomFieldsToEvent(d, s.validateAndCleanCustomFields(v, c.customEventFieldsErrorCallback)),
                    o.i("Add DESIGN event: {eventId:" + e + ", value:" + n + "}"),
                    c.addEventToStore(d)
                } else
                    u.instance.sendSdkErrorEvent(a.category, a.area, a.action, a.parameter, a.reason, s.getGameKey(), s.getGameSecret())
            }
        }
        ,
        c.addErrorEvent = function(e, n, t, i, r) {
            if (void 0 === r && (r = !1),
            s.isEventSubmissionEnabled()) {
                var a = c.errorSeverityToString(e)
                  , d = l.validateErrorEvent(e, n);
                if (null == d) {
                    var v = {};
                    if (v.category = c.CategoryError,
                    v.severity = a,
                    v.message = n,
                    c.addDimensionsToEvent(v),
                    !r) {
                        var g = {};
                        if (t && Object.keys(t).length > 0)
                            for (var f in t)
                                g[f] = t[f];
                        else
                            for (var f in s.instance.currentGlobalCustomEventFields)
                                g[f] = s.instance.currentGlobalCustomEventFields[f];
                        if (i && t && Object.keys(t).length > 0)
                            for (var f in s.instance.currentGlobalCustomEventFields)
                                g[f] || (g[f] = s.instance.currentGlobalCustomEventFields[f]);
                        c.addCustomFieldsToEvent(v, s.validateAndCleanCustomFields(g, c.customEventFieldsErrorCallback))
                    }
                    o.i("Add ERROR event: {severity:" + a + ", message:" + n + "}"),
                    c.addEventToStore(v)
                } else
                    u.instance.sendSdkErrorEvent(d.category, d.area, d.action, d.parameter, d.reason, s.getGameKey(), s.getGameSecret())
            }
        }
        ,
        c.addAdEvent = function(n, t, i, r, a, d, v, g, f) {
            if (s.isEventSubmissionEnabled()) {
                var m = c.adActionToString(n)
                  , E = c.adTypeToString(t)
                  , p = c.adErrorToString(a)
                  , h = l.validateAdEvent(n, t, i, r);
                if (null == h) {
                    var A = {};
                    A.category = c.CategoryAds,
                    A.ad_sdk_name = i,
                    A.ad_placement = r,
                    A.ad_type = E,
                    A.ad_action = m,
                    n == e.EGAAdAction.FailedShow && p.length > 0 && (A.ad_fail_show_reason = p),
                    !v || t != e.EGAAdType.RewardedVideo && t != e.EGAAdType.Video || (A.ad_duration = d),
                    c.addDimensionsToEvent(A);
                    var S = {};
                    if (g && Object.keys(g).length > 0)
                        for (var y in g)
                            S[y] = g[y];
                    else
                        for (var y in s.instance.currentGlobalCustomEventFields)
                            S[y] = s.instance.currentGlobalCustomEventFields[y];
                    if (f && g && Object.keys(g).length > 0)
                        for (var y in s.instance.currentGlobalCustomEventFields)
                            S[y] || (S[y] = s.instance.currentGlobalCustomEventFields[y]);
                    c.addCustomFieldsToEvent(A, s.validateAndCleanCustomFields(S, c.customEventFieldsErrorCallback)),
                    o.i("Add AD event: {ad_sdk_name:" + i + ", ad_placement:" + r + ", ad_type:" + E + ", ad_action:" + m + (n == e.EGAAdAction.FailedShow && p.length > 0 ? ", ad_fail_show_reason:" + p : "") + (!v || t != e.EGAAdType.RewardedVideo && t != e.EGAAdType.Video ? "" : ", ad_duration:" + d) + "}"),
                    c.addEventToStore(A)
                } else
                    u.instance.sendSdkErrorEvent(h.category, h.area, h.action, h.parameter, h.reason, s.getGameKey(), s.getGameSecret())
            }
        }
        ,
        c.processEvents = function(e, d) {
            if (s.isEventSubmissionEnabled())
                try {
                    var v = a.createGuid();
                    d && (c.cleanupEvents(),
                    c.fixMissingSessionEndEvents());
                    var g = [];
                    g.push(["status", r.Equal, "new"]);
                    var f = [];
                    f.push(["status", r.Equal, "new"]),
                    e && (g.push(["category", r.Equal, e]),
                    f.push(["category", r.Equal, e]));
                    var m = [];
                    m.push(["status", v]);
                    var E = t.select(i.Events, g);
                    if (!E || 0 == E.length)
                        return o.i("Event queue: No events to send"),
                        void c.updateSessionStore();
                    if (E.length > c.MaxEventCount) {
                        if (!(E = t.select(i.Events, g, !0, c.MaxEventCount)))
                            return;
                        var p = E[E.length - 1].client_ts;
                        if (g.push(["client_ts", r.LessOrEqual, p]),
                        !(E = t.select(i.Events, g)))
                            return;
                        f.push(["client_ts", r.LessOrEqual, p])
                    }
                    if (o.i("Event queue: Sending " + E.length + " events."),
                    !t.update(i.Events, m, f))
                        return;
                    for (var h = [], A = 0; A < E.length; ++A) {
                        var S = E[A]
                          , y = JSON.parse(a.decode64(S.event));
                        if (0 != y.length) {
                            var b = y.client_ts;
                            b && !l.validateClientTs(b) && delete y.client_ts,
                            h.push(y)
                        }
                    }
                    u.instance.sendEventsInArray(h, v, c.processEventsCallback)
                } catch (e) {
                    o.e("Error during ProcessEvents(): " + e.stack),
                    u.instance.sendSdkErrorEvent(n.EGASdkErrorCategory.Json, n.EGASdkErrorArea.ProcessEvents, n.EGASdkErrorAction.JsonError, n.EGASdkErrorParameter.Undefined, e.stack, s.getGameKey(), s.getGameSecret())
                }
        }
        ,
        c.processEventsCallback = function(e, n, s, a) {
            var u = [];
            if (u.push(["status", r.Equal, s]),
            e === d.Ok)
                t.delete(i.Events, u),
                o.i("Event queue: " + a + " events sent.");
            else if (e === d.NoResponse) {
                var l = [];
                l.push(["status", "new"]),
                o.w("Event queue: Failed to send events to collector - Retrying next time"),
                t.update(i.Events, l, u)
            } else {
                if (n) {
                    var c, v = 0;
                    for (var g in n)
                        0 == v && (c = n[g]),
                        ++v;
                    e === d.BadRequest && c.constructor === Array ? o.w("Event queue: " + a + " events sent. " + v + " events failed GA server validation.") : o.w("Event queue: Failed to send events.")
                } else
                    o.w("Event queue: Failed to send events.");
                t.delete(i.Events, u)
            }
        }
        ,
        c.cleanupEvents = function() {
            t.update(i.Events, [["status", "new"]])
        }
        ,
        c.fixMissingSessionEndEvents = function() {
            if (s.isEventSubmissionEnabled()) {
                var e = [];
                e.push(["session_id", r.NotEqual, s.getSessionId()]);
                var n = t.select(i.Sessions, e);
                if (n && 0 != n.length) {
                    o.i(n.length + " session(s) located with missing session_end event.");
                    for (var d = 0; d < n.length; ++d) {
                        var u = JSON.parse(a.decode64(n[d].event))
                          , l = u.client_ts - n[d].timestamp;
                        l = Math.max(0, l),
                        u.category = c.CategorySessionEnd,
                        u.length = l,
                        c.addEventToStore(u)
                    }
                }
            }
        }
        ,
        c.addEventToStore = function(e) {
            if (s.isEventSubmissionEnabled())
                if (s.isInitialized())
                    try {
                        if (t.isStoreTooLargeForEvents() && !a.stringMatch(e.category, /^(user|session_end|business)$/))
                            return o.w("Database too large. Event has been blocked."),
                            void u.instance.sendSdkErrorEvent(n.EGASdkErrorCategory.Database, n.EGASdkErrorArea.AddEventsToStore, n.EGASdkErrorAction.DatabaseTooLarge, n.EGASdkErrorParameter.Undefined, "", s.getGameKey(), s.getGameSecret());
                        var d = s.getEventAnnotations();
                        for (var l in e)
                            d[l] = e[l];
                        var v = JSON.stringify(d);
                        o.ii("Event added to queue: " + v);
                        var g = {
                            status: "new"
                        };
                        g.category = d.category,
                        g.session_id = d.session_id,
                        g.client_ts = d.client_ts,
                        g.event = a.encode64(JSON.stringify(d)),
                        t.insert(i.Events, g),
                        e.category == c.CategorySessionEnd ? t.delete(i.Sessions, [["session_id", r.Equal, d.session_id]]) : c.updateSessionStore(),
                        t.isStorageAvailable() && t.save(s.getGameKey())
                    } catch (l) {
                        o.e("addEventToStore: error"),
                        o.e(l.stack),
                        u.instance.sendSdkErrorEvent(n.EGASdkErrorCategory.Database, n.EGASdkErrorArea.AddEventsToStore, n.EGASdkErrorAction.DatabaseTooLarge, n.EGASdkErrorParameter.Undefined, l.stack, s.getGameKey(), s.getGameSecret())
                    }
                else
                    o.w("Could not add event: SDK is not initialized")
        }
        ,
        c.updateSessionStore = function() {
            if (s.sessionIsStarted()) {
                var e = {};
                e.session_id = s.instance.sessionId,
                e.timestamp = s.getSessionStart();
                var n = s.getEventAnnotations();
                c.addDimensionsToEvent(n);
                var r = s.instance.currentGlobalCustomEventFields;
                c.addCustomFieldsToEvent(n, s.validateAndCleanCustomFields(r, c.customEventFieldsErrorCallback)),
                e.event = a.encode64(JSON.stringify(n)),
                t.insert(i.Sessions, e, !0, "session_id"),
                t.isStorageAvailable() && t.save(s.getGameKey())
            }
        }
        ,
        c.addDimensionsToEvent = function(e) {
            e && (s.getCurrentCustomDimension01() && (e.custom_01 = s.getCurrentCustomDimension01()),
            s.getCurrentCustomDimension02() && (e.custom_02 = s.getCurrentCustomDimension02()),
            s.getCurrentCustomDimension03() && (e.custom_03 = s.getCurrentCustomDimension03()))
        }
        ,
        c.addCustomFieldsToEvent = function(e, n) {
            e && n && Object.keys(n).length > 0 && (e.custom_fields = n)
        }
        ,
        c.resourceFlowTypeToString = function(n) {
            return n == e.EGAResourceFlowType.Source || n == e.EGAResourceFlowType[e.EGAResourceFlowType.Source] ? "Source" : n == e.EGAResourceFlowType.Sink || n == e.EGAResourceFlowType[e.EGAResourceFlowType.Sink] ? "Sink" : ""
        }
        ,
        c.progressionStatusToString = function(n) {
            return n == e.EGAProgressionStatus.Start || n == e.EGAProgressionStatus[e.EGAProgressionStatus.Start] ? "Start" : n == e.EGAProgressionStatus.Complete || n == e.EGAProgressionStatus[e.EGAProgressionStatus.Complete] ? "Complete" : n == e.EGAProgressionStatus.Fail || n == e.EGAProgressionStatus[e.EGAProgressionStatus.Fail] ? "Fail" : ""
        }
        ,
        c.errorSeverityToString = function(n) {
            return n == e.EGAErrorSeverity.Debug || n == e.EGAErrorSeverity[e.EGAErrorSeverity.Debug] ? "debug" : n == e.EGAErrorSeverity.Info || n == e.EGAErrorSeverity[e.EGAErrorSeverity.Info] ? "info" : n == e.EGAErrorSeverity.Warning || n == e.EGAErrorSeverity[e.EGAErrorSeverity.Warning] ? "warning" : n == e.EGAErrorSeverity.Error || n == e.EGAErrorSeverity[e.EGAErrorSeverity.Error] ? "error" : n == e.EGAErrorSeverity.Critical || n == e.EGAErrorSeverity[e.EGAErrorSeverity.Critical] ? "critical" : ""
        }
        ,
        c.adActionToString = function(n) {
            return n == e.EGAAdAction.Clicked || n == e.EGAAdAction[e.EGAAdAction.Clicked] ? "clicked" : n == e.EGAAdAction.Show || n == e.EGAAdAction[e.EGAAdAction.Show] ? "show" : n == e.EGAAdAction.FailedShow || n == e.EGAAdAction[e.EGAAdAction.FailedShow] ? "failed_show" : n == e.EGAAdAction.RewardReceived || n == e.EGAAdAction[e.EGAAdAction.RewardReceived] ? "reward_received" : ""
        }
        ,
        c.adErrorToString = function(n) {
            return n == e.EGAAdError.Unknown || n == e.EGAAdError[e.EGAAdError.Unknown] ? "unknown" : n == e.EGAAdError.Offline || n == e.EGAAdError[e.EGAAdError.Offline] ? "offline" : n == e.EGAAdError.NoFill || n == e.EGAAdError[e.EGAAdError.NoFill] ? "no_fill" : n == e.EGAAdError.InternalError || n == e.EGAAdError[e.EGAAdError.InternalError] ? "internal_error" : n == e.EGAAdError.InvalidRequest || n == e.EGAAdError[e.EGAAdError.InvalidRequest] ? "invalid_request" : n == e.EGAAdError.UnableToPrecache || n == e.EGAAdError[e.EGAAdError.UnableToPrecache] ? "unable_to_precache" : ""
        }
        ,
        c.adTypeToString = function(n) {
            return n == e.EGAAdType.Video || n == e.EGAAdType[e.EGAAdType.Video] ? "video" : n == e.EGAAdType.RewardedVideo || n == e.EGAAdError[e.EGAAdType.RewardedVideo] ? "rewarded_video" : n == e.EGAAdType.Playable || n == e.EGAAdError[e.EGAAdType.Playable] ? "playable" : n == e.EGAAdType.Interstitial || n == e.EGAAdError[e.EGAAdType.Interstitial] ? "interstitial" : n == e.EGAAdType.OfferWall || n == e.EGAAdError[e.EGAAdType.OfferWall] ? "offer_wall" : n == e.EGAAdType.Banner || n == e.EGAAdError[e.EGAAdType.Banner] ? "banner" : ""
        }
        ,
        c.CategorySessionStart = "user",
        c.CategorySessionEnd = "session_end",
        c.CategoryDesign = "design",
        c.CategoryBusiness = "business",
        c.CategoryProgression = "progression",
        c.CategoryResource = "resource",
        c.CategoryError = "error",
        c.CategoryAds = "ads",
        c.MaxEventCount = 500,
        c.MAX_ERROR_COUNT = 10,
        c.countMap = {},
        c.timestampMap = {},
        c
    }(),
    n.GAEvents = c
}(i || (i = {})),
function(e) {
    !function(n) {
        var t = e.logging.GALogger
          , i = e.state.GAState
          , r = e.events.GAEvents
          , s = function() {
            function e() {
                this.blocks = new n.PriorityQueue({
                    compare: function(e, n) {
                        return e - n
                    }
                }),
                this.id2TimedBlockMap = {},
                e.startThread()
            }
            return e.createTimedBlock = function(e) {
                void 0 === e && (e = 0);
                var t = new Date;
                return t.setSeconds(t.getSeconds() + e),
                new n.TimedBlock(t)
            }
            ,
            e.performTaskOnGAThread = function(t, i) {
                void 0 === i && (i = 0);
                var r = new Date;
                r.setSeconds(r.getSeconds() + i);
                var s = new n.TimedBlock(r);
                s.block = t,
                e.instance.id2TimedBlockMap[s.id] = s,
                e.instance.addTimedBlock(s)
            }
            ,
            e.performTimedBlockOnGAThread = function(n) {
                e.instance.id2TimedBlockMap[n.id] = n,
                e.instance.addTimedBlock(n)
            }
            ,
            e.scheduleTimer = function(t, i) {
                var r = new Date;
                r.setSeconds(r.getSeconds() + t);
                var s = new n.TimedBlock(r);
                return s.block = i,
                e.instance.id2TimedBlockMap[s.id] = s,
                e.instance.addTimedBlock(s),
                s.id
            }
            ,
            e.getTimedBlockById = function(n) {
                return n in e.instance.id2TimedBlockMap ? e.instance.id2TimedBlockMap[n] : null
            }
            ,
            e.ensureEventQueueIsRunning = function() {
                e.instance.keepRunning = !0,
                e.instance.isRunning || (e.instance.isRunning = !0,
                e.scheduleTimer(e.ProcessEventsIntervalInSeconds, e.processEventQueue))
            }
            ,
            e.endSessionAndStopQueue = function() {
                i.isInitialized() && (t.i("Ending session."),
                e.stopEventQueue(),
                i.isEnabled() && i.sessionIsStarted() && (r.addSessionEndEvent(),
                i.instance.sessionStart = 0))
            }
            ,
            e.stopEventQueue = function() {
                e.instance.keepRunning = !1
            }
            ,
            e.ignoreTimer = function(n) {
                n in e.instance.id2TimedBlockMap && (e.instance.id2TimedBlockMap[n].ignore = !0)
            }
            ,
            e.setEventProcessInterval = function(n) {
                n > 0 && (e.ProcessEventsIntervalInSeconds = n)
            }
            ,
            e.prototype.addTimedBlock = function(e) {
                this.blocks.enqueue(e.deadline.getTime(), e)
            }
            ,
            e.run = function() {
                clearTimeout(e.runTimeoutId);
                try {
                    for (var n; n = e.getNextBlock(); )
                        if (!n.ignore)
                            if (n.async) {
                                if (!n.running) {
                                    n.running = !0,
                                    n.block();
                                    break
                                }
                            } else
                                n.block();
                    return void (e.runTimeoutId = setTimeout(e.run, e.ThreadWaitTimeInMs))
                } catch (e) {
                    t.e("Error on GA thread"),
                    t.e(e.stack)
                }
            }
            ,
            e.startThread = function() {
                e.runTimeoutId = setTimeout(e.run, 0)
            }
            ,
            e.getNextBlock = function() {
                var n = new Date;
                return e.instance.blocks.hasItems() && e.instance.blocks.peek().deadline.getTime() <= n.getTime() ? e.instance.blocks.peek().async && e.instance.blocks.peek().running ? e.instance.blocks.peek() : e.instance.blocks.dequeue() : null
            }
            ,
            e.processEventQueue = function() {
                r.processEvents("", !0),
                e.instance.keepRunning ? e.scheduleTimer(e.ProcessEventsIntervalInSeconds, e.processEventQueue) : e.instance.isRunning = !1
            }
            ,
            e.instance = new e,
            e.ThreadWaitTimeInMs = 1e3,
            e.ProcessEventsIntervalInSeconds = 8,
            e
        }();
        n.GAThreading = s
    }(e.threading || (e.threading = {}))
}(i || (i = {})),
function(e) {
    var n = e.threading.GAThreading
      , t = e.logging.GALogger
      , i = e.store.GAStore
      , r = e.state.GAState
      , s = e.http.GAHTTPApi
      , o = e.device.GADevice
      , a = e.validators.GAValidator
      , d = e.http.EGAHTTPApiResponse
      , u = e.utilities.GAUtilities
      , l = e.events.GAEvents
      , c = function() {
        function c() {}
        return c.getGlobalObject = function() {
            return "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof global ? global : void 0
        }
        ,
        c.init = function() {
            if (o.touch(),
            c.methodMap.configureAvailableCustomDimensions01 = c.configureAvailableCustomDimensions01,
            c.methodMap.configureAvailableCustomDimensions02 = c.configureAvailableCustomDimensions02,
            c.methodMap.configureAvailableCustomDimensions03 = c.configureAvailableCustomDimensions03,
            c.methodMap.configureAvailableResourceCurrencies = c.configureAvailableResourceCurrencies,
            c.methodMap.configureAvailableResourceItemTypes = c.configureAvailableResourceItemTypes,
            c.methodMap.configureBuild = c.configureBuild,
            c.methodMap.configureSdkGameEngineVersion = c.configureSdkGameEngineVersion,
            c.methodMap.configureGameEngineVersion = c.configureGameEngineVersion,
            c.methodMap.configureUserId = c.configureUserId,
            c.methodMap.initialize = c.initialize,
            c.methodMap.addBusinessEvent = c.addBusinessEvent,
            c.methodMap.addResourceEvent = c.addResourceEvent,
            c.methodMap.addProgressionEvent = c.addProgressionEvent,
            c.methodMap.addDesignEvent = c.addDesignEvent,
            c.methodMap.addErrorEvent = c.addErrorEvent,
            c.methodMap.addAdEvent = c.addAdEvent,
            c.methodMap.setEnabledInfoLog = c.setEnabledInfoLog,
            c.methodMap.setEnabledVerboseLog = c.setEnabledVerboseLog,
            c.methodMap.setEnabledManualSessionHandling = c.setEnabledManualSessionHandling,
            c.methodMap.setEnabledEventSubmission = c.setEnabledEventSubmission,
            c.methodMap.setCustomDimension01 = c.setCustomDimension01,
            c.methodMap.setCustomDimension02 = c.setCustomDimension02,
            c.methodMap.setCustomDimension03 = c.setCustomDimension03,
            c.methodMap.setGlobalCustomEventFields = c.setGlobalCustomEventFields,
            c.methodMap.setEventProcessInterval = c.setEventProcessInterval,
            c.methodMap.startSession = c.startSession,
            c.methodMap.endSession = c.endSession,
            c.methodMap.onStop = c.onStop,
            c.methodMap.onResume = c.onResume,
            c.methodMap.addRemoteConfigsListener = c.addRemoteConfigsListener,
            c.methodMap.removeRemoteConfigsListener = c.removeRemoteConfigsListener,
            c.methodMap.getRemoteConfigsValueAsString = c.getRemoteConfigsValueAsString,
            c.methodMap.isRemoteConfigsReady = c.isRemoteConfigsReady,
            c.methodMap.getRemoteConfigsContentAsString = c.getRemoteConfigsContentAsString,
            c.methodMap.addOnBeforeUnloadListener = c.addOnBeforeUnloadListener,
            c.methodMap.removeOnBeforeUnloadListener = c.removeOnBeforeUnloadListener,
            void 0 !== c.getGlobalObject() && void 0 !== c.getGlobalObject().GameAnalytics && void 0 !== c.getGlobalObject().GameAnalytics.q) {
                var e = c.getGlobalObject().GameAnalytics.q;
                for (var t in e)
                    c.gaCommand.apply(null, e[t])
            }
            window.addEventListener("beforeunload", (function(e) {
                console.log("addEventListener unload"),
                r.instance.isUnloading = !0,
                r.notifyBeforeUnloadListeners(),
                n.endSessionAndStopQueue(),
                r.instance.isUnloading = !1
            }
            ))
        }
        ,
        c.gaCommand = function() {
            for (var n = [], t = 0; t < arguments.length; t++)
                n[t] = arguments[t];
            n.length > 0 && n[0]in e.GameAnalytics.methodMap && (n.length > 1 ? e.GameAnalytics.methodMap[n[0]].apply(null, Array.prototype.slice.call(n, 1)) : e.GameAnalytics.methodMap[n[0]]())
        }
        ,
        c.configureAvailableCustomDimensions01 = function(e) {
            void 0 === e && (e = []),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) ? t.w("Available custom dimensions must be set before SDK is initialized") : r.setAvailableCustomDimensions01(e)
            }
            ))
        }
        ,
        c.configureAvailableCustomDimensions02 = function(e) {
            void 0 === e && (e = []),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) ? t.w("Available custom dimensions must be set before SDK is initialized") : r.setAvailableCustomDimensions02(e)
            }
            ))
        }
        ,
        c.configureAvailableCustomDimensions03 = function(e) {
            void 0 === e && (e = []),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) ? t.w("Available custom dimensions must be set before SDK is initialized") : r.setAvailableCustomDimensions03(e)
            }
            ))
        }
        ,
        c.configureAvailableResourceCurrencies = function(e) {
            void 0 === e && (e = []),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) ? t.w("Available resource currencies must be set before SDK is initialized") : r.setAvailableResourceCurrencies(e)
            }
            ))
        }
        ,
        c.configureAvailableResourceItemTypes = function(e) {
            void 0 === e && (e = []),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) ? t.w("Available resource item types must be set before SDK is initialized") : r.setAvailableResourceItemTypes(e)
            }
            ))
        }
        ,
        c.configureBuild = function(e) {
            void 0 === e && (e = ""),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) ? t.w("Build version must be set before SDK is initialized.") : a.validateBuild(e) ? r.setBuild(e) : t.i("Validation fail - configure build: Cannot be null, empty or above 32 length. String: " + e)
            }
            ))
        }
        ,
        c.configureSdkGameEngineVersion = function(e) {
            void 0 === e && (e = ""),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) || (a.validateSdkWrapperVersion(e) ? o.sdkGameEngineVersion = e : t.i("Validation fail - configure sdk version: Sdk version not supported. String: " + e))
            }
            ))
        }
        ,
        c.configureGameEngineVersion = function(e) {
            void 0 === e && (e = ""),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) || (a.validateEngineVersion(e) ? o.gameEngineVersion = e : t.i("Validation fail - configure game engine version: Game engine version not supported. String: " + e))
            }
            ))
        }
        ,
        c.configureUserId = function(e) {
            void 0 === e && (e = ""),
            n.performTaskOnGAThread((function() {
                c.isSdkReady(!0, !1) ? t.w("A custom user id must be set before SDK is initialized.") : a.validateUserId(e) ? r.setUserId(e) : t.i("Validation fail - configure user_id: Cannot be null, empty or above 64 length. Will use default user_id method. Used string: " + e)
            }
            ))
        }
        ,
        c.initialize = function(e, i) {
            void 0 === e && (e = ""),
            void 0 === i && (i = ""),
            o.updateConnectionType();
            var s = n.createTimedBlock();
            s.async = !0,
            c.initTimedBlockId = s.id,
            s.block = function() {
                c.isSdkReady(!0, !1) ? t.w("SDK already initialized. Can only be called once.") : a.validateKeys(e, i) ? (r.setKeys(e, i),
                c.internalInitialize()) : t.w("SDK failed initialize. Game key or secret key is invalid. Can only contain characters A-z 0-9, gameKey is 32 length, gameSecret is 40 length. Failed keys - gameKey: " + e + ", secretKey: " + i)
            }
            ,
            n.performTimedBlockOnGAThread(s)
        }
        ,
        c.addBusinessEvent = function(e, t, i, s, a, d, u) {
            if (void 0 === e && (e = ""),
            void 0 === t && (t = 0),
            void 0 === i && (i = ""),
            void 0 === s && (s = ""),
            void 0 === a && (a = ""),
            void 0 === d && (d = {}),
            void 0 === u && (u = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add business event"))
                    return;
                l.addBusinessEvent(e, t, i, s, a, d, u)
            } else
                n.performTaskOnGAThread((function() {
                    c.isSdkReady(!0, !0, "Could not add business event") && l.addBusinessEvent(e, t, i, s, a, d, u)
                }
                ))
        }
        ,
        c.addResourceEvent = function(t, i, s, a, d, u, v) {
            if (void 0 === t && (t = e.EGAResourceFlowType.Undefined),
            void 0 === i && (i = ""),
            void 0 === s && (s = 0),
            void 0 === a && (a = ""),
            void 0 === d && (d = ""),
            void 0 === u && (u = {}),
            void 0 === v && (v = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add resource event"))
                    return;
                l.addResourceEvent(t, i, s, a, d, u, v)
            } else
                n.performTaskOnGAThread((function() {
                    c.isSdkReady(!0, !0, "Could not add resource event") && l.addResourceEvent(t, i, s, a, d, u, v)
                }
                ))
        }
        ,
        c.addProgressionEvent = function(t, i, s, a, d, u, v) {
            if (void 0 === t && (t = e.EGAProgressionStatus.Undefined),
            void 0 === i && (i = ""),
            void 0 === s && (s = ""),
            void 0 === a && (a = ""),
            void 0 === u && (u = {}),
            void 0 === v && (v = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add progression event"))
                    return;
                var g = "number" == typeof d;
                l.addProgressionEvent(t, i, s, a, g ? d : 0, g, u, v)
            } else
                n.performTaskOnGAThread((function() {
                    if (c.isSdkReady(!0, !0, "Could not add progression event")) {
                        var e = "number" == typeof d;
                        l.addProgressionEvent(t, i, s, a, e ? d : 0, e, u, v)
                    }
                }
                ))
        }
        ,
        c.addDesignEvent = function(e, t, i, s) {
            if (void 0 === i && (i = {}),
            void 0 === s && (s = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add design event"))
                    return;
                var a = "number" == typeof t;
                l.addDesignEvent(e, a ? t : 0, a, i, s)
            } else
                n.performTaskOnGAThread((function() {
                    if (c.isSdkReady(!0, !0, "Could not add design event")) {
                        var n = "number" == typeof t;
                        l.addDesignEvent(e, n ? t : 0, n, i, s)
                    }
                }
                ))
        }
        ,
        c.addErrorEvent = function(t, i, s, a) {
            if (void 0 === t && (t = e.EGAErrorSeverity.Undefined),
            void 0 === i && (i = ""),
            void 0 === s && (s = {}),
            void 0 === a && (a = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add error event"))
                    return;
                l.addErrorEvent(t, i, s, a)
            } else
                n.performTaskOnGAThread((function() {
                    c.isSdkReady(!0, !0, "Could not add error event") && l.addErrorEvent(t, i, s, a)
                }
                ))
        }
        ,
        c.addAdEventWithNoAdReason = function(t, i, s, a, d, u, v) {
            if (void 0 === t && (t = e.EGAAdAction.Undefined),
            void 0 === i && (i = e.EGAAdType.Undefined),
            void 0 === s && (s = ""),
            void 0 === a && (a = ""),
            void 0 === d && (d = e.EGAAdError.Undefined),
            void 0 === u && (u = {}),
            void 0 === v && (v = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add ad event"))
                    return;
                l.addAdEvent(t, i, s, a, d, 0, !1, u, v)
            } else
                n.performTaskOnGAThread((function() {
                    c.isSdkReady(!0, !0, "Could not add ad event") && l.addAdEvent(t, i, s, a, d, 0, !1, u, v)
                }
                ))
        }
        ,
        c.addAdEventWithDuration = function(t, i, s, a, d, u, v) {
            if (void 0 === t && (t = e.EGAAdAction.Undefined),
            void 0 === i && (i = e.EGAAdType.Undefined),
            void 0 === s && (s = ""),
            void 0 === a && (a = ""),
            void 0 === d && (d = 0),
            void 0 === u && (u = {}),
            void 0 === v && (v = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add ad event"))
                    return;
                l.addAdEvent(t, i, s, a, e.EGAAdError.Undefined, d, !0, u, v)
            } else
                n.performTaskOnGAThread((function() {
                    c.isSdkReady(!0, !0, "Could not add ad event") && l.addAdEvent(t, i, s, a, e.EGAAdError.Undefined, d, !0, u, v)
                }
                ))
        }
        ,
        c.addAdEvent = function(t, i, s, a, d, u) {
            if (void 0 === t && (t = e.EGAAdAction.Undefined),
            void 0 === i && (i = e.EGAAdType.Undefined),
            void 0 === s && (s = ""),
            void 0 === a && (a = ""),
            void 0 === d && (d = {}),
            void 0 === u && (u = !1),
            o.updateConnectionType(),
            r.instance.isUnloading) {
                if (!c.isSdkReady(!0, !0, "Could not add ad event"))
                    return;
                l.addAdEvent(t, i, s, a, e.EGAAdError.Undefined, 0, !1, d, u)
            } else
                n.performTaskOnGAThread((function() {
                    c.isSdkReady(!0, !0, "Could not add ad event") && l.addAdEvent(t, i, s, a, e.EGAAdError.Undefined, 0, !1, d, u)
                }
                ))
        }
        ,
        c.setEnabledInfoLog = function(e) {
            void 0 === e && (e = !1),
            n.performTaskOnGAThread((function() {
                e ? (t.setInfoLog(e),
                t.i("Info logging enabled")) : (t.i("Info logging disabled"),
                t.setInfoLog(e))
            }
            ))
        }
        ,
        c.setEnabledVerboseLog = function(e) {
            void 0 === e && (e = !1),
            n.performTaskOnGAThread((function() {
                e ? (t.setVerboseLog(e),
                t.i("Verbose logging enabled")) : (t.i("Verbose logging disabled"),
                t.setVerboseLog(e))
            }
            ))
        }
        ,
        c.setEnabledManualSessionHandling = function(e) {
            void 0 === e && (e = !1),
            n.performTaskOnGAThread((function() {
                r.setManualSessionHandling(e)
            }
            ))
        }
        ,
        c.setEnabledEventSubmission = function(e) {
            void 0 === e && (e = !1),
            n.performTaskOnGAThread((function() {
                e ? (r.setEnabledEventSubmission(e),
                t.i("Event submission enabled")) : (t.i("Event submission disabled"),
                r.setEnabledEventSubmission(e))
            }
            ))
        }
        ,
        c.setCustomDimension01 = function(e) {
            void 0 === e && (e = ""),
            n.performTaskOnGAThread((function() {
                a.validateDimension01(e, r.getAvailableCustomDimensions01()) ? r.setCustomDimension01(e) : t.w("Could not set custom01 dimension value to '" + e + "'. Value not found in available custom01 dimension values")
            }
            ))
        }
        ,
        c.setCustomDimension02 = function(e) {
            void 0 === e && (e = ""),
            n.performTaskOnGAThread((function() {
                a.validateDimension02(e, r.getAvailableCustomDimensions02()) ? r.setCustomDimension02(e) : t.w("Could not set custom02 dimension value to '" + e + "'. Value not found in available custom02 dimension values")
            }
            ))
        }
        ,
        c.setCustomDimension03 = function(e) {
            void 0 === e && (e = ""),
            n.performTaskOnGAThread((function() {
                a.validateDimension03(e, r.getAvailableCustomDimensions03()) ? r.setCustomDimension03(e) : t.w("Could not set custom03 dimension value to '" + e + "'. Value not found in available custom03 dimension values")
            }
            ))
        }
        ,
        c.setGlobalCustomEventFields = function(e) {
            void 0 === e && (e = {}),
            n.performTaskOnGAThread((function() {
                t.i("Set global custom event fields: " + JSON.stringify(e)),
                r.instance.currentGlobalCustomEventFields = e
            }
            ))
        }
        ,
        c.setEventProcessInterval = function(e) {
            n.performTaskOnGAThread((function() {
                n.setEventProcessInterval(e)
            }
            ))
        }
        ,
        c.startSession = function() {
            if (r.isInitialized()) {
                var e = n.createTimedBlock();
                e.async = !0,
                c.initTimedBlockId = e.id,
                e.block = function() {
                    r.isEnabled() && r.sessionIsStarted() && n.endSessionAndStopQueue(),
                    c.resumeSessionAndStartQueue()
                }
                ,
                n.performTimedBlockOnGAThread(e)
            }
        }
        ,
        c.endSession = function() {
            c.onStop()
        }
        ,
        c.onStop = function() {
            n.performTaskOnGAThread((function() {
                try {
                    n.endSessionAndStopQueue()
                } catch (e) {}
            }
            ))
        }
        ,
        c.onResume = function() {
            var e = n.createTimedBlock();
            e.async = !0,
            c.initTimedBlockId = e.id,
            e.block = function() {
                c.resumeSessionAndStartQueue()
            }
            ,
            n.performTimedBlockOnGAThread(e)
        }
        ,
        c.getRemoteConfigsValueAsString = function(e, n) {
            return void 0 === n && (n = null),
            r.getConfigurationStringValue(e, n)
        }
        ,
        c.isRemoteConfigsReady = function() {
            return r.isRemoteConfigsReady()
        }
        ,
        c.addRemoteConfigsListener = function(e) {
            r.addRemoteConfigsListener(e)
        }
        ,
        c.removeRemoteConfigsListener = function(e) {
            r.removeRemoteConfigsListener(e)
        }
        ,
        c.getRemoteConfigsContentAsString = function() {
            return r.getRemoteConfigsContentAsString()
        }
        ,
        c.getABTestingId = function() {
            return r.getABTestingId()
        }
        ,
        c.getABTestingVariantId = function() {
            return r.getABTestingVariantId()
        }
        ,
        c.addOnBeforeUnloadListener = function(e) {
            r.addOnBeforeUnloadListener(e)
        }
        ,
        c.removeOnBeforeUnloadListener = function(e) {
            r.removeOnBeforeUnloadListener(e)
        }
        ,
        c.internalInitialize = function() {
            r.ensurePersistedStates(),
            i.setItem(r.getGameKey(), r.DefaultUserIdKey, r.getDefaultId()),
            r.setInitialized(!0),
            c.newSession(),
            r.isEnabled() && n.ensureEventQueueIsRunning()
        }
        ,
        c.newSession = function() {
            t.i("Starting a new session."),
            r.validateAndFixCurrentDimensions(),
            s.instance.requestInit(r.instance.configsHash, c.startNewSessionCallback)
        }
        ,
        c.startNewSessionCallback = function(e, s) {
            if (e !== d.Ok && e !== d.Created || !s)
                e == d.Unauthorized ? (t.w("Initialize SDK failed - Unauthorized"),
                r.instance.initAuthorized = !1) : (e === d.NoResponse || e === d.RequestTimeout ? t.i("Init call (session start) failed - no response. Could be offline or timeout.") : e === d.BadResponse || e === d.JsonEncodeFailed || e === d.JsonDecodeFailed ? t.i("Init call (session start) failed - bad response. Could be bad response from proxy or GA servers.") : e !== d.BadRequest && e !== d.UnknownResponseCode || t.i("Init call (session start) failed - bad request or unknown response."),
                null == r.instance.sdkConfig ? null != r.instance.sdkConfigCached ? (t.i("Init call (session start) failed - using cached init values."),
                r.instance.sdkConfig = r.instance.sdkConfigCached) : (t.i("Init call (session start) failed - using default init values."),
                r.instance.sdkConfig = r.instance.sdkConfigDefault) : t.i("Init call (session start) failed - using cached init values."),
                r.instance.initAuthorized = !0);
            else {
                var o = 0;
                if (s.server_ts) {
                    var a = s.server_ts;
                    o = r.calculateServerTimeOffset(a)
                }
                if (s.time_offset = o,
                e != d.Created) {
                    var v = r.getSdkConfig();
                    v.configs && (s.configs = v.configs),
                    v.configs_hash && (s.configs_hash = v.configs_hash),
                    v.ab_id && (s.ab_id = v.ab_id),
                    v.ab_variant_id && (s.ab_variant_id = v.ab_variant_id)
                }
                r.instance.configsHash = s.configs_hash ? s.configs_hash : "",
                r.instance.abId = s.ab_id ? s.ab_id : "",
                r.instance.abVariantId = s.ab_variant_id ? s.ab_variant_id : "",
                i.setItem(r.getGameKey(), r.SdkConfigCachedKey, u.encode64(JSON.stringify(s))),
                r.instance.sdkConfigCached = s,
                r.instance.sdkConfig = s,
                r.instance.initAuthorized = !0
            }
            if (r.instance.clientServerTimeOffset = r.getSdkConfig().time_offset ? r.getSdkConfig().time_offset : 0,
            r.populateConfigurations(r.getSdkConfig()),
            !r.isEnabled())
                return t.w("Could not start session: SDK is disabled."),
                void n.stopEventQueue();
            n.ensureEventQueueIsRunning();
            var g = u.createGuid();
            r.instance.sessionId = g,
            r.instance.sessionStart = r.getClientTsAdjusted(),
            l.addSessionStartEvent();
            var f = n.getTimedBlockById(c.initTimedBlockId);
            null != f && (f.running = !1),
            c.initTimedBlockId = -1
        }
        ,
        c.resumeSessionAndStartQueue = function() {
            r.isInitialized() && (t.i("Resuming session."),
            r.sessionIsStarted() || c.newSession())
        }
        ,
        c.isSdkReady = function(e, n, i) {
            return void 0 === n && (n = !0),
            void 0 === i && (i = ""),
            i && (i += ": "),
            e && !r.isInitialized() ? (n && t.w(i + "SDK is not initialized"),
            !1) : e && !r.isEnabled() ? (n && t.w(i + "SDK is disabled"),
            !1) : !(e && !r.sessionIsStarted()) || (n && t.w(i + "Session has not started yet"),
            !1)
        }
        ,
        c.initTimedBlockId = -1,
        c.methodMap = {},
        c
    }();
    e.GameAnalytics = c
}(i || (i = {})),
i.GameAnalytics.init();
i.GameAnalytics.gaCommand;
globalThis.gameanalytics = i;
