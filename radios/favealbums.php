<?php
chdir('..');
include ("includes/vars.php");
include ("includes/functions.php");
include ("international.php");
include ("backends/sql/backend.php");

debuglog("Populating Favourite Album Radio", "FAVEALBUMS");

$uris = array();
$qstring = "";

generic_sql_query("CREATE TEMPORARY TABLE alplaytable AS SELECT SUM(Playcount) AS playtotal,
	Albumindex
	FROM (SELECT Playcount, Albumindex FROM Playcounttable JOIN Tracktable USING (TTindex)
	WHERE Playcount > 3) AS derived GROUP BY Albumindex ORDER BY ".SQL_RANDOM_SORT, true);
// This rather cumbersome code gives us albums in a random order but tracks in order.
// All attempts to do this with a single SQL query hit a brick wall.
$albums = array();
$uris = array();
$avgplays = generic_sql_query("SELECT AVG(playtotal) AS plavg FROM alplaytable", false, null, 'plavg', 0);

$result = generic_sql_query("SELECT Uri, TrackNo, Albumindex FROM Tracktable JOIN alplaytable
	USING (Albumindex) WHERE playtotal > ".$avgplays." AND Uri IS NOT NULL AND Hidden = 0", false, PDO::FETCH_OBJ);
foreach ($result as $obj) {
	if (!array_key_exists($obj->Albumindex, $albums)) {
		$albums[$obj->Albumindex] = array($obj->TrackNo => $obj->Uri);
	} else {
		if (array_key_exists($obj->TrackNo, $albums[$obj->Albumindex])) {
			array_push($albums[$obj->Albumindex], $obj->Uri);
		} else {
			$albums[$obj->Albumindex][$obj->TrackNo] = $obj->Uri;
		}
	}
}
foreach($albums as $a) {
	ksort($a);
	foreach ($a as $t) {
		array_push($uris, $t);
	}
}

print json_encode($uris);

?>