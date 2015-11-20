<?php
	
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['table'])) && ($_POST['table']!="") ) {
		$table = $_POST["table"];
	}
	if ( (isset($_POST['insert_keys'])) && ($_POST['insert_keys']!="") ) {
		$insert_keys = explode(",", $_POST["insert_keys"]);
	} else {
		$insert_keys = '';
	}
	if ( (isset($_POST['insert_values'])) && ($_POST['insert_values']!="") ) {
		$insert_values = explode(",", $_POST["insert_values"]);
	} else {
		$insert_values = '';
	}
	
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	// echo "<pre>";
	if ( (isset($table)) && (is_array($insert_keys)) && (is_array($insert_values)) && (count($insert_keys)==count($insert_values)) ) {
		
		$insert = call_user_func('db_insert_new', $table, $insert_keys, $insert_values);
		echo json_encode($insert);
		
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_read', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['element_type'] = '".$_POST['element_type']."', \$_POST['element_id'] = '".$_POST['element_id']."'.", 'exec_read');
		// print_r($error);
		echo json_encode($error);
	}
	// echo "</pre>";	

/* General function to read data from an array of elements or a single one in the DB */
function db_insert_new($table, $insert_keys='', $insert_values='', $link=FALSE) {
	global $db_tables;
	
	$close = false;
	if ((!$link)||(!is_resource($link))) {
		$link = db_conect();
		$close = true;
		// $link is an array when db_conect() returns an error!
		if (is_array($link)) {
			$link['msg'] = $write['error_before_reading_'.$table].', '.$link['msg'];
			$link['process_id'] = 'db_read_new';
			return $link;
		}
	}
	
	$insert_data = array();
	for ($i=0; $i<count($insert_keys); $i++) {
		$insert_data[$insert_keys[$i]] = $insert_values[$i];
	}
	$insert = db_insert_query($link, $db_tables[$table], $insert_data);
	
	
	// errors: 2 - querry error, 3 - 0 results found.
	if(!$insert['error']) {
		$return = return_array('db_insert_new_'.$table, $insert['data'], $insert['msg'].', '.$write['success_inserting_to__'.$table], $insert['dosql']);
	} else {
		$return = return_array('db_insert_new_'.$table, array('table' => $table), $insert['msg'], $insert['dosql'], true, $insert['error_type'], $insert['error_msg'], $insert['error_process']);
	}
	
	if ($close) {
		mysql_close ($link);
	}
	
	return $return;
	
}
?>