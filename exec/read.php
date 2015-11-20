<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	// header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['element_type'])) && ($_POST['element_type']!="") ) {
		$element_type = $_POST["element_type"];
	}
	if ( (isset($_POST['element_id'])) && ($_POST['element_id']!="") ) {
		$element_id = $_POST["element_id"];
	}
	if ( (isset($_POST['recursive'])) && ($_POST['recursive']=="true") ) {
		$recursive = true;
	} else {
		$recursive = false;
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	// echo "<pre>";
	if ( (isset($element_type)) && (isset($element_id)) ) {
		$read = call_user_func('db_read_'.$element_type.'s', $element_id, $recursive);
		// print_r($read);
		echo json_encode($read);
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_read', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['element_type'] = '".$_POST['element_type']."', \$_POST['element_id'] = '".$_POST['element_id']."'.", 'exec_read');
		// print_r($error);
		echo json_encode($error);
	}
	// echo "</pre>";	
?>