<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	include ("../inc/noTours-feed.php");
	
	//header("Content-type: text/javascript; charset=utf-8");
	header("Content-type: text/html; charset=utf-8");
	
	//www.editor.notours.org/exec/import_project.php?&copy_from=918&copy_to=1087&level=1
	
	//www.editor.notours.org/exec/import_project.php?&copy_from=918&copy_to=1087&relocate=true
	$element_type = 'project';
	
	if ( (isset($_GET['copy_from'])) && ($_GET['copy_from']!="") ) {
		$copy_from_id = $_GET["copy_from"];
	}
	if ( (isset($_GET['copy_to'])) && ($_GET['copy_to']!="") ) {
		$copy_to_id = $_GET["copy_to"];
	}
	
	if ( (isset($_GET['rename'])) && ($_GET['rename']!="") ) {
		$rename = $_GET["rename"];
	} else {
		$rename = false;
	}
	
	// Change sound coordinates acording to new project?
	if ( (isset($_GET['relocate'])) && ($_GET['relocate']!="") ) {
		$relocate = $_GET["relocate"];
	} else {
		$relocate = false;
	}
	
	// Change sound level?
	if ( (isset($_GET['level'])) && ($_GET['level']!="") ) {
		$new_level = true;
		$level = $_GET["level"];
	} else {
		$new_level = false;
	}
	
	// LANG
	if ( (isset($_GET['lang'])) && ($_GET['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_GET['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	echo "<pre>";
	if ( (isset($copy_from_id)) && (isset($copy_to_id)) ) {
	
		$copy_from_project = call_user_func('db_read_'.$element_type.'s', $copy_from_id, true);
		$copy_to_project = call_user_func('db_read_'.$element_type.'s', $copy_to_id, true);
		
		//check both projects where properly read
		if ($copy_from_project['error']) {
			$return = return_array('exec_import_project', '', $write['error_importing_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_read_'.$element_type.'s');
			$return['db_read_'.$element_type.'s'] = $copy_from_project;
			print_r($return);
			//echo json_encode($return);
		} else if ($copy_to_project['error']) {
			$return = return_array('exec_import_project', '', $write['error_importing_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_read_'.$element_type.'s');
			$return['db_read_'.$element_type.'s'] = $copy_to_project;
			print_r($return);
			//echo json_encode($return);
			
		} else {
			
			if ($relocate) {
				// to move
				$add_lat = $copy_to_project['data']['latitude'] - $copy_from_project['data']['latitude'];
				$add_lng = $copy_to_project['data']['longitude']  - $copy_from_project['data']['longitude'];
			}
			
			$objects_data = $copy_from_project['data']['notours_object']['data'];
			
			for ($i=0; $i<count($objects_data); $i++) {
				//print_r($objects_data[$i]);
				$o_data = array();
				$o_data['project_id'] = $copy_to_id;
				$o_data['title'] = $objects_data[$i]['title'];
				$o_data['description'] = $objects_data[$i]['description'];
				$new_level ? $o_data['level'] = $level : $o_data['level'] = $objects_data[$i]['level'];
				$o_data['milestone'] = $objects_data[$i]['milestone'];
				$relocate ? $o_data['latitude'] = $objects_data[$i]['latitude'] + $add_lat : $o_data['latitude'] = $objects_data[$i]['latitude'];
				$relocate ? $o_data['longitude'] = $objects_data[$i]['longitude'] + $add_lng : $o_data['longitude'] = $objects_data[$i]['longitude'];
				$o_data['radius'] = $objects_data[$i]['radius'];
				$o_data['attributes'] = $objects_data[$i]['attributes'];
				$o_data['type'] = $objects_data[$i]['type'];
				$object_sounds =  $objects_data[$i]['notours_file']['data'];
				$object = db_insert($db_tables['objects'], $o_data);
				if(!$object['error']) {
					$object_id = $object['data'];
					$o_data['id'] = $object['data'];
					$sounds = update_sounds ($objects_data[$i]['notours_file']['data'], $object_id, $o_data['project_id']);
					$objects_data[$i]['notours_file']['data'] = $sounds;
					if (!$sounds['error']) {
						//$return = return_array('exec_duplicate_project', $data, $write['success_updating_element'], '', false, '', '', '');
						$success = return_array('exec_import_project', $object['data'], $write['success_importing_object'], $object['dosql'], false, '', '', '');
						print_r($success);
						//echo json_encode($success);
					} else {
						$return = return_array('exec_import_project', $data, $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'notours_file');
					}
				} else {
					$return = return_array('exec_import_project', '', $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'insert_object');
					$return[ 'insert_object'] = $object;
				}
			}
		}
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_import_project', '', $write['data_mising'], '', true, 10, "Mising variables: \$_GET['copy_from'] = '".$_GET['copy_from']."', \$_GET['copy_to'] = '".$_GET['copy_to']."'.", 'exec_import_project');
		print_r($error);
		//echo json_encode($error);
	}
	echo "</pre>";
	function update_sounds ($sounds, $object_id, $project_id) {
		global $write, $db_tables, $projectFolder, $tmpSoundFolder, $soundFolder, $rename;
		$error = false;
		$sound_data = array();
		$error_array = array();
		for ($u=0; $u<count($sounds); $u++) {
			$s_data['object_id'] = $object_id;
			$s_data['project_id'] =  $project_id;
			$s_data['url'] = $sounds[$u]['url'];
			if ($rename) {
				$s_data['url'] = strtolower($s_data['url']);
				$s_data['url'] = str_replace ('-', '', $s_data['url']);
				$s_data['url'] = str_replace ('_', '', $s_data['url']);
			}
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