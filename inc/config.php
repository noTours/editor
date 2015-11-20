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
 
/* DATABASE INFORMATION */

$auth_key = 'your_auth_key_here';

$db = array(
	"type" => "mysql",
	"host" => "your_host",
	"data" => "your_DB",
	"user" => "your_user",
	"pass" => "your_password"
);

$db_tables = array(
	"name" => "base_name",
	"authors" => "notours_author",
	"projects" => "notours_project",
	"walkers" => "notours_walker",
	"walkers_trigger" => "notours_walker_trigger",
	"walkers_data" => "notours_walker_data",
	"walkers_stored" => "notours_walker_stored",
	"objects" => "notours_object",
	"files" => "notours_file",
	"soundmanager_group" => "notours_soundmanager_group",
	"soundmanager_relation" => "notours_soundmanager_relation",
	"soundmanager_sound" => "notours_soundmanager_sound",
	"soundmanager_tag" => "notours_soundmanager_tag"
);

/* Global variables */
$root = "your_web_root";

/* NOTOURS */
$soundFolder = "sound/";
$imagesFolder = "images/";
$tmpSoundFolder = "tmp_sound/";
$tmpImageFolder = "tmp_image/";
$tmpKmlFolder = "tmp_kml/";
$projectFolder = "projects/";

?>