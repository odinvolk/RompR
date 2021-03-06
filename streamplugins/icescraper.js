var icecastPlugin = {

    refreshMyDrink: function(path) {
        if ($("#icecastlist").hasClass('notfilled')) {
    		icecastPlugin.makeabadger();
            $("#icecastlist").load("streamplugins/85_iceScraper.php?populate", icecastPlugin.spaghetti);
        } else if (path) {
    		icecastPlugin.makeabadger();
            $("#icecastlist").load("streamplugins/85_iceScraper.php?populate=1&path="+path, icecastPlugin.spaghetti);
        }
    },

    makeabadger: function() {
        $('i[name="icecastlist"]').makeSpinner();
    },

    spaghetti: function() {
    	$('i[name="icecastlist"]').stopSpinner();
        $('[name="searchfor"]').keyup(onKeyUp);
        $('[name="cornwallis"]').click(icecastPlugin.iceSearch);
        $("#icecastlist").removeClass('notfilled');
        layoutProcessor.postAlbumActions();
    },

    iceSearch: function() {
    	icecastPlugin.makeabadger();
        $("#icecastlist").load("streamplugins/85_iceScraper.php?populate=1&searchfor="+encodeURIComponent($('input[name="searchfor"]').val()), icecastPlugin.spaghetti);
    },

    handleClick: function(event) {
        var clickedElement = findClickableElement(event);
        if (clickedElement.hasClass("menu")) {
            doMenu(event, clickedElement);
        } else if (clickedElement.hasClass("clickicepager")) {
            icecastPlugin.refreshMyDrink(clickedElement.attr('name'));
        } else if (prefs.clickmode == "double") {
            if (clickedElement.hasClass("clickstream")) {
                event.stopImmediatePropagation();
                trackSelect(event, clickedElement);
            }
        } else if (prefs.clickmode == "single") {
            onSourcesDoubleClicked(event);
        }
    }

}

menuOpeners['icecastlist'] = icecastPlugin.refreshMyDrink;
clickRegistry.addClickHandlers('#icecastlist', icecastPlugin.handleClick, onSourcesDoubleClicked);
