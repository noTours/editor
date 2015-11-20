<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['newuser'])) && ($_POST['newuser']!="") ) {
		$user = $_POST["newuser"];
	}
	if ( (isset($_POST['newpass'])) && ($_POST['newpass']!="") ) {
		$pass = $_POST["newpass"];
	}
	if ( (isset($_POST['twice'])) && ($_POST['twice']!="") ) {
		$twice = $_POST["twice"];
	}
	if ( (isset($_POST['newmail'])) && ($_POST['newmail']!="") ) {
		$mail = $_POST["newmail"];
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	//echo "<pre>";
	if ( (isset($user)) && (isset($pass)) && (isset($twice)) && (isset($mail)) ) {
		$match = db_select_one($db_tables['authors'], array('name','password'), array($user,$pass));
		// error - 11: an author with same name and password already exists!
		if (!$match['error']) {
			$error = return_array('exec_signup', array('newuser'=>$user, 'newpass'=>$pass), $write['author_exists'], '', true, 11, '', 'exec_signup');
			//print_r($error);
			echo json_encode($error);
		} else {
			$insert = db_insert($db_tables['authors'], array("name" => $user, "password" => $pass, "mail" => $mail, "descripcion" => ''));
			//success
			if (!$insert['error']) {
				$success = return_array('exec_signup', array("id" =>$insert['data'], "name" => $user, "password" => $pass, "mail" => $mail, "descripcion" => ''), $write['success_creating_author'].', '.$insert['msg'], $insert['dosql'], false, '', '', '');
				echo json_encode($success);
				//print_r($success);
			} else {
				$error = return_array('exec_signup', array('newuser'=>$user, 'newpass'=>$pass, "mail" => $mail), $write['error_creating_author'].', '.$write['subprocess_error'], '', true, 7, '', 'db_insert');
				$error[ 'db_insert'] = $insert;
				//print_r($error);
				echo json_encode($error);
			}
		}
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_login', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['newuser'] = '".$_POST['newuser']."', \$_POST['newpass'] = '".$_POST['newpass']."', \$_POST['twice'] = '".$_POST['twice']."', \$_POST['newmail'] = '".$_POST['newmail']."'.", 'exec_signup');
		//print_r($error);
		echo json_encode($error);
	}
	//echo "</pre>";	
?>