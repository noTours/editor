<?php
$rss_headers = array (
	'rss0' => '<rss version="2.0" xmlns:georss="http://www.georss.org/georss">',
	'rss1' => '<rss version="2.0" xmlns:georss="http://www.georss.org/georss" xmlns:notours="http://www.escoitar.org/notours">'
);
	
function projects_feed($projects_data) {
	global $rss_headers;
	global $root;
	global $projectFolder;
	$feed = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
	$feed .= $rss_headers['rss0']."\n";
	$feed .= "\t<channel>\n";
	$feed .= channel_tags('noTours android project list', $root.'proyectos.php?id_autor='.$autor, 'noTours android project list', 'es','');
	for ($i=0; $i<count($projects_data); $i++) {
		$feed .= "\t\t<item>\n";
		$enclosure = "\t\t\t<enclosure url=\"".$root.$projectFolder.$projects_data[$i]["id"]."/".$projects_data[$i]["icon"]."\" length=\"\" type=\"image/png\" />\n";
		$extra = "\t\t\t<georss:point>".$projects_data[$i]['latitude']." ".$projects_data[$i]['longitude']." ".$projects_data[$i]['zoom']."</georss:point>\n";
		$feed .= item_tags($projects_data[$i]["id"], $projects_data[$i]["name"], $projects_data[$i]["description"], $enclosure, '', $extra);
		$feed .= "\t\t</item>\n";
	}
	$feed .= "\t</channel>\n";
	$feed .= "</rss>\n";
	return $feed;
}
function objects_feed($project_data, $version) {
	global $rss_headers, $root, $projectFolder, $soundFolder, $imagesFolder;
	$feed = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
	$feed .= $rss_headers[$version]."\n";
	$feed .= "\t<channel>\n";
	$extra = "\t\t<georss:relationshiptag>is-centered-at</georss:relationshiptag>\n";
	$extra .= "\t\t<georss:point>".$project_data["latitude"]." ".$project_data["longitude"]."</georss:point>\n";
	$extra .= "\t\t<notours:sticky>".intval($project_data["sticky"])."</notours:sticky>\n";
	$feed .= channel_tags($project_data["title"], $root.$projectFolder.$project_data["id"], $project_data["description"], 'es', $extra);
	$objects_data = $project_data['notours_object']['data'];
	switch ($version) {
		case 'rss0':
    	    for ($i=0; $i<count($objects_data); $i++) {
    	    	if (!$objects_data[$i]['notours_file']['error']) {
    	    		$files_data = $objects_data[$i]['notours_file']['data'];
    	    		$feed .= "\t\t<item>\n";
    	    		$enclosure = "";
    	    		for ($u=0; $u<count($files_data); $u++) {
    	    			$enclosure .= "\t\t\t<enclosure url=\"".$soundFolder.$files_data[$u]["url"]."\" length=\"".$files_data[$u]["length"]."\" type=\"".$files_data[$u]["type"]."\" />\n";
    	    		}
					$extra = "\t\t\t<georss:circle>".$objects_data[$i]["latitude"]." ".$objects_data[$i]["longitude"]." ".round($objects_data[$i]["radius"], 2)."</georss:circle>\n";
    	    		$feed .= item_tags($objects_data[$i]["id"], $objects_data[$i]["title"], $objects_data[$i]["description"], $enclosure, $objects_data[$i]["modified"], $extra);
    	    		$feed .= "\t\t</item>\n";
    	    	}
			}
    	    break;
    	case 'rss1':
    		for ($i=0; $i<count($objects_data); $i++) {
    			if (!$objects_data[$i]['notours_file']['error']) {
    	    		$files_data = $objects_data[$i]['notours_file']['data'];
    	    		$feed .= "\t\t<item>\n";
    	    		if (($objects_data[$i]["latitude"]!="")&&($objects_data[$i]["latitude"]!=null)) {
    	    			$geodata = trim($objects_data[$i]["latitude"]." ".$objects_data[$i]["longitude"]." ".round($objects_data[$i]["radius"], 2));
    	    		} else {
    	    			$geodata = trim($objects_data[$i]["geodata"]);
    	    		}
    	    		$extra = "\t\t\t<georss:circle>".$geodata."</georss:circle>\n";
    	    		if ($objects_data[$i]["type"]=="soundpoint") {
    	    			$enclosure = "\t\t\t<enclosure url=\"".$root.$projectFolder.$project_data["id"]."/".$soundFolder.$files_data[0]["url"]."\" length=\"".$files_data[0]["length"]."\" type=\"".$files_data[0]["type"]."\" />\n";
    	    			$extra .= soundpoint_tag($files_data, $objects_data[$i]["attributes"], $objects_data[$i]["level"], $objects_data[$i]["milestone"]);
    	    		} else if ($objects_data[$i]["type"]=="soundscape") {
						$enclosure = "\t\t\t<enclosure url=\"".$root.$projectFolder.$project_data["id"]."/".$soundFolder."soundscape_".$objects_data[$i]["id"].".m3u\" length=\"12216320\" type=\"audio/x-mpegurl\" />\n";
    	    			$extra .= soundscape_tag($files_data, $objects_data[$i]["attributes"], $objects_data[$i]["level"], $objects_data[$i]["milestone"]);
    	    		}
    	    		$feed .= item_tags($objects_data[$i]["id"], $objects_data[$i]["title"], $objects_data[$i]["description"], $enclosure, $objects_data[$i]["modified"], $extra);
    	    		$feed .= "\t\t</item>\n";
    	    	}
			}
    	    break;
	}
	$feed .= "\t</channel>\n";
	$feed .= "</rss>\n";
	return $feed;
}
function objects_list($project_data) {
	$list = "Required files for the soundwalk:\n";
	$objects_data = $project_data['notours_object']['data'];
	for ($i=0; $i<count($objects_data); $i++) {
    	if (!$objects_data[$i]['notours_file']['error']) {
    	   	$files_data = $objects_data[$i]['notours_file']['data'];
    		if ($objects_data[$i]["type"]=="soundpoint") {
    	    	$list .= $files_data[0]["url"]."\n";
    	    } else if ($objects_data[$i]["type"]=="soundscape") {
    	    	for($i=0; $i<count($files_data); $i++) {
					$list .= $data[$i]["url"];	
				}
			}
    	}
	}
	return $list;
}

function channel_tags($title, $link, $description, $language, $extra) {
	$channel_tags = "";
	$channel_tags .= "\t\t<title>".$title."</title>\n";
	$channel_tags .= "\t\t<link>".$link."/</link>\n";
	$channel_tags .= "\t\t<description>".$description."</description>\n";
	$channel_tags .= "\t\t<language>".$language."</language>\n";
	$channel_tags .= $extra;
	return $channel_tags;
}

function item_tags($guid, $title, $description, $enclosure, $pubDate, $extra) {
	$item_tags .= "\t\t\t<guid isPermaLink=\"false\">".$guid."</guid>\n";
	$item_tags .= "\t\t\t<title>".$title."</title>\n";
	$item_tags .= "\t\t\t<description>".$description."</description>\n";
	$item_tags .= $enclosure;
	$item_tags .= "\t\t\t<pubDate>".$pubDate."</pubDate>\n";
	$item_tags .= $extra;
	return $item_tags;
}

// Para devolver el contenido de la etiqueta notours:soundpoint de un item a partir de los datos
function soundpoint_tag($data, $attributes, $level, $milestone) {
	$soundpoint_tag = "";
	$soundpoint_tag .= "\t\t\t<notours:soundpoint>\n";
	$soundpoint_tag .= "\t\t\t\t<notours:attributes>".$attributes."</notours:attributes>\n";
	$soundpoint_tag .= "\t\t\t\t<notours:level>".$level."</notours:level>\n";
	$soundpoint_tag .= "\t\t\t\t<notours:milestone>".$milestone."</notours:milestone>\n";
	$soundpoint_tag .= soundsource_tag($data[0], "soundpoint");	
	$soundpoint_tag .= "\t\t\t</notours:soundpoint>\n";
	return $soundpoint_tag;
}

function soundsource_tag($data, $object_type) {
	global $soundFolder;
	$soundsource_tag = "";
	$soundsource_tag .= "\t\t\t\t<notours:soundsource>\n";
	if ($data["type"]=="folder") {
		$soundsource_tag .= "\t\t\t\t\t<notours:folder>/".$soundFolder.$data["url"]."</notours:folder>\n";
	} else {
		$soundsource_tag .= "\t\t\t\t\t<notours:file>/".$soundFolder.$data["url"]."</notours:file>\n";
	}
	if ($object_type=="soundscape") {
		$soundsource_tag .= "\t\t\t\t\t<notours:angle>".$data["angles"]."</notours:angle>\n";
	}
	$soundsource_tag .= "\t\t\t\t\t<notours:volume>".$data["volume"]."</notours:volume>\n";
	$soundsource_tag .= "\t\t\t\t</notours:soundsource>\n";
	return $soundsource_tag;
}

// Para devolver el contenido de la etiqueta notours:soundscape de un item a partir de los datos		
function soundscape_tag($data, $attributes, $level, $milestonel) {
	$soundscape_tag = "";
	$soundscape_tag .= "\t\t\t<notours:soundscape>\n";
	$soundscape_tag .= "\t\t\t\t<notours:attributes>".$attributes."</notours:attributes>\n";
	$soundpoint_tag .= "\t\t\t\t<notours:level>".$level."</notours:level>\n";
	$soundpoint_tag .= "\t\t\t\t<notours:milestone>".$milestone."</notours:milestone>\n";
	for($i=0; $i<count($data); $i++) {
		$soundpoint_tag .= soundsource_tag($data[$i], "soundscape");	
	}
	$soundscape_tag .= "\t\t\t</notours:soundscape>\n";
	return $soundscape_tag;
}

?>