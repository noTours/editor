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
 
/* Error Table */
//	error_type 
//	0				error_conecting_db
//	1				error_selecting_db
//	2				error_executing_query			Invalid query
//	3				no_db_entries_found
//	4				error_db_unlink 				File does't exixt
//	5				no_previous_db_conexion			Invalid resource link
//	6				error inside operations array
//	7				subprocess error
//	8				wrong data type for variable
//	9				error_copping_files
//	10				data_missing					POST/GET vars missing.
//	11				author_exists
//	12				error_creating_folders
//	13				error_creating_icon
//	14				error building ZIP folder
//	15				wrong data value for variable

// response array for error handling
function return_array($process_id, $data, $ui_msg, $dosql='', $error=FALSE, $type='', $tec_msg='', $error_process='') {
	$return = array (
		"process_id" => $process_id,
		"data" => $data,
		"msg" => $ui_msg
	);
	if (($dosql)&&($dosql!='')) {
		$return['dosql'] = $dosql;
	}
	if ($error) {
		//error process
		$return['error'] = $error;
		$return['error_type'] = $type;
		$return['error_msg'] = $tec_msg;
		$return['error_process'] = $error_process;
	} else if ($tec_msg!='') {
		$return['tec_msg'] = $tec_msg;
	}
	return $return;
}

function extension($file) {
	$ext = strtolower($file);
	$ext = explode("\.", $ext);
	if (count($ext)>=2) {
		$ext = $ext[count($ext)-1];
		return $ext;
	} else {
		return false;
	}
}
function mime_type($file) {
	$extension = extension($file);
	switch ($extension) {
		case 'mp3':
			$mine_type = 'audio/mpeg'; 
        	break;
		case 'aif':
			$mine_type = 'audio/x-aiff '; 
        	break;
		case 'aiff':
			$mine_type = 'audio/x-aiff '; 
        	break;
		case 'wav':
			$mine_type = 'audio/x-wav'; 
        	break;
		case 'm3u':
			$mine_type = 'audio/x-mpegurl'; 
        	break;
		case 'gif':
			$mine_type = 'image/gif'; 
        	break;
		case 'jpeg':
			$mine_type = 'image/jpeg'; 
        	break;
		case 'jpg':
			$mine_type = 'image/jpeg'; 
        	break;
		case 'tif':
			$mine_type = 'image/tiff'; 
        	break;
		case 'tiff':
			$mine_type = 'image/tiff'; 
        	break;
		case 'png':
			$mine_type = 'image/png'; 
        	break;
	}
	return $mine_type;
}

function mueve($file, $newfile) {
	if (@copy($file, $newfile)) {
    	@unlink($file);
    	return true;
	} else {
		return false;
	}
}

function reduceFoto ($img, $nombre, $w, $h) {
	//Separamos la extension del nombre
	$str = str_replace(" ", "", strtolower($nombre));
	$array_nombre = explode(".", $str);
	$percent;
	global $root;
	global $tmpImageFolder;
	//creamos una imagen en funcion del tipo de imagen que recibimos
	switch ($array_nombre[1]) {
		case "jpg":
			$new_img = imagecreatefromjpeg($img);
			break;
		case "gif":
			$new_img = imagecreatefromgif($img);
			break;
		case "png":
			$new_img = imagecreatefrompng($img);
			break;
		default:
			$new_img = imagecreatefrompng("logo_notours_screen.png");
			break;
	}
	$width = imagesx($new_img);
	$height = imagesy($new_img);
	if ($w<=$h) {
		$percent = $h/$height;
	} else {
		$percent = $w/$width;
	}
	$new_width = $width * $percent;
	$new_height = $height * $percent;
	$tmp = imagecreatetruecolor($new_width, $new_height);
	$wite = imagecolorallocate($tmp, 255, 255, 255);
	imagefill($tmp, 0, 0, $wite);
	$icon = imagecreatetruecolor($w, $h);
	$wite = imagecolorallocate($icon, 255, 255, 255);
	imagefill($icon, 0, 0, $wite);
	$ofsetx = ($new_width - $w)/2;
	$ofsetY = ($new_height - $h)/2;
	imagecopyresampled($tmp, $new_img, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
	imagecopy($icon, $tmp, 0, 0, $ofsetx, $ofsetY, $w, $h);
	imagepng($icon, "../".$tmpImageFolder.$array_nombre[0].".png");
	imagedestroy($icon);
	imagedestroy($tmp);
	imagedestroy($new_img);
	return $tmpImageFolder.$array_nombre[0].".png";
}
		
function escribe($doc, $txt, $modo) {
	// si logramos crear un documento para escribir en el
	if ($documento = @fopen($doc, $modo)){
		// escribimos el texto indicado
		fwrite($documento, $txt);
		// cerramos el documento
		fclose($documento);
		// y devolvemos correcto
    	return true;
	} else {
		return false;
	}
}

/* Create zip file using ZipArchive class */
function addToZip($z, $dir, $path, $r) {
	$return = array();
	if(is_dir($path.$dir)){
		$d = dir($path.$dir);
		$z->addEmptyDir($dir);
		array_push($return, $dir);
		while($df=$d->read()) {
    		if ($df=="." || $df=="..") continue;
    		if	(is_file($path.$dir.'/'.$df)) {
    			$z->addFile($path.$dir.'/'.$df, $dir.'/'.$df);
    			array_push($return, $dir.'/'.$df);
    		} else {
				$return = array_merge($return, addToZip($z, $dir.'/'.$df, $path, $return));
    		}
     	}
     	$d->close();
     	//array_push($return, $r);
     	return $return;
  	}
}
function createZip($dir, $path, $destination){
	$zip = new ZipArchive;
	if ($zip->open($destination, ZIPARCHIVE::OVERWRITE | ZIPARCHIVE::CREATE)) {
	    $content = addToZip($zip, $dir, $path, '');
	   	$zip->close();
	    return $content;
	} else {
	    return false;
	}
}

/* Autor: Martin R. Mondragon Sotelo
   e-mail: martin@mygnet.com

function createzip($struct,$namezip=0) {
	$ZipData = array(); 
	$Dircont = array(); 
	$DirFile = array();
	$offseto = 0;		
	while(list($file,$data)=each($struct))
	{	$file= str_replace("\\", "/", $file);  
	    $dir=explode("/",$file);
		for($i=0; $i<sizeof($dir); $i++)if($dir[$i]=="")unset($dir[$i]);					
		$num=count($dir); //Total de niveles
		$ele=0;  		  //Nivel actual
		$dirname="";	  //Nombre archivo o directorio
		while(list($idx,$val)=each($dir))
		{	$ty=(++$ele)==$num?true:false;
			$ty=trim($data)!=""?$ty:false;//Compruebar si el ultimo elemento es directorio o archivo
			$dirname.=$val.($ty?"":"/");
			if(isset($DirFile[$dirname]))continue; else $DirFile[$dirname]=true;			
			$gzdata="";				
			if($ty)
			{	$unziplen=strlen($data);  
				$czip=crc32($data);  
				$gzdata=gzcompress($data);  
				$gzdata=substr(substr($gzdata,0,strlen($gzdata)-4),2); 
				$cziplen=strlen($gzdata);  
			}						
			$ZipData[]="\x50\x4b\x03\x04".($ty?"\x14":"\x0a")."\x00\x00\x00".($ty?"\x08":"\x00")."\x00\x00\x00\x00\x00".
					   pack("V",$ty?$czip:0).pack("V",$ty?$cziplen:0).pack("V",$ty?$unziplen:0).pack("v",strlen($dirname)). 
					   pack("v",0).$dirname.$gzdata.pack("V",$ty?$czip:0).pack("V",$ty?$cziplen:0).pack("V",$ty?$unziplen:0);
			$Dircont[]="\x50\x4b\x01\x02\x00\x00".($ty?"\x14":"\x0a")."\x00\x00\x00".($ty?"\x08":"\x00")."\x00\x00\x00\x00\x00".
					   pack("V",$ty?$czip:0).pack("V",$ty?$cziplen:0).pack("V",$ty?$unziplen:0).pack("v",strlen($dirname)). 
					   pack("v", 0 ).pack("v",0).pack("v",0).pack("v",0).pack("V",$ty?32:16).pack("V",$offseto).$dirname;  		
			$offseto=strlen(implode("",$ZipData));			
		}//Fin While dir		
	}//Fin While archivos
	$data = implode("",$ZipData);  
	$cdir = implode("",$Dircont);  	
	$data=$data.$cdir."\x50\x4b\x05\x06\x00\x00\x00\x00".pack("v",sizeof($Dircont)).pack("v",sizeof($Dircont)).pack("V",strlen($cdir)).pack("V",strlen($data))."\x00\x00";
    if($namezip)//Construir el archivo
    {	if(($fp=fopen($namezip,"wb")))
   		{	fwrite($fp,$data);
			fclose ($fp);
			return true;
		}else return false;
    }else return $data;	   
}
function fun_dir($dir,&$A,$path=0) {
	$d = dir($dir);
	$path=$path?$path:$dir;
	while($df=$d->read()) {
		if ($df=="." || $df=="..") continue;
    	if	(is_file($d->path.$df)) {
    		$A[str_replace($path,"",$d->path.$df)]=file_get_contents($d->path.$df);
     	} else {
     		$A[str_replace($path,"",$d->path.$df)."/"]=""; 
       		fun_dir($d->path.$df."/",$A,$path);
     	}
  	}
  	$d->close();   
}
*/

function comprimir($folder) {
	global $projectFolder;
	//$contenido = array();
	$name = explode('/', $folder);
	$name = $name[count($name)-1];
	//fun_dir($folder.'/', $contenido);
	$comprimir = createZip($name, '../'.$projectFolder, '../'.$projectFolder.$name.'.zip');
	if ($comprimir) {
	//if (createzip($contenido,'../'.$projectFolder.$name.'.zip')) {
		$success = return_array('comprimir', array("zip"=>'../'.$projectFolder.$name.'.zip', "contenido"=>$comprimir), $write['success_zip'], '', false, '', '', '');
		return $success;
	} else {
		// error: 14 - Error building ZIP folder.
		$error = return_array('comprimir', $contenido, $write['error_zip'], '', true, 14, '', 'comprimir');
		return $error;
	}
}

function getBoolValue($val) {
	switch (strtolower($val)) {
		case 'true':
			return true;
			break;
		case 'false':
			return false;
			break;
  		default:
        	return false;
	}
}

?>