<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	include ("../inc/noTours-feed.php");
	
	//header("Content-type: text/javascript; charset=utf-8");
	header("Content-type: text/html; charset=utf-8");
	
	// www.editor.notours.org/exec/duplicate_project.php?element_type=project&element_id=1003&new_lat=43.21387139&new_lng=2.35116004
	if ( (isset($_GET['element_type'])) && ($_GET['element_type']!="") ) {
		$element_type = $_GET["element_type"];
	}
	if ( (isset($_GET['element_id'])) && ($_GET['element_id']!="") ) {
		$element_id = $_GET["element_id"];
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
	if ( (isset($element_type)) && (isset($element_id)) && (isset($new_lat)) && (isset($new_lat)) ) {
		$project = call_user_func('db_read_'.$element_type.'s', $element_id, true);
		if ($project['error']) {
			$return = return_array('exec_duplicate_project', '', $write['error_copying_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_read_'.$element_type.'s');
			$return['db_read_'.$element_type.'s'] = $project;
			print_r($return);
			//echo json_encode($return);
		} else {
			
			//print_r($project['data']);
			$data = array();
			$data['author_id'] = $project['data']['author_id'];
			$data['title'] = $project['data']['title'];
			$data['description'] = $project['data']['title'];
			$data['latitude'] = $new_lat;
			$data['longitude'] = $new_lng;
			$add_lat = $new_lat - $project['data']['latitude'];
			$add_lng = $new_lng - $project['data']['longitude'];
			$data['zoom'] = $project['data']['zoom'];
			$data['levels'] = $project['data']['levels'];
			$data['sticky'] = $project['data']['sticky'];
			$data['icon'] = "logo_notours_screen.png";
			$icon = "../".$project['data']['icon'];
			if (($project['data']['kml']!='null')&&($project['data']['kml']!='')) {
				$data['kml'] = "project_kml_layer.kml";
				$kml = "../".$project['data']['kml'];
			} else {
				$data['kml'] = '';
				$kml = '';
			}
			//print_r($data);
			
			$insert = db_insert($db_tables['projects'], $data);
			$new_data = array_merge(array('id'=>$insert['data']), $data);
			$insert['data'] = $new_data;
			//print_r($insert);
			
			if (!$insert['error']) {
				// success
				$folders = array(
					'project_folder' => '../'.$projectFolder.$insert['data']['id'].'/',
					'sound_folder' => '../'.$projectFolder.$insert['data']['id'].'/'.$imagesFolder,
					'image_folder' => '../'.$projectFolder.$insert['data']['id'].'/'.$soundFolder,
				);
				$projectf = @mkdir($folders['project_folder'], 0775);
				$sound = @mkdir($folders['sound_folder'], 0775);
				$image = @mkdir($folders['image_folder'], 0775);
				// error 12: error creating folders
				if (!$projectf || !$sound || !$image ) {
					$error = return_array('create_project_folders', $folders, $write['error_creating_folders'], '', true, 12, '', 'create_project_folders');
					$return = return_array('exec_duplicate_project', $insert, $write['error_creating_project'].', '.$write['subprocess_error'], '', true, 7, '', 'create_project_folders');
					$return[ 'create_project_folders'] = $error;
					print_r($return);
					//echo json_encode($return);
				} else {
					$insert['data']['folders'] = $folders;
					$atachments = project_atachments($insert['data']['id'], $insert, 'create', 'creating');
					// success copying kml & icon files
					if ($atachments) {
						$objects_data = $project['data']['notours_object']['data'];
						for ($i=0; $i<count($objects_data); $i++) {
							//print_r($objects_data[$i]);
							$o_data = array();
							$o_data['project_id'] = $insert['data']['id'];
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
								$sounds = update_sounds ($objects_data[$i]['notours_file']['data'], $object_id, $o_data['project_id']);
								$objects_data[$i]['notours_file']['data'] = $sounds;
								if (!$sounds['error']) {
									//$return = return_array('exec_duplicate_project', $data, $write['success_updating_element'], '', false, '', '', '');
									$success = return_array('exec_duplicate_project', $object['data'], $write['success_duplicating_object'], $object['dosql'], false, '', '', '');
									print_r($success);
									//echo json_encode($success);
						
								} else {
									$return = return_array('exec_duplicate_project', $data, $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'notours_file');
								}
							} else {
								$return = return_array('exec_duplicate_project', '', $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'insert_object');
								$return[ 'insert_object'] = $object;
							}
						}
					}
				}
			} else {
				// error 2: Invalid query
				$return = return_array('exec_duplicate_project', $data, $write['error_creating_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_insert');
				$return[ 'db_insert'] = $insert;
				print_r($return);
				//echo json_encode($success);
			}
		}
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_duplicate_project', '', $write['data_mising'], '', true, 10, "Mising variables: \$_GET['element_type'] = '".$_GET['element_type']."', \$_GET['element_id'] = '".$_GET['element_id']."', \$_GET['new_lat'] = '".$_GET['new_lat']."', \$_GET['new_lng'] = '".$_GET['new_lng']."'.", 'exec_duplicate_project');
		print_r($error);
		//echo json_encode($error);
	}
	echo "</pre>";
	
	
	function project_atachments($id, $project, $process_name='create', $process_action_name='creating') {
		global $db_tables, $write, $projectFolder, $icon, $kml, $data;
		$tmp_success = true;
		// icon
		if ((isset($icon))&&($icon!='')) {
			$icon_data = array(
				'source'=> $icon,
				'dest'=> $projectFolder.$id."/".$data['icon'],
			);
			$img = @imagecreatefrompng($icon_data['source']);
			$icon_result = @imagepng($img,"../".$icon_data['dest']);
			// error 13: error creating icon
			if (!$icon_result) {
				$tmp_success = false;
				$error = return_array($process_name.'_project_icon', $icon_data, $write['error_'.$process_action_name.'_icon'], '', true, 13, '', $process_name.'_project_icon');
				$return = return_array('exec_duplicate_project', $project, $write['error_'.$process_action_name.'_project'].', '.$write['subprocess_error'], '', true, 7, '', $process_name.'_project_icon');
				$return[$process_name.'_project_icon'] = $error;
				print_r($return);
				//echo json_encode($return);
			//success
			} else {
				chmod ("../".$icon_data['dest'], 0775);
				$update_icon = db_update($db_tables['projects'], array("icon" => $icon_data['dest']), array("id" => $id));
				$project['data']['icon'] = $icon_data['dest'];
			}
		}
		// kml
		if ((isset($kml))&&($kml!='')) {
			$kml_data = array(
				'source'=> $kml,
				'dest'=> $projectFolder.$id."/".$data['kml'],
			);
			if (@copy($kml_data['source'], "../".$kml_data['dest'])) {
				chmod ("../".$kml_data['dest'], 0775);
				$update_kml = db_update($db_tables['projects'], array("kml" => $kml_data['dest']), array("id" => $id));
				$project['data']['kml'] = $kml_data['dest'];
			// error 13: error creating kml
			} else {
				$tmp_success = false;
				$error = return_array($process_name.'_project_kml', $kml_data, $write['error_'.$process_action_name.'_kml'], '', true, 13, '', $process_name.'_project_kml');
				$return = return_array('exec_duplicate_project', $project, $write['error_'.$process_action_name.'_project'].', '.$write['subprocess_error'], '', true, 7, '', $process_name.'_project_kml');
				$return[$process_name.'_project_kml'] = $error;
				print_r($return);
				//echo json_encode($return);
			}
		}
		return $tmp_success;
	}
	
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