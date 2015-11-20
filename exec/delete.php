<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	//echo "<pre>";
	if ( (isset($_POST['element_type'])) && ($_POST['element_type']!="") && (isset($_POST['element_id'])) && ($_POST['element_id']!="")) {
		if ( (isset($_POST['force'])) && ($_POST['force']=="true") ) {
			$force = true;
		}
		$delete = call_user_func('db_delete_'.$_POST['element_type'].'s', $_POST['element_id']);
		//print_r($delete);
		echo json_encode($delete);
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_delete', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['element_type'] = '".$_POST['element_type']."', \$_POST['element_id'] = '".$_POST['element_id']."'.", 'exec_delete');
		//print_r($error);
		echo json_encode($error);
	}
	//echo "</pre>";	
?>