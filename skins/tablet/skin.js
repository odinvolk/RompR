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

function showHistory() {
    $('#historypanel').slideToggle('fast');
}

var layoutProcessor = function() {

    function isLandscape() {
        if (window.innerHeight > window.innerWidth) {
            return false;
        } else {
            return true;
        }
    }

    return {

        supportsDragDrop: false,
        hasCustomScrollbars: false,
        usesKeyboard: false,
        sortFaveRadios: false,
        openOnImage: false,

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
                $('#pscroller').scrollTo(('.playlistcurrentitem'), 800, {offset: {top: offset}, easing: 'swing'});
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
                if (element.parent().hasClass('album1')) {
                    var c = 'dropmenu notfilled album1';
                } else if (element.parent().hasClass('album2')) {
                    var c = 'dropmenu notfilled album2';
                } else {
                    var c = 'dropmenu notfilled';
                }
                var t = $('<div>', {id: name, class: c}).insertAfter(element.parent());
            }
        },
        
        getArtistDestinationDiv: function(menutoopen) {
            if (prefs.sortcollectionby == "artist") {
                return $("#"+menutoopen).parent();
            } else {
                return $("#"+menutoopen);
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
        },
        
        postPlaylistLoad: function() {
            $('#pscroller').find('.icon-cancel-circled').each(function() {
                var d = $('<i>', {class: 'icon-updown playlisticonr fixed clickable clickicon rearrange_playlist'}).insertBefore($(this));
            });
        },
        
        getElementPlaylistOffset: function(element) {
            return element.position().top;
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
