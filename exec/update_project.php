<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	$data = array();
	$project_id = null;
	
	if ( (isset($_POST['hidden_id'])) && ($_POST['hidden_id']!="") ) {
		$project_id = intval($_POST['hidden_id']);
	}
	if ( (isset($_POST['hidden_author'])) && ($_POST['hidden_author']!="") ) {
		$data['author_id'] = $_POST['hidden_author'];
	}
	if ( (isset($_POST['hidden_title'])) && ($_POST['hidden_title']!="") ) {
		$data['title'] = str_replace('"', "'",$_POST['hidden_title']);
	}
	if ( (isset($_POST['hidden_description'])) && ($_POST['hidden_description']!="") ) {
		$data['description'] = $_POST['hidden_description'];
	}
	if ( (isset($_POST['hidden_lat'])) && ($_POST['hidden_lat']!="") && (isset($_POST['hidden_lonx'])) && ($_POST['hidden_lonx']!="") && (isset($_POST['hidden_zoom'])) && ($_POST['hidden_zoom']!="") ) {
		$data['latitude'] = $_POST['hidden_lat'];
		$data['longitude'] = $_POST['hidden_lonx'];
		$data['zoom'] = $_POST['hidden_zoom'];
	}
	if ( (isset($_POST['hidden_levels'])) && ($_POST['hidden_levels']!="") ) {
		$data['levels'] = $_POST['hidden_levels'];
	}
	if ((isset($_POST['hidden_sticky'])) && ($_POST['hidden_sticky']!="")) {
		$data['sticky'] = $_POST['hidden_sticky'];
		//if ($_POST['hidden_sticky']=="true") $data['sticky'] = 1;
		//if ($_POST['hidden_sticky']=="false") $data['sticky'] = 0;
	}
	if ((isset($_POST['hidden_icon'])) && ($_POST['hidden_icon']!="")) {
		$icon = "../".$_POST['hidden_icon'];
		$data['icon'] = "logo_notours_screen.png";
	} else {
		if ((isset($project_id))&&($_POST['hidden_id']=='0')) {
			$icon = "../inc/img/logo_notours_screen.png";
			$data['icon'] = "logo_notours_screen.png";
		}
	}
	if ((isset($_POST['hidden_kml'])) && ($_POST['hidden_kml']!="")) {
		$kml = "../".$_POST['hidden_kml'];
		$data['kml'] = "project_kml_layer.kml";
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	//echo "<pre>";
	if ((count($data)>0)&&(isset($project_id))) {
		$data['modified'] = date("o-m-d G:i:s");
		if ($project_id==0) {
			//$project_id = nuevaEntrada("proyectos_notours", $datos);
			$insert = db_insert($db_tables['projects'], $data);
			$new_data = array_merge(array('id'=>$insert['data']), $data);
			$insert['data'] = $new_data;
			// success
			if (!$insert['error']) {
				$folders = array(
					'project_folder' => '../'.$projectFolder.$insert['data']['id'].'/',
					'sound_folder' => '../'.$projectFolder.$insert['data']['id'].'/'.$imagesFolder,
					'image_folder' => '../'.$projectFolder.$insert['data']['id'].'/'.$soundFolder,
				);
				$project = @mkdir($folders['project_folder'], 0775);
				$sound = @mkdir($folders['sound_folder'], 0775);
				$image = @mkdir($folders['image_folder'], 0775);
				// error 12: error creating folders
				if (!$project || !$sound || !$image ) {
					$error = return_array('create_project_folders', $folders, $write['error_creating_folders'], '', true, 12, '', 'create_project_folders');
					$return = return_array('exec_update_project', $insert, $write['error_creating_project'].', '.$write['subprocess_error'], '', true, 7, '', 'create_project_folders');
					$return[ 'create_project_folders'] = $error;
					//print_r($return);
					echo json_encode($return);
				} else {
					$insert['data']['folders'] = $folders;
					project_atachments($insert['data']['id'], $insert, 'create', 'creating');
				}
			} else {
				// error 2: Invalid query
				$return = return_array('exec_update_project', $data, $write['error_creating_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_insert');
				$return[ 'db_insert'] = $insert;
				//print_r($return);
				echo json_encode($success);
			}
		} else {
			$update = db_update($db_tables['projects'], $data, array("id"=>$project_id));
			// success
			if (!$update['error']) {
				project_atachments($project_id, $update, 'update', 'updating');
			} else {
				// error 2: Invalid query
				$return = return_array('exec_update_project', $data, $write['error_updating_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_insert');
				$return[ 'db_insert'] = $insert;
				//print_r($return);
				echo json_encode($return);
			}
		}
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_update_project', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['hidden_id'] = '".$_POST['hidden_id']."', \$_POST['hidden_author'] = '".$_POST['hidden_author']."', \$_POST['hidden_title'] = '".$_POST['hidden_title']."', \$_POST['hidden_description'] = '".$_POST['hidden_description']."', \$_POST['hidden_lat'] = '".$_POST['hidden_lat']."', \$_POST['hidden_lonx'] = '".$_POST['hidden_lonx']."', \$_POST['hidden_zoom'] = '".$_POST['hidden_zoom']."', \$_POST['hidden_icon'] = '".$_POST['hidden_icon']."'.", 'exec_update_project');
		//print_r($error);
		echo json_encode($error);
	}
	//echo "</pre>";
	function project_atachments($id, $project, $process_name='create', $process_action_name='creating') {
		global $db_tables, $write, $projectFolder, $icon, $kml, $data;
		$tmp_success = true;
		// icon
		if (isset($icon)) {
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
				$return = return_array('exec_update_project', $project, $write['error_'.$process_action_name.'_project'].', '.$write['subprocess_error'], '', true, 7, '', $process_name.'_project_icon');
				$return[$process_name.'_project_icon'] = $error;
				//print_r($return);
				echo json_encode($return);
			//success
			} else {
				chmod ("../".$icon_data['dest'], 0775);
				$update_icon = db_update($db_tables['projects'], array("icon" => $icon_data['dest']), array("id" => $id));
				$project['data']['icon'] = $icon_data['dest'];
				if($icon!="../inc/img/".$data['icon']) {
					unlink($icon);
				}
			}
		}
		// kml
		if (isset($kml)) {
			$kml_data = array(
				'source'=> $kml,
				'dest'=> $projectFolder.$id."/".$data['kml'],
			);
			if (mueve($kml_data['source'], "../".$kml_data['dest'])) {
				chmod ("../".$kml_data['dest'], 0775);
				$update_kml = db_update($db_tables['projects'], array("kml" => $kml_data['dest']), array("id" => $id));
				$project['data']['kml'] = $kml_data['dest'];
			// error 13: error creating kml
			} else {
				$tmp_success = false;
				$error = return_array($process_name.'_project_kml', $kml_data, $write['error_'.$process_action_name.'_kml'], '', true, 13, '', $process_name.'_project_kml');
				$return = return_array('exec_update_project', $project, $write['error_'.$process_action_name.'_project'].', '.$write['subprocess_error'], '', true, 7, '', $process_name.'_project_kml');
				$return[$process_name.'_project_kml'] = $error;
				//print_r($return);
				echo json_encode($return);
			}
		}
		//success
		if ($tmp_success) {
			$success = return_array('exec_update_project', $project['data'], $write['success_'.$process_action_name.'_project'], $project['dosql'], false, '', '', '');
			//print_r($success);
			echo json_encode($success);
		}
	}
?>