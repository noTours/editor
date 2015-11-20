<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	// header("Content-type: text/html; charset=utf-8");
	
	$project_id = null;
	$store = null;
	$data_user = array();
	$fields_user = array('name','mac');
	$data_text = '';
	
	if ( (isset($_POST['project_id'])) && ($_POST['project_id']!="") ) {
		$project_id = intval($_POST['project_id']);
	}
	if ( (isset($_POST['store'])) && ($_POST['store']!="") ) {
		$store = false;
		if($_POST['store']=="true") $store = true;
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

	// http://www.vhplab.net/editor/exec/store_walker.php?project_id=0&name=horacio&mac=356409049793345&store=true
	// echo "<pre>";
	if ((count($data_user)==count($fields_user))&&(isset($project_id))&&(isset($store))) {
		if (store) {
			$walker = db_select_one($db_tables['walkers'], $fields_user, array($data_user['name'],$data_user['mac']));
			if (!$walker['error']) {
				// el usuario existe
				$walker_id = $walker['data']['id'];
				$walker_data = db_select_all($db_tables['walkers_data'], array('walker_id','project_id'), array($walker_id,$project_id));
				if (!$walker_data['error']) {
					$data = '';
					foreach ($walker_data['data']['notours_walker_data'] as $wd) {
    					$data .= $wd['latitude'].', '.$wd['longitude'].', '.$wd['time']."; ";
					}
					$data = trim($data);
					$insert = db_insert($db_tables['walkers_stored'], array('walker_id'=>$walker_id, 'project_id'=>$project_id, 'data'=>$data));
					if (!$insert['error']) {
						// se han guardado los datos del usuario
						$delete = db_delete_all($db_tables['walkers_data'], array('walker_id','project_id'), array($walker_id,$project_id));
						if (!$delete['error']) {
							// las entradas antiguas del usuario se han borrado correctamente
						} else {
							// se ha producido un error al intentar borrar las entradas antiguas del usuario
							// print_r($delete);
							echo json_encode($delete);
						}
					} else {
						// se ha producido un error al intentar guardar los datos del usuario
						// print_r($insert);
						echo json_encode($insert);
					}
				} else {
					$error = intval($walker['error_type']);
					switch ($error) {
						case 3:
							// no hay datos de este usuario
							break;
						default:
							// se ha producido un error al intentar leer los datos de este usuario
							// print_r($walker_data);
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
						// print_r($walker);
						echo json_encode($walker);
						break;
				}
			}
		} else {
			// error: n(0???) - some variables have wrong values.
			$error = return_array('exec_update_walker', '', $write['error_wrong_datavalue'], '', true, 0, "Wrong variables: \$_POST['latitude'] = '".$_POST['latitude']."', \$_POST['longitude'] = '".$_POST['longitude']."'.", 'exec_update_walker');
			// print_r($error);
			echo json_encode($error);
		}
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_update_walker', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['project_id'] = '".$_POST['project_id']."', ".$data_text.".", 'exec_update_walker');
		// print_r($error);
		echo json_encode($error);
	}
	// echo "</pre>";
?>