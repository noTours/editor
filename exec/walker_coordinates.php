<?php
	// incluimos el documento que contiene todas las funciones
	include ("../inc/config.php");
	include ("../inc/db.php");
	include ("../inc/noTours.php");
	include ("../inc/noTours-db.php");
	
	//header("Content-type: text/javascript; charset=utf-8");
	 header("Content-type: text/html; charset=utf-8");
	
	if ( (isset($_POST['project_id'])) && ($_POST['project_id']!="") ) {
		$project_id = $_POST["project_id"];
	}
	if ( (isset($_POST['author_id'])) && ($_POST['author_id']!="") ) {
		$author_id = $_POST["author_id"];
	}
	if ( (isset($_POST['last'])) && ($_POST['last']=="true") ) {
		$last = true;
	}
	if ( (isset($_POST['stored'])) && ($_POST['stored']=="true") ) {
		$stored = true;
	}
	if ( (isset($_POST['all'])) && ($_POST['all']=="true") ) {
		$all = true;
	} else {
		$all = false;
	}
	if ( (isset($_POST['lang'])) && ($_POST['lang']!="") ) {
		include ("../inc/lang_".$_POST['lang'].".php");
	} else {
		include ("../inc/lang_es.php");
	}
	
	// last vs all
	// by author, project, name
	// http://www.editor.notours.org/exec/walker_coordinates.php?project_id=96
	// http://www.editor.notours.org/exec/walker_coordinates.php?project_id=96&stored=true
	// http://www.editor.notours.org/exec/walker_coordinates.php?author_id=1
	// http://www.editor.notours.org/exec/walker_coordinates.php?author_id=1&stored=true
	// http://www.editor.notours.org/exec/walker_coordinates.php?&last=true
	// http://www.editor.notours.org/exec/walker_coordinates.php?&stored=true
	
	
	$centro = Array('x' => 0.0, 'y' => 0.0);
	// echo "<pre>";
	if (isset($author_id)) {
		$read = call_user_func('db_read_authors', $author_id, true);
		if (!$read['error']) {
			$return = Array(
				'format' => 'byAuthorId',
				'id' => $read['data']['id'],
				'name' => $read['data']['name'],
				'descripcion' => $read['data']['descripcion'],
				'type' => $read['data']['type'],
				'projects' => Array(),
			);
			if (isset($stored)) $return['format'] = 'byAuthorIdStored';
				foreach ($read['data']['notours_project']['data'] as $project) {
					$centro = LatLonToMeters(latLong($project['latitude'], $project['longitude']));
					if (isset($stored)) {
						$walkers = get_stored_walkers($project['id']);
						if (!$walkers['error']) {
							$walkers_array = $walkers['data']['notours_walker_stored'];
							$n = 0;
							foreach ($walkers_array as $single_walker) {
								$single_walker_data = explode(";", $single_walker['data']);
								$new_single_walker_data = "";
								foreach ($single_walker_data as $position) {
									$position_data = explode(",", $position); 
									$meters = LatLonToMeters(latLong($position_data[0], $position_data[1]));
									$dif = dif($centro, $meters);
									$new_single_walker_data .= $position_data[0].",".$position_data[1].",".$position_data[2].";";
								}
								$walkers_array[$n]['data'] = $new_single_walker_data;
								$n++;
							}
							$data = $walkers_array;
						} else if ($walkers['error_type']==3) {
							$data = 'No walkers';
						} else {
							$data = $walkers;
						}
				} else {
					//if (isset($last)) {
						$walkers = get_last_walkers($project['id'], $centro);
					/*
					} else {
						$walkers = get_walkers($project['id'], $all);
					}*/
					if (!$walkers['error']) {
						$data = $walkers['data'];
					} else if ($walkers['error_type']==3) {
						$data = 'No walkers';
					} else {
						$data = $walkers;
					}
				}
				array_push($return['projects'], Array(
					'id' => $project['id'],
					'title' => $project['title'],
					'latitude' => $project['latitude'],
					'longitude' => $project['longitude'],
					'x' => $centro['x'],
					'y' => $centro['y'],
					'zoom' => $project['zoom'],
					'levels' => $project['levels'],
					'data' => $data
				));
			}
		}
		//print_r($return);
		echo json_encode($return);
	} else if (isset($project_id)) {
		$read = call_user_func('db_read_projects', $project_id, false);
		if (!$read['error']) {
			$centro = LatLonToMeters(latLong($read['data']['latitude'], $read['data']['longitude']));
			$return = Array(
				'format' => 'byProjectId',
				'id' => $read['data']['id'],
				'title' => $read['data']['title'],
				'latitude' => $read['data']['latitude'],
				'longitude' => $read['data']['longitude'],
				'x' => $centro['x'],
				'y' => $centro['y'],
				'zoom' => $read['data']['zoom'],
				'levels' => $read['data']['levels'],
				'data' => Array()
			);
			if (isset($stored)) {
				$return['format'] = 'byProjectIdStored';
				$walkers = get_stored_walkers($project_id);
				if (!$walkers['error']) {
					$walkers_array = $walkers['data']['notours_walker_stored'];
					$n = 0;
					foreach ($walkers_array as $single_walker) {
						$single_walker_data = explode(";", $single_walker['data']);
						$new_single_walker_data = "";
						foreach ($single_walker_data as $position) {
							$position_data = explode(",", $position); 
							$meters = LatLonToMeters(latLong($position_data[0], $position_data[1]));
							$dif = dif($centro, $meters);
							$new_single_walker_data .= $position_data[0].",".$position_data[1].",".$position_data[2].";";
						}
						$walkers_array[$n]['data'] = $new_single_walker_data;
						$n++;
					}
					$return['data'] = $walkers_array;
				} else if ($walkers['error_type']==3) {
					$return['data'] = 'No walkers';
				} else {
					$return['data'] = $walkers;
				}
			} else {
				//if (isset($last)) {
					$walkers = get_last_walkers($project_id, $centro);
				/*
				} else {
					$walkers = get_walkers($project_id, $all);
				}*/
				if (!$walkers['error']) {
					$return['data'] = $walkers['data'];
				} else if ($walkers['error_type']==3) {
					$return['data'] = 'No walkers';
				} else {
					$return['data'] = $walkers;
				}
			}
		} else {
			$return = $read;
		}
		//print_r($return);
		echo json_encode($return);
	} else if (isset($last)) {
		$now = time();
		$now -= 20;
		$date = date("o-m-d G:i:s", $now);
		$project_id = 31;
		$reference_project = call_user_func('db_read_projects', $project_id, false);
		if (!$reference_project['error']) {
			$centro = LatLonToMeters(latLong($reference_project['data']['latitude'], $reference_project['data']['longitude']));
			$return = Array(
				'format' => 'last',
				'id' => $reference_project['data']['id'],
				'title' => $reference_project['data']['title'],
				'latitude' => $reference_project['data']['latitude'],
				'longitude' => $reference_project['data']['longitude'],
				'x' => $centro['x'],
				'y' => $centro['y'],
				'zoom' => $reference_project['data']['zoom'],
				'levels' => $reference_project['data']['levels'],
				'data' => Array()
			);
			$read = db_select_all($db_tables['walkers_data'], 'time', '>'.$date, '*time');
			if (!$read['error']) {
				$walkers = Array();
				$return_walkers = Array();
				foreach ($read['data']['notours_walker_data'] as $walker) {
					if (!in_array($walker['walker_id'], $walkers)) {
						$meters = LatLonToMeters(latLong($walker['latitude'], $walker['longitude']));
						$dif = dif($centro, $meters);
						$walker['x'] = $walker['latitude'];
						$walker['y'] = $walker['longitude'];
    					array_push($walkers, $walker['walker_id']);
    					array_push($return_walkers, $walker);
					}	
				}
				$return['data'] = $return_walkers;
			} else {
				$return['data'] = "nobody";
			}
			
		} else {
			$return = $reference_project;
		}
		//print_r($return);
		echo json_encode($return);
	} else if (isset($stored)) {
	
		$project_id = 31;
		$reference_project = call_user_func('db_read_projects', $project_id, false);
		if (!$reference_project['error']) {
			$centro = LatLonToMeters(latLong($reference_project['data']['latitude'], $reference_project['data']['longitude']));
			$return = Array(
				'format' => 'stored',
				'id' => $reference_project['data']['id'],
				'title' => $reference_project['data']['title'],
				'latitude' => $reference_project['data']['latitude'],
				'longitude' => $reference_project['data']['longitude'],
				'x' => $centro['x'],
				'y' => $centro['y'],
				'zoom' => $reference_project['data']['zoom'],
				'levels' => $reference_project['data']['levels'],
				'data' => Array()
			);
			$read = db_select_all($db_tables['walkers_stored'],'','');
			if (!$read['error']) {
				$walkers_array = $read['data']['notours_walker_stored'];
				$n = 0;
				foreach ($walkers_array as $single_walker) {
					$single_walker_data = explode(";", $single_walker['data']);
					$new_single_walker_data = "";
					foreach ($single_walker_data as $position) {
						$position_data = explode(",", $position); 
						$meters = LatLonToMeters(latLong($position_data[0], $position_data[1]));
						$dif = dif($centro, $meters);
						$new_single_walker_data .= $position_data[0].",".$position_data[1].",".$position_data[2].";";
					}
					$walkers_array[$n]['data'] = $new_single_walker_data;
					$n++;
				}
				$return['data'] = $walkers_array;
			} else if ($read['error_type']==3) {
				$return = 'No walkers';
			} else {
				$return = $read;
			}
		} else {
			$return = $reference_project;
		}
		//print_r($return);
		echo json_encode($return);
	} else {
		// error: 10 - POST/GET vars missing.
		$error = return_array('exec_read', '', $write['data_mising'], '', true, 10, "Mising variables: \$_POST['project_id'] = '".$_POST['project_id']."'.", 'exec_read');
		//print_r($error);
		echo json_encode($error);
	}
	// echo "</pre>";
	function get_last_walkers($id, $centro) {
		global $db_tables;
		$now = time();
		$now -= 30;
		$date = date("o-m-d G:i:s", $now);
		$return = db_select_all($db_tables['walkers_data'], Array('project_id','time'), Array($id, '>'.$date), '*time');
		$trigger = db_select_all($db_tables['walkers_trigger'], Array('project_id','time'), Array($id, '>'.$date), '*time');
		if (!$trigger['error']) {
			$walkers_t = Array();
			$r_t = Array();
			foreach ($trigger['data']['notours_walker_trigger'] as $t) {
				if (($t['trigger']==1)&&(!in_array($t['walker_id'], $walkers_t))) {
					$r_t[$t['walker_id']] = Array('trigger' => $t['trigger'], 'level' => $t['level']);
					array_push($walkers_t, $t['walker_id']);
				}	
			}
		}
		
		if (!$return['error']) {
			$walkers = Array();
			$r = Array();
			foreach ($return['data']['notours_walker_data'] as $walker) {
				if (!in_array($walker['walker_id'], $walkers)) {
					$meters = LatLonToMeters(latLong($walker['latitude'], $walker['longitude']));
					$dif = dif($centro, $meters);
					$walker['x'] = $walker['latitude'];
					$walker['y'] = $walker['longitude'];
					if (isset($r_t[$walker['walker_id']])) {
						$walker['trigger'] = $r_t[$walker['walker_id']]['trigger'];
						$walker['level'] = $r_t[$walker['walker_id']]['level'];
					} else {
						$walker['trigger'] = 0;
						$walker['level'] = 0;
					}
					$walker['miliseconds'] = strtotime($walker['time']);
					array_push($walkers, $walker['walker_id']);
    				array_push($r, $walker);
				}	
			}
			$return['data'] = $r;
		}
		return $return;
	}
	function get_stored_walkers($id) {
		global $db_tables;
		$return = db_select_all($db_tables['walkers_stored'], 'project_id', $id);
		/*if (!$return['error']) {
			$walkers = Array();
			$r = Array();
			foreach ($return['data']['notours_walker_data'] as $walker) {
				if (!in_array($walker['walker_id'], $walkers)) {
    				array_push($walkers, $walker['walker_id']);
    				array_push($r, $walker);
				}	
			}
			$return['data'] = $r;
		}*/
		return $return;
	}
	function get_walkers($id, $repeat=FALSE) {
		global $db_tables;
		$return = db_select_all($db_tables['walkers_data'], 'project_id', $id, '*time');
		if (!$return['error']) {
			$walkers = Array();
			$r = Array();
			foreach ($return['data']['notours_walker_data'] as $walker) {
				if ($repeat) {
					array_push($r, $walker);
				} else if (!in_array($walker['walker_id'], $walkers)) {
    				array_push($walkers, $walker['walker_id']);
    				array_push($r, $walker);
				}
			}
			$return['data'] = $r;
		}
		return $return;
	}
	
	function latLong($lat, $long) {
		return Array('lat' => $lat, 'long' => $long);
	}
	function LatLonToMeters ($p) {
		$y = log(tan(0.25 * M_PI + 0.5 * toRadians($p['lat']))); //(180 - ($p['lat'] + 90)
		$x = toRadians($p['long']); //$p['long'] + 180
		return Array('x' => toEarthMeters($x), 'y' => toEarthMeters($y));
	}
	function toRadians($v) {
		return $v * M_PI / 180;
	}
	function toEarthMeters($v) {
		return $v * 6378137;
	}
	function dif($o, $p) {
		return Array('x' => round($p['x'] - $o['x'],4), 'y' => round($p['y'] - $o['y'],4));
	}

?>