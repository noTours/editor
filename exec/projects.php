<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['author_id'])) && ($_POST['author_id']!="") ) {
		$author_id = $_POST['author_id'];
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	//echo "<pre>";
	if (isset($author_id)) {
		$projects = db_select_all($db_tables['projects'], 'author_id', $author_id, 'modified');
		//print_r($projects);
		echo json_encode($projects);
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_projects', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['author_id'] = '".$_POST['author_id']."'.", 'exec_projects');
		//print_r($error);
		echo json_encode($error);
	}
	//echo "</pre>";	
?>