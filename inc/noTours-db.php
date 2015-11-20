<?php

/* General function to select an element from the DB before doing something */
function db_select_do($function, $self_name, $self_process, $id, $table, $link) {
	global $write;
	if (is_resource($link)) {
		// select one element
		$element = db_select_one_query($link, $table, 'id', $id);
		//print_r($element);
		if (!$element['error']) {
			if ($function!='') {
				$do = call_user_func($function, $element['data'], $link);
				// success
				if (!$do['error']) {
					$return = return_array($self_name, $do['data'], $element['msg'].', '.$do['msg'], $element['dosql']);
					return $return;
				} else {
					return $do;
				}
			} else {
				return $element;
			}
		// errors: 2 - querry error, 3 - 0 results found.
		} else {
			$element['msg'] = $write['error_'.$self_process].', '.$element['msg'];
			$element['process_id'] = $self_name;
			return $element;
		}
	// error 5 - no previous db conection.
	} else {
		$conexion = return_array($self_name, '', $write['error_'.$self_process].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", $self_name);
		return $conexion;
	}
}	
	
/* General function to delete an array of elements or a single one in the DB */
function db_delete_elements($element_type, $element, $link=FALSE) {
	global $db_tables, $write;
	$close = false;
	if ((!$link)||(!is_resource($link))) {
		$link = db_conect();
		$close = true;
		// $link is an array when db_conect() returns an error!
		if (is_array($link)) {
			$link['msg'] = $write['error_before_deleting_'.$element_type].', '.$link['msg'];
			$link['process_id'] = 'db_delete_'.$element_type.'s';
			return $link;
		}
	}
	// Array
	if (is_array($element)) {
		$data = array();
		$error = false;
		$error_array = array();
		// Array of objects
		if (is_array($element[0])) {
			for($i=0; $i<count($element); $i++) {
				$delete = call_user_func('db_delete_one_'.$element_type, $element[$i], $link);
				array_push($data, $delete);
				// error 6 - error inside operations array.
				if ($delete['error']) {
					$error = true;
					array_push($error_array, (count($data)-1));
				}
			}
		// Single object
		} else if ($element['data']) {
			$msg = '';
			if (($element['msg'])&&($element['msg']!='')) {
				$msg = $element['msg'].', ';
			}
			$element = $element['data'];
			// delete element
			$return = call_user_func('db_delete_one_'.$element_type, $element, $link);
			$return['process_id'] = 'db_delete_one_'.$element_type;
			$return['msg'] = $msg.$return['msg'];
		// Array of ids
		} else {
			for($i=0; $i<count($element); $i++) {
				$delete = db_select_do('db_delete_one_'.$element_type, 'db_select_delete_'.$element_type, 'deleting_'.$element_type, $element[$i], $db_tables[$element_type.'s'], $link);
				$delete['process_id'] = 'db_delete_one_'.$element_type;
				array_push($data, $delete);
				// error 6 - error inside operations array.
				if ($delete['error']) {
					$error = true;
					array_push($error_array, (count($data)-1));
				}
			}
		}
		// success 
		if(!$error) {
			$return = return_array('db_delete_'.$element_type.'s', $data, $write['success_deleting_'.$element_type], '', false, '', '');
		// error 6 - error inside operations array.
		} else {
			$return = return_array('db_delete_'.$element_type.'s', $data, $write['error_deleting_'.$element_type], '', true, 6, '', 'db_delete_'.$element_type.'s');
			$return['error_array'] = $error_array;
		}
	// Single id
	} else {
		$return = db_select_do('db_delete_one_'.$element_type, 'db_select_delete_'.$element_type, 'deleting_'.$element_type, $element, $db_tables[$element_type.'s'], $link);
		$return['process_id'] = 'db_delete_'.$element_type;
	}
	if ($close) {
		mysql_close ($link);
	}
	return $return;
}

/* General function for deletting a single element */
function db_delete_one_element($element_type, $sub_element_type, $element, $link) {
	global $projectFolder, $db_tables, $write;
	if (is_resource($link)) {
		// success: required data ok.
		if (($element['id'])&&($element['id']!='')) {
			$sub_elements = db_select_all_query($link, $db_tables[$sub_element_type.'s'], $element_type.'_id', $element['id'], '*id');
			if (!$sub_elements['error']) {
				// delete sub-elements
				$delete_sub_elements = db_delete_elements($sub_element_type, $sub_elements['data']['notours_'.$sub_element_type], $link);
				// error 7 - subprocess error (error deleting sub-elements).
				if ($delete_sub_elements['error']) {
					$return = return_array('db_delete_one_'.$element_type, $element, $write['error_deleting_'.$element_type].', '.$write['subprocess_error'], '', true, 7, '', 'delete_'.$sub_element_type.'s');
					$return['delete_'.$sub_element_type.'s'] = $delete_sub_elements;
					return $return;
				}
			}
			// no sub-elements or success deleting sub-elements
			if (($sub_elements['error_type']==3)||(!$delete_sub_elements['error'])) {
				// extra only for projects
				if ($element_type=='project') {
					// rmdir and unlik content
					rrmdir("../".$projectFolder.$element['id']);
				}
				// delete element
				$delete_element = db_delete_one_query($link, $db_tables[$element_type.'s'], 'id', $element['id']);
				// error 2 - querry error.
				if ($delete_element['error']) {
					$delete_element['msg'] = $write['error_deleting_'.$element_type].', '.$delete_element['msg'];
				// success deleting sub-elements
				} else if (!$sub_elements['error']) {
					$delete_element['msg'] = $write['success_deleting_'.$sub_element_type.'s'].', '.$delete_element['msg'].', '.$write['success_deleting_'.$element_type];
				} else {
					$delete_element['msg'] = $delete_element['msg'].', '.$write['success_deleting_'.$element_type];
				}
				$delete_element['data'] = $element;
				$delete_element['delete_'.$sub_element_type.'s'] = $delete_sub_elements;
				$delete_element['process_id'] = 'db_delete_one_'.$element_type;
				return $delete_element;
			}
		// errors: 2 - querry error, 3 - 0 results found.
		} else if ($element['error']) {
			$element['process_id'] = 'db_delete_one_'.$element_type;
			$element['msg'] = $write['error_deleting_'.$element_type].', '.$element['msg'];
			return $element;
		// error 8 - wrong data type for variable
		} else {
			$datatype = return_array('db_delete_one_'.$element_type, $element, $write['error_deleting_'.$element_type].', '.$write['error_wrong_datatype'], '', true, 8, "Wrong data type for variable: \$".$element_type." type '".gettype($element)."', array expected.", 'db_delete_one_'.$element_type);
			return $datatype;
		}
	// error 5 - no previous db conection.
	} else {
		$conexion = return_array('db_delete_one_'.$element_type, '', $write['error_deleting_'.$element_type].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_delete_one_'.$element_type);
		return $conexion;
	}
}
function rrmdir($dir) {
	if (is_dir($dir)) {
		$objects = scandir($dir);
		foreach ($objects as $object) {
			if ($object != "." && $object != "..") {
				if (filetype($dir."/".$object) == "dir") rrmdir($dir."/".$object); else unlink($dir."/".$object);
			}
		}
		reset($objects);
		rmdir($dir);
	}
}

// Para borrar una entrada de la tabla objetos junto con todos los archivos y entradas file asociadas.
function db_delete_files($files, $link=FALSE) {
	$return = db_delete_elements('file', $files, $link);
	return $return;
}
function db_delete_one_file($file, $link) {
	global $db_tables, $write, $force;
	// unlink asociated file
	//echo $file['offline'];
	if(($file['id'])&&($file['id']!='')) {
		if(!$file['offline']) {
			$unlink = db_unlink_files($file['url']);
			$file['url'] = $unlink['data']['file_url'];
			$unlink['data'] = $file;
		}
		if ((!$unlink['error'])||($force==true)) {
			// delete
			$delete = db_delete_one_query($link, $db_tables['files'], 'id', $file['id']);
			$delete['data'] = $unlink['data'];
			// success 
			if (!$delete['error']) {
				$delete['msg'] = $msg.$unlink['msg'].', '.$delete['msg'];
			// error 2 - querry error.
			} else {
				$delete['msg'] = $write['error_deleting_file'].', '.$delete['msg'];
			}
			return $delete;
		// error 4 - file does't exixt.
		} else {
			$unlink['msg'] = $write['error_deleting_file'].', '.$unlink['msg'];
			return $unlink;
		}
	} else {
		// error 8 - wrong data type for variable
		$error = return_array('db_delete_one_file', $file, $write['error_deleting_file'].', '.$write['error_wrong_datatype'], '', true, 8, "Wrong data type for variable: \$file type '".gettype($file)."', array expected.", 'db_delete_one_file');
		return $error;
	}
}
function db_unlink_files($url) {
	global $projectFolder, $write;
	$file_url = "../".$projectFolder.$url;
	if(is_file($file_url)) {
		unlink($file_url);
		$return = return_array('db_unlink_files', array('type'=>$type, 'file_url'=>$file_url), $write['success_db_unlink']);
	} else {
		$return = return_array('db_unlink_files', array('type'=>$type, 'file_url'=>$file_url), $write['error_db_unlink'], '', true, 4, '', 'db_unlink_files');
	}
	return $return;
}

// Para borrar una entrada de la tabla objetos junto con todos los archivos y entradas file asociadas.
function db_delete_objects($objects, $link=FALSE) {
	$return = db_delete_elements('object', $objects, $link);
	return $return;
}
function db_delete_one_object($object, $link) {
	$return = db_delete_one_element('object', 'file', $object, $link);
	return $return;
}

// Para borrar una entrada de la tabla pojects junto con todos los archivos y entradas file asociadas.
function db_delete_projects($projects, $link=FALSE) {
	$return = db_delete_elements('project', $projects, $link);
	return $return;
}
function db_delete_one_project($project, $link) {
	$return = db_delete_one_element('project', 'object', $project, $link);
	return $return;
}

// Para borrar una entrada de la tabla author junto con todos los archivos y entradas file asociadas.
function db_delete_authors($authors, $link=FALSE) {
	$return = db_delete_elements('author', $authors, $link);
	return $return;
}
function db_delete_one_author($author, $link) {
	$return = db_delete_one_element('author', 'project', $author, $link);
	return $return;
}

/* General function to read data from an array of elements or a single one in the DB */
function db_read_elements($element_type, $element, $recursive=TRUE, $link=FALSE) {
	global $db_tables, $write;
	$close = false;
	if ((!$link)||(!is_resource($link))) {
		$link = db_conect();
		$close = true;
		// $link is an array when db_conect() returns an error!
		if (is_array($link)) {
			$link['msg'] = $write['error_before_reading_'.$element_type].', '.$link['msg'];
			$link['process_id'] = 'db_read_'.$element_type.'s';
			return $link;
		}
	}
	// Array
	if (is_array($element)) {
		$data = array();
		$error = false;
		$error_array = array();
		// Array of objects
		if (is_array($element[0])) {
			for($i=0; $i<count($element); $i++) {
				$sub_element = call_user_func('db_read_'.$element_type.'_content', $element[$i], $link);
				array_push($data, $sub_element['data']);
				// error 6 - error inside operations array.
				if ($sub_element['error']) {
					$error = true;
					array_push($error_array, (count($data)-1));
				}
			}
			// success 
			if(!$error) {
				if (count($element)>1) {
					$msg = $write['success_reading_all_'.$element_type.'s'];
				} else {
					$msg = $write['success_reading_'.$element_type];
				}
				$return = return_array('db_read_'.$element_type.'s', $data, $msg, '', false, '', '');
			// error 6 - error inside operations array.
			} else {
				$return = return_array('db_read_'.$element_type.'s', $data, $write['error_reading_'.$element_type], '', true, 6, '', 'db_read_'.$element_type.'s');
				$return['error_array'] = $error_array;
			}
		// Single object
		/*} else if ($element['data']) {
			$msg = '';
			if (($element['msg'])&&($element['msg']!='')) {
				$msg = $element['msg'].', ';
			}
			$element = $element['data'];
			// delete element
			$return = call_user_func('db_delete_one_'.$element_type, $element, $link);
			$return['process_id'] = 'db_delete_one_'.$element_type;
			$return['msg'] = $msg.$return['msg'];*/
		// Array of ids
		} else {
			for($i=0; $i<count($element); $i++) {
				if ($recursive) {
					$select = db_select_do('db_read_'.$element_type.'_content', 'db_select_read_'.$element_type, 'reading_'.$element_type, $element[$i], $db_tables[$element_type.'s'], $link);
				} else {
					$select = db_select_do('', 'db_select_read_'.$element_type, 'reading_'.$element_type, $element[$i], $db_tables[$element_type.'s'], $link);
				}
				array_push($data, $select['data']);
				// error 6 - error inside operations array.
				if ($select['error']) {
					$error = true;
					array_push($error_array, (count($data)-1));
				}
			}
			// success 
			if(!$error) {
				$return = return_array('db_read_'.$element_type.'s', $data, $write['success_reading_'.$element_type.'s'], '', false, '', '');
			// error 6 - error inside operations array.
			} else {
				$return = return_array('db_read_'.$element_type.'s', $data, $write['error_reading_'.$element_type.'s'], '', true, 6, '', 'db_read_'.$element_type.'s');
				$return['error_array'] = $error_array;
			}
		}
	// Single id
	} else {
		if ($recursive) {
			$select = db_select_do('db_read_'.$element_type.'_content', 'db_select_read_'.$element_type, 'reading_'.$element_type, $element, $db_tables[$element_type.'s'], $link);
		} else {
			$select = db_select_do('', 'db_select_read_'.$element_type, 'reading_'.$element_type, $element, $db_tables[$element_type.'s'], $link);
		}
		// errors: 2 - querry error, 3 - 0 results found.
		if(!$select['error']) {
			$return = return_array('db_read_'.$element_type, $select['data'], $select['msg'].', '.$write['success_reading_'.$element_type], $select['dosql']);
		} else {
			$return = return_array('db_read_'.$element_type, array('element_type' => $element_type, 'id'=>$element), $select['msg'], $select['dosql'], true, $select['error_type'], $select['error_msg'], $select['error_process']);
		}
	}
	if ($close) {
		mysql_close ($link);
	}
	return $return;
}

/* General function for reading sub-elements contained in an element */
function db_read_sub_elements($element_type, $sub_element_type, $element, $link) {
	global $projectFolder, $db_tables, $write;
	if (is_resource($link)) {
		// success: required data ok.
		if (($element['id'])&&($element['id']!='')) {
			if ($sub_element_type=="project") {
				$sub_elements = db_select_all_query($link, $db_tables[$sub_element_type.'s'], $element_type.'_id', $element['id'], 'modified');
			} else if ($sub_element_type=="object") {
				$sub_elements = db_select_all_query($link, $db_tables[$sub_element_type.'s'], $element_type.'_id', $element['id'], '*level');
			} else {
				$sub_elements = db_select_all_query($link, $db_tables[$sub_element_type.'s'], $element_type.'_id', $element['id'], '*id');
			}
			// no sub-elements or success deleting sub-elements
			if (($sub_elements['error_type']==3)||(!$sub_elements['error'])) {
				if (!$sub_elements['error']) {
					$do = call_user_func('db_read_'.$sub_element_type.'s', $sub_elements['data']['notours_'.$sub_element_type], true, $link);
					$element['notours_'.$sub_element_type] = $do;
					$msg = $write['success_reading_'.$sub_element_type.'s'];
				}
				if ($sub_elements['error_type']==3) {
					$element['notours_'.$sub_element_type] = $sub_elements;
					$element['notours_'.$sub_element_type]['process_id'] = 'db_read_'.$sub_element_type.'s';
					$msg = $write['no_'.$sub_element_type.'s'];
					$element['msg'] = $write['no_'.$sub_element_type.'s'];
				}
				$element = array_merge(array('element_type' => $element_type), $element);
				$return = array('data'=>$element, 'msg'=>$msg);
				return $return;
			} else {
			
			}
		// errors: 2 - querry error, 3 - 0 results found.
		} else if ($element['error']) {
			$element['process_id'] = 'db_reading_'.$sub_element_type.'s';
			$element['msg'] = $write['error_reading_'.$sub_element_type.'s'].', '.$element['msg'];
			return $element;
		// error 8 - wrong data type for variable
		} else {
			$datatype = return_array('db_reading_'.$sub_element_type.'s', $element, $write['error_reading_'.$sub_element_type.'s'].', '.$write['error_wrong_datatype'], '', true, 8, "Wrong data type for variable: \$".$element_type." type '".gettype($element)."', array expected.", 'db_reading_'.$sub_element_type.'s');
			return $datatype;
		}
	// error 5 - no previous db conection.
	} else {
		$conexion = return_array('db_reading_'.$sub_element_type.'s', '', $write['error_reading_'.$sub_element_type.'s'].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_reading_'.$sub_element_type.'s');
		return $conexion;
	}
}


function db_read_files($files, $recursive=TRUE, $link=FALSE) {
	$return = db_read_elements('file', $files, $recursive, $link);
	return $return;
}
function db_read_file_content($file, $link) {
	global $projectFolder;
	//$file['url'] = "../".$projectFolder.$file['url'];
	$return = array_merge(array('element_type' => 'file'), $file);
	return array('data'=>$return);
}

function db_read_objects($objects, $recursive=TRUE, $link=FALSE) {
	$return = db_read_elements('object', $objects, $recursive, $link);
	return $return;
}
function db_read_object_content($object, $link) {
	global $write;
	$return = db_read_sub_elements('object', 'file', $object, $link);
	return $return;
}

function db_read_projects($projects, $recursive=TRUE, $link=FALSE) {
	$return = db_read_elements('project', $projects, $recursive, $link);
	return $return;
}
function db_read_project_content($project, $link) {
	$return = db_read_sub_elements('project', 'object', $project, $link);
	return $return;
}

function db_read_authors($authors, $recursive=TRUE, $link=FALSE) {
	$return = db_read_elements('author', $authors, $recursive, $link);
	return $return;
}
function db_read_author_content($author, $link) {
	$return = db_read_sub_elements('author', 'project', $author, $link);
	return $return;
}

function db_read_walkers($walkers, $recursive=TRUE, $link=FALSE) {
	$return = db_read_elements('walker', $walkers, $recursive, $link);
	return $return;
}
function db_read_walker_content($walker, $link) {
	$return = db_read_sub_elements('walker', 'project', $walker, $link);
	return $return;
}

function url_file($file) {
	global $projectFolder, $soundFolder, $imagesFolder;
	if (($file['type']=="audio/mpeg")||($file['type']=="audio/x-wav")) {
		$url = "../".$projectFolder.$file['project_id']."/".$soundFolder.$file['url'];
	} else if (($file['type']=="image/gif")||($file['type']=="image/jpeg")) {
		$url = "../".$projectFolder.$file['project_id']."/".$imagesFolder.$file['url'];
	}
	return $url;
}
function duplicate_file($element, $link) {
	global $db_tables;
	$data = array();
	$temp_url = explode("/", $element['url']);
	$element['url'] = $temp_url[(count($temp_url)-1)];
	$data['file_source'] = url_file($element);
	$parent_object = db_select_one_query($link, $db_tables['objects'], 'id', $element['object_id']);
	if ($element['project_id']=='') {
		$element['project_id'] = $parent_object['data']['project_id'];
	}
	$duplicate = duplicate_element($element, 'file', false, $link, 'copy_file_documents');
	$data['file_dest'] = url_file($duplicate['data']);
	if (!$duplicate['error']) {
		$file = @copy ($data['file_source'], $data['file_dest']);
		// error 9: error copping files
		if (!$file) {
			$error = return_array('copy_file_documents', $data, $write['error_copping_files'], '', true, 9, '', 'copy_file_documents');
			$return = return_array('db_duplicate_file', $duplicate, $write['subprocess_error'], '', true, 7, '', 'copy_file_documents');
			$return[ 'copy_project_documents'] = $error;
			return $return;
		} else {
			$duplicate['data']['copy_file_documents'] = $data;
		}
	}
	return $duplicate;
}
function duplicate_object($element, $link) {
	$return = duplicate_element($element, 'object', 'file', $link);
	return $return;
}
function duplicate_project($element, $link) {
	global $projectFolder, $imagesFolder, $soundFolder;
	$duplicate = duplicate_element($element, 'project', 'object', $link);
	if (!$duplicate['error']) {
		$data = array(
			'project_folder' => '../'.$projectFolder.$duplicate['data']['insert_id'].'/',
			'sound_folder' => '../'.$projectFolder.$duplicate['data']['insert_id'].'/'.$imagesFolder,
			'image_folder' => '../'.$projectFolder.$duplicate['data']['insert_id'].'/'.$soundFolder,
			'icon_source'=> '../../googleMaps/notours_form/projects/'.$element['id'].'/'.$element['icon'],
			'icon_dest'=> '../'.$projectFolder.$duplicate['data']['insert_id'].'/'.$element['icon'],
		);
		$project = @mkdir($data['project_folder']);
		$sound = @mkdir($data['sound_folder']);
		$image = @mkdir($data['image_folder']);
		$icon = @copy ($data['icon_source'], $data['icon_dest']);
		// error 9: error copping files
		if (!$project || !$sound || !$image || !$icon) {
			$error = return_array('copy_project_documents', $data, $write['error_copping_files'], '', true, 9, '', 'copy_project_documents');
			$return = return_array('db_duplicate_project', $duplicate, $write['subprocess_error'], '', true, 7, '', 'copy_project_documents');
			$return[ 'copy_project_documents'] = $error;
			return $return;
		} else {
			$duplicate['data']['copy_project_documents'] = $data;
		}
	}
	return $duplicate;
}
function duplicate_author($element, $link) {
	$return = duplicate_element($element, 'author', 'project', $link);
	return $return;
}
	
function duplicate_elements($element, $change=FALSE, $link=FALSE) {
	global $write;
	$close = false;
	if ($change) {
		$change_keys = array_keys($change);
		$change_values = array_values($change);
	}
	if ((!$link)||(!is_resource($link))) {
		$link = db_conect();
		$close = true;
		// $link is an array when db_conect() returns an error!
		if (is_array($link)) {
			$link['msg'] = $write['error_before_copping_elements'].', '.$link['msg'];
			$link['process_id'] = 'db_duplicate_elements';
			$link['data'] = $element;
			return $link;
		}
	}
	// Array
	if (is_array($element)&&(is_array($element[0])||$element['data'])) {
		// Array of objects
		if (is_array($element[0])) {
			$data = array();
			$error = false;
			$error_array = array();
			for($i=0; $i<count($element); $i++) {
				//print_r($element[$i]);
				if ($change) {
					for($u=0; $u<count($change); $u++) {
						$element[$i][$change_keys[$u]] = $change_values[$u];
					}
				}
				$copy = call_user_func('duplicate_'.$element[$i]['element_type'], $element[$i], $link);
				array_push($data, $copy);
				// error 6 - error inside operations array.
				if ($copy['error']) {
					$error = true;
					array_push($error_array, (count($data)-1));
				}
			}
			// success 
			if(!$error) {
				$return = return_array('db_duplicate_elements', $data, $write['success_copping_elements'], '', false, '', '');
			// error 6 - error inside operations array.
			} else {
				$return = return_array('db_duplicate_elements', $data, $write['error_copping_elements'], '', true, 6, '', 'db_duplicate_elements');
				$return['error_array'] = $error_array;
			}
		// Single object
		} else if ($element['data']) {
			if ($change) {
				for($i=0; $i<count($change); $i++) {
					$element['data'][$change_keys[$i]] = $change_values[$i];
				}
			}
			$copy = call_user_func('duplicate_'.$element['data']['element_type'], $element['data'], $link);
			// success
			if (!$copy['error']) {
				$return = $copy;
			// error 7 - subprocess error (error copping elements).
			} else {
				$return = return_array('db_duplicate_elements', $element['data'], $write['subprocess_error'], '', true, 7, '', $copy['process_id']);
				$error = array('msg' => $copy['msg'], 'error_type' => $copy['error_type']);
				if ($copy['dosql']) $error['dosql'] = $copy['dosql'];
				if ($copy['error_msg']) $error['error_msg'] = $copy['error_msg'];
				if ($copy['error_array']) $error['error_array'] = $copy['error_array'];
				if ($copy['error_process']) $error['error_process'] = $copy['error_process'];
				if($copy['error_type']==7){
					$error[$copy['error_process']] = $copy[$copy['error_process']];
				} else {
					$error['data'] = $copy[$copy['error_process']];
				}
				$return[$copy['process_id']] = $error;
			}
		}
	// error 8 - wrong data type for variable
	} else {
		$return = return_array('db_duplicate_elements', $element, $write['error_copping_element'].', '.$write['error_wrong_datatype'], '', true, 8, "Wrong data type for variable: \$element type '".gettype($element)."', array expected.", 'db_duplicate_elements');
	}
	if ($close) {
		mysql_close ($link);
	}
	return $return;
}

function duplicate_element($element, $element_type, $sub_element_type, $link) { 
	global $db_tables, $write;
	if (is_resource($link)) {
		// Array
		if (is_array($element)) {
			//childs
			$insert['data'] = rand(0,100);
			if (($sub_element_type)&&($element['notours_'.$sub_element_type])) {
				// childs
				if ($element['notours_'.$sub_element_type]['data']!='') {
					$insert_data = array_slice($element, 2, -1);
					$insert = db_insert_query($link, $db_tables[$element_type.'s'], $insert_data);
					if (!$insert['error']) {
						$duplicate_elements = duplicate_elements($element['notours_'.$sub_element_type]['data'], array($element_type.'_id'=>$insert['data']), $link);
						// error 7 - subprocess error (error copping elements).
						if ($duplicate_elements['error']) {
							$insert_data = array_merge(array('insert_id'=>$insert['data']), $insert_data);
							$return = return_array('db_duplicate_'.$element_type, $insert_data, $write['subprocess_error'], '', true, 7, '', 'db_duplicate_'.$sub_element_type.'s');
							$error = array('msg' => $duplicate_elements['msg'], 'error_type' => $duplicate_elements['error_type'], 'data' => $duplicate_elements['data']);
							if ($duplicate_elements['dosql']) $error['dosql'] = $duplicate_elements['dosql'];
							if ($duplicate_elements['error_msg']) $error['error_msg'] = $duplicate_elements['error_msg'];
							if ($duplicate_elements['error_array']) $error['error_array'] = $duplicate_elements['error_array'];
							$return['db_duplicate_'.$sub_element_type.'s'] = $error;
							return $return;
						} else {
							$insert_data['notours_'.$sub_element_type] = $duplicate_elements;
						}
					}
				// empty childs
				} else {
					$insert_data = array_slice($element, 2, -2);
					$insert = db_insert_query($link, $db_tables[$element_type.'s'], $insert_data);
				}
			} else {
				$insert_data = array_slice($element, 2);
				$insert = db_insert_query($link, $db_tables[$element_type.'s'], $insert_data);
			}
			// errors: 2 - querry error
			if ($insert['error']) {
				$return = return_array('db_duplicate_'.$element_type, $insert_data, $write['error_copping_elements'].', '.$insert['msg'], $insert['dosql'], true, $insert['error_type'], $insert['error_msg'], 'db_insert_query');
			// success
			} else {
				$insert_data = array_merge(array('insert_id'=>$insert['data']), $insert_data);
				$return = return_array('db_duplicate_'.$element_type, $insert_data, $write['success_copping_element'], $insert_data['dosql'], false, '', '', '');
			}
		// error 8 - wrong data type for variable
		} else {
			$return = return_array('db_duplicate_'.$element_type, $element, $write['error_copping_element'].', '.$write['error_wrong_datatype'], '', true, 8, "Wrong data type for variable: \$element type '".gettype($element)."', array expected.", 'db_duplicate_'.$element_type);
		}
	// error 5 - no previous db conection.
	} else {
		$return = return_array('db_duplicate_'.$element_type, '', $write['error_copping_elements'].', '.$write['no_previous_db_conexion'], '', true, 5, "Invalid resource link: '".$link."'", 'db_duplicate_'.$element_type);
	}
	return $return;
}

/* AQUI */	


// Para comprobar el password y devolver los datos de un autor
function db_pass($name, $password) {
	global $db, $db_tables, $write;
	$data = array();
	$link = mysql_connect ($db['host'],$db['user'],$db['pass']);
	if (!$link) {
		$error = array (
			"error" => true,
			"msg" => $write['error_reading_pass_db']
		);
		return $error;
	} else {
		mysql_select_db ($db['data'], $link);
		$dosql = " SELECT * FROM `".$db_tables['authors']."` WHERE `nombre` = '".$name."' LIMIT 0,1 ";
		$result = mysql_query ($dosql);
		while ($row = mysql_fetch_array($result)) {
			$author = array (
				"id" => $row['id'],
				"nombre" => $row['nombre'],
				"password" => $row['password'],
				"descripcion" => $row['descripcion']
			);
		}
		mysql_close ($link);
		if ($author["password"]==$password) {
			return $author;
		} else {
			$error = array (
				"error" => true,
				"msg" => $name.", (".$password.") ".$write['wrong_pass']
			);
			return $error;
		}
	}
}

function db_newuser($nom, $pass, $check) {
	global $db, $db_tables, $write;
	if ($pass==$check) {
		$link = mysql_connect ($db['host'],$db['user'],$db['pass']);
		if (!$link) {
			$error = array (
				"error" => true,
				"msg" => $write['error_creating_author_db']
			);
			return $error;
		} else {
			mysql_select_db ($db['data'], $link);
			$dosql = " SELECT * FROM `".$db_tables['authors']."` WHERE `nombre` = '".$nom."' LIMIT 0,1 ";
			$result = mysql_query ($dosql);
			mysql_close ($link);
			if ($row = mysql_fetch_array($result)) {
				$error = array (
					"error" => true,
					"msg" => $write['error_author_exists']
				);
				return $error;
			} else {
				$author = array (
					"id" => db_insert_query($db_tables['authors'], array("nombre" => $nom, "password" => $pass, "descripcion" => '')),
					"nombre" => $nom,
					"password" => $pass,
					"descripcion" => ''
				);
				return $author;
			}
		}
	}
}

?>