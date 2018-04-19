<?php

class romprmetadata {
	
	public static function set($data) {
		global $returninfo;
		if ($data['artist'] === null ||
			$data['title'] === null ||
			$data['attributes'] == null) {
			debuglog("Something is not set. Artist is '".$data['artist']."' Title is '".$data['title']."'","USERRATING",1);
			header('HTTP/1.1 400 Bad Request');
			print json_encode(array('error' => 'Artist or Title or Attributes not set'));
			exit(0);
		}

		switch ($data['artist']) {
			case 'geturisfordir':
				$ttids = romprmetadata::geturisfordir($data);
				break;

			case  'geturis':
				$ttids = romprmetadata::geturis($data);
				break;

			default:
				$ttids = romprmetadata::find_item($data, forcedUriOnly($data['urionly'], getDomain($data['uri'])));
				break;
		}

		$newttids = array();
		foreach ($ttids as $ttid) {
			if (!track_is_wishlist($ttid)) {
				$newttids[] = $ttid;
			}
		}
		$ttids = $newttids;

		if (count($ttids) == 0) {
			$ttids[0] = create_new_track($data);
			debuglog("Created New Track with TTindex ".$ttids[0],"USERRATINGS",5);
		}

		if (count($ttids) > 0) {
			if (romprmetadata::doTheSetting($ttids, $data['attributes'], $data['uri'])) {
			} else {
				header('HTTP/1.1 417 Expectation Failed');
				$returninfo['error'] = 'Setting attributes failed';
			}
		} else {
			debuglog("TTID Not Found","USERRATING",2);
			header('HTTP/1.1 417 Expectation Failed');
			$returninfo['error'] = 'TTindex not found';
		}
	}

	public static function add($data) {
		// This is used for adding specific tracks so we need urionly to be true
		// We don't simply call into this using 'set' with urionly set to true
		// because that might result in the rating being changed
		global $returninfo;
		$ttids = romprmetadata::find_item($data, true);

		// As we check by URI we can only have one result.
		$ttid = null;
		if (count($ttids) > 0) {
			$ttid = $ttids[0];
			if (track_is_hidden($ttid) || track_is_searchresult($ttid)) {
				debuglog("Track ".$ttid." being added is a search result or a hidden track","USERRATINGS");
				// Setting attributes (Rating: 0) will unhide/un-searchify it. Ratings of 0 are got rid of
				// by remove_cruft at the end, because they're meaningless
				if ($data['attributes'] == null) {
					$data['attributes'] = array(array('attribute' => 'Rating', 'value'=> 0));
				}
			} else {
				debuglog("Track being added already exists","USERRATINGS");
			}
		}

		check_for_wishlist_track($data);

		if ($ttid == null) {
			debuglog("Creating Track being added","USERRATINGS");
			$ttid = create_new_track($data);
		}

		romprmetadata::doTheSetting(array($ttid), $data['attributes'], $data['uri']);
	}

	public static function inc($data) {
		global $returninfo;
		// NOTE : 'inc' does not do what you might expect.
		// This is not an 'increment' function, it still does a SET but it will create a hidden track
		// if the track can't be found, compare to SET which creates a new unhidden track.
		if ($data['artist'] === null ||
			$data['title'] === null ||
			$data['attributes'] == null) {
			debuglog("Something is not set","USERRATING",2);
			header('HTTP/1.1 400 Bad Request');
			print json_encode(array('error' => 'Artist or Title or Attributes not set'));
			exit(0);
		}
		$ttids = romprmetadata::find_item($data, forcedUriOnly(false,getDomain($data['uri'])));
		if (count($ttids) == 0) {
			debuglog("Doing an INCREMENT action - Found NOTHING so creating hidden track","USERRATING",6);
			$data['hidden'] = 1;
			$ttids[0] = create_new_track($data);
		}

		$lp = -1;
		if (array_key_exists('lastplayed', $data)) {
			debuglog("Setting LastPlayed from supplied data","USERRATING");
			$lp = $data['lastplayed'];
		}

		if (count($ttids) > 0) {
			foreach ($ttids as $ttid) {
				debuglog("Doing an INCREMENT action - Found TTID ".$ttid,"USERRATING",9);
				foreach ($data['attributes'] as $pair) {
					debuglog("(Increment) Setting ".$pair["attribute"]." to ".$pair["value"]." on ".$ttid,"USERRATING",6);
					romprmetadata::increment_value($ttid, $pair["attribute"], $pair["value"], $lp);
				}
				$returninfo['metadata'] = get_all_data($ttid);
			}
		}
	}

	public static function remove($data) {
		global $returninfo;
		if ($data['artist'] === null || $data['title'] === null) {
			header('HTTP/1.1 400 Bad Request');
			print json_encode(array('error' => 'Artist or Title not set'));
			exit(0);
		}
		$ttids = romprmetadata::find_item($data, forcedUriOnly($data['urionly'], getDomain($data['uri'])));
		if (count($ttids) > 0) {
			foreach ($ttids as $ttid) {
				$result = true;
				foreach ($data['attributes'] as $pair) {
					debuglog("Removing ".$pair["attribute"]." ".$pair["value"],"USERRATING");
					$r = romprmetadata::remove_tag($ttid, $pair["value"]);
					if ($r == false) {
						debuglog("FAILED Removing ".$pair["attribute"]." ".$pair["value"],"USERRATING",2);
						$result = false;
					}
				}
				if ($result) {
					$returninfo['metadata'] = get_all_data($ttid);
				} else {
					header('HTTP/1.1 417 Expectation Failed');
					$returninfo['error'] = 'Removing attributes failed';
				}
			}
		} else {
			debuglog("TTID Not Found","USERRATING",2);
			header('HTTP/1.1 417 Expectation Failed');
			$returninfo['error'] = 'TTindex not found';
		}
	}

	public static function get($data) {
		global $returninfo, $nodata;
		if ($data['artist'] === null || $data['title'] === null) {
			header('HTTP/1.1 400 Bad Request');
			print json_encode(array('error' => 'Artist or Title not set'));
			exit(0);
		}
		$ttids = romprmetadata::find_item(	$data, forcedUriOnly(false, getDomain($data['uri'])));
		if (count($ttids) > 0) {
			$returninfo = get_all_data(array_shift($ttids));
		} else {
			$returninfo = $nodata;
		}
	}

	public static function setalbummbid($data) {
		global $returninfo, $nodata;
		$ttids = romprmetadata::find_item($data, forcedUriOnly(false, getDomain($data['uri'])));
		if (count($ttids) > 0) {
			foreach ($ttids as $ttid) {
				debuglog("Updating album MBID ".$data['attributes']." from TTindex ".$ttid,"BACKEND");
				if ($result = generic_sql_query("SELECT Albumindex FROM Tracktable WHERE TTindex = ".$ttid)) {
					while ($obj = $result->fetch(PDO::FETCH_OBJ)) {
						$albumindex = $obj->Albumindex;
						debuglog("   .. album index is ".$albumindex,"BACKEND");
						sql_prepare_query("UPDATE Albumtable SET mbid = ? WHERE Albumindex = ? AND mbid IS NOT NULL",$data['attributes'],$albumindex);
					}
				}
				$result = null;
			}
		}
		$returninfo = $nodata;
	}

	public static function cleanup($data) {
		// Does nothing, as a cleanup is standard when we call into userRatings
	}

	public static function amendalbum($data) {
		if ($data['albumindex'] !== null && romprmetadata::amend_album($data['albumindex'], $data['albumartist'], $data['date'])) {
		} else {
			header('HTTP/1.1 400 Bad Request');
			$returninfo['error'] = 'That just did not work';
		}
	}

	public static function deletetag($data) {
		if (romprmetadata::remove_tag_from_db($data['value'])) {
		} else {
			header('HTTP/1.1 400 Bad Request');
			$returninfo['error'] = 'Well, that went well';
		}
	}

	public static function delete($data) {
		$ttids = romprmetadata::find_item($data, true);
		if (count($ttids) == 0) {
			header('HTTP/1.1 400 Bad Request');
			$returninfo['error'] = 'TTindex not found';
		} else {
			romprmetadata::delete_track(array_shift($ttids));
		}
	}

	public static function deletewl($data) {
		romprmetadata::delete_track($data['wltrack']);
	}

	public static function getcharts($data) {
		global $returninfo;
		$returninfo['Artists'] = get_artist_charts();
		$returninfo['Albums'] = get_album_charts();
		$returninfo['Tracks'] = get_track_charts();
	}

	public static function clearwishlist() {
		debuglog("Removing Wishlist Tracks","MONKEYS");
		if (clear_wishlist()) {
			debuglog(" ... Success!","MONKEYS");
		} else {
			debuglog(" ... FAILED!");
		}
	}

	// Private Functions

	static function geturisfordir($data) {
		$uris = getDirItems($data['uri']);
		$ttids = array();
		foreach ($uris as $uri) {
			if ($r = sql_prepare_query("SELECT TTindex FROM Tracktable WHERE Uri = ?", $uri)) {
				while ($obj = $r->fetch(PDO::FETCH_ASSOC)) {
					debuglog(" TTindex : ".$obj['TTindex'],"SCOOBY");
					$ttids[] = $obj['TTindex'];
				}
			}
			$r = null;
		}
		return $ttids;
	}

	static function geturis($data) {
		$uris = getItemsToAdd($data['uri'], "");
		$ttids = array();
		foreach ($uris as $uri) {
			$uri = trim(substr($uri, strpos($uri, ' ')+1, strlen($uri)), '"');
			if ($r = sql_prepare_query("SELECT TTindex FROM Tracktable WHERE Uri = ?", $uri)) {
				while ($obj = $r->fetch(PDO::FETCH_ASSOC)) {
					$ttids[] = $obj['TTindex'];
				}
			}
			$r = null;
		}
		return $ttids;
	}

	static function find_item($data,$urionly) {

		// romprmetadata::find_item
		//		Looks for a track in the database based on uri, title, artist, album, and albumartist or
		//		combinations of those
		//		Returns: Array of TTindex

		// romprmetadata::find_item is used by userRatings to find tracks on which to update or display metadata.
		// It is NOT used when the collection is created

		// When Setting Metadata we do not use a URI because we might have mutliple versions of the
		// track in the database or someone might be rating a track from Spotify that they already have
		// in Local. So in this case we check using an increasingly wider check to find the track,
		// returning as soon as one of these produces matches.
		//		First by Title, TrackNo, AlbumArtist and Album
		//		Third by Track, Album Artist, and Album
		// 		Then by Track, Track Artist, and Album
		//		Then by Track, Artist, and Album NULL (meaning wishlist)
		// We return ALL tracks found, because you might have the same track on multiple backends,
		// and set metadata on them all.
		// This means that when getting metadata it doesn't matter which one we match on.
		// When we Get Metadata we do supply a URI BUT we don't use it if we have one, just because.
		// $urionly can be set to force looking up only by URI. This is used by when we need to import a
		// specific version of the track  - currently from either the Last.FM importer or when we add a
		// spotify album to the collection

		// If we don't supply an album to this function that's because we're listening to the radio.
		// In that case we look for a match where there is something in the album field and then for
		// where album is NULL

		// FIXME! There is one scenario where the above fails.
		// If you tag or rate a track, and then add it to the collection again from another backend
		// later on, the rating doesn't get picked up by the new copy.
		// Looking everything up by name/album/artist (i.e. ignoring the URI in romprmetadata::find_item)
		// doesn't fix this because the collection display still doesn't show the rating as that's
		// looked up by TTindex

		debuglog("Looking for item ".$data['title'],"MYSQL");
		$ttids = array();
		$stmt = null;
		if ($urionly && $data['uri']) {
			debuglog("  Trying by URI ".$data['uri'],"MYSQL");
			if ($stmt = sql_prepare_query("SELECT TTindex FROM Tracktable WHERE Uri = ?", $data['uri'])) {
				while ($ttidobj = $stmt->fetch(PDO::FETCH_OBJ)) {
					debuglog("    Found TTindex ".$ttidobj->TTindex,"MYSQL");
					$ttids[] = $ttidobj->TTindex;
				}
			}
		}

		if ($data['artist'] == null || $data['title'] == null || ($urionly && $data['uri'])) {
			return $ttids;
		}

		if (count($ttids) == 0) {
			if ($data['album']) {
				if (count($ttids) == 0 && $data['albumartist'] !== null && $data['trackno'] != 0) {
					debuglog("  Trying by albumartist ".$data['albumartist']." album ".$data['album']." title ".$data['title']." track number ".$data['trackno'],"MYSQL");
					if ($stmt = sql_prepare_query(
						"SELECT
							TTindex
						FROM
							Tracktable JOIN Albumtable USING (Albumindex)
							JOIN Artisttable ON Albumtable.AlbumArtistindex = Artisttable.Artistindex
						WHERE
							LOWER(Title) = LOWER(?)
							AND LOWER(Artistname) = LOWER(?)
							AND LOWER(Albumname) = LOWER(?)
							AND TrackNo = ?",
						$data['title'], $data['albumartist'], $data['album'], $data['trackno'])) {
						while ($ttidobj = $stmt->fetch(PDO::FETCH_OBJ)) {
							debuglog("    Found TTindex ".$ttidobj->TTindex,"MYSQL");
							$ttids[] = $ttidobj->TTindex;
						}
					}
				}
				if (count($ttids) == 0 && $data['albumartist'] !== null) {
					debuglog("  Trying by albumartist ".$data['albumartist']." album ".$data['album']." and title ".$data['title'],"MYSQL");
					if ($stmt = sql_prepare_query(
						"SELECT
							TTindex
						FROM
							Tracktable JOIN Albumtable USING (Albumindex)
							JOIN Artisttable ON Albumtable.AlbumArtistindex = Artisttable.Artistindex
						WHERE
							LOWER(Title) = LOWER(?)
							AND LOWER(Artistname) = LOWER(?)
							AND LOWER(Albumname) = LOWER(?)",
						$data['title'], $data['albumartist'], $data['album'])) {
						while ($ttidobj = $stmt->fetch(PDO::FETCH_OBJ)) {
							debuglog("    Found TTindex ".$ttidobj->TTindex,"MYSQL");
							$ttids[] = $ttidobj->TTindex;
						}
					}
				}
				
				if (count($ttids) == 0 && ($data['albumartist'] == null || $data['albumartist'] == $data['artist'])) {
					debuglog("  Trying by artist ".$data['artist']." album ".$data['album']." and title ".$data['title'],"MYSQL");
					if ($stmt = sql_prepare_query(
						"SELECT
							TTindex
						FROM
							Tracktable JOIN Artisttable USING (Artistindex)
							JOIN Albumtable USING (Albumindex)
						WHERE
							LOWER(Title) = LOWER(?)
							AND LOWER(Artistname) = LOWER(?)
						    AND LOWER(Albumname) = LOWER(?)", $data['title'], $data['artist'], $data['album'])) {
						while ($ttidobj = $stmt->fetch(PDO::FETCH_OBJ)) {
							debuglog("    Found TTindex ".$ttidobj->TTindex,"MYSQL");
							$ttids[] = $ttidobj->TTindex;
						}
					}
				}

				// Finally look for Uri NULL which will be a wishlist item added via a radio station
				if (count($ttids) == 0) {
					debuglog("  Trying by (wishlist) artist ".$data['artist']." and title ".$data['title'],"MYSQL");
					if ($stmt = sql_prepare_query(
						"SELECT
							TTindex
						FROM
							Tracktable JOIN Artisttable USING (Artistindex)
						WHERE
							LOWER(Title) = LOWER(?)
							AND LOWER(Artistname) = LOWER(?)
							AND Uri IS NULL",
						$data['title'], $data['artist'])) {
						while ($ttidobj = $stmt->fetch(PDO::FETCH_OBJ)) {
							debuglog("    Found TTindex ".$ttidobj->TTindex,"MYSQL");
							$ttids[] = $ttidobj->TTindex;
						}
					}
				}
			} else {
				// No album supplied - ie this is from a radio stream. First look for a match where
				// there is something in the album field
				debuglog("  Trying by artist ".$data['artist']." Uri NOT NULL and title ".$data['title'],"MYSQL");
				if ($stmt = sql_prepare_query(
					"SELECT
						TTindex
					FROM
						Tracktable JOIN Artisttable USING (Artistindex)
					 WHERE
					 	LOWER(Title) = LOWER(?)
					 	AND LOWER(Artistname) = LOWER(?)
					 	AND Uri IS NOT NULL", $data['title'], $data['artist'])) {
					while ($ttidobj = $stmt->fetch(PDO::FETCH_OBJ)) {
						debuglog("    Found TTindex ".$ttidobj->TTindex,"MYSQL");
						$ttids[] = $ttidobj->TTindex;
					}
				}

				if (count($ttids) == 0) {
					debuglog("  Trying by (wishlist) artist ".$data['artist']." and title ".$data['title'],"MYSQL");
					if ($stmt = sql_prepare_query(
						"SELECT
							TTindex
						FROM
							Tracktable JOIN Artisttable USING (Artistindex)
						WHERE
							LOWER(Title) = LOWER(?)
							AND LOWER(Artistname) = LOWER(?)
							AND Uri IS NULL", $data['title'], $data['artist'])) {
						while ($ttidobj = $stmt->fetch(PDO::FETCH_OBJ)) {
							debuglog("    Found TTindex ".$ttidobj->TTindex,"MYSQL");
							$ttids[] = $ttidobj->TTindex;
						}
					}
				}
			}
		}
		$stmt = null;
		return $ttids;
	}

	static function increment_value($ttid, $attribute, $value, $lp) {

		// Increment_value doesn't 'increment' as such - it's used for setting values on tracks without
		// unhiding them. It's used for Playcount, which was originally an 'increment' type function but
		// that changed because multiple rompr instances cause multiple increments

		debuglog("(Increment) Setting ".$attribute." to ".$value." for TTID ".$ttid, "MYSQL",8);
		$retval = true;
		$stmt = null;
		if ($lp === -1) {
			if ($stmt = sql_prepare_query("REPLACE INTO ".$attribute."table (TTindex, ".$attribute.", LastPlayed) VALUES (?, ?, CURRENT_TIMESTAMP)", $ttid, $value)) {
				debuglog(" .. success","MYSQL",8);
			} else {
				debuglog("FAILED (Increment) Setting ".$attribute." to ".$value." for TTID ".$ttid, "MYSQL",2);
				$retval = false;
			}
		} else {
			if ($stmt = sql_prepare_query("REPLACE INTO ".$attribute."table (TTindex, ".$attribute.", LastPlayed) VALUES (?, ?, ?)", $ttid, $value, $lp)) {
				debuglog(" .. success","MYSQL",8);
			} else {
				debuglog("FAILED (Increment) Setting ".$attribute." to ".$value." for TTID ".$ttid, "MYSQL",2);
				$retval = false;
			}
		}
		$stmt = null;
		return $retval;

	}

	static function set_attribute($ttid, $attribute, $value) {

		// set_attribute
		//		Sets an attribute (Rating, Tag etc) on a TTindex.
		$retval = true;
		$stmt = null;
		debuglog("Setting ".$attribute." to ".$value." on ".$ttid,"MYSQL",8);
		if ($stmt = sql_prepare_query("REPLACE INTO ".$attribute."table (TTindex, ".$attribute.") VALUES (?, ?)", $ttid, $value)) {
			debuglog("  .. success","MYSQL",8);
		} else {
			debuglog("FAILED Setting ".$attribute." to ".$value." on ".$ttid,"MYSQL",2);
			$retval = false;
		}
		$stmt = null;
		return $retval;
	}

	static function doTheSetting($ttids, $attributes, $uri) {
		global $returninfo;
		$result = true;
		debuglog("Checking For attributes","USERRATING",8);
		if ($attributes !== null) {
			debuglog("Setting attributes","USERRATING",7);
			foreach($ttids as $ttid) {
				debuglog("TTid ".$ttid,"USERRATING",9);
				foreach ($attributes as $pair) {
					debuglog("Setting ".$pair["attribute"]." to ".debug_format($pair['value'])." on TTindex ".$ttid,"USERRATING",6);
					switch ($pair['attribute']) {
						case 'Tags':
							$result = romprmetadata::addTags($ttid, $pair['value']);
							break;

						default:
							$result = romprmetadata::set_attribute($ttid, $pair["attribute"], $pair["value"]);
							break;
					}
					if (!$result) { break; }
				}
				if ($uri) {
					$returninfo['metadata'] = get_all_data($ttid);
				}
			}
		}
		return $result;
	}

	static function addTags($ttid, $tags) {

		// addTags
		//		Add a list of tags to a TTindex

		foreach ($tags as $tag) {
			$t = trim($tag);
			debuglog("Adding Tag ".$t." to ".$ttid,"MYSQL",8);
			$tagindex = null;
			if ($result = sql_prepare_query("SELECT Tagindex FROM Tagtable WHERE Name=?", $t)) {
				while ($obj = $result->fetch(PDO::FETCH_OBJ)) {
					$tagindex = $obj->Tagindex;
				}
				if ($tagindex == null) $tagindex = romprmetadata::create_new_tag($t);
				if ($tagindex == null) {
					debuglog("    Could not create tag ".$t,"MYSQL",2);
					return false;
				}

				if ($result = generic_sql_query("INSERT INTO TagListtable (TTindex, Tagindex) VALUES ('".$ttid."', '".$tagindex."')")) {
					debuglog("Success","MYSQL",8);
				} else {
					// Doesn't matter, we have a UNIQUE constraint on both columns to prevent us adding the same tag twice
					debuglog("  .. Failed but that's OK if it's because of a duplicate entry or UNQIUE constraint","MYSQL",4);
				}
			}
		}
		return true;
	}

	static function create_new_tag($tag) {

		// create_new_tags
		//		Creates a new entry in Tagtable
		//		Returns: Tagindex

		global $mysqlc;
		debuglog("Creating new tag ".$tag,"MYSQL",7);
		$tagindex = null;
		if ($result = sql_prepare_query("INSERT INTO Tagtable (Name) VALUES (?)", $tag)) {
			$tagindex = $mysqlc->lastInsertId();
		}
		return $tagindex;
	}

	static function remove_tag($ttid, $tag) {

		// remove_tags
		//		Removes a tag relation from a TTindex

		debuglog("Removing Tag ".$tag." from ".$ttid,"MYSQL",5);
		$retval = false;
		if ($tagindex = simple_query('Tagindex', 'Tagtable', 'Name', $tag, false)) {
			if ($result = generic_sql_query("DELETE FROM TagListtable WHERE TTindex = '".$ttid."' AND Tagindex = '".$tagindex."'")) {
				debuglog(" .. Success","MYSQL",8);
				$retval = true;
			} else {
				debuglog("  ..  Failed to remove tag ".$tag." from ttindex ".$ttid,"MYSQL",2);
			}
		} else {
			debuglog("  ..  Could not find tag ".$tag,"MYSQL",2);
		}
		return $retval;
	}

	static function remove_tag_from_db($tag) {
		debuglog("Removing Tag ".$tag." from database","MYSQL",5);
		if ($result = sql_prepare_query("DELETE FROM Tagtable WHERE Name=?", $tag)) {
			return true;
		}
		return false;
	}

	static function delete_track($ttid) {
		if (remove_ttid($ttid)) {
		} else {
			header('HTTP/1.1 400 Bad Request');
		}
	}

	static function amend_album($albumindex, $newartist, $date) {
		debuglog("Updating Album index ".$albumindex." with new artist ".$newartist." and new date ".$date,"USERRATING",6);
		$artistindex = ($newartist == null) ? null : check_artist($newartist);
		if ($stmt = sql_prepare_query("SELECT * FROM Albumtable WHERE Albumindex = ?", $albumindex)) {
			$obj = $stmt->fetch(PDO::FETCH_OBJ);
			$params = array(
				'album' => $obj->Albumname,
				'albumai' => ($artistindex == null) ? $obj->AlbumArtistindex : $artistindex,
				'albumuri' => $obj->AlbumUri,
				'image' => $obj->Image,
				'date' => ($date == null) ? $obj->Year : $date,
				'searched' => $obj->Searched,
				'imagekey' => $obj->ImgKey,
				'ambid' => $obj->mbid,
				'domain' => $obj->Domain);
			$newalbumindex = check_album($params);
			if ($albumindex != $newalbumindex) {
				debuglog("Moving all tracks from album ".$albumindex." to album ".$newalbumindex,"USERRATING",6);
				if ($stmt = sql_prepare_query("UPDATE Tracktable SET Albumindex = ? WHERE Albumindex = ?", $newalbumindex, $albumindex)) {
					debuglog("...Success","USERRATING",8);
				} else {
					debuglog("Track move Failed!","USERRATING",2);
					return false;
				}
			}
		} else {
			debuglog("Failed to find album to update!","USERRATING",2);
			return false;
		}
		return true;
	}

}

?>