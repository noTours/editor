<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	include ("../inc/noTours-feed.php");
	
	//header("Content-type: text/javascript; charset=utf-8");
	header("Content-type: text/html; charset=utf-8");
	
	// www.editor.notours.org/exec/add_project.php?element_type=project&element_id=728&new_element_id=1050&new_lat=0.0&new_lng=0.0
	if ( (isset($_GET['element_type'])) && ($_GET['element_type']!="") ) {
		$element_type = $_GET["element_type"];
	}
	if ( (isset($_GET['element_id'])) && ($_GET['element_id']!="") ) {
		$element_id = $_GET["element_id"];
	}
	if ( (isset($_GET['new_element_id'])) && ($_GET['new_element_id']!="") ) {
		$new_element_id = $_GET["new_element_id"];
	}
	// LatLng to move the project
	if ( (isset($_GET['new_lat'])) && ($_GET['new_lat']!="") ) {
		$new_lat = $_GET["new_lat"];
	}
	if ( (isset($_GET['new_lng'])) && ($_GET['new_lng']!="") ) {
		$new_lng = $_GET["new_lng"];
	}
	
	if ( (isset($_GET['lang'])) && ($_GET['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_GET['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	echo "<pre>";
	if ( (isset($element_type)) && (isset($element_id)) && (isset($new_element_id)) && (isset($new_lat)) && (isset($new_lng)) ) {
		$project = call_user_func('db_read_'.$element_type.'s', $element_id, true);
		$new_project = call_user_func('db_read_'.$element_type.'s', $new_element_id, true);
		if (($project['error'])||($new_project['error'])) {
			$return = return_array('exec_add_project', '', $write['error_copying_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_read_'.$element_type.'s');
			$return['db_read_'.$element_type.'s'] = $project;
			print_r($return);
			//echo json_encode($return);
		} else {
			$objects_data = $project['data']['notours_object']['data'];
			$add_lat = $new_lat - $project['data']['latitude'];
			if(floatval($new_lat)==0.0) {
				$add_lat = 0.0;
			}
			$add_lng = $new_lng - $project['data']['longitude'];
			if(floatval($new_lng)==0.0) {
				$add_lng = 0.0;
			}
			for ($i=0; $i<count($objects_data); $i++) {
				//print_r($objects_data[$i]);
				$o_data = array();
				$o_data['project_id'] = $new_element_id;
				$o_data['title'] = $objects_data[$i]['title'];
				$o_data['description'] = $objects_data[$i]['description'];
				$o_data['level'] = $objects_data[$i]['level'];
				$o_data['milestone'] = $objects_data[$i]['milestone'];
				$o_data['latitude'] = $objects_data[$i]['latitude'] + $add_lat;
				$o_data['longitude'] = $objects_data[$i]['longitude'] + $add_lng;
				$o_data['radius'] = $objects_data[$i]['radius'];
				$o_data['attributes'] = $objects_data[$i]['attributes'];
				$o_data['type'] = $objects_data[$i]['type'];
				$object_sounds =  $objects_data[$i]['notours_file']['data'];
				$object = db_insert($db_tables['objects'], $o_data);
				if(!$object['error']) {
					$object_id = $object['data'];
					$o_data['id'] = $object['data'];
					if(!$objects_data[$i]['notours_file']['error']) {
						$sounds = update_sounds ($objects_data[$i]['notours_file']['data'], $object_id, $o_data['project_id']);
						$objects_data[$i]['notours_file']['data'] = $sounds;
						if (!$sounds['error']) {
							//$return = return_array('exec_duplicate_project', $data, $write['success_updating_element'], '', false, '', '', '');
							$success = return_array('exec_add_project', $project['data'], $write['success_'.$process_action_name.'_project'], $project['dosql'], false, '', '', '');
							print_r($success);
							//echo json_encode($success);
						} else {
							$return = return_array('exec_add_project', $data, $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'notours_file');
						}
					}
				} else {
					$return = return_array('exec_add_project', '', $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'insert_object');
					$return[ 'insert_object'] = $object;
				}
			}
		}
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_duplicate_project', '', $write['data_mising'], '', true, 10, "Mising variables: \$_GET['element_type'] = '".$_GET['element_type']."', \$_GET['element_id'] = '".$_GET['element_id']."', \$_GET['new_element_id'] = '".$_GET['new_element_id']."', \$_GET['new_lat'] = '".$_GET['new_lat']."', \$_GET['new_lng'] = '".$_GET['new_lng']."'.", 'exec_add_project');
		print_r($error);
		//echo json_encode($error);
	}
	echo "</pre>";

	function update_sounds ($sounds, $object_id, $project_id) {
		global $write, $db_tables, $projectFolder, $tmpSoundFolder, $soundFolder;
		$error = false;
		$sound_data = array();
		$error_array = array();
		for ($u=0; $u<count($sounds); $u++) {
			$s_data['object_id'] = $object_id;
			$s_data['project_id'] =  $project_id;
			$s_data['url'] = $sounds[$u]['url'];
			$s_data['offline'] = $sounds[$u]['offline'];
			$s_data['length'] = $sounds[$u]['length'];
			$s_data['type'] = $sounds[$u]['type'];
			$s_data['volume'] = $sounds[$u]['volume'];
			$s_data['angles'] = $sounds[$u]['angles'];
			$s = db_insert($db_tables['files'], $s_data);
			$s_data["id"] = $s['data'];
			$s['data'] = $s_data;
			array_push($sound_data, $s);
			if ($s['error']) {
				$error = true;
				array_push($error_array, $u);
			}
		}
		// success 
		if(!$error) {
			$return = return_array('update_sounds', $sound_data, $write['success_update_sounds'], '', false, '', '');
		// error 6 - error inside operations array.
		} else {
			$return = return_array('update_sounds', $sound_data, $write['error_update_sounds'], '', true, 6, '', '');
			$return['error_array'] = $error_array;
		}
		return $return;
	}
?>