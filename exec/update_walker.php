<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	// header("Content-type: text/html; charset=utf-8");
	
	$data_user = array();
	$data = array();
	$project_id = null;
	$fields_user = array('name','mac');
	$fields_data = array('latitude','longitude');
	$data_text = '';
	$auth  = '';

	if((isset($_POST['auth_key']))){
		$auth = $_POST['auth_key'];
	}
	
	if ( (isset($_POST['project_id'])) && ($_POST['project_id']!="") ) {
		$project_id = intval($_POST['project_id']);
	}
	for ($i=0; $i<count($fields_user); $i++) {
		if ( (isset($_POST[$fields_user[$i]])) && ($_POST[$fields_user[$i]]!="") ) {
			$data_user[$fields_user[$i]] = $_POST[$fields_user[$i]];
		}
		$data_text .= "\$_POST['".$fields_user[$i]."'] = '".$_POST[$fields_user[$i]]."', ";
	}
	for ($i=0; $i<count($fields_data); $i++) {
		if ( (isset($_POST[$fields_data[$i]])) && ($_POST[$fields_data[$i]]!="") ) {
			$data[$fields_data[$i]] = floatval($_POST[$fields_data[$i]]);
		}
		$data_text .= "\$_POST['".$fields_data[$i]."'] = '".$_POST[$fields_data[$i]]."', ";
	}
	$data_text = rtrim($data_text,", ");
	
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	// http://www.vhplab.net/editor/exec/update_walker.php?project_id=0&name=horacio&mac=356409049793345&latitude=48.288787&longitude=14.299319
	// echo "<pre>";
	if($auth === $auth_key){
	
		if ((count($data)==count($fields_data))&&(count($data_user)==count($fields_user))&&(isset($project_id))) {
			if (($data['latitude']!=0.0)&&($data['longitude']!=0.0)) {
				$walker = db_select_one($db_tables['walkers'], $fields_user, array($data_user['name'],$data_user['mac']));
				if (!$walker['error']) {
					// el usuario existe
					$user_id = $walker['data']['id'];
				} else {
					$error = intval($walker['error_type']);
					switch ($error) {
						case 3:
							// el usuario no existe
							$insert = db_insert($db_tables['walkers'], $data_user);
							if (!$insert['error']) {
								// se ha creado un nuevo usuario
								$user_id = $insert['data'];
							} else {
								// se ha producido un error al crear un nuevo usuario
								$user_id = false;
								// print_r($insert);
								echo json_encode($insert);
							}
							break;
						default:
							// se ha producido un error al intentar comprobar si el usuario existe
							$user_id = false;
							// print_r($walker);
							echo json_encode($walker);
							break;
					}
				}
				if ($user_id) {
					$data['walker_id'] = $user_id;
					$data['project_id'] = $project_id;
					$data['time'] = date("o-m-d G:i:s");
					$insert = db_insert($db_tables['walkers_data'], $data);
					$new_data = array_merge(array('id'=>$insert['data']), $data);
					$insert['data'] = $new_data;
					if (!$insert['error']) {
						// success
						$return = return_array('exec_update_walker', $insert['data'], $write['success_updating_data'], $insert['dosql'], false, '', '', '');
					} else {
						// error 2: Invalid query
						$return = return_array('exec_update_walker', $data, $write['error_inserting_data'].', '.$write['subprocess_error'], '', true, 7, '', 'db_insert');
						$return[ 'db_insert'] = $insert;
					}
					// print_r($return);
					echo json_encode($return);
				}
			} else {
				// error: 15 - some variables have wrong values.
				$error = return_array('exec_update_walker', '', $write['error_wrong_datavalue'], '', true, 15, "Wrong variables: \$_POST['latitude'] = '".$_POST['latitude']."', \$_POST['longitude'] = '".$_POST['longitude']."'.", 'exec_update_walker');
				// print_r($error);
				echo json_encode($error);
			}
		} else {
			// error: 10 - POST/GET vars missing.
			$error = return_array('exec_update_walker', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['project_id'] = '".$_POST['project_id']."', ".$data_text.".", 'exec_update_walker');
			// print_r($error);
			echo json_encode($error);
		}
		
	}else{
		// error: 11 - wrong auth_key
		$error = return_array('exec_update_data', '', $write['auth_missing'], '', true, 11, "Missing or wrong auth key: ".$auth.".", 'exec_update_data');
	
		echo json_encode($error);
	}
	// echo "</pre>";
?>