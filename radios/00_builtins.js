var starRadios = function() {

	return {

        setup: function() {

            //
            // 1 star etc
            //
            for (var i = 1; i <= 5; i++) {
                $('#pluginplaylists').append(playlist.radioManager.standardBox('starradios', i+'stars', 'icon-'+i+'-stars', language.gettext('playlist_xstar', [i])));
            }
			
			//
            // Tag
            //
            var a = $('<div>', {class: "menuitem containerbox fullwidth"}).appendTo('#pluginplaylists');
            var c = $('<div>', {class: "containerbox expand spacer dropdown-container"}).
                appendTo(a).makeTagMenu({
                textboxname: 'cynthia',
                labelhtml: '<i class="smallcover icon-tags svg-square"></i>',
                populatefunction: tagAdder.populateTagMenu,
                buttontext: language.gettext('button_playradio'),
                buttonfunc: starRadios.tagPopulate
            });

            //
            // All Tracks at random
            //
            $('#pluginplaylists').append(playlist.radioManager.standardBox('starradios', 'allrandom', 'icon-allrandom', language.gettext('label_allrandom')));

            //
            // Never Played Tracks
            //
            $('#pluginplaylists').append(playlist.radioManager.standardBox('starradios', 'neverplayed', 'icon-neverplayed', language.gettext('label_neverplayed')));

            //
            // Recently Played Tracks
            //
            $('#pluginplaylists').append(playlist.radioManager.standardBox('starradios', 'recentlyplayed', 'icon-recentlyplayed', language.gettext('label_recentlyplayed')));

            $('.starradios').on(prefs.clickBindType(), function(evt) {
                evt.stopPropagation();
                playlist.radioManager.load('starRadios', $(evt.delegateTarget).attr('name'));
            });
        },

        tagPopulate: function() {
            playlist.radioManager.load('starRadios', $('[name="cynthia"]').val());
        }
	}
}();

var recentlyaddedtracks = function() {

    return {

        setup: function() {

            //
            // Recently Added Tracks
            //
            $('#pluginplaylists').append(playlist.radioManager.standardBox('recentlyaddedradio', 'random', 'icon-recentlyplayed', language.gettext('label_recentlyadded_random')));
            $('#pluginplaylists').append(playlist.radioManager.standardBox('recentlyaddedradio', 'byalbum', 'icon-recentlyplayed', language.gettext('label_recentlyadded_byalbum')));

            $('.recentlyaddedradio').on(prefs.clickBindType(), function(evt) {
                evt.stopPropagation();
                playlist.radioManager.load('recentlyaddedtracks', $(evt.delegateTarget).attr('name'));
            });
        }
    }
}();

var mostPlayed = function() {

    return {

        setup: function() {

            //
            // Favourite Tracks
            //
            $('#pluginplaylists').append(playlist.radioManager.standardBox('mostplayedradio', null, 'icon-music', language.gettext('label_mostplayed')));
            $('.mostplayedradio').on(prefs.clickBindType(), function(evt) {
                evt.stopPropagation();
                playlist.radioManager.load('mostPlayed', null);
            });
        }
    }
}();

var faveAlbums = function() {

    return {

        setup: function() {

            //
            // Favourite Albums
            //
            $('#pluginplaylists').append(playlist.radioManager.standardBox('favealbumradio', null, 'icon-music', language.gettext('label_favealbums')));
            $('.favealbumradio').on(prefs.clickBindType(), function(evt) {
                evt.stopPropagation();
                playlist.radioManager.load('faveAlbums', null);
            });
        }
    }
}();

playlist.radioManager.register("starRadios", starRadios, 'radios/code/starRadios.js');
playlist.radioManager.register("recentlyaddedtracks", recentlyaddedtracks, 'radios/code/recentlyadded.js');
playlist.radioManager.register("mostPlayed", mostPlayed, 'radios/code/mostplayed.js');
playlist.radioManager.register("faveAlbums", faveAlbums, 'radios/code/favealbums.js');
