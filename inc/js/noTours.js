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
 * http://vhplab.net/editor/inc/js/noTours.min.js
 * 
 * enjoy the code and drop me a line for comments and questions!
 * dev@escoitar.org
 *
 */
 
function update_field(elemento, limit, extra, check, wrong) {
	var value = $(elemento).attr("value");
	var data = $(elemento).attr("name").split("_");
	var campo = data[0];
	var contexto = data[1];
	var id = data[2];
    var old = $("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .value").text();
    var ok = false;
    var prj = $(".project").attr("id");
    if (check) {
    	ok = check(value, old);
    } else if ((value)&&(value != "")&&(value!=old)) {
    	ok = true;
    }
   	if (ok) {
    	$("#"+ contexto +"_"+ id +" .update_"+ campo).empty();
    	hidden_value = value; 
    	if (extra) hidden_value += extra;
    	$("#"+ contexto +"_"+ id +" .update_"+ campo).append(hidden_imput_html(campo, id, hidden_value));
    	if ((limit)&&(value.length>=limit)) value = value.slice(0,limit) + '...';
    	$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .value").text(value);
		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .value").attr("class","value new");
		eval(contexto +"_"+ id +".saved = false;");
		eval(prj +".change();");
		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").hide();
		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box").show("slow");
		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .new").show();
	} else if (value==old) {
		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").hide();
		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box").show("slow");
		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .new").show();
	} else {
		alert(wrong);
	}
};
var hexadecimal = new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
function convierteHexadecimal(num){
    var hexaDec = Math.floor(num/16);
    var hexaUni = num - (hexaDec * 16);
    return hexadecimal[hexaDec] + hexadecimal[hexaUni];
};
function degradado(color_inicio, color_fin, pasos) {

	var incremento_r = parseInt((color_fin[0] - color_inicio[0])/pasos);
	var incremento_g = parseInt((color_fin[0] - color_inicio[1])/pasos);
	var incremento_b = parseInt((color_fin[0] - color_inicio[2])/pasos);
	
	var r = convierteHexadecimal((color_inicio[0] + incremento_r));
	var g = convierteHexadecimal((color_inicio[1] + incremento_g));
	var b = convierteHexadecimal((color_inicio[2] + incremento_b));
	
	var color = "#" + r + "" + g + "" + b;
	return color;
};
// para importar desde rss o xml
function itemChild(item, def) {
	var child;
	if(item.firstChild != null){
		child = item.firstChild.data;
	} else {
		child = def;
	}
	return child;
};
function getsSufix(name){
	var name_array = name.split('.');
	if (name_array.length>=2) {
		var sufix = name_array[(name_array.length - 1)];
		return sufix.toLowerCase();
	} else {
		return false;
	}
};
function round(flo, n){
	var num = Math.pow(10,n);
	flo = parseFloat(flo);
	flo = Math.round(flo*num);
	flo = flo/num;
	return flo;
};
function sortNumber(a,b) {
	return a - b;
};
function sortAngle(a,b) {
	var c = eval('file_'+ a +'.angles[0]');
	var d = eval('file_'+ b +'.angles[0]');
	return parseInt(c) - parseInt(d);
};