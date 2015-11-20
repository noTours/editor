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
 * http://vhplab.net/editor/inc/js/noTours-cookie.js
 * 
 * enjoy the code and drop me a line for comments and questions!
 * dev@escoitar.org
 *
 */
 
function setCookie(c_name,value,expiredays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
};
function getCookie(c_name) {
	if (document.cookie.length>0) {
  		c_start = document.cookie.indexOf(c_name + "=");
		if (c_start!=-1) {
    		c_start=c_start + c_name.length+1;
			c_end=document.cookie.indexOf(";",c_start);
    		if (c_end==-1) {
    			c_end=document.cookie.length;
    		}
    		return unescape(document.cookie.substring(c_start,c_end));
		}
		return "";
	}
};
function delCookie(c_name) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate()-1);
	document.cookie=c_name+ "=NULL;expires="+exdate.toGMTString()+";";
};
function checkCookie() {
	var cookieUser = getCookie('userid');
	var cookieLang = getCookie('userlang');
	if (cookieUser!=null && cookieUser!="") {
		//user = cookieUser;
		noTours.user = cookieUser;
		//logged = true;
		noTours.logged = true;
  	} else {
		//logged = false;
		noTours.logged = false;
  	}
  	if (cookieLang!=null && cookieLang!="") {
		//lang = cookieLang;
		noTours.lang = cookieLang;
  	}
};