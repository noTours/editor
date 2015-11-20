/*!
 * noTours editor 1.1
 *
 * Attribution-NonCommercial-ShareAlike 3.0
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 * 
 * noTours editor base framework by Horacio González Diéguez
 * is licensed under a Creative Commons based on a work at
 * http://www.editor.notours.org/
 *
 * Date: Tue Feb 14 2012
 * 
 * original uncompressed js file:
 * http://vhplab.net/editor/inc/js/noTours-html.js
 * 
 * enjoy the code and drop me a line for comments and questions!
 * dev@escoitar.org
 *
 */

function wrapper_tag_html(tag, id, clss, content, tab, extra) {
	var html = '\n'; 
	html += tab +'<'+ tag;
	if ((id)&&(id!="")) html += ' id="'+ id +'"';
	if ((clss)&&(clss!="")) html += ' class="'+ clss +'"';
	if ((extra)&&(extra!="")) html += ' ' + extra;
	html += '>';
	if ((content)&&(content!="")) html += content;
	html += tab +'</'+ tag +'>';
	if ((id)&&(id!="")) {
		html += '<!-- '+ id +' -->';
	} else if ((clss)&&(clss!="")) {
		html += '<!-- '+ clss +' -->';
	}
	html += '\n';
	return html;
};
function login_form_html() {
	var html = ''; 
	html += '\t<form id="login" class="recuadro" method="post" action="">\n';
	html += '\t\t<input type="text" class="text" name="user" id="user" value=""><label for="user">'+noTours.write.user_label+':</label>\n';
	html += '\t\t<input type="password" class="text" name="pass" id="pass" value=""><label for="pass">'+noTours.write.password_label+':</label>\n';
	html += '\t\t<input type="hidden" name="lang" value="'+ noTours.lang +'">\n';
	html += '\t\t<input type="submit" class="submit" value="'+noTours.write.enter_submit+'">\n';
	html += '\t</form>\n';
	return html;
};
function new_author_form_html() {
	var html = '';
	html += '\t<form id="new_author" class="recuadro" method="post" action="">\n';
	html += '\t\t<input type="text" class="text" name="newuser" id="newuser" value=""><label for="newuser">'+noTours.write.user_label+':</label>\n';
	html += '\t\t<input type="text" class="text" name="newmail" id="newmail" value=""><label for="newmail">'+noTours.write.mail_label+':</label>\n';
	html += '\t\t<input type="password" class="text" name="newpass" id="newpass" value=""><label for="newpass">'+noTours.write.password_label+':</label>\n';
	html += '\t\t<input type="password" class="text" name="twice" id="twice" value=""><label for="twice">'+noTours.write.password_again_label+':</label>\n';
	html += '\t\t<input type="hidden" name="lang" value="'+ noTours.lang +'">\n';
	html += '\t\t<input type="submit" class="submit" value="'+noTours.write.create_author_submit+'">\n';
	html += '\t</form>\n';
	return html;
};
function new_project_form_html() {
	var html = '';
	html += '\t<form id="new_project" class="recuadro" method="post" action="">\n';
	html += '\t\t<label for="titulo_proyecto">'+noTours.write.project_label+'</label><input type="text" class="text" name="titulo_proyecto" id="titulo_proyecto" value="">\n';
	html += '\t</form>\n';
	return html;
};
function update_project_form_html(id, tab) {
	var html = ''; 
	html += tab +'<form class="update_project" action="" method="post" id="update_project_'+ id +'" name="update_project_'+ id +'" enctype="multipart/form-data">\n';
	html += tab +'\t<fieldset class="data">\n';
	html += tab +'\t\t<input name="hidden_id" type="hidden" value="'+ id +'" />\n';
	html += tab +'\t\t<div class="update_location"></div>\n';
	html += tab +'\t\t<div class="update_title"></div>\n';
	html += tab +'\t\t<div class="update_description"></div>\n';
	html += tab +'\t\t<div class="update_icon"></div>\n';
	html += tab +'\t\t<div class="update_levels"></div>\n';
	html += tab +'\t\t<div class="update_sticky"></div>\n';
	html += tab +'\t\t<div class="update_kml"></div>\n';
	html += tab +'\t</fieldset>\n';
	html += tab +'</form><!-- update_project_'+ id +' -->\n';
	return html;
};
function update_object_form_html(id, project_id, tab) {
	var html = ""; 
	html += tab +'<form class="update_object" action="" method="post" enctype="multipart/form-data">\n';
	html += tab +'\t<fieldset class="enviar_formulario">\n';
	html += tab +'\t\t<input name="hidden_id" type="hidden" value="'+ id +'" />\n';
	html += tab +'\t\t<input name="hidden_project_id" type="hidden" value="'+ project_id +'" />\n';
	html += tab +'\t\t<div class="update_title"></div>\n';
	html += tab +'\t\t<div class="update_type"></div>\n';
	html += tab +'\t\t<div class="update_level"></div>\n';
	html += tab +'\t\t<div class="update_milestone"></div>\n';
	html += tab +'\t\t<div class="update_description"></div>\n';
	html += tab +'\t\t<div class="update_sound"></div>\n';
	html += tab +'\t\t<div class="update_attributes"></div>\n';
	html += tab +'\t\t<div class="update_location"></div>\n';
	html += tab +'\t</fieldset>\n';
	html += tab +'</form>\n';
	return html;
};
function delete_object_form_html(id, tab) {
	var html = "";
	html += tab +'<div class="delete_object">\n';
	html += tab +'\t<a class="delete" title="'+ noTours.write.delete_object_title +'">'+ noTours.write.delete_object +'</a>\n';
	html += tab +'</div>\n';
	return html;
};
function geocode_form_html(tb) {
	var html = "";
	html += tb +'<form class="geocode" action="" method="post" enctype="multipart/form-data">\n';
	html += tb +'\t<a title="'+ noTours.write.geocode +'" class="icon"></a><input type="text" name="address" id="address" value="" />\n';
	html += tb +'</form>\n';
	return html;
};
function kml_alert_html() {
	var html = "";
	html += '\t\t\t\t\t\t<div class="recuadro">\n';
	html += '\t\t\t\t\t\t\t<img src="'+ noTours.root +'/inc/img/icon/snmp_alert_small.png" />\n';
	html += '\t\t\t\t\t\t\t<p>'+ noTours.write.use_kml_alert +'</p>\n';
	html += '\t\t\t\t\t\t</div>\n';
	return html;
};
function kml_form_html() {
	var html = "";
	var prj = $(".project").attr('id');
	var id = prj.slice(8);
	html += '\t\t\t\t\t\t<h3>'+ noTours.write.use_kml_info_head +'<'+'/h3>\n';
	html += '\t\t\t\t\t\t<div class="recuadro">\n';
	html += '\t\t\t\t\t\t\t<p>'+ noTours.write.use_kml_info +'</p>\n';
	html += '\t\t\t\t\t\t\t<img class="new_kml" src="'+ noTours.root +'/inc/img/icon/kml-new.png" />\n';
	html += '\t\t\t\t\t\t\t<div id="new_kml">\n';
	html += '\t\t\t\t\t\t\t\t'+ imput_html('iframe', '', 'kml', id, '') +'\n';
	html += '\t\t\t\t\t\t\t</div>\n';
	html += '\t\t\t\t\t\t</div>\n';
	html += '\t\t\t\t\t\t<p class="small">*'+ noTours.write.use_kml_tip +'</p>\n';
	return html;
};
function lang_buttons_html() {
	var html = '';
	html += '\t<p class="lang">\n';
	html += '\t\t<a class="en" title="english language version"></a>\n';
	html += '\t\t<a class="fr" title="French language version"></a>\n';
	html += '\t\t<a class="es" title="versión en español"></a>\n';
	html += '\t\t<a class="gl" title="versión en galego"></a>\n';
	html += '\t\t<a class="ca" title="versió en català"></a>\n';
	html += '\t</p>\n';
	return html;
};
function upload_sound_html() {
	var html = '';
	html += '\t\t<form class="process" enctype="multipart/form-data" action="process_sound.php" method="POST" id="process_sound" name="process_sound">\n';
	html += '\t\t\t<input class="file" type="file" accept="audio/*" id="sound" name="sound" />\n';
	html += '\t\t\t<input class="submit" type="submit" value="'+ noTours.write.upload +'"/>\n';
	html += '\t\t\t<input type="hidden" name="lang" value="'+ noTours.lang +'"/>\n';
	html += '\t\t</form>\n';
	html += '\t\t<div id="loading">\n';
	html += '\t\t\t'+ noTours.write.iframe_uploading +'<img src="../inc/img/loading.gif" />\n';
	html += '\t\t</div> \n';
	return html;
};
function upload_icon_html() {
	var html = '';
	html += '\t\t<form class="process" enctype="multipart/form-data" action="process_icon.php" method="POST" id="process_icon" name="process_icon">\n';
	html += '\t\t\t<input class="file" type="file" accept="image/*" id="icon" name="icon" />\n';
	html += '\t\t\t<input class="submit" type="submit" value="'+ noTours.write.upload +'"/>\n';
	html += '\t\t\t<input type="hidden" name="lang" value="'+ noTours.lang +'"/>\n';
	html += '\t\t</form>\n';
	html += loading_html();
	return html;
};
function upload_kml_html() {
	var html = '';
	html += '\t\t<form class="process" enctype="multipart/form-data" action="process_kml.php" method="POST" id="process_kml" name="process_kml">\n';
	html += '\t\t\t<input class="file" type="file" accept="text/xml" id="kml" name="kml" />\n';
	html += '\t\t\t<input class="submit" type="submit" value="'+ noTours.write.upload +'"/>\n';
	html += '\t\t\t<input type="hidden" name="lang" value="'+ noTours.lang +'"/>\n';
	html += '\t\t</form>\n';
	html += loading_html();
	return html;
};
function loading_html() {
	var html = '';
	html += '\t\t<div id="loading">\n';
	html += '\t\t\t<img src="../inc/img/loading-circle.gif" /><span>'+ noTours.write.iframe_uploading +'</span>\n';
	html += '\t\t</div> \n';
	return html;
};
function header_html() {
	var html = '';
	html += '\t\t\t<a target="_blank" href="http://www.notours.org/"><img class="logo" src="inc/img/pix/logo_notours.jpg" alt="NoTours" /></a>\n';
	html += '\t\t\t<div class="nav"><span class="out">'+ noTours.write.logout_link +'</span> | <span class="main">'+ noTours.write.mainmenu_link +'</span> | <a target="_blank" href="http://www.notours.org/archives/489" >'+ noTours.write.documentation_link +'</a> <p class="lang"><a class="en" title="english language version">en</a> | <a class="fr" title="French language version">fr</a> | <a class="es" title="versión en español">es</a> | <a class="gl" title="versión en galego">gl</a> | <a class="ca" title="versió en català">ca</a> | <a class="fi" title="Suomalainen versio">fi</a> | <a class="gr" title="Ελληνική έκδοση">gr</a></p></div>\n';
	html += '\t\t\t<div id="actions"><a class="download_project" title="'+ noTours.write.download_project_title +'">'+ noTours.write.download_project +'</a> <a class="delete_project" title="'+ noTours.write.delete_project_title +'">'+ noTours.write.delete_project +'</a><a class="save_project saved"  title="'+ noTours.write.save_project_title +'">'+ noTours.write.save_project +'</a></div>\n';
	return html;
};
function project_tip_html() {
	var html = "";
	html += '\t\t\t\t\t\t<h3>'+ noTours.write.create_project_info_head +'<'+'/h3>\n';
	html += '\t\t\t\t\t\t<div class="recuadro"><p>'+ noTours.write.create_project_info +'</p></div>\n';
	html += '\t\t\t\t\t\t<p class="small">*'+ noTours.write.dbclick_info +'</p>\n';
	return html;
};
function object_tip_html() {
	var html = "";
	html += '\t\t\t\t\t\t<h3>'+ noTours.write.create_project_info_head +'<'+'/h3>\n';
	html += '\t\t\t\t\t\t<div class="recuadro"><span class="new_object">'+ noTours.write.new_object_button +'</span><p>'+ noTours.write.create_object_info +'</p></div>\n';
	return html;
};
function empty_field_html(contexto, campo, id, texto_valor, value, limit, tab) {
	var html = '';
	var display_value = value;
	html += tab +'<div class="wrap_'+ campo +'">\n';
	html += tab +'\t<div class="value_box">\n';
	if ((texto_valor)&&(texto_valor!="")) html += tab +'\t\t<h4>'+ texto_valor +':</h4>\n';
	if ((limit)&&(display_value.length>=limit)) display_value = display_value.slice(0,limit) + '...';
    html += tab +'\t\t<span class="value edit" name="'+ campo +'_'+ contexto +'_'+ id +'">'+ display_value +'</span>\n';
	html += tab +'\t</div>\n';
	html += tab +'</div><!-- wrap_'+ campo +' -->\n';
	return html;
};
function dbclick_field_html(contexto, campo, type, id, texto_valor, texto_campo, value, limit, tab) {
	var html = '';
	var display_value = value;
	html += tab +'<div class="wrap_'+ campo +'">\n';
	html += tab +'\t<div class="value_box">\n';
	if ((texto_valor)&&(texto_valor!="")) html += tab +'\t\t<h4>'+ texto_valor +':</h4>\n';
	if ((limit)&&(display_value.length>limit)) display_value = display_value.slice(0,limit) + '...';
    html += tab +'\t\t<span class="value edit" name="'+ campo +'_'+ contexto +'_'+ id +'">'+ display_value +'</span>\n';
	html += tab +'\t</div>\n';
	html += tab +'\t<div class="field_box hidden">\n';
	if ((texto_campo)&&(texto_campo!="")) html += tab +'\t\t<label for="'+ campo +'_'+ contexto +'_'+ id +'">'+ texto_campo +'</label>\n';
	html += tab +'\t\t'+ imput_html(type, contexto, campo, id, value) +'\n';
	html += tab +'\t</div>\n';
	html += tab +'</div><!-- wrap_'+ campo +' -->\n';
	return html;
};
function simple_checkbox_html(contexto, campo, id, texto_valor, texto_campo, clase, value, tab) {
	var html = '';
	if ((!value)||(value=="")) value = noTours.write.attributes_label;
	if (typeof campo == "object") {
		
		html += tab +'<div class="wrap_'+ clase +'">\n';
		html += tab +'\t<div class="field_box">\n';
		if ((!texto_campo)||(texto_campo=="")) texto_campo = campo;
		for (i=0; i<campo.length; i++) {
			html += tab +'\t\t<label for="'+ clase +'_'+ contexto +'_'+ id +'">'+ texto_campo[i] +'</label>\n';
			var checked = '';
			if(value.indexOf(campo[i])!=(-1)) checked = 'checked="checked" ';
			html += tab +'\t\t<input type="checkbox" name="'+ clase +'_'+ contexto +'_'+ id +'" value="'+ campo[i] +'" '+ checked +'/>\n';
		}
		html += tab +'\t</div>\n';
		
		html += tab +'\t<div class="value_box">\n';
		html += tab +'\t\t<span class="value edit" name="'+ clase +'_'+ contexto +'_'+ id +'">'+ value +'</span>\n';
		html += tab +'\t</div>\n';
		
		html += tab +'</div><!-- '+ clase +' -->\n';
	} 
	return html;
};

function simple_checkbox_html_2(contexto, campo, id, texto_valor, texto_campo, clase, value, tab) {
	var html = '';
	html += tab +'<div class="wrap_'+ clase +'">\n';
	html += tab +'\t<div class="field_box">\n';
	if ((!texto_campo)||(texto_campo=="")) texto_campo = campo;
	html += tab +'\t\t<label for="'+ clase +'_'+ contexto +'_'+ id +'">'+ texto_campo +'</label>\n';
	var checked = '';
	var txt = 'normal';
	if(value) {
		checked = 'checked="checked" ';
		txt = 'stiky';
	}
	html += tab +'\t\t<input type="checkbox" name="'+ clase +'_'+ contexto +'_'+ id +'" value="'+ value +'" '+ checked +'/>\n';
	html += tab +'\t</div>\n';
	html += tab +'\t<div class="value_box">\n';
	html += tab +'\t\t<span class="value edit" name="'+ clase +'_'+ contexto +'_'+ id +'">'+ txt +'</span>\n';
	html += tab +'\t</div>\n';
	html += tab +'</div><!-- '+ clase +' -->\n';
	return html;
};

function dbclick_checkbox_html(contexto, campo, id, texto_valor, texto_campo, clase, value, tab) {
	var html = '';
	if ((!value)||(value=="")) value = noTours.write.attributes_label;
	if (typeof campo == "object") {
		html += tab +'<div class="wrap_'+ clase +'">\n';
		html += tab +'\t<div class="value_box">\n';
		if ((texto_valor)&&(texto_valor!="")) html += tab +'\t\t<h4>'+ texto_valor +':</h4>\n';
		html += tab +'\t\t<span class="value edit" name="'+ clase +'_'+ contexto +'_'+ id +'">'+ value +'</span>\n';
		html += tab +'\t</div>\n';
		html += tab +'\t<div class="field_box hidden">\n';
		if ((!texto_campo)||(texto_campo=="")) texto_campo = campo;
		for (i=0; i<campo.length; i++) {
			html += tab +'\t\t<label for="'+ clase +'_'+ contexto +'_'+ id +'">'+ texto_campo[i] +'</label>\n';
			var checked = '';
			if(value.indexOf(campo[i])!=(-1)) checked = 'checked="checked" ';
			html += tab +'\t\t<input type="checkbox" name="'+ clase +'_'+ contexto +'_'+ id +'" value="'+ campo[i] +'" '+ checked +'/>\n';
		}
		html += tab +'\t</div>\n';
		html += tab +'</div><!-- '+ clase +' -->\n';
	} else {
		html += tab +'<div class="wrap_'+ campo +'">\n';
		html += tab +'\t<div class="value_box">\n';
		if ((texto_valor)&&(texto_valor!="")) html += tab +'\t\t<h4>'+ texto_valor +':</h4>\n';
		html += tab +'\t\t<span class="value edit" name="'+ campo +'_'+ contexto +'_'+ id +'">'+ value +'</span>\n';
		html += tab +'\t</div>\n';
		html += tab +'\t<div class="field_box hidden">\n';	
		if ((!texto_campo)||(texto_campo=="")) texto_campo = campo;
		html += tab +'\t\t<label for="'+ campo +'_'+ contexto +'_'+ id +'">'+ texto_campo +'</label>\n';
		var checked = '';
		if(value.indexOf(campo)!=(-1)) checked = 'checked="checked" ';
		html += tab +'\t\t<input type="checkbox" name="'+ campo +'_'+ contexto +'_'+ id +'" value="'+ campo +'" '+ checked +'/>\n';
		html += tab +'</div><!-- '+ campo +' -->\n';
	}
	return html;
};
function dbclick_option_html(contexto, campo, id, texto_valor, texto_campo, keys, values, value, tab) {
	var html = '';
	//if ((!value)||(value=="")) value = noTours.write.attributes_label;
	html += tab +'<div class="wrap_'+ campo +'">\n';
	html += tab +'\t<div class="value_box">\n';
	if ((texto_valor)&&(texto_valor!="")) html += tab +'\t\t<h4>'+ texto_valor +':</h4>\n';
	html += tab +'\t\t<span class="value edit" name="'+ campo +'_'+ contexto +'_'+ id +'">'+ value +'</span>\n';
	html += tab +'\t</div>\n';
	html += tab +'\t<div class="field_box hidden">\n';
	if ((texto_campo)&&(texto_campo!="")) html += tab +'\t\t<label for="'+ campo +'_'+ contexto +'_'+ id +'">'+ texto_campo +'</label>\n';
	html += tab +'\t\t<select name="'+ campo +'_'+ contexto +'_'+ id +'">\n';
	for (i=0; i<values.length; i++) {
		var selected = '';
		if(value==values[i]) selected = 'selected="selected" ';
		html += tab +'\t\t<option  value="'+ values[i] +'" '+ selected +'>'+ keys[i] +'</option>\n';
	}
	html += tab +'\t\t</select>\n';
	html += tab +'\t</div>\n';
	html += tab +'</div><!-- wrap_'+ campo +' -->\n';
	return html;
};
function dbclick_text_html(contexto, campo, id, texto_valor, clase, value, tab) {
	var html = '';
	if (typeof campo == "object") {
		html += tab +'<div class="wrap_'+ clase +'">\n';
		for (i=0; i<campo.length; i++) {
			html += tab +'\t<div class="value_box">\n';
			if ((texto_valor[i])&&(texto_valor[i]!="")) html += tab +'\t\t<h4>'+ texto_valor[i] +':</h4>\n';
			html += tab +'\t\t<span class="value '+ campo[i] +'" name="'+ campo[i] +'_'+ contexto +'_'+ id +'">'+ value[i] +'</span>\n';
			html += tab +'\t</div>\n';
		}
		html += tab +'</div><!-- '+ clase +' -->\n';
	} else {
		html += tab +'<div class="wrap_'+ campo +'">\n';
		html += tab +'\t<div class="value_box">\n';
		if ((texto_valor)&&(texto_valor!="")) html += tab +'\t\t<h4>'+ texto_valor +':</h4>\n';
		html += tab +'\t\t<span class="value '+ clase +'" name="'+ campo +'_'+ contexto +'_'+ id +'">'+ value +'</span>\n';
		html += tab +'\t</div>\n';
		html += tab +'</div><!-- '+ campo +' -->\n';
	}
	return html;
};
function dbclick_img_html(contexto, campo, id, texto_valor, texto_campo, img, tab, optional) {
	var html = '';
	html += tab +'<div class="wrap_'+ campo +'">\n';
	html += tab +'\t<div class="value_box">\n';
	if ((texto_valor)&&(texto_valor!="")) html += tab +'\t\t<h4>'+ texto_valor +':</h4>\n';
	html += tab +'\t\t<span class="value edit" name="'+ campo +'_'+ contexto +'_'+ id +'">('+noTours.write.edit+')</span>\n';
	html += tab +'\t\t<img src="'+ img +'" />\n';
	html += tab +'\t</div>\n';
	html += tab +'\t<div class="field_box hidden">\n';
	if (optional) {
		html += tab +'\t\t<label for="'+ campo +'_'+ contexto +'_'+ id +'_opt">'+ eval('noTours.write.optional_'+campo) +'</label>\n';
		html += tab +'\t\t<input type="text" name="'+ campo +'_'+ contexto +'_'+ id +'_opt" value="" />\n';
		html += tab +'\t\t<span>'+ eval('noTours.write.remember_optional_'+campo) +'</span>\n';
		html += tab +'\t\t<span>'+ eval('noTours.write.alternative_optional_'+campo) +'</span><div class="optional">'+ noTours.write.upload_now +'</div>\n';
	}
	if ((texto_campo)&&(texto_campo!="")) html += tab +'\t\t<label for="'+ campo +'_'+ contexto +'_'+ id +'">'+ texto_campo +'</label>\n';
	html += tab +'\t\t'+ imput_html('iframe', contexto, campo, id, '') +'\n';
	html += tab +'\t</div>\n';
	html += tab +'</div><!-- '+ campo +' -->\n';
	return html;
};
function click_button_html(clss, title) {
	var html = '<a class="button '+ clss +'" title="'+ title +'"></a>';
	return html;
};
function click_text_html(clss, text, title) {
	var html = '<a class="text '+ clss +'" title="'+ title +'">'+text +'</a>';
	return html;
};
function simple_checklist_html(campo, contexto, id, labels, tab) {
	var html = '';
	html += tab +'<ul class="wrap_'+ campo +'">\n';
	for (i=0; i<labels.length; i++) {
		var a = labels[i].split(" ");
		var n = parseInt(a[1]);
		html += tab +'\t<li class="l_'+i+'">\n';
		html += tab +'\t\t<label for="'+ campo +'_'+ n +'_'+ contexto +'_'+ id +'">'+ labels[i] +'</label>\n';
		html += tab +'\t\t<input type="checkbox" name="'+ campo +'_'+ n +'_'+ contexto +'_'+ id +'" value="'+ labels[i] +'" checked="checked"/>\n';
		html += tab +'\t</li>\n';
	}
	html += tab +'</ul><!-- wrap_'+ campo +' -->\n';
	return html;
};
function dbclick_sound_html(contexto, campo, id, sound, inline, angles, tab) {
	var html = '';
	html += tab +'<li class="wrap_'+ campo +'">\n';
	html += tab +'\t<div class="value_box">\n';
	html += tab +'\t\t<h4>'+ noTours.write.sound_header +':</h4>\n';
	var value = '';
	var txt_value = '('+ noTours.write.edit +')';
	if ((sound!="")&&(!inline)) {
		sound_name = sound.split("/");
		value = sound_name[(sound_name.length -1)];
		txt_value = sound_name[(sound_name.length -1)];
	} else if (sound!="") {
		value = sound;
		txt_value = sound;
	}
	html += tab +'\t\t<span class="value edit" name="'+ campo +'_'+ contexto +'_'+ id +'" id="'+ campo +'_'+ contexto +'_'+ id +'">'+ txt_value + '</span><span class="angle">'+ angles[0] +' '+ angles[1] +'</span>\n';
	html += tab +'\t\t<input name="hidden_'+ campo +'" id="hidden_'+ campo +'_'+ id +'" type="hidden" value="" />\n';
	//if (inline) html += sound_player_html(sound, '', tab+'\t\t');
	html += tab +'\t</div>\n';
	html += tab +'\t<div class="field_box hidden">\n';
	html += tab +'\t\t<label for="'+ campo +'_'+ contexto +'_'+ id +'_opt">'+ noTours.write.optional_sound +'</label>\n';
	html += tab +'\t\t<input type="text" maxlength="25" name="'+ campo +'_'+ contexto +'_'+ id +'_opt" value="'+ value +'" />\n';
	//html += tab +'\t\t<label for="iframe_'+ campo +'_'+ id +'">'+ noTours.write.alternative_optional_sound +'</label>\n';
	//html += tab +'\t\t'+ imput_html('iframe', contexto, 'sound', id, '') +'\n';
	html += tab +'\t</div>\n';
	html += tab +'</li><!-- '+ campo +' -->\n';
	return html;
};
function imput_html(type, contexto, campo, id, value) {
	var html = '';
	switch (type) {
		case 'input':
			html += '<input type="text" name="'+ campo +'_'+ contexto +'_'+ id +'" value="'+ value +'" />';
			break;
		case 'textarea':
			html += '<textarea name="'+ campo +'_'+ contexto +'_'+ id +'">'+ value +'</textarea>';
			break;
		case 'iframe':
			html += '<iframe name="iframe_'+ campo +'_'+ id +'" id="iframe_'+ campo +'_'+ id +'" src="'+ noTours.root +'exec/upload_'+ campo +'.html"></iframe>';
			break;
		case 'checkbox':
			html += '<input type="checkbox" name="'+ campo +'_'+ contexto +'_'+ id +'" value="'+ value +'" />\n';
			break;
		case 'hidden':
			html += '<input type="hidden" name="'+ campo +'_'+ contexto +'_'+ id +'" value="'+ value +'" />\n';
			break;
		case '':
			return '';
			break;
	}
	return html;
};
function sound_player_html(url, vars, tb) {
	var html = '';
	if (url!="") {
		html += tb +'<object data="'+ noTours.root +'inc/playerwpress.swf?soundFile='+ url + vars +'" type="application/x-shockwave-flash" height="24" width="290">\n';
		html += tb +'\t<param value="'+ noTours.root +'inc/playerwpress.swf?soundFile='+ url + vars +'" name="movie">\n';
		html += tb +'\t<param value="high" name="quality">\n';
		html += tb +'\t<param value="true" name="menu">\n';
		html += tb +'\t<param value="transparent" name="wmode">\n';
		html += tb +'</object>\n';
	}
	return html;
};
function formGeocodeHtml() {
	var html = ""; 
	html += '\t<form id="geocode" action="" method="post">\n';
	html += '\t\t<input type="text" class="text" name="address" id="address" value="">\n';
	html += '\t</form>\n';
	return html;
};
function hidden_imput_html(campo, id, value) {
	var html = '';
	html += '<input name="hidden_'+ campo +'" id="hidden_'+ campo +'_'+ id +'" type="hidden" value="'+ value +'" />';
	return html;		
};