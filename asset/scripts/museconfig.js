/*
 Copyright 2011-2016 Adobe Systems Incorporated. All Rights Reserved.
*/
(function () {
    var a = {
            waitSeconds: 0,
            paths: {
                "html5shiv": "../../../themes/FeuilletNumerique/asset/scripts/html5shiv.js?crc=4241844378",
                "jquery": "../../../themes/FeuilletNumerique/asset/scripts/jquery-1.8.3.min.js?crc=209076791",
                "jquery.musemenu": "../../../themes/FeuilletNumerique/asset/scripts/jquery.musemenu.js?crc=507538709",
                "jquery.museoverlay": "../../../themes/FeuilletNumerique/asset/scripts/jquery.museoverlay.js?crc=3765439314",
                "jquery.musepolyfill.bgsize": "../../../themes/FeuilletNumerique/asset/scripts/jquery.musepolyfill.bgsize.js?crc=4262302383",
                "jquery.museresponsive": "../../../themes/FeuilletNumerique/asset/scripts/jquery.museresponsive.js?crc=159461060",
                "jquery.scrolleffects": "../../../themes/FeuilletNumerique/asset/scripts/jquery.scrolleffects.js?crc=64263717",
                "jquery.watch": "../../../themes/FeuilletNumerique/asset/scripts/jquery.watch.js?crc=4146793168",
                "musedisclosure": "../../../themes/FeuilletNumerique/asset/scripts/musedisclosure.js?crc=40483772",
                "museutils": "../../../themes/FeuilletNumerique/asset/scripts/museutils.js?crc=3977567354",
                "musewpdisclosure": "../../../themes/FeuilletNumerique/asset/scripts/musewpdisclosure.js?crc=47145737",
                "musewpslideshow": "../../../themes/FeuilletNumerique/asset/scripts/musewpslideshow.js?crc=20506143",
                "pie": "../../../themes/FeuilletNumerique/asset/scripts/pie.js?crc=3827607177",
                "taketori": "../../../themes/FeuilletNumerique/asset/scripts/taketori.js?crc=214255737",
                "touchswipe": "../../../themes/FeuilletNumerique/asset/scripts/touchswipe.js?crc=4065839998",
                "webpro": "../../../themes/FeuilletNumerique/asset/scripts/webpro.js?crc=4008207987",
                "whatinput": "../../../themes/FeuilletNumerique/asset/scripts/whatinput.js?crc=86476730"
            },
            shim: {
                "jquery.musemenu": {
                    "deps": ["jquery", "museutils"]
                },
                "jquery.museoverlay": {
                    "deps": ["jquery", "museutils"]
                },
                "jquery.musepolyfill.bgsize": {
                    "deps": ["jquery", "museutils"]
                },
                "jquery.museresponsive": {
                    "deps": ["jquery", "museutils"]
                },
                "jquery.scrolleffects": {
                    "deps": ["jquery", "museutils"]
                },
                "jquery.watch": {
                    "deps": ["jquery"]
                },
                "musedisclosure": {
                    "deps": ["jquery", "museutils"]
                },
                "museutils": {
                    "deps": ["jquery"]
                },
                "musewpdisclosure": {
                    "deps": ["jquery", "webpro", "museutils"]
                },
                "musewpslideshow": {
                    "deps": ["jquery", "webpro", "museutils"]
                },
                "pie": {
                    "deps": ["jquery"]
                },
                "touchswipe": {
                    "deps": ["jquery"]
                },
                "webpro": {
                    "deps": ["jquery", "museutils"]
                }
            }
        },
        b = function (a, b) {
            for (var c = 0, d = a.length; c < d; c++)
                if (a[c] == b) return c;
            return -1
        };
    if ("undefined" !== typeof $)
        for (var c in a.shim) {
            var d = b(a.shim[c].deps, "jquery");
            0 <= d && a.shim[c].deps.splice(d, 1)
        }
    //if (true && document.location.protocol != "https:") a.paths.jquery = ["http://musecdn.businesscatalyst.com/scripts/4.0/jquery-1.8.3.min", a.paths.jquery];
    define.amd = null;
    requirejs.config(a);
    muse_init()
})();;
(function () {
    if (!("undefined" == typeof Muse || "undefined" == typeof Muse.assets)) {
        var a = function (a, b) {
            for (var c = 0, d = a.length; c < d; c++)
                if (a[c] == b) return c;
            return -1
        }(Muse.assets.required, "museconfig.js");
        if (-1 != a) {
            Muse.assets.required.splice(a, 1);
            for (var a = document.getElementsByTagName("meta"), b = 0, c = a.length; b < c; b++) {
                var d = a[b];
                if ("generator" == d.getAttribute("name")) {
                    "2015.2.0.352" != d.getAttribute("content") && Muse.assets.outOfDate.push("museconfig.js");
                    break
                }
            }
        }
    }
})();