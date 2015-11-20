<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	include ("../inc/noTours-feed.php");
	
	header("Content-type: text/javascript; charset=utf-8");
	//header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['element_type'])) && ($_POST['element_type']!="") ) {
		$element_type = $_POST["element_type"];
	}
	if ( (isset($_POST['element_id'])) && ($_POST['element_id']!="") ) {
		$element_id = $_POST["element_id"];
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_es.php");
		//include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	//echo "<pre>";
	if ( (isset($element_type)) && (isset($element_id)) ) {
		$project = call_user_func('db_read_'.$element_type.'s', $element_id, true);
		if ($project['error']) {
			$return = return_array('exec_export_project', '', $write['error_exporting_project'].', '.$write['subprocess_error'], '', true, 7, '', 'db_read_'.$element_type.'s');
			$return['db_read_'.$element_type.'s'] = $project;
			//print_r($return);
			echo json_encode($return);
		} else {
			
			//$feed_0 = objects_feed($project['data'], 'rss0');
			//$escribe_0 = escribe("../".$projectFolder.$project['data']['id']."/soundscape-v0.rss", $feed_0, "w");
				
			$feed_1 = objects_feed($project['data'], 'rss1');
			$list = objects_list($project['data']);
			$escribe_1 = escribe("../".$projectFolder.$project['data']['id']."/soundscape.rss", $feed_1, "w");
			$escribe_list = escribe("../".$projectFolder.$project['data']['id']."/sound/required.txt", $list, "w");
			
			//if ( ($escribe_0) && ($escribe_1) ){
			if ($escribe_1){
				$comprimir = comprimir("../".$projectFolder.$project['data']['id']);
				if (!$comprimir['error']) {
					//$success = return_array('exec_export_project', array("feed_0" =>"../".$projectFolder.$project['data']['id']."/soundscape-v0.rss", "feed_1" => "../".$projectFolder.$project['data']['id']."/soundscape-v1.rss", "zip"=>$comprimir['data']['zip']), $write['success_exporting_project'].', '.$comprimir['msg'], '', false, '', '', '');
					$success = return_array('exec_export_project', array("feed" =>"../".$projectFolder.$project['data']['id']."/soundscape.rss", "zip"=>$comprimir['data']['zip']), $write['success_exporting_project'].', '.$comprimir['msg'], '', false, '', '', '');
					//print_r($success);
					echo json_encode($success);
				} else {
					$return = return_array('exec_export_project', '', $write['error_exporting_project'].', '.$write['subprocess_error'].', '.$comprimir['msg'], '', true, 7, '', 'comprimir');
					$return[ 'comprimir'] = $comprimir;
					//print_r($return);
					echo json_encode($return);
				}
			} else {
				$error = return_array('exec_export_project', array("feed_0" =>"../".$projectFolder.$project['data']['id']."/soundscape-v0.rss", "feed_1" => "../".$projectFolder.$project['data']['id']."/soundscape-v1.rss"), $write['error_creating_rss'], '', true, 15, '', 'escribe');
				$return = return_array('exec_export_project', '', $write['error_exporting_project'].', '.$write['subprocess_error'].', '.$error['msg'], '', true, 7, '', 'escribe');
				$return[ 'escribe'] = $error;
				//print_r($return);
				echo json_encode($return);
			}
			
		}
		
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_export_project', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['element_type'] = '".$_POST['element_type']."', \$_POST['element_id'] = '".$_POST['element_id']."'.", 'exec_export_project');
		//print_r($error);
		echo json_encode($error);
	}
	//echo "</pre>";
?>