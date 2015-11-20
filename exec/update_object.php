<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	$data = array();
	$object_id = null;
	$data['project_id'] = null;
	if ( (isset($_POST['hidden_id'])) && ($_POST['hidden_id']!="") ) {
		$object_id = intval($_POST['hidden_id']);
	}
	if ( (isset($_POST['hidden_project_id'])) && ($_POST['hidden_project_id']!="") ) {
		$data['project_id'] = intval($_POST['hidden_project_id']);
	}
	if ( (isset($_POST['hidden_title'])) && ($_POST['hidden_title']!="") ) {
		$data['title'] = $_POST['hidden_title'];
	}
	if ( (isset($_POST['hidden_description'])) && ($_POST['hidden_description']!="") ) {
		$data['description'] = $_POST['hidden_description'];
	}
	if ( (isset($_POST['hidden_level'])) && ($_POST['hidden_level']!="") ) {
		$data['level'] = $_POST['hidden_level'];
	}
	if ( (isset($_POST['hidden_milestone'])) && ($_POST['hidden_milestone']!="") ) {
		$data['milestone'] = $_POST['hidden_milestone'];
	}
	if ( (isset($_POST['hidden_sound'])) && ($_POST['hidden_sound']!="") ) {
		$sounds = $_POST['hidden_sound'];
	}
	if ( (isset($_POST['hidden_lat'])) && ($_POST['hidden_lat']!="") && (isset($_POST['hidden_lonx'])) && ($_POST['hidden_lonx']!="") && (isset($_POST['hidden_radio'])) && ($_POST['hidden_radio']!="") ) {
		$data['latitude'] = floatval($_POST['hidden_lat']);
		$data['longitude'] = floatval($_POST['hidden_lonx']);
		$data['radius'] = floatval($_POST['hidden_radio']);
	}
	if ( (isset($_POST['hidden_attributes'])) && ($_POST['hidden_attributes']!="") ) {
		$data['attributes'] = $_POST['hidden_attributes'];
	}
	if ( (isset($_POST['hidden_type'])) && ($_POST['hidden_type']!="") ) {
		$data['type'] = $_POST['hidden_type'];
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	//echo "<pre>";
	if (((count($data)>1)||(isset($sounds)))&&(isset($object_id))&&(isset($data['project_id']))) {
		$data['modified'] = date("o-m-d G:i:s");
		if ($object_id==0) {
			$object = db_insert($db_tables['objects'], $data);
			if(!$object['error']) {
				$object_id = $object['data'];
				$data['id'] = $object['data'];
				if (isset($sounds)) {
					$files = update_sounds($sounds, $object_id, $data['project_id']);
					$data['notours_file'] = $files;
				}
				if (!$files['error']) {
					$return = return_array('exec_update_object', $data, $write['success_updating_element'], '', false, '', '', '');
				} else {
					$return = return_array('exec_update_object', $data, $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'notours_file');
				}
			} else {
				$return = return_array('exec_update_object', '', $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'insert_object');
				$return[ 'insert_object'] = $object;
			}
		} else {
			$object = db_update($db_tables['objects'], $data, array("id" => $object_id));
			if(!$object['error']) {
				$data['id'] = $object_id;
				if (isset($sounds)) {
					$files = update_sounds($sounds, $object_id, $data['project_id']);
					$data['notours_file'] = $files;
				}
				if(!$files['error']) {
					$return = return_array('exec_update_object', $data, $write['success_updating_element'], '', false, '', '', '');
				} else {
					$return = return_array('exec_update_object', $data, $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'notours_file');
				}
			} else {
				$return = return_array('exec_update_object', '', $write['error_updating_element'].', '.$write['subprocess_error'], '', true, 7, '', 'update_object');
				$return[ 'update_object'] = $object;
			}
		}
		//print_r($return);
		echo json_encode($return);
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_update_object', '', $write['data_mising'], '', true, 10, 'checkout: '.count($data).','.isset($sounds).','.isset($object_id).','.isset($data['project_id'])." Mising variables: \$_POST['hidden_id'] = '".$_POST['hidden_id']."', \$_POST['hidden_project_id'] = '".$_POST['hidden_project_id']."', \$_POST['hidden_title'] = '".$_POST['hidden_title']."', \$_POST['hidden_description'] = '".$_POST['hidden_description']."', \$_POST['hidden_lat'] = '".$_POST['hidden_lat']."', \$_POST['hidden_lonx'] = '".$_POST['hidden_lonx']."', \$_POST['hidden_radio'] = '".$_POST['hidden_radio']."', \$_POST['hidden_sound'] = '".$_POST['hidden_sound'].", \$_POST['hidden_attributes'] = '".$_POST['hidden_attributes']."'.", 'exec_update_object');
		//print_r($error);
		echo json_encode($error);
	}
	//echo "</pre>";
	
	function update_sounds ($val, $object_id, $project_id) {
		global $write, $db_tables, $projectFolder, $tmpSoundFolder, $soundFolder;
		$sounds = explode('}', $val);
		$file_data = array();
		$error = false;
		$error_array = array();
		for($i=0; $i<(count($sounds)-1); $i++){
			$tmp_sound = explode('{', $sounds[$i]);
			$sound = explode('|', $tmp_sound[1]);
			array_unshift($sound, $tmp_sound[0]);
			$mueve_error = false;
			$file_source = $tmpSoundFolder.$sound[0];
			$file_dest = $projectFolder.$project_id.'/'.$soundFolder.$sound[0];
			if (($sound[4])&&($sound[4]!="")) {
				$angles = $sound[4];
			} else {
				$angles = NULL;
			}
			if ($sound[1]=='folder') {
				$mime = 'folder';
			} else {
				$mime = mime_type($sound[0]);
			}
			if ($sound[2]=='offline') {
				$sound_data = array('object_id'=>$object_id, 'project_id'=>$project_id, 'url'=>$sound[0], 'offline'=>true, 'length'=>null, 'type'=>$mime, 'volume'=>100, 'angles'=>$angles);
			} else if ($sound[2]=='uploaded') {
				if (mueve('../'.$file_source, '../'.$file_dest)) {
					$sound_data = array('object_id'=>$object_id, 'project_id'=>$project_id, 'url'=>$sound[0], 'offline'=>false, 'length'=>filesize('../'.$file_dest), 'type'=>$mime, 'volume'=>100, 'angles'=>$angles);
				} else {
					$sound_data = array('object_id'=>$object_id, 'project_id'=>$project_id, 'url'=>$sound[0], 'offline'=>true, 'length'=>null, 'type'=>$mime, 'volume'=>100, 'angles'=>$angles);
					$mueve_error = true;
				}
			}
			if (($sound[3]!=0)&&($sound[3]!="")) {
				$file = db_update($db_tables['files'], $sound_data, array("id" => $sound[3]));
			} else {
				$file = db_insert($db_tables['files'], $sound_data);
				$sound_data["id"] = $file['data'];
				$file['data'] = $sound_data;
			}
			if ($mueve_error) {
				$file['msg'] = $write['error_updating_element'].', '.$write['subprocess_error'].', '.$write['error_copping_files'];
				$file['error'] = true;
				$file['error_type'] = 7;
				$file['error_process'] = 'copping_files';
				$error = return_array('copping_files', array('file_source'=>$file_source, 'file_dest'=>$file_dest), $write['error_copping_files'], '', true, 9, '', '');
				$file['copping_files'] = $error;
			}
			array_push($file_data, $file);
			if ($file['error']) {
				$error = true;
				array_push($error_array, (count($file_data)-1));
			}
		}
		// success 
		if(!$error) {
			$return = return_array('update_sounds', $file_data, $write['success_update_sounds'], '', false, '', '');
		// error 6 - error inside operations array.
		} else {
			$return = return_array('update_sounds', $file_data, $write['error_update_sounds'], '', true, 6, '', '');
			$return['error_array'] = $error_array;
		}
		return $return;
	}
?>