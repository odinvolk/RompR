<body class="mobile">
<div id="pset" class="invisible"></div>
<div id="notifications"></div>
<div id="headerbar" class="noborder fullwidth containerbox">
    <div id="sourcescontrols" class="expand center containerbox noborder">
        <div id="volumedropper" class="topdropmenu rightmenu widemenu">
<?php
            print '<div class="configtitle textcentre"><b>'.get_int_text('label_volume').'</b></div>';
?>
            <div id="volumecontrol" class="fullwidth">
                <div id="volume"></div>
            </div>
<?php
            print '<div class="configtitle textcentre"><b>'.get_int_text('config_audiooutputs').'</b></div>';
?>
            <div class="pref">
<?php
include('player/mpd/outputs.php');
printOutputCheckboxes();
?>
            </div>
<?php
            print '<div class="configtitle textcentre nohelp"><b>'.get_int_text('config_players').'</b></div>';
?>
            <div class="pref styledinputs" name="playerdefs">
            </div>
            
        </div>
        <div id="specialplugins" class="topdropmenu rightmenu autohide">
            <div class="sptext"></div>
        </div>
        <div id="narrowscreenicons" class="topdropmenu rightmenu autohide clearfix">
            <i class="noshrink icon-folder-open-empty topimg choose_filelist tright"></i>
            <i class="noshrink choose_playlistman icon-doc-text topimg tright"></i>
            <i class="noshrink icon-info-circled topimg choose_infopanel tright"></i>
            <i class="noshrink choose_prefs icon-cog-alt topimg tright"></i>
        </div>
        <i class="icon-play-circled topimg choose_nowplaying expand"></i>
        <i class="icon-music topimg choose_albumlist expand"></i>
        <i class="icon-search topimg choose_searcher expand"></i>
        <i class="icon-folder-open-empty onlywide topimg choose_filelist expand"></i>
        <i class="icon-radio-tower topimg choose_radiolist expand"></i>
        <i class="icon-podcast-circled topimg choose_podcastslist expand"></i>
        <i class="choose_playlistman onlywide icon-doc-text topimg expand"></i>
        <i class="choose_pluginplaylists icon-wifi topimg expand"></i>
        <div class="onlyverywide containerbox expandabit topbarplaycontrols">
            <i class="prev-button icon-fast-backward topimg expand"></i>
            <i class="play-button icon-play-circled topimg expand"></i>
            <i class="stop-button icon-stop-1 topimg expand"></i>
            <i class="stopafter-button icon-to-end-1 topimg expand"></i>
            <i class="next-button icon-fast-forward topimg expand"></i>
        </div>
        <i class="icon-volume-up topimg expand topbarmenu" name="volumedropper"></i>
        <i class="icon-doc-text topimg choose_playlist expand"></i>
        <i class="onlywide icon-info-circled topimg choose_infopanel expand"></i>
        <i class="onlywide choose_prefs icon-cog-alt topimg expand"></i>
        <i class="icon-menu topimg ninety expand topbarmenu" name="specialplugins"></i>
        <i class="icon-menu topimg expand onlynarrow topbarmenu" name="narrowscreenicons"></i>
    </div>
</div>

<div id="loadsawrappers">

<div id="infobar" class="mainpane invisible pleft pright">
    <div id="toomanywrappers">
        <div id="geoffreyboycott" class="fullwidth">
            <div id="albumcover"><img id="albumpicture" /></div>
            <div id="cssisshit">
                <div id="buttonholder" class="containerbox vertical">
                    <div id="buttons" class="fixed">
        <?php
                        print '<i title="'.get_int_text('button_previous').
                            '" class="prev-button icon-fast-backward clickicon controlbutton-small"></i>';
                        print '<i title="'.get_int_text('button_play').
                            '" class="play-button icon-play-circled shiftleft clickicon controlbutton"></i>';
                        print '<i title="'.get_int_text('button_stop').
                            '" class="stop-button icon-stop-1 shiftleft2 clickicon controlbutton-small"></i>';
                        print '<i title="'.get_int_text('button_stopafter').
                            '" class="stopafter-button icon-to-end-1 shiftleft3 clickicon controlbutton-small"></i>';
                        print '<i title="'.get_int_text('button_next').
                            '" class="next-button icon-fast-forward shiftleft4 clickicon controlbutton-small"></i>';
        ?>
                    </div>
                    <div id="progress" class="fixed"></div>
                    <div id="playbackTime" class="fixed">
                    </div>
                </div>
            </div>
        </div>
        <div id="amontobin" class="clearfix">
            <div id="subscribe" class="invisible">
                <i class="icon-rss npicon clickicon"></i>
                <input type="hidden" id="nppodiput" value="" />
            </div>
            <div id="stars" class="invisible">
                <i id="ratingimage" class="icon-0-stars rating-icon-big"></i>
                <input type="hidden" value="-1" />
            </div>
            <div id="lastfm" class="invisible">
                <i class="icon-heart npicon clickicon" id="love"></i>
            </div>
            <div id="playcount"></div>
            <div id="dbtags" class="invisible">
            </div>
        </div>
        <div id="nowplaying">
            <div id="nptext"></div>
        </div>
    </div>
</div>

<div id="albumlist" class="scroller mainpane invisible pright">
<?php
    print '<div class="menuitem containerbox" style="margin-top:12px;padding-left:8px">';
    print '<div class="fixed" style="padding-right:4px"><i onclick="toggleCollectionButtons()" '.
        'title="'.get_int_text('button_collectioncontrols').
        '" class="icon-menu playlisticon clickicon lettuce"></i></div>';
    print '<div class="configtitle textcentre expand"><b>'.get_int_text('button_local_music').'</b></div>';
    print '</div>';
?>
    <div id="collectionbuttons" class="invisible">
<?php
    print '<div class="pref styledinputs">';
    print '<input type="radio" class="topcheck savulon" name="sortcollectionby" '.
        'value="artist" id="sortbyartist">
    <label for="sortbyartist">'.ucfirst(get_int_text('label_artists')).'</label><br/>
    <input type="radio" class="topcheck savulon" name="sortcollectionby" value="album" id="sortbyalbum">
    <label for="sortbyalbum">'.ucfirst(get_int_text('label_albums')).'</label><br/>
    <input type="radio" class="topcheck savulon" name="sortcollectionby" value="albumbyartist" id="sortbyalbumbyartist">
    <label for="sortbyalbumbyartist">'.ucfirst(get_int_text('label_albumsbyartist')).'</label>
    <div class="pref">
    <input class="autoset toggle" type="checkbox" id="showartistbanners">
    <label for="showartistbanners">'.get_int_text('config_showartistbanners').'</label>
    </div>
    </div>
    <div class="pref styledinputs">
    <input class="autoset toggle" type="checkbox" id="sortbydate">
    <label for="sortbydate">'.get_int_text('config_sortbydate').'</label>
    <div class="pref styledinputs">
    <input class="autoset toggle" type="checkbox" id="notvabydate">
    <label for="notvabydate">'.get_int_text('config_notvabydate').'</label>
    </div>
    </div>
    <div class="pref textcentre">
    <button name="donkeykong">'.get_int_text('config_updatenow').'</button>
    </div>';
?>
    </div>
    <div id="collection" class="noborder selecotron">
    </div>
</div>

<div id='searchpane' class="scroller mainpane invisible pright">
<div id="search" class="noborder">
<?php
include("player/".$prefs['player_backend']."/search.php");
?>
</div>
<div id="searchresultholder" class="selecotron"></div>
</div>

<div id="filelist" class="scroller mainpane invisible pright">
    <div id="filecollection" class="noborder selecotron"></div>
</div>

<div id="infopane" class="infowiki scroller mainpane invisible">
    <div class="fullwidth buttonbar noborder containerbox">
        <div id="chooserbuttons" class="noborder expand center topbox containerbox fullwidth headercontainer">
            <i id="choose_history" class="icon-versions topimg expand"></i>
            <i id="backbutton" class="icon-left-circled topimg button-disabled expand onlywide"></i>
            <i id="forwardbutton" class="icon-right-circled topimg button-disabled expand onlywide"></i>
        </div>
    </div>
    <div id="artistchooser" class="infotext invisible"></div>
    <div id="historypanel" class="fullwdith invisible"></div>
<?php
    print '<div id="artistinformation" class="infotext"><h2 align="center">'.
        get_int_text('label_emptyinfo').'</h2></div>';
?>
    <div id="albuminformation" class="infotext"></div>
    <div id="trackinformation" class="infotext"></div>
</div>

<div id="radiolist" class="scroller mainpane invisible pright">
<?php
    print '<div class="configtitle textcentre"><b>'.get_int_text('button_internet_radio').'</b></div>';
?>

<?php
$sp = glob("streamplugins/*.php");
foreach($sp as $p) {
include($p);
}
?>
</div>

<div id="podcastslist" class="scroller mainpane invisible pright">
<?php
include("includes/podcasts.php");
?>
</div>

<?php
if ($use_smartradio) {
?>
<div id="pluginplaylistholder" class="containerbox vertical scroller mainpane invisible pright">
<?php
print '<div class="configtitle textcentre"><b>'.get_int_text('label_pluginplaylists').'</b></div>';
?>
<div class="pref">
<?php
if ($prefs['player_backend'] == "mopidy") {
    print '<div class="textcentre textunderline"><b>Music From Your Collection</b></div>';
}
?>
<div class="fullwidth" id="pluginplaylists"></div>

<?php
if ($prefs['player_backend'] == "mopidy") {
    print '<div class="textcentre textunderline"><b>Music From Spotify</b></div>';
}
?>
<div class="fullwidth" id="pluginplaylists_spotify"></div>

<?php
if ($prefs['player_backend'] == "mopidy") {
    print '<div class="textcentre textunderline"><b>Music From Everywhere</b></div>';
    print '<div id="radiodomains" class="pref"><b>Play From These Sources:</b></div>';
}
?>
<div class="fullwidth" id="pluginplaylists_everywhere"></div>
<div class="clearfix containerbox vertical" id="pluginplaylists_crazy"></div>
</div>
</div>
<?php
}
?>

<div id="playlistman" class="scroller mainpane invisible pright">
<?php
    print '<div class="configtitle textcentre"><b>'.get_int_text('button_saveplaylist').'</b></div>';
?>
    <div class="pref containerbox dropdown-container"><div class="fixed padright">
        </div><div class="expand"><input id="playlistname" type="text" size="200"/></div>
<?php
        print '<button class="fixed">'.get_int_text('button_save').'</button>';
?>
    </div>
    <div class="pref">
        <div id="playlistslist">
            <div id="storedplaylists"></div>
        </div>
    </div>
</div>
<div id="prefsm" class="scroller mainpane invisible pright">
<?php
include("includes/prefspanel.php")
?>
</div>

<div id="playlistm" class="pleft pright">
<?php
include('skins/playlist.php');
?>
</div>

</div>

<div id="tagadder" class="topdropmenu dropmenu dropshadow mobmenu">
    <div class="configtitle textcentre moveable" style="padding-top:4px"><b>
<?php
print get_int_text("lastfm_addtags").'</b><i class="icon-cancel-circled clickicon playlisticonr tright" onclick="tagAdder.close()"></i></div><div>'.get_int_text("lastfm_addtagslabel");
?>
    </div>
    <div class="containerbox padright dropdown-container tagaddbox"></div>
</div>
