<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	$project_id = null;
	$start = null;
	$data_user = array();
	$fields_user = array('name','mac');
	$data_text = '';
	
	if ( (isset($_POST['project_id'])) && ($_POST['project_id']!="") ) {
		$project_id = intval($_POST['project_id']);
	}
	if ( (isset($_POST['start'])) && ($_POST['start']!="") ) {
		$start = false;
		if($_POST['start']=="true") $start = true;
	}
	
	for ($i=0; $i<count($fields_user); $i++) {
		if ( (isset($_POST[$fields_user[$i]])) && ($_POST[$fields_user[$i]]!="") ) {
			$data_user[$fields_user[$i]] = $_POST[$fields_user[$i]];
		}
		$data_text .= "\$_POST['".$fields_user[$i]."'] = '".$_POST[$fields_user[$i]]."', ";
	}
	$data_text = rtrim($data_text,", ");
	
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}

	// http://www.editor.notours.org/exec/start_walker.php?project_id=612&name=horaciogd&mac=356409049793345&start=true
	//echo "<pre>";
	if ((count($data_user)==count($fields_user))&&(isset($project_id))&&(isset($start))) {
		if (start) {
			$walker = db_select_one($db_tables['walkers'], $fields_user, array($data_user['name'],$data_user['mac']));
			if (!$walker['error']) {
				// el usuario existe
				$walker_id = $walker['data']['id'];
				$walker_data = db_select_all($db_tables['walkers_data'], array('walker_id','project_id'), array($walker_id,$project_id));
				if (!$walker_data['error']) {
					$data = '';
					foreach ($walker_data['data']['notours_walker_data'] as $wd) {
						$delete = db_delete_one($db_tables['walkers_data'], 'id', $wd['id']);
						//print_r($delete);
					}
				} else {
					$error = intval($walker['error_type']);
					switch ($error) {
						case 3:
							// no hay datos de este usuario
							break;
						default:
							// se ha producido un error al intentar leer los datos de este usuario
							//print_r($walker_data);
							echo json_encode($walker_data);
							break;
					}
				}
			} else {
				$error = intval($walker['error_type']);
				switch ($error) {
					case 3:
						// el usuario no existe
						break;
					default:
						// se ha producido un error al intentar comprobar si el usuario existe
						//print_r($walker);
						echo json_encode($walker);
						break;
				}
			}
		} else {
			// error: n(0???) - some variables have wrong values.
			$error = return_array('exec_update_walker', '', $write['error_wrong_datavalue'], '', true, 0, "Wrong variables: \$_POST['latitude'] = '".$_POST['latitude']."', \$_POST['longitude'] = '".$_POST['longitude']."'.", 'exec_update_walker');
			//print_r($error);
			echo json_encode($error);
		}
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_update_walker', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['project_id'] = '".$_POST['project_id']."', ".$data_text.".", 'exec_update_walker');
		//print_r($error);
		echo json_encode($error);
	}
	//echo "</pre>";
?>