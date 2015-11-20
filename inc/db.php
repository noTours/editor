<?php
/*!
 * Base Framework 1.02
 * 
 * Attribution-NonCommercial-ShareAlike 3.0
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 * 
 * Base Framework by Horacio González Diéguez
 * is licensed under a Creative Commons based on a work at
 * https://github.com/horaciogd/Base-Framework
 *
 * Date: Fri Jan 02 2015
 * 
 * enjoy the code and drop me a line for comments and questions!
 * horaciogd at vhplab dot net
 *
 */
// mysql_connect & mysql_select_db (execute + error handling)
function db_conect() {
	global $db, $write;
	$link = @mysql_connect($db['host'],$db['user'],$db['pass']);
	if (!$link) {
		$return = return_array('db_conect', '', $write['error_conecting_db'], '', true, 0, mysql_error(), 'db_conect');
		return $return;
	} else {
		$select = mysql_select_db ($db['data'], $link);
		if (!$select) {
			$return = return_array('db_conect', '', $write['error_selecting_db'], '', true, 1, mysql_error(), 'db_conect');
			return $return;
		} else {
			return $link;
		}
	}
}

// returns an sql query depending on input variables
function sql_query ($table, $query_key, $query_value, $query_order, $query_limit, $query='SELECT *') {
	$dosql = $query." FROM `".$table."`";
	// conditions
	if($query_key && $query_value) {
		if (is_array($query_key) && is_array($query_value)) {
			if ($query_value[0][0]=='<') {
				$dosql .= " WHERE `".$query_key[0]."` < '".substr($query_value[0], 1)."'";
			} else if ($query_value[0][0]=='>') {
				$dosql .= " WHERE `".$query_key[0]."` > '".substr($query_value[0], 1)."'";
			} else if ($query_value[0][0]=='*') {
				$dosql .= " WHERE `".$query_key[0]."` LIKE '".substr($query_value[0], 1)."'";
			} else {
				$dosql .= " WHERE `".$query_key[0]."` = '".$query_value[0]."'";
			}
			for ($i=1; $i<count($query_key);$i++) {
				if ($query_value[$i][0]=='<') {
					$dosql .= " AND `".$query_key[$i]."` < '".substr($query_value[$i], 1)."'";
				} else if($query_value[$i][0]=='>') {
					$dosql .= " AND `".$query_key[$i]."` > '".substr($query_value[$i], 1)."'";
				} else if($query_value[$i][0]=='*') {
					$dosql .= " AND `".$query_key[$i]."` LIKE '".substr($query_value[$i], 1)."'";
				} else {
					$dosql .= " AND `".$query_key[$i]."` = '".$query_value[$i]."'";
				}
			}
		} else if (($query_key!='') && ($query_value!='')) {
			if ($query_value[0]=='*') {
				$dosql .= " WHERE `".$query_key."` LIKE '".substr($query_value, 1)."'";
			} else if ($query_value[0]=='<') {
				$dosql .= " WHERE `".$query_key."` < '".substr($query_value, 1)."'";
			} else if ($query_value[0]=='>') {
				$dosql .= " WHERE `".$query_key."` > '".substr($query_value, 1)."'";
			} else {
				$dosql .= " WHERE `".$query_key."` = '".$query_value."'";
			}
		}
	}
	// order
	if ($query_order && ($query_order!='')) {
		if($query_order[0]=='*') {
			$dosql .= " ORDER BY `".substr($query_order, 1)."`  DESC";
		} else {
			$dosql .= " ORDER BY `".$query_order."`  ASC";
		}
	}
	// limit
	if ($query_limit && ($query_limit!='')) {
		//$array_limit = preg_split (',', $query_limit);
		$dosql .= " LIMIT ".$query_limit;
	}
	return $dosql;
}

/* general function behaviour */
//
//	1) connect to db ?
//	2) build sql
//	3) make sql query
//	4) check results
//	5) cose connection ?
//	6) buil response array
//			- error (boolean)
//			- error type (0,1,2,3)
//			- error msg (vervose info about error)
//			- dosql (txt used for the sql query)
//			- result data (array)
//			- msg (ui info about success / error)

/* yo creo que esta sobra */
// Para leer todos los datos de un elemento de la bd y devolverlos en un array
function db_select_one_query($link=FALSE, $table='', $query_key='', $query_value='') {
	global $write;
	if (is_resource($link)) {
		// build the sql query
		$dosql = sql_query($table, $query_key, $query_value, false, '0, 1');
		// store sql query result in $result variable
		$result = mysql_query($dosql, $link);
		// $result is false when sql query failed
		if (!$result) {
			$return = return_array('db_select_one_query', '', $write['error_selecting_db_entry'].', '.$write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_select_one_query');
			return $return;
		// mysql_num_rows is 0 when sql query returns no results	
		} else if (mysql_num_rows($result)==0) {
			$return = return_array('db_select_one_query', '', $write['error_selecting_db_entry'].', '.$write['no_db_entries_found'], $dosql, true, 3, '', 'db_select_one_query');
			return $return;
		} else {
			$row = mysql_fetch_array($result);
			$entry = array();
			$fields = array_keys($row);
			$values = array_values($row);
			for($i=0; $i<count($fields); $i++) {
				if (!is_int($fields[$i])) {
					$entry[$fields[$i]] = $values[$i];
				}
			}
			$return = return_array('db_select_one_query', $entry, $write['success_selecting_db_entry'], $dosql);
			return $return;
		}
	} else {
		$return = return_array('db_select_one_query', '', $write['error_selecting_db_entry'].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_select_one_query');
		return $return;
	}
}
// Para leer todos los datos de un elemento de la bd y devolverlos en un array
function db_select_one($table, $query_key, $query_value) {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_selecting_db_entry'].', '.$link['msg'];
		return $link;
	} else {
		$return = db_select_one_query($link, $table, $query_key, $query_value);
		mysql_close ($link);
		return $return;
	}
}

// Para leer todaas las entradas de una tabla de la bd y devolverlas en un array
function db_select_all_query($link=FALSE, $table='', $query_key='', $query_value='', $query_order='', $query_limit='') {
	global $write;
	if (is_resource($link)) {
		// build the sql query
		$dosql = sql_query($table, $query_key, $query_value, $query_order, $query_limit);
		// store sql query result in $result variable
		$result = mysql_query($dosql);
		// $result is false when sql query failed
		if (!$result) {
			$return = return_array('db_select_all_query', '', $write['error_selecting_db_entries'].', '.$write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_select_all_query');
			return $return;
		// mysql_num_rows is 0 when sql query returns no results	
		} else if (mysql_num_rows($result)==0) {
			$return = return_array('db_select_all_query', '', $write['error_selecting_db_entries'].', '.$write['no_db_entries_found'], $dosql, true, 3, '', 'db_select_all_query');
			return $return;
		} else {
			$entries = array();
			$entries[$table] = array();
			while ($row = mysql_fetch_array($result)) {
				$data = array();
				$fields = array_keys($row);
				$values = array_values($row);
				for($i=0; $i<count($fields); $i++) {
					if (!is_int($fields[$i])) {
						$data[$fields[$i]] = iconv('UTF-8', 'UTF-8//IGNORE', $values[$i]);
						//$data[$fields[$i]] =  $values[$i];
					}
				}
				array_push($entries[$table], $data);
			}
			$return = return_array('db_select_all_query', $entries, $write['success_selecting_db_entries'], $dosql);
			return $return;
		}
	} else {
		$return = return_array('db_select_all_query', '', $write['error_selecting_db_entries'].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_select_all_query');
		return $return;
	}
}
function db_select_all($table, $query_key, $query_value, $query_order='', $query_limit='') {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_selecting_db_entries'].', '.$link['msg'];
		return $link;
	} else {
		$return = db_select_all_query($link, $table, $query_key, $query_value, $query_order, $query_limit);
		mysql_close ($link);
		return $return;
	}
}

// Para leer todaas las entradas de una tabla de la bd y devolverlas en un array
function db_delete_all_query($link=FALSE, $table='', $query_key='', $query_value='', $query_order='', $query_limit='') {
	global $write;
	if (is_resource($link)) {
		// build the sql query
		$dosql = sql_query($table, $query_key, $query_value, $query_order, $query_limit, 'DELETE');
		// store sql query result in $result variable
		$result = mysql_query($dosql);
		// $result is false when sql query failed
		if (!$result) {
			$return = return_array('db_delete_all_query', '', $write['error_deleting_db_entries'].', '.$write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_delete_all_query');
			return $return;
		} else {
			$return = return_array('db_delete_all_query', '', $write['success_deleting_db_entries'], $dosql);
			return $return;
		}
	} else {
		$return = return_array('db_delete_all_query', '', $write['error_deleting_db_entries'].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_delete_all_query');
		return $return;
	}
}
function db_delete_all($table, $query_key, $query_value, $query_order='', $query_limit='') {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_deleting_db_entries'].', '.$link['msg'];
		return $link;
	} else {
		$return = db_delete_all_query($link, $table, $query_key, $query_value, $query_order, $query_limit);
		mysql_close ($link);
		return $return;
	}
}


// Para leer todos los datos de un elemento de la bd y devolverlos en un array
function db_select_avg_query($table, $query_column, $query_key, $query_value) {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_selecting_db_avg'].', '.$link['msg'];
		return $link;
	} else {
		// build the sql query
		$dosql = "SELECT";
		if (is_array($query_column)) {
			$dosql .= ' AVG(`'.$query_column[0].'`)';
			for ($i=1; $i<count($query_column);$i++) {
				$dosql .= ', AVG(`'.$query_column[$i].'`)';
			}
		} else {
			$dosql .= ' AVG(`'.$query_column.'`)';
		}
		if (is_array($query_key)&&is_array($query_value)) {
			$dosql .= " FROM `".$table."` WHERE `".$query_key[0]."`='".$query_value[0]."'";
			for ($i=1; $i<count($query_key);$i++) {
				$dosql .=  " AND `".$query_key[$i]."`='".$query_value[$i]."'";
			}
		} else {
			$dosql .= " FROM `".$table."` WHERE `".$query_key."`='".$query_value."' LIMIT 0, 1";
		}
		// store sql query result in $result variable
		$result = mysql_query ($dosql);
		// $result is false when sql query failed
		if (!$result) {
			$return = return_array('db_select_avg_query', '', $write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_select_avg_query');
			$return['msg'] = $write['error_selecting_db_avg'].', '.$return['msg'];
			mysql_close ($link);
			return $return;
		// mysql_num_rows is 0 when sql query returns no results	
		} else if (mysql_num_rows($result)==0) {
			$return = return_array('db_select_avg_query', '', $write['no_db_entries_found'], $dosql, true, 3, '', 'db_select_avg_query');
			$return['msg'] = $write['error_selecting_db_avg'].', '.$return['msg'];
			mysql_close ($link);
			return $return;
		} else {
			$row = mysql_fetch_array($result);
			$entry = array();
			$fields = array_keys($row);
			$values = array_values($row);
			for($i=0; $i<count($fields); $i++) {
				if (!is_int($fields[$i])) {
					if (is_array($query_column)) {
						$entry[$query_column[$i/2]] = $values[$i];
					} else {
						$entry[$query_column] = $values[$i];
					}
				}
			}
			mysql_close ($link);
			$return = return_array('db_select_avg_query', $entry, $write['success_selecting_db_avg'], $dosql);
			return $return;
		}
	}
}

// Para contar el numero total de entradas de una lista seleccionada de la base de datos
function db_select_count($table, $query_key, $query_value) {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_counting_db_entries'].', '.$link['msg'];
		return $link;
	} else {
		// build the sql query
		$dosql = 'SELECT COUNT(*) FROM `'.$table.'`';
		if($query_key && $query_value) {
			if (is_array($query_key)&&is_array($query_value)) {
				$dosql .= " ` WHERE `".$query_key[0]."`='".$query_value[0]."'";
				for ($i=1; $i<count($query_key);$i++) {
					$dosql .=  " AND `".$query_key[$i]."`='".$query_value[$i]."'";
				}
			} else if($query_value[0]=='*') {
				$dosql .= " WHERE `".$query_key."` LIKE '".substr($query_value, 1)."'";
			} else {
				$dosql .= " WHERE `".$query_key."`='".$query_value."'";
			}
		}
		// store sql query result in $result variable
		$result = mysql_query($dosql);
		// $result is false when sql query failed
		if (!$result) {
			$return = return_array('db_select_count', '', $write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_select_count');
			$return['msg'] = $write['error_counting_db_entries'].', '.$return['msg'];
			mysql_close ($link);
			return $return;
		// mysql_num_rows is 0 when sql query returns no results	
		} else if (mysql_num_rows($result)==0) {
			$return = return_array('db_select_count', '', $write['no_db_entries_found'], $dosql, true, 3, '', 'db_select_count');
			$return['msg'] = $write['error_counting_db_entries'].', '.$return['msg'];
			mysql_close ($link);
			return $return;
		} else {
			$row = mysql_fetch_array($result);
			$entry = array();
			$fields = array_keys($row);
			$values = array_values($row);
			$entry['count'] = $values[0];
			mysql_close ($link);
			$return = return_array('db_select_count', $entry, $write['success_counting_db_entries'], $dosql);
			return $return;
		}
	}
}	

// Para borrar un elemento de la bd
function db_delete_one_query($link, $table, $query_key, $query_value) {
	global $write;
	if (is_resource($link)) {
		// build the sql query
		$dosql = "DELETE FROM `".$table."` WHERE `".$query_key."`=".$query_value." LIMIT 1";
		// store sql query result in $result variable
		$result = mysql_query($dosql, $link);
		// $result is false when sql query failed
		if (!$result) {
			$return = return_array('db_delete_one_query', '', $write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_delete_one_query');
			$return['msg'] = $write['error_deleting_db_entry'].', '.$return['msg'];
			return $return;
		// aparentemente no hay forma de saber si hubo resultados que borrar en la consulta 
		} else {
			$return = return_array('db_delete_one_query', $del_data['data'], $write['success_deleting_db_entry'], $dosql);
			return $return;
		}
	} else {
		$return = return_array('db_delete_one_query', '', $write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_delete_one_query');
		$return['msg'] = $write['error_deleting_db_entry'].', '.$return['msg'];
		return $return;
	}
}
// Para borrar un elemento de la bd
function db_delete_one($table, $query_key, $query_value) {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_deleting_db_entry'].', '.$link['msg'];
		return $link;
	} else {
		// select the element of the db to check if it exists 
		$del_data = db_select_one_query($link, $table, $query_key, $query_value);
		if ($del_data['error']) {
			$del_data['msg'] = $write['error_deleting_db_entry'].', '.$del_data['msg'];
			return $del_data;
		} else {
			$return = db_delete_one_query($link, $table, $query_key, $query_value);
			return $return;
		}
		mysql_close ($link);
	}
}
// Para actualizar un elemento de la bd
function db_update($table, $data, $id) {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_updating_db_entry'].', '.$link['msg'];
		return $link;
	} else {
		$return = db_update_query($link, $table, $data, $id);
		mysql_close ($link);
		return $return;
	}
}
function db_update_query($link=FALSE, $table, $data, $id) {
	global $write;
	if (is_resource($link)) {
		// select the element of the db to check if it exists
		$query_keys = array_keys($id);
		$query_values = array_values($id);
		$old_data = db_select_one_query($link, $table, $query_keys, $query_values);
		if ($old_data['error']) {
			$old_data['msg'] = $write['error_updating_db_entry'].', '.$old_data['msg'];
			return $old_data;
		} else {
			// build the sql query
			$dosql .= "UPDATE `".$table."` SET ";
			$update_keys = array_keys($data);
			$update_values = array_values($data);
			$dosql .= "`".$update_keys[0]."` = '".$update_values[0]."'";
			for($i=1; $i<count($update_keys); $i++) {
				$dosql .= ", `".$update_keys[$i]."` = '".$update_values[$i]."'";
			}
			if (is_array($id)) {
				$dosql .= " WHERE `".$query_keys[0]."`='".$query_values[0]."'";
				for($i=1; $i<count($query_keys); $i++) {
					$dosql .= " AND `".$query_keys[$i]."`='".$query_values[$i]."'";
				}
				$dosql .= " LIMIT 1";
			} else {
				$dosql .= " WHERE `id`=".$id." LIMIT 1";
			}
			// store sql query result in $result variable
			$result = mysql_query($dosql);
			// $result is false when sql query failed
			if (!$result) {
				$return = return_array('db_update_query', '', $write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_update_query');
				$return['msg'] = $write['error_updating_db_entry'].', '.$return['msg'];
				return $return;
			} else {
				$new_data = db_select_one_query($link, $table, $query_keys, $query_values);
				$return = return_array('db_update_query', $new_data['data'], $write['success_updating_db_entry'], $dosql);
				return $return;
			}
		}
	} else {
		$return = return_array('db_update_query', '', $write['success_updating_db_entry'].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_update_query');
		return $return;
	}
}	

// Para insertar una entrada en la bd
function db_insert_query($link=FALSE, $table, $data) {
	global $write;
	if (is_resource($link)) {
		// build the sql query
		$query_keys = array_keys($data);
		$query_values = array_values($data);
		$dosql .= "INSERT INTO `".$table."` (`".$query_keys[0]."`";
		for($i=1; $i<count($query_keys); $i++) {
			$dosql .= ", `".$query_keys[$i]."`";
		}
		$dosql .= ") VALUES ('".$query_values[0]."'";
		for($i=1; $i<count($query_values); $i++) {
			$dosql .= ", '".$query_values[$i]."'";
		}
		$dosql .= ")";
		// store sql query result in $result variable
		$result = mysql_query($dosql);
		// $result is false when sql query failed
		if (!$result) {
			$return = return_array('db_insert_query', '', $write['error_executing_query'], $dosql, true, 2, "Invalid query: ".mysql_error(), 'db_insert_query');
			$return['msg'] = $write['error_inserting_db_entry'].', '.$return['msg'];
			return $return;
		} else {
			$return = return_array('db_insert_query', mysql_insert_id(), $write['success_inserting_db_entry'], $dosql);
			return $return;
		}
	} else {
		$return = return_array('db_insert_query', '', $write['error_inserting_db_entry'].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_select_one_query');
		return $return;
	}
}
function db_insert($table, $data) {
	global $write;
	$link = db_conect();
	// $link is an array when db_conect() returns an error!
	if (is_array($link)) {
		$link['msg'] = $write['error_inserting_db_entry'].', '.$link['msg'];
		return $link;
	} else {
		$return = db_insert_query($link, $table, $data);
		mysql_close ($link);
		return $return;
	}
}


?>