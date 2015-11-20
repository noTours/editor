<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	 	<script type="text/javascript" charset="utf-8" src="../inc/js/jquery-1.4.4.min.js"></script>
	 	<script type="text/javascript" charset="utf-8" src="../inc/js/noTours-html.min.js"></script>
	 	<script type="text/javascript" charset="utf-8" src="../inc/js/noTours.min.js"></script>
	 	<link rel="stylesheet" type="text/css" media="screen"  href="../inc/css/noTours-iframe.css"/>
	</head>
	<script language="javascript">
	//<![CDATA[
		var win = window.name;
		var data = win.split("_");
		var campo = data[1];
		var id = data[2];
		var noTours = parent.window.noTours;
		<?php
		// incluimos el documento que contiene todas las funciones
		include ("../inc/config.php");
		include ("../inc/db.php");
		include ("../inc/noTours.php");
		include ("../inc/noTours-db.php");
		$upload = false;
		if ((isset($_FILES['kml'])) AND ($_FILES['kml']['error'] == "0")) {
			$nombre = str_replace(" ", "", strtolower($_FILES['kml']['name']));
			if (move_uploaded_file($_FILES['kml']['tmp_name'],"../".$tmpKmlFolder.$nombre)) {
    			chmod ("../".$tmpKmlFolder.$nombre, 0777);
    			$upload = true;
    		}	
		}
		echo "\t\tvar kml = '".$nombre."';\n";
		echo "\t\tvar root = '".$root."';\n";
		echo "\t\tvar folder = '".$tmpKmlFolder."';\n";
		echo "\t\tvar ok = '".$upload."';\n";
		?>
		$(document).ready(function() {
			$("body").append(loading_html());
			if (ok) {
				eval("parent.window.project_"+ id +".receiveKml('"+ kml +"','"+ folder +"');");
				window.location = root +'exec/upload_kml.html';
			}
		});
	//]]>
	</script>
	<body>
	</body>
</html>