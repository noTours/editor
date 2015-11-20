<?php
	header("Content-type: text/javascript; charset=utf-8");
	// include document containing text translations
	if ((isset($_GET['lang']))&&($_GET['lang']!='')) {
		include ("../inc/noTours-lang-".$_GET['lang'].".php");
		echo '
//**************
// Lang Object
//**************

function Lang_'.$_GET['lang'].'() {
	
	this.id = "'.$_GET['lang'].'";';
		$fields = array_keys($write);
		$values = array_values($write);
		for ($i=0; $i<count($fields); $i++) {
			echo '
	this.'.$fields[$i].' = '.json_encode($values[$i]).';';
		}
		echo '
}';
	}
?>