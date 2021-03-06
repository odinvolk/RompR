jQuery.fn.menuReveal = function(callback) {
    if (this.hasClass('toggledown')) {
        if (callback) {
            this.slideToggle('fast',callback);
        } else {
            this.slideToggle('fast');
        }
    } else {
        this.findParentScroller().saveScrollPos();
        if (callback) {
            this.show(0, callback);
        } else {
            this.show();
        }
    }
    return this;
}

jQuery.fn.menuHide = function(callback) {
    var self = this;
    if (this.hasClass('toggledown')) {
        if (callback) {
            this.slideToggle('fast',callback);
        } else {
            this.slideToggle('fast');
        }
    } else {
        this.hide(0, function() {
            if (callback) {
                callback();
            }
            self.findParentScroller().restoreScrollPos();
            if (self.hasClass('removeable')) {
                self.remove();
            }
        });
    }
    return this;
}

jQuery.fn.isOpen = function() {
    if (this.hasClass('backmenu') || $('#'+this.attr('name')).is(':visible')) {
        return true;
    } else {
        return false;
    }
}

jQuery.fn.isClosed = function() {
    if (this.hasClass('backmenu') || $('#'+this.attr('name')).is(':visible')) {
        return false;
    } else {
        return true;
    }
}

jQuery.fn.makeSpinner = function() {
    if (this.hasClass('icon-toggle-closed') ||
        this.hasClass('icon-toggle-open') ||
        this.hasClass('podicon')) {
        return this.each(function() {
            var originalclasses = new Array();
            var classes = '';
            if ($(this).attr("class")) {
                var classes = $(this).attr("class").split(/\s/);
            }
            for (var i = 0, len = classes.length; i < len; i++) {
                if (classes[i] == "invisible" || (/^icon/.test(classes[i]))) {
                    originalclasses.push(classes[i]);
                    $(this).removeClass(classes[i]);
                }
            }
            $(this).attr("originalclass", originalclasses.join(" "));
            $(this).addClass('icon-spin6 spinner');
        });
    } else {
        this.addClass('clickflash');
        return this;
    }
}

jQuery.fn.stopSpinner = function() {
    if (this.hasClass('spinner')) {
        return this.each(function() {
            $(this).removeClass('icon-spin6 spinner');
            if ($(this).attr("originalclass")) {
                $(this).addClass($(this).attr("originalclass"));
                $(this).removeAttr("originalclass");
            }
        });
    
    } else {
        this.removeClass('clickflash');
        return this;
    }
}

jQuery.fn.findParentScroller = function() {
    var parentScroller = this.parent();
    while (!parentScroller.hasClass('scroller') && !parentScroller.hasClass('dropmenu') && !parentScroller.hasClass('phone')) {
        parentScroller = parentScroller.parent();
    }
    return parentScroller;
}

jQuery.fn.saveScrollPos = function() {
    this.prepend('<input type="hidden" name="restorescrollpos" value="'+this.scrollTop()+'" />');
    this.scrollTo(0);
    this.css('overflow-y', 'hidden');
}

jQuery.fn.restoreScrollPos = function() {
    var a = this.find('input[name="restorescrollpos"]');
    this.css('overflow-y', 'scroll');
    this.scrollTop(a.val());
    a.remove();
}

jQuery.fn.makeTagMenu = function(options) {
    var settings = $.extend({
        textboxname: "",
        textboxextraclass: "",
        labelhtml: "",
        populatefunction: null,
        buttontext: null,
        buttonfunc: null,
        buttonclass: ""
    },options);

    this.each(function() {
        var tbc = "enter";
        if (settings.textboxextraclass) {
            tbc = tbc + " "+settings.textboxextraclass;
        }
        $(this).append(settings.labelhtml);
        var holder = $('<div>', { class: "expand"}).appendTo($(this));
        var dropbutton = $('<i>', { class: 'fixed combo-button'}).appendTo($(this));
        var textbox = $('<input>', { type: "text", class: tbc, name: settings.textboxname }).appendTo(holder);
        var dropbox = $('<div>', {class: "drop-box tagmenu dropshadow"}).appendTo(holder);
        var menucontents = $('<div>', {class: "tagmenu-contents"}).appendTo(dropbox);
        if (settings.buttontext !== null) {
            var submitbutton = $('<button>', {class: "fixed"+settings.buttonclass,
                style: "margin-left: 8px"}).appendTo($(this));
            submitbutton.html(settings.buttontext);
            if (settings.buttonfunc) {
                submitbutton.click(function() {
                    settings.buttonfunc(textbox.val());
                });
            }
        }

        dropbutton.click(function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            if (dropbox.is(':visible')) {
                dropbox.slideToggle('fast');
            } else {
                var data = settings.populatefunction(function(data) {
                    menucontents.empty();
                    for (var i in data) {
                        var d = $('<div>', {class: "backhi"}).appendTo(menucontents);
                        d.html(data[i]);
                        d.click(function() {
                            var cv = textbox.val();
                            if (cv != "") {
                                cv += ",";
                            }
                            cv += $(this).html();
                            textbox.val(cv);
                        });
                    }
                    dropbox.slideToggle('fast');
                });
            }
        });
    });
}

jQuery.fn.fanoogleMenus = function() {
    return this;
}

/* Touchwipe for playlist only, based on the more general jquery touchwipe */
/*! jquery.touchwipe - v1.3.0 - 2015-01-08
* Copyright (c) 2015 Josh Stafford; Licensed MIT */

/* This version ignores all vertical swipes but adds a long press function
   and uses the touchend event instead of a timer to make the action happen */

jQuery.fn.playlistTouchWipe = function(settings) {
        
    var config = {
        min_move_x: 20,
        min_move_y: 20,
        swipeSpeed: 300,
        swipeDistance: 120,
        longPressTime: 1000,
        preventDefaultEvents: false, // prevent default on swipe
        preventDefaultEventsX: true, // prevent default is touchwipe is triggered on horizontal movement
        preventDefaultEventsY: true // prevent default is touchwipe is triggered on vertical movement
    };

    if (settings) {
        $.extend(config, settings);
    }

    this.each(function() {
        var startX;
        var startY;
        var isMoving = false;
        var touchesX = [];
        var touchesY = [];
        var self = this;
        var starttime = 0;
        var longpresstimer = null;
        var pressing = false;
  
        function cancelTouch() {
            clearTimeout(longpresstimer);
            this.removeEventListener('touchmove', onTouchMove);
            this.removeEventListener('touchend', onTouchEnd);
            startX = null;
            startY = null;
            isMoving = false;
            pressing = false;
        }

        function onTouchEnd(e) {
            var time = Date.now();
            clearTimeout(longpresstimer);
            if (pressing) {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                pressing = false;
                setTimeout(bindPlaylistClicks, 500);
            } else if (isMoving) {
                var dx = touchesX.pop();
                touchesX.push(dx);
                if (time - starttime < config.swipeSpeed && dx > config.swipeDistance) {
                    touchesX.push($(self).outerWidth(true));
                    if ($(self).hasClass('item')) {
                        $(self).next().animate({left: 0 - $(self).outerWidth(true)}, 'fast', 'swing');
                    }
                    $(self).animate({left: 0 - $(self).outerWidth(true)}, 'fast', 'swing', doAction);
                } else {
                    doAction();
                }
            }
        }
        
        function doAction() {
            var dxFinal, dyFinal;
            cancelTouch();
            dxFinal = touchesX.pop();
            touchesX = [];
            if (dxFinal > ($(self).outerWidth(true)*0.75)) {
                if ($(self).hasClass('track')) {
                    playlist.delete($(self).attr('romprid'));
                } else if ($(self).hasClass('item')) {
                    playlist.deleteGroup($(self).attr('name'));
                }
            } else {
                $(self).animate({left: 0}, 'fast', 'swing');
                if ($(self).hasClass('item')) {
                    $(self).next().animate({left: 0}, 'fast', 'swing');
                }
            }
        }

        function onTouchMove(e) {
            clearTimeout(longpresstimer);
            if(config.preventDefaultEvents) {
                e.preventDefault();
            }

            if (isMoving) {
                var x = e.touches[0].pageX;
                var y = e.touches[0].pageY;
                var dx = startX - x;
                var dy = startY - y;
                                
                if (Math.abs(dx) >= config.min_move_x) {
                    if (config.preventDefaultEventsX) {
                        e.preventDefault();
                    }
                    var newpos = 0 - dx;
                    if (newpos < 0) {
                        $(self).css('left', newpos.toString()+'px');
                        if ($(self).hasClass('item')) {
                            $(self).next().css('left', newpos.toString()+'px');
                        }
                        touchesX.push(dx);
                    }
                }
            }
        }
        
        function longPress() {
            debug.log("TOUCHWIPE","Long Press");
            pressing = true;
            // Unbind click handler from playlist, otherwise the touchend
            // event makes it start playing the clicked track.
            // Don't seem to be able to prevent the event propagating.
            $(self).addBunnyEars();
            unbindPlaylistClicks();
        }

        function onTouchStart(e) {
            starttime = Date.now();
            if (e.touches.length === 1) {
                startX = e.touches[0].pageX;
                startY = e.touches[0].pageY;
                isMoving = true;
                this.addEventListener('touchmove', onTouchMove, false);
                this.addEventListener('touchend', onTouchEnd, false);
                longpresstimer = setTimeout(longPress, config.longPressTime);
            }
        }

        this.addEventListener('touchstart', onTouchStart, false);

    });

    return this;
};


function showHistory() {
    if ($('#historypanel').find('.configtitle').length > 0) {
        $('#historypanel').slideToggle('fast');
    }
}

var layoutProcessor = function() {

    function isLandscape() {
        if (window.innerHeight > window.innerWidth) {
            return false;
        } else {
            return true;
        }
    }
    
    function doSwipeCss() {
        if (prefs.playlistswipe) {
            $('<style id="playlist_swipe">#sortable .playlisticonr.icon-cancel-circled { display: none }</style>').appendTo('head');
        } else {
            $('style[id="playlist_swipe"]').remove();
        }
    }
    
    return {

        supportsDragDrop: false,
        hasCustomScrollbars: false,
        usesKeyboard: false,
        sortFaveRadios: false,
        openOnImage: true,
        swipewason: prefs.playlistswipe,

        changeCollectionSortMode: function() {
            collectionHelper.forceCollectionReload();
        },

        bindSourcesClicks: function() {
            $('.mainpane').not('#infobar').not('#playlistm').not('#prefsm').not('#infopane').bindPlayClicks();
        },

        postAlbumActions: function() {

        },

        afterHistory: function() {
            browser.rePoint();
            showHistory();
        },

        addInfoSource: function(name, obj) {
            $("#chooserbuttons").append($('<i>', {
                onclick: "browser.switchsource('"+name+"')",
                class: obj.icon+' topimg expand',
                id: "button_source"+name
            }));
        },

        setupInfoButtons: function() { },

        goToBrowserPanel: function(panel) {
            $('#infopane').scrollTo('#'+panel+'information',800,{easing: 'swing'});
        },

        goToBrowserPlugin: function(panel) {
            layoutProcessor.sourceControl('infopane');
            layoutProcessor.goToBrowserPanel(panel);
        },

        goToBrowserSection: function(section) {
            // Wikipedia mobile does not return contents
        },

        notifyAddTracks: function() {
            if (!playlist.radioManager.isRunning()) {
                infobar.notify(infobar.NOTIFY, language.gettext("label_addingtracks"));
            }
        },

        hidePanel: function(panel, is_hidden, new_state) { },

        setTagAdderPosition: function(position) {

        },

        setPlaylistHeight: function() {
            var newheight = $("#playlistm").height() - $("#horse").outerHeight(true);
            if ($("#playlistbuttons").is(":visible")) {
                newheight = newheight - $("#playlistbuttons").outerHeight(true) - 2;
            }
            $("#pscroller").css("height", newheight.toString()+"px");
        },

        playlistLoading: function() {
            infobar.notify(infobar.SMARTRADIO, "Preparing. Please Wait A Moment....");
        },

        preHorse: function() {
            if (!$("#playlistbuttons").is(":visible")) {
                // Make the playlist scroller shorter so the window doesn't get a vertical scrollbar
                // while the buttons are being slid down
                var newheight = $("#pscroller").height() - 48;
                $("#pscroller").css("height", newheight.toString()+"px");
            }
        },

        scrollPlaylistToCurrentTrack: function() {
            if (prefs.scrolltocurrent && $('.playlistcurrentitem').length > 0) {
                var offset = 0 - ($('#pscroller').outerHeight(true) / 2);
                $('#pscroller').scrollTo($('.playlistcurrentitem'), 800, {offset: {top: offset}, easing: 'swing'});
            }
        },

        playlistupdate: function(upcoming) {

        },

        addCustomScrollBar: function(value) {
        
        },

        sourceControl: function(source) {
            if (source == 'infopane') {
                $('#infobar').css('display', 'none');
            } else {
                $('#infobar').css('display', '');
            }
            if (source == "playlistm" && $('.choose_playlist').css('font-weight') == '900') {
                // hacky - set an irrelevant css parameter as a flag so we change behaviour
                source = "infobar";
            }
            $('.mainpane:not(.invisible):not(#'+source+')').addClass('invisible');
            $('#'+source).removeClass('invisible');
            prefs.save({chooser: source});
            layoutProcessor.adjustLayout();
            switch (source) {
                case'searchpane':
                    setSearchLabelWidth();
                    break;
                    
                case 'pluginplaylistholder':
                    setSpotiLabelWidth();
                    break;
            }
        },

        adjustLayout: function() {
            infobar.updateWindowValues();
            var ws = getWindowSize();
            var newheight = ws.y-$("#headerbar").outerHeight(true);
            var v = newheight - 32;
            $("#loadsawrappers").css({height: newheight+"px"});
            if ($('#nowplaying').offset().top > 0) {
                var t = $('#toomanywrappers').height() - $('#nowplaying').offset().top + $("#headerbar").outerHeight(true);
                $("#nowplaying").css({height: t+"px"});
                infobar.rejigTheText();
            }
            layoutProcessor.setPlaylistHeight();
            browser.rePoint();
            // Very very wierd thing happeneing, where this button, and only this button
            // gets an inlive css style of display: inline set sometime after page load
            // on a narrow screen. Non of the other onlywides do. Can't figure it out
            // so just clear it here.
            $('.choose_filelist').css('display','');
        },

        displayCollectionInsert: function(d) {
            infobar.notify(infobar.NOTIFY,"Added track to Collection");
            infobar.markCurrentTrack();
            if (prefs.chooser == 'albumlist') {
                switch (prefs.sortcollectionby) {
                    case 'artist':
                        $('#albumlist').scrollTo($('[name="aartist'+d.artistindex+'"]'));
                        break;
                        
                    default:
                        $('#albumlist').scrollTo($('[name="aalbum'+d.albumindex+'"]'));
                        break;
                        
                }
            }
        },

        setProgressTime: function(stats) {
            makeProgressOfString(stats);
        },

        updateInfopaneScrollbars: function() {
        },

        setRadioModeHeader: function(html) {
            $("#plmode").html(html);
        },
        
        makeCollectionDropMenu: function(element, name) {
            var x = $('#'+name);
            // If the dropdown doesn't exist then create it
            if (x.length == 0) {
                if (element.hasClass('album1')) {
                    var c = 'dropmenu notfilled album1';
                } else if (element.hasClass('album2')) {
                    var c = 'dropmenu notfilled album2';
                } else {
                    var c = 'dropmenu notfilled';
                }
                var ec = '';
                if (/aalbum/.test(name) || /aartist/.test(name)) {
                    ec = ' removeable';
                }
                var t = $('<div>', {id: name, class: c+ec}).insertAfter(element);
            }
        },
        
        getArtistDestinationDiv: function(menutoopen) {
            if (prefs.sortcollectionby == "artist") {
                return $('.menu[name="'+menutoopen+'"]').parent();
            } else {
                return  $("#"+menutoopen);
            }
        },

        initialise: function() {

            if (!prefs.checkSet('clickmode')) {
                prefs.clickmode = 'single';
            }
            $(".dropdown").floatingMenu({ });
            $('.topbarmenu').bind('click', function() {
                $('.autohide:visible').not('#'+$(this).attr('name')).slideToggle('fast');
                $('#'+$(this).attr('name')).slideToggle('fast');
            });
            $('.autohide').bind('click', function() {
                $(this).slideToggle('fast');
            });
            setControlClicks();
            $('.choose_nowplaying').click(function(){layoutProcessor.sourceControl('infobar')});
            $('.choose_albumlist').click(function(){layoutProcessor.sourceControl('albumlist')});
            $('.choose_searcher').click(function(){layoutProcessor.sourceControl('searchpane')});
            $('.choose_filelist').click(function(){layoutProcessor.sourceControl('filelist')});
            $('.choose_radiolist').click(function(){layoutProcessor.sourceControl('radiolist')});
            $('.choose_podcastslist').click(function(){layoutProcessor.sourceControl('podcastslist')});
            $('.choose_infopanel').click(function(){layoutProcessor.sourceControl('infopane')});
            $('.choose_playlistman').click(function(){layoutProcessor.sourceControl('playlistman')});
            $('.choose_pluginplaylists').click(function(){layoutProcessor.sourceControl('pluginplaylistholder')});
            $('.choose_prefs').click(function(){layoutProcessor.sourceControl('prefsm')});
            $('#choose_history').click(showHistory);
            $('.icon-rss.npicon').click(function(){podcasts.doPodcast('nppodiput')});
            $('#love').click(nowplaying.love);
            $('.choose_playlist').click(function(){layoutProcessor.sourceControl('playlistm')});
            $("#ratingimage").click(nowplaying.setRating);
            $("#playlistname").parent().next('button').click(player.controller.savePlaylist);
            $('.clear_playlist').click(playlist.clear);
            $("#volume").rangechooser({
                range: 100,
                ends: ['max'],
                onstop: infobar.volumeend,
                whiledragging: infobar.volumemoved,
                orientation: "horizontal"
            });
            doSwipeCss();
        },

        findAlbumDisplayer: function(key) {
            return $('.containerbox.album[name="'+key+'"]');
        },
        
        findArtistDisplayer: function(key) {
            return $('div.menu[name="'+key+'"]');
        },
        
        insertAlbum: function(v) {
            var albumindex = v.id;
            $('#aalbum'+albumindex).html(v.tracklist);
            layoutProcessor.findAlbumDisplayer('aalbum'+albumindex).remove();
            switch (v.type) {
                case 'insertAfter':
                    debug.log("Insert After",v.where);
                    $(v.html).insertAfter(layoutProcessor.findAlbumDisplayer(v.where));
                    break;
        
                case 'insertAtStart':
                    debug.log("Insert At Start",v.where);
                    $(v.html).insertAfter($('#'+v.where).find('div.clickalbum[name="'+v.where+'"]'));
                    break;
            }
        },
        
        removeAlbum: function(key) {
            $('#'+key).findParentScroller().restoreScrollPos();
            $('#'+key).remove();
            layoutProcessor.findAlbumDisplayer(key).remove();
        },
        
        removeArtist: function(key) {
            switch (prefs.sortcollectionby) {
                case 'artist':
                    $('#aartist'+key).findParentScroller().restoreScrollPos();
                    $('#aartist'+key).remove();
                    layoutProcessor.findArtistDisplayer('aartist'+key).remove();
                    break;
                    
                case 'albumbyartist':
                    $('#aartist'+key).remove();
                    break;
                    
            }
            
        },
        
        fixupArtistDiv: function(jq, name) {
            if (prefs.sortcollectionby != 'artist') {
                jq.find('.menu.backmenu').attr('name', name);
            }
        },
        
        getElementPlaylistOffset: function(element) {
            var top = element.position().top;
            if (element.parent().hasClass('trackgroup')) {
                top += element.parent().position().top;
            }
            return top;
        },
        
        postPlaylistLoad: function() {
            if (prefs.playlistswipe) {
                $('#sortable .track').playlistTouchWipe({});
                $('#sortable .item').playlistTouchWipe({});
            } else {
                $('#pscroller').find('.icon-cancel-circled').each(function() {
                    var d = $('<i>', {class: 'icon-updown playlisticonr fixed clickable clickicon rearrange_playlist'}).insertBefore($(this));
                });
            }
        },
        
        postPodcastSubscribe: function(data, index) {
            $('.menuitem[name="podcast_'+index+'"]').fadeOut('fast', function() {
                $('.menuitem[name="podcast_'+index+'"]').remove();
                $('#podcast_'+index).remove();
                $("#fruitbat").html(data);
                $("#fruitbat").find('.fridge').tipTip({edgeOffset: 8});
                infobar.notify(infobar.NOTIFY, "Subscribed to Podcast");
                podcasts.doNewCount();
                layoutProcessor.postAlbumActions();
            });
        }
        
    }

}();

// Dummy functions standing in for widgets we don't use in this version -
// custom scroll bars, tipTip, and drag/drop stuff
jQuery.fn.tipTip = function() {
    return this;
}

jQuery.fn.acceptDroppedTracks = function() {
    return this;
}

jQuery.fn.sortableTrackList = function() {
    return this;
}

jQuery.fn.trackDragger = function() {
    return this;
}
