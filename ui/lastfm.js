function LastFM(user) {

    var lastfm_api_key = "15f7532dff0b8d84635c757f9f18aaa3";
    var lastfm_secret="3ddf4cb9937e015ca4f30296a918a2b0";
    var logged_in = false;
    var username = user;
    var token = "";
    var self=this;
    var lovebanshown = false;
    var queue = new Array();
    var throttle = null;
    var throttleTime = 1000;

    if (prefs.lastfm_session_key !== "" || typeof lastfm_session_key !== 'undefined') {
        logged_in = true;
    }

    this.setThrottling = function(t) {
        throttleTime = Math.max(1000,t);
    }

    this.showloveban = function(flag) {
        if (logged_in && lovebanshown != flag) {
            lovebanshown = flag;
            if (lovebanshown) {
                $("#lastfm").fadeIn('fast');
            } else {
                $("#lastfm").fadeOut('fast');
            }
        }
        $('#lastfm').removeClass('notloved').addClass('notloved');
    }

    this.isLoggedIn = function() {
        return logged_in;
    }

    this.getLanguage = function() {
        switch (prefs.lastfmlang) {
            case "default":
                return null;
                break;
            case "interface":
                return interfaceLanguage;
                break;
            case "browser":
                return browserLanguage;
                break;
            case "user":
                if (prefs.user_lang != "") {
                    return prefs.user_lang;
                } else {
                    return null;
                }
                break;
        }
    }

    this.username = function() {
        return username;
    }
    
    this.startlogin = function() {
        var user = $("#configpanel").find('input[name|="user"]').val();
        self.login(user);
        $("#configpanel").fadeOut(1000);
    }

    this.login = function (user, pass) {

        username = user;
        var options = {api_key: lastfm_api_key, method: "auth.getToken"};
        var keys = getKeys(options);
        var it = "";

        for(var key in keys) {
            it = it+keys[key]+options[keys[key]];
        }
        it = it+lastfm_secret;
        options.api_sig = hex_md5(it);
        options.format = 'json';
        var url = "http://ws.audioscrobbler.com/2.0/";
        var adder = "?";
        var keys = getKeys(options);
        for(var key in keys) {
            url=url+adder+keys[key]+"="+options[keys[key]];
            adder = "&";
        }
        $.get(url, function(data) {
            token = data.token;
            debug.log("LASTFM","Token",token);
            var lfmlog = new popup({
                css: {
                    width: 600,
                    height: 400
                },
                fitheight: true,
                title: language.gettext("lastfm_loginwindow")
            });
            var mywin = lfmlog.create();
            mywin.append('<table align="center" cellpadding="2" id="lfmlogintable" width="90%"></table>');
            $("#lfmlogintable").append('<tr><td>'+language.gettext("lastfm_login1")+'</td></tr>');
            $("#lfmlogintable").append('<tr><td>'+language.gettext("lastfm_login2")+'</td></tr>');
            $("#lfmlogintable").append('<tr><td align="center"><a href="http://www.last.fm/api/auth/?api_key='+lastfm_api_key+'&token='+token+'" target="_blank">'+
                                        '<button>'+language.gettext("lastfm_loginbutton")+'</button></a></td></tr>');
            $("#lfmlogintable").append('<tr><td>'+language.gettext("lastfm_login3")+'</td></tr>');
            lfmlog.addCloseButton('OK',lastfm.finishlogin);
            lfmlog.open();
        });
    }

    this.finishlogin = function() {
        debug.log("LAST.FM","Finishing login");
        LastFMSignedRequest(
            {
                token: token,
                format: 'json',
                api_key: lastfm_api_key,
                method: "auth.getSession"
            },
            function(data) {
                debug.log("LASTFM","Got Session Key : ",data);
                var lastfm_session_key = data.session.key;
                logged_in = true;
                prefs.save({
                    lastfm_session_key: lastfm_session_key,
                    lastfm_user: username
                });
            },
            function(data) {
                alert(language.gettext("lastfm_loginfailed"));
            }
        );
        return true;
    }

    this.flushReqids = function() {
        clearTimeout(throttle);
        for (var i = queue.length-1; i >= 0; i--) {
            if (queue[i].flag == false && queue[i].reqid) {
                queue.splice(i, 1);
            }
        }
        throttle = setTimeout(lastfm.getRequest, throttleTime);
    }

    this.formatBio = function(bio, link) {
        debug.trace("LASTFM","    Formatting Bio");
        if (bio) {
            bio = bio.replace(/\n/g, "</p><p>");
            bio = bio.replace(/(<a .*?href="http:\/\/.*?")/g, '$1 target="_blank"');
            bio = bio.replace(/(<a .*?href="https:\/\/.*?")/g, '$1 target="_blank"');
            bio = bio.replace(/(<a .*?href=")(\/.*?")/g, '$1https://www.last.fm$2 target="_blank"');
            bio = bio.replace(/\[url=(.*?) .*?\](.*?)\[\/url\]/g, '<a href="$1" target="_blank">$2</a>');
            return bio.fixDodgyLinks();
        } else {
            return "";
        }
    }

    function LastFMGetRequest(options, cache, success, fail, reqid) {
        options.format = "json";
        var url = "http://ws.audioscrobbler.com/2.0/";
        var adder = "?";
        var keys = getKeys(options);
        for(var key in keys) {
            url=url+adder+keys[key]+"="+encodeURIComponent(options[keys[key]]);
            adder = "&";
        }
        queue.push({url: url, success: success, fail: fail, flag: false, cache: cache, reqid: reqid, retries: 0});
        if (throttle == null && queue.length == 1) {
            lastfm.getRequest();
        }
    }

    this.getRequest = function() {
        var req = queue[0];
        clearTimeout(throttle);
        if (req) {
            if (req.flag) {
                debug.trace("LASTFM","Request pulled from queue is already being handled!")
                return;
            }
            queue[0].flag = true;
            debug.trace("LASTFM","Taking next request from queue",req.url);
            if (req.url == "POST") {
                debug.log("LASTFM", "Handling POST request via queue");
                $.ajax({
                    method: "POST",
                    url: "http://ws.audioscrobbler.com/2.0/",
                    data: req.options,
                    dataType: 'json',
                    timeout: 5000,
                    success: function(data) {
                        throttle = setTimeout(lastfm.getRequest, throttleTime);
                        req = queue.shift();
                        debug.log("LASTFM", req.options.method,"request success");
                        if (data.error) {
                            debug.warn("LASTFM","Last FM signed request failed with status",data.error.message);
                            req.fail(data);
                        } else {
                            req.success(data);
                        }
                    },
                    error: function(xhr,status,err) {
                        throttle = setTimeout(lastfm.getRequest, throttleTime);
                        req = queue.shift();
                        debug.error("LASTFM",req.options.method,"request error",xhr,status,err);
                        if (req.retries < 3) {
                            debug.log("LASTFM","Retrying...");
                            req.retries++;
                            req.flag = false;
                            queue.unshift(req);
                        } else {
                            req.fail(null);
                        }
                    }
                });
            } else {
                var getit = $.ajax({
                    dataType: 'json',
                    url: 'browser/backends/getlfmdata.php?use_cache='+req.cache+'&uri='+encodeURIComponent(req.url),
                    success: function(data) {
                        var c = getit.getResponseHeader('Pragma');
                        debug.debug("LASTFM","Request success",c,data);
                        if (c == "From Cache") {
                            throttle = setTimeout(lastfm.getRequest, 100);
                        } else {
                            throttle = setTimeout(lastfm.getRequest, throttleTime);
                        }
                        req = queue.shift();
                        if (data === null) {
                            data = {error: language.gettext("lastfm_error")};
                        }
                        if (data.error) {
                            if (req.reqid || req.reqid === 0) {
                                req.fail(data, req.reqid);
                            } else {
                                req.fail(data);
                            }
                        } else {
                            debug.debug("LASTFM","Calling success callback");
                            if (req.reqid || req.reqid === 0) {
                                req.success(data, req.reqid);
                            } else {
                                req.success(data);
                            }
                        }
                    },
                    error: function(xhr,status,err) {
                        throttle = setTimeout(lastfm.getRequest, throttleTime);
                        req = queue.shift();
                        debug.warn("LASTFM", "Get Request Failed",xhr.status,status,err);
                        if (req.reqid || req.reqid === 0) {
                            req.fail(null, req.reqid);
                        } else {
                            req.fail();
                        }
                    }
                });
            }
        } else {
            throttle = null;
        }
    }

    function LastFMSignedRequest(options, success, fail) {

        // We've passed an object but we need the properties to be in alphabetical order
        var keys = getKeys(options);
        var it = "";
        for(var key in keys) {
            if (keys[key] != 'format' && keys[key] != 'callback') {
                it = it+keys[key]+options[keys[key]];
            }
        }
        it = it+lastfm_secret;
        options.api_sig = hex_md5(it);
        queue.push({
            url: "POST",
            options: options,
            success: success,
            fail: fail,
            flag: false,
            retries : 0
        });
        if (throttle == null && queue.length == 1) {
            lastfm.getRequest();
        }
    }

    var getKeys = function(obj) {
        var keys = [];
        for(var key in obj){
            keys.push(key);
        }
        keys.sort();
        return keys;
    }

    function addGetOptions(options, method) {
        for(var i in options) {
            options[i] = encodeURIComponent(options[i]);
        }
        options.api_key = lastfm_api_key;
        options.autocorrect = prefs.lastfm_autocorrect ? 1 : 0;
        options.method = method;
    }

    function addSetOptions(options, method) {
        options.format = 'json';
        options.api_key = lastfm_api_key;
        options.sk = prefs.lastfm_session_key;
        options.method = method;
    }

    this.track = {

        love : function(options,callback) {
            if (logged_in) {
                addSetOptions(options, "track.love");
                LastFMSignedRequest(
                    options,
                    function() {
                        infobar.notify(infobar.NOTIFY, language.gettext("label_loved")+" "+options.track);
                        callback(true);
                    },
                    function() {
                        infobar.notify(infobar.ERROR, language.gettext("label_lovefailed"));
                    }
                );
            }
        },

        unlove : function(options,callback,callback2) {
            if (logged_in) {
                addSetOptions(options, "track.unlove");
                LastFMSignedRequest(
                    options,
                    function() {
                        infobar.notify(infobar.NOTIFY, language.gettext("label_unloved")+" "+options.track);
                        callback(false);
                    },
                    function() {
                        infobar.notify(infobar.ERROR, language.gettext("label_unlovefailed"));
                    }
                );
            }
        },

        getInfo : function(options, callback, failcallback, reqid) {
            if (username != "") { options.username = username; }
            addGetOptions(options, "track.getInfo");
            if (self.getLanguage()) {
                options.lang = self.getLanguage();
            }
            LastFMGetRequest(
                options,
                true,
                callback,
                function(data) { failcallback({ error: 1, message: language.gettext("label_notrackinfo")}) },
                reqid
            );
        },

        getTags: function(options, callback, failcallback, reqid) {
            if (username != "") { options.user = username; }
            addGetOptions(options, "track.getTags");
            LastFMGetRequest(
                options,
                false,
                callback,
                failcallback,
                reqid
            );
        },

        getSimilar: function(options, callback, failcallback) {
            addGetOptions(options, "track.getSimilar");
            LastFMGetRequest(
                options,
                true,
                callback,
                failcallback
            );
        },

        addTags : function(options, callback, failcallback) {
            if (logged_in) {
                addSetOptions(options, "track.addTags");
                LastFMSignedRequest(
                    options,
                    function() { callback("track", options.tags) },
                    function() { failcallback("track", options.tags) }
                );
            }
        },

        removeTag: function(options, callback, failcallback) {
            if (logged_in) {
                addSetOptions(options, "track.removeTag");
                LastFMSignedRequest(
                    options,
                    function() { callback("track", options.tag); },
                    function() { failcallback("track", options.tag); }
                );
            }
        },

        updateNowPlaying : function(options) {
            if (logged_in && prefs.lastfm_scrobbling) {
                addSetOptions(options, "track.updateNowPlaying");
                LastFMSignedRequest(
                    options,
                    function() {  },
                    function() { debug.warn("LAST FM","Failed to update Now Playing",options) }
                );
            }
        },

        scrobble : function(options) {
            if (logged_in && prefs.lastfm_scrobbling) {
                debug.log("LAST FM","Last.FM is scrobbling");
                addSetOptions(options, "track.scrobble");
                LastFMSignedRequest(
                    options,
                    function() {  },
                    function() { infobar.notify(infobar.ERROR, language.gettext("label_scrobblefailed")+" "+options.track) }
                );
            }
        },

    }

    this.album = {

        getInfo: function(options, callback, failcallback) {
            addGetOptions(options, "album.getInfo");
            if (username != "") { options.username = username }
            options.autocorrect = prefs.lastfm_autocorrect ? 1 : 0;
            if (self.getLanguage()) {
                options.lang = self.getLanguage();
            }
            debug.mark("LASTFM","album.getInfo",options);
            LastFMGetRequest(
                options,
                true,
                callback,
                function() { failcallback({ error: 1,
                                            message: language.gettext("label_noalbuminfo")}); }
            );
        },

        getTags: function(options, callback, failcallback) {
            addGetOptions(options, "album.getTags");
            if (username != "") { options.user = username }
            debug.mark("LASTFM","album.getTags",options);
            LastFMGetRequest(
                options,
                false,
                callback,
                failcallback
            );
        },

        addTags : function(options, callback, failcallback) {
            if (logged_in) {
                addSetOptions(options, "album.addTags");
                LastFMSignedRequest(
                    options,
                    function() { callback("album", options.tags) },
                    function() { failcallback("album", options.tags) }
                );
            }
        },

        removeTag: function(options, callback, failcallback) {
            if (logged_in) {
                addSetOptions(options, "album.removeTag");
                LastFMSignedRequest(
                    options,
                    function() { callback("album", options.tag); },
                    function() { failcallback("album", options.tag); }
                );
            }
        }
    }

    this.artist = {

        getInfo: function(options, callback, failcallback, reqid) {
            addGetOptions(options, "artist.getInfo");
            if (username != "") { options.username = username }
            if (self.getLanguage()) {
                options.lang = self.getLanguage();
            }
            LastFMGetRequest(
                options,
                true,
                callback,
                function() { failcallback({error: 1, message: language.gettext("label_noartistinfo")}); },
                reqid
            );
        },

        getTags: function(options, callback, failcallback) {
            if (username != "") { options.user = username }
            addGetOptions(options, "artist.getTags");
            LastFMGetRequest(
                options,
                false,
                callback,
                failcallback
            );
        },

        addTags : function(options, callback, failcallback) {
            if (logged_in) {
                addSetOptions(options, "artist.addTags");
                LastFMSignedRequest(
                    options,
                    function() { callback("artist", options.tags) },
                    function() { failcallback("artist", options.tags) }
                );
            }
        },

        removeTag: function(options, callback, failcallback) {
            if (logged_in) {
                addSetOptions(options, "artist.removeTag");
                LastFMSignedRequest(
                    options,
                    function() { callback("artist", options.tag); },
                    function() { failcallback("artist", options.tag); }
                );
            }
        },

        getSimilar: function(options, callback, failcallback) {
            addGetOptions(options, "artist.getSimilar");
            LastFMGetRequest(
                options,
                true,
                callback,
                failcallback,
                1
            )
        }

    }

    this.user = {

        getArtistTracks: function(artist, perpage, page, callback, failcallback) {
            var options = { user: username,
                            page: page,
                            limit: perpage,
                            artist: artist
                          };
            addGetOptions(options, "user.getArtistTracks");
            LastFMGetRequest(
                options,
                false,
                callback,
                failcallback,
                1
            )
        },

        getTopArtists: function(options, callback, failcallback) {
            options.user = username;
            addGetOptions(options, "user.getTopArtists");
            LastFMGetRequest(
                options,
                false,
                callback,
                failcallback,
                1
            )
        },

        getTopTracks: function(options, callback, failcallback) {
            options.user = username;
            addGetOptions(options, "user.getTopTracks");
            LastFMGetRequest(
                options,
                false,
                callback,
                failcallback,
                1
            )
        }
    }

    this.library = {

        getArtists: function(perpage, page, callback, failcallback) {
            var options = { user: username,
                            page: page,
                            limit: perpage
                          };
            addGetOptions(options, "library.getArtists");
            LastFMGetRequest(
                options,
                false,
                callback,
                failcallback,
                1
            )
        }

    }
}
