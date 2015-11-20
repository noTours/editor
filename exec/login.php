<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	// header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['user'])) && ($_POST['user']!="") ) {
		$user = $_POST["user"];
	}
	if ( (isset($_POST['pass'])) && ($_POST['pass']!="") ) {
		$pass = $_POST["pass"];
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	// echo "<pre>";
	if ( (isset($user)) && (isset($pass)) ) {
		$login = db_select_one($db_tables['authors'], array('name','password'), array($user,$pass));
		// print_r($login);
		echo json_encode($login);
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_login', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['user'] = '".$_POST['user']."', \$_POST['pass'] = '".$_POST['pass']."'.", 'exec_login');
		// print_r($error);
		echo json_encode($error);
	}
	// echo "</pre>";	
?>