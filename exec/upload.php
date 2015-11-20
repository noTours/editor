<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//revisar se se subiu unha nova imaxe e facer unha variable de metadatos mais directa
	if ((isset($_FILES['imaxe'])) AND ($_FILES['imaxe']['error'] == "0")) {
		$nombre = str_replace(" ", "", strtolower($_FILES['imaxe']['name']));
		move_uploaded_file($_FILES['imaxe']['tmp_name'],"../".$tmpImageFolder.$nombre) OR die ("<p>Error!</p>");
    	chmod ("../".$tmpImageFolder.$nombre, 0777);
		echo json_encode(array($_FILES['imaxe']['tmp_name'],"../".$tmpImageFolder.$nombre));
	} else{
		echo json_encode("no image");
	}
?>