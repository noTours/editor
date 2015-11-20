<?php
	
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	//header("Content-type: text/javascript; charset=utf-8");
	 header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['table'])) && ($_POST['table']!="") ) {
		$table = $_POST["table"];
	} else {
		$table = 'soundmanager_group';
	}
	if ( (isset($_POST['query_key'])) && ($_POST['query_key']!="") ) {
		$query_key = $_POST["query_key"];
	} else {
		$query_key = '';
	}
	if ( (isset($_POST['query_value'])) && ($_POST['query_value']!="") ) {
		$query_value = $_POST["query_value"];
	} else {
		$query_value = '';
	}
	
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_GET['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	// echo "<pre>";
	if ( (isset($table)) && (isset($query_key)) && (isset($query_value)) ) {
		$read = call_user_func('db_read_new', $table, $query_key, $query_value);
		// print_r($read);
		echo json_encode($read);
		
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_read', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['element_type'] = '".$_POST['element_type']."', \$_POST['element_id'] = '".$_POST['element_id']."'.", 'exec_read');
		// print_r($error);
		echo json_encode($error);
	}
	// echo "</pre>";	
	
	
/* General function to read data from an array of elements or a single one in the DB */
function db_read_new($table, $query_key='', $query_value='', $link=FALSE) {
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
	
	$select = db_select_all_query($link, $db_tables[$table], $query_key, $query_value); 
	
	// errors: 2 - querry error, 3 - 0 results found.
	if(!$select['error']) {
		$return = return_array('db_read_new_'.$table, $select['data'], $select['msg'].', '.$write['success_reading_'.$table], $select['dosql']);
	} else {
		$return = return_array('db_read_new_'.$table, array('table' => $table), $select['msg'], $select['dosql'], true, $select['error_type'], $select['error_msg'], $select['error_process']);
	}
	
	if ($close) {
		mysql_close ($link);
	}
	
	return $return;
	
}

?>