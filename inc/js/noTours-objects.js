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
 * http://vhplab.net/editor/inc/js/noTours-objects.js
 * 
 * enjoy the code and drop me a line for comments and questions!
 * dev@escoitar.org
 *
 */
 
//******************************
// Notours Interface
//******************************
function NotoursInterface() {
	// interface state
	this.terminal = false;
	this.navigation = false;
	this.floatingBox = false;
	this.menu = false;
	this.saving = false;
	this.editing = false;
	this.terminal_height = 120;
	// user data
	this.user = '';					// store cookieUser
	this.lang = 'es';				// store cookieLang
	this.write = null;				// Lang oject for translation
	this.logged =  new Boolean();	// logged control var
	this.logging = false;			// logging control var
	this.author = null;
	// Gmaps
	this.browserSupportFlag =  new Boolean();
	this.initialLocation;
	this.map;
	this.drag = '';
	this.miniMap;
	this.rectangle;
	// NoTours
	this.root = "http://www.editor.notours.org/";
	this.projectFolder = 'projects/';
	//internal
	this.self = this;	//to eliminate noTour.(future????)
};
NotoursInterface.prototype.initialize = function initialize() {
	var height = parseInt($("#floatingBox").height());
	var margin = ((height-371)*50/168)+10;
	$("#floatingBox .wrapper").css("margin", margin +"px auto");
	var language = this.lang;
	$.getScript('exec/lang.js.php?lang='+ language, function() {
		eval('noTours.write = new Lang_'+ language +'();');
		$("header").append(header_html());
		noTours.header_init();
		noTours.showNavigation();
		noTours.map_init();
		noTours.interface_init();
		if(noTours.logged) {
			noTours.author = new NotoursAuthor();
			noTours.author.initialize(noTours.user);
			noTours.author.load();
		} else {
			noTours.login_register_init();
		}
	});
};
NotoursInterface.prototype.interface_init = function() {
	$('#elements').hide();
	$('#history').hide();
	$('#send').hide();
	$('#objects').hide();
	$('#terminal .nav .resize').hide();
	$('#navigation .nav').click(function() {
		if (noTours.navigation) {
			$('#navigation .nav').addClass("right");
			$('#navigation .nav').removeClass("left");
			noTours.hideNavigation();
		} else {
			$('#navigation .nav').addClass("left");
			$('#navigation .nav').removeClass("right");
			noTours.showNavigation();
		}
	});
	$('#terminal .nav').click(function() {
		if (noTours.terminal) {
			noTours.terminal = false;
			$('#workarea').css("bottom", 8);
			$('#terminal .nav').addClass("up");
			$('#terminal .nav').removeClass("down");
			$('#terminal').css("height", 0);
			$('#history').hide();
			$('#send').hide();
			$('#terminal .nav .resize').hide();
		} else {
			noTours.terminal = true;
			$('#workarea').css("bottom", noTours.terminal_height + 8);
			$('#terminal .nav').addClass("down");
			$('#terminal .nav').removeClass("up");
			$('#terminal').css("height", noTours.terminal_height);
			$('#history').show();
			$('#send').show();
			$('#terminal .nav .resize').show();
		}
	});
	$('#floatingBox .nav .hide').click(function() {
		if (noTours.floatingBox) {
			noTours.floatingBox = false;
			noTours.saving = false;		// try to save again after failure
			$('#floatingBox').hide();
		} else {
			noTours.floatingBox = true;
			$('#floatingBox').show();
		}
	});
	$('#terminal .resize').mousedown(function(e) {
		var css_height = $("#terminal").css("height");
		var borderOfset = 5;
		var browserOfset = 10;
		var minSize = 45;
		var maxSize = window.innerHeight - 80 - borderOfset - browserOfset;
		var ypos = window.innerHeight - e.pageY - borderOfset - browserOfset;
		var pos = css_height.indexOf("px");
		var height = css_height.substr(0,pos);
		var proportion = (ypos-borderOfset)/height;
		$('#terminal').bind('mousemove',function(e){
			ypos = window.innerHeight - e.pageY - borderOfset - browserOfset;
			height = ypos/proportion;
			if ((height>=minSize)&&(height<=maxSize)) {
				$("#terminal").css("height", height);
				$("#workarea").css("bottom", height + 8);
				noTours.terminal_height = height;
			}
		});
	});
	$('#terminal').mouseup(function(){
		$('#terminal').unbind('mousemove');
	});
	$("#send").submit(function() {
		if (noTours.author.type=="debugger") {
			$("#history").append($("#command").attr("value")+"<br />");
			$("#history").append(eval($("#command").attr("value"))+"<br />");
			$("#history").scrollTo('100%');
		}
		return false;
    });
};
NotoursInterface.prototype.login_register_init = function() {
	$("#floatingBox .content").append('<h3>'+ noTours.write.welcome_notours +'<'+'/h3>');
	$("#floatingBox .content").append(login_form_html());
	this.login_form_init();
	$("#floatingBox .content").append(new_author_form_html());
	this.new_author_form_init();
	$("#floatingBox .content").append(lang_buttons_html());
};
NotoursInterface.prototype.header_init = function() {
	// lang
	$('.lang a').click(function() {
		var newLang = $(this).attr("class");
		if (newLang!=noTours.lang) {
			$("#history").append('changeLang('+ newLang +');<br />'+ noTours.root +'exec/lang.js.php?lang='+ newLang +'<br />');
			$.getScript('exec/lang.js.php?lang='+ newLang, function() {
				eval('noTours.write = new Lang_'+ newLang +'();');
				$("#history").append('noTours.write = new Lang_'+ newLang +'();<br />');
				noTours.lang = newLang;
				setCookie('userlang', newLang, 7);
				noTours.main();
			});
		}
	});
	// actions
	$("#actions").hide();
    $(".delete_project").click(function() {
    	var prj = $('.project').attr('id');
		var ok = confirm(noTours.write.delete_project_q);
		if (ok==true) {
  			eval(prj +'.del();');
	  	}
	});
	$(".download_project").click(function() {
		eval($('.project').attr('id') + '.zip();');
	});
	$(".save_project").click(function() {
		eval($('.project').attr('id') + '.save();');
	});
	// logout
	$('.out').click(function() {
		noTours.logout();
	});
	// main menu
	$('.main').click(function() {
		var actual = $('.project').attr('id');
		if ((actual)&&(actual!="")) {
			noTours.checkSave(actual, noTours.write.leave_project, function(){
				noTours.main();
			});
		}
	});
};
NotoursInterface.prototype.map_init = function() {
	var myOptions = {
		zoom: 4,
		center: new google.maps.LatLng(48.13, 7.44),
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		panControl: false,
		streetViewControl: false,
		disableDoubleClickZoom: true,
		scaleControl: false,
		zoomControl: true,
		mapTypeControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE,
			position: google.maps.ControlPosition.RIGHT_TOP
		}
	};
	noTours.map = new google.maps.Map(document.getElementById("map"), myOptions);
	google.maps.event.addListener(noTours.map, 'dragstart', function() {
		noTours.drag = 'map';
	});
	google.maps.event.addListener(noTours.map, 'dragend', function() {
		noTours.drag = '';
	});
	addKmlControl(noTours.map);
	addLevelControl(noTours.map);
};
NotoursInterface.prototype.mini_map_init = function(id, lat, lonx, num) {
	noTours.map.setCenter(new google.maps.LatLng(lat, lonx));
	$('#history').append('noTours.map.setCenter('+lat+', '+lonx+');<br />');
	noTours.map.setZoom(num);
	var myOptions = {
		zoom: num - 4,
		center: new google.maps.LatLng(lat, lonx),
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	noTours.miniMap = new google.maps.Map(document.getElementById('map_project_'+ id), myOptions);
	google.maps.event.addListener(noTours.miniMap, 'center_changed', function() {
		var center = noTours.miniMap.getCenter();
		var zoom = noTours.miniMap.getZoom();
		var latitud = "" + center.lat();
		var longitud = "" + center.lng();
		var id = $(".project").attr("id");
		id = id.slice(8);
		$("#update_project_"+ id +" fieldset .update_location").empty();
    	$("#update_project_"+ id +" fieldset .update_location").append(hidden_imput_html("lat", id, latitud.substring(0,10)) +" "+ hidden_imput_html("lonx", id, longitud.substring(0,10)) +" "+ hidden_imput_html("zoom", id, zoom+4));
    	$("#project_"+ id +" .wrap_edit_location .value_box .value[name='lat_project_"+ id +"']").text(latitud.substring(0,6));
    	$("#project_"+ id +" .wrap_edit_location .value_box .value[name='lonx_project_"+ id +"']").text(longitud.substring(0,6));
    	$("#project_"+ id +" .wrap_edit_location .value_box .value[name='zoom_project_"+ id +"']").text(zoom+4);
    	$("#project_"+ id +" .wrap_edit_location .value_box .value").attr("class","value new");
		eval("project_"+ id +".change();");
		eval("project_"+ id +".saved = false;");
		if (noTours.drag=='miniMap') {
			noTours.map.setCenter(center);
			noTours.map.setZoom(zoom + 4);
		}
	});
	google.maps.event.addListener(noTours.miniMap, 'dragstart', function() {
		noTours.drag = 'miniMap';
	});
	google.maps.event.addListener(noTours.miniMap, 'dragend', function() {
		noTours.drag = '';
	});
	noTours.rectangle = new google.maps.Rectangle({
		bounds: noTours.map.getBounds(),
		strokeColor: "#000",
		fillOpacity: 0.0,
		strokeOpacity: 0.6,
		strokeWeight: 1,
	});
	noTours.rectangle.setMap(noTours.miniMap);
	google.maps.event.addListener(noTours.map, 'center_changed', function() {
		noTours.rectangle.setBounds(noTours.map.getBounds());
		if (noTours.drag=='map') {
			var center = noTours.map.getCenter();
			var zoom = noTours.map.getZoom();
			noTours.miniMap.setCenter(center);
			noTours.miniMap.setZoom(zoom - 4);
		}
	});
};
NotoursInterface.prototype.login_form_init = function() {
	$("#login").submit(function() {
		if(!noTours.logging) {
			noTours.logging = true;
			var user = $("#user").attr("value");
			var pass = $("#pass").attr("value");
			if ((user!="")&&(pass!="")) {
				var values = $(this).serialize();
				$('#history').append('submit login <br />'+ noTours.root +'exec/login.php?'+ values +'<br />');
				jQuery.post(noTours.root+"exec/login.php", values, function(json){
					if (typeof json.error == "undefined") {
						noTours.author = new NotoursAuthor();
						noTours.author.initialize(json.data.id, json.data.name, json.data.password, json.data.descripcion, json.data.type);
						noTours.author.show(true);
					} else {
						alert(json.msg);
						$('#history').append(json.msg+'<br />');
						if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
					}
				}, "json" );
			}
		}
		return false;
	});
};
NotoursInterface.prototype.new_author_form_init = function() {
	$("#new_author").submit(function() {
		var newuser = $("#newuser").attr("value");
		var newpass = $("#newpass").attr("value");
		var twice = $("#twice").attr("value");
		var newmail = $("#newmail").attr("value");
		if ((newuser != "")&&(newpass != "")&&(twice != "")&&(newmail != "")) {
			if (newmail.search(/^[^@]+@[^@]+.[a-z]{2,}$/i) == -1) {
				alert(noTours.write.mail_alert);
			}else if (newpass!=twice) {
				alert(noTours.write.password_alert);
			} else {
				var values = $(this).serialize();
				$('#history').append('submit new_author <br />'+ noTours.root +'exec/signup.php?'+ values +'<br />');
				jQuery.post(noTours.root+"exec/signup.php", values, function(json){
					if (typeof json.error == "undefined") {
						$('#history').append(json.msg +'<br />');
						$('#history').append(json.dosql +'<br />');
						noTours.author = new NotoursAuthor();
						noTours.author.initialize(json.data.id, json.data.name, json.data.password, json.data.descripcion, json.data.type);
						noTours.author.projects = Array();
						noTours.author.show(false);
					} else {
						alert(json.msg);
						$('#history').append(json.msg+'<br />');
						if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
					}
				}, "json" );
			}
		}
		return false;
	});
};
NotoursInterface.prototype.new_project_form_init = function() {
	$("#new_project").submit(function() {
    	var title = $("#titulo_proyecto").attr("value");
    	$('#titulo_proyecto').unbind('blur');
		noTours.new_project(title);
		return false;
    });
    $("#titulo_proyecto").blur( function(){
    	var title = $("#titulo_proyecto").attr("value");
    	noTours.new_project(title);
    });
};
NotoursInterface.prototype.geocode_form_init = function () {
    $("#geocode input").hide();
	$("#geocode").mouseenter(function() {
		$("#geocode input").fadeIn('slow');
    });
    $("#geocode").mouseleave(function() {
		$("#geocode input").fadeOut('slow');
    });
	$("#geocode").submit(function() {
    	var address = $("#address").attr("value");
		if (address != "") {
			codeAddress(address);
		}
		return false;
    });
};
NotoursInterface.prototype.hideNavigation = function() {
	$('#navigation').css("width", 0);
	$('#workarea').css("left", 8);
	$('#terminal').css("left", 8);
	//$('#navigation .nav').addClass("right");
	//$('#navigation .nav').removeClass("left");
	$('#navigation .nav').removeClass("clean");
	$('#navigation').addClass("border");
	$('#elements').hide();
	noTours.navigation = false;
};
NotoursInterface.prototype.showNavigation = function() {
	$('#navigation').css("width", 360);
	$('#workarea').css("left", 368);
	$('#terminal').css("left", 368);
	//$('#navigation .nav').addClass("left");
	//$('#navigation .nav').removeClass("right");
	$('#navigation .nav').addClass("clean");
	$('#navigation').removeClass("border");
	$('#elements').show();
	noTours.navigation = true;
};
NotoursInterface.prototype.hideMenu = function(callback) {
	$('.project').animate({height: "30px"}, "slow", function(){
		$(".project .wrapper").hide();
		$("#toogle").attr("class","open");
		$('#menu').removeClass("shadow");
		if (callback) {
			callback();
		}
	});
	$('#menu').animate({height: "30px"}, "slow");
	$('#elements').animate({top: "30px"}, "slow");
	this.menu = false;
};
NotoursInterface.prototype.showMenu = function(callback) {
	$(".project .wrapper").show();
	$('.project').animate({height: "232px"}, "slow",function(){
		$("#toogle").attr("class","close");
		$('#menu').addClass("shadow");
		if (callback) {
			callback();
		}
	});
	$('#menu').animate({height: "232px"}, "slow");
	$('#elements').animate({top: "236px"}, "slow");
	this.menu = true;
};
NotoursInterface.prototype.logout = function() {
	delCookie('userid');
	delCookie('userlang');
	window.location.reload();
};
NotoursInterface.prototype.main = function(callback) {
	if (noTours.editing){
		noTours.hideMenu();
		$("#actions").hide();
		var prj = $('.project').attr('id');
		eval(prj +'.close();');
		if (prj=="project_0") {
			noTours.author.projects[project_0.number] = null;
			project_0 = null;
		}
	} else {
		$("#projects").empty();
		$("#menu").empty();
		$("header").empty();
		$("header").append(header_html());
		noTours.header_init();
	}
	$("#floatingBox .content").empty();
	if(noTours.logged) {
		$("#floatingBox .content").append('<h3>'+ noTours.write.welcome +' '+ noTours.author.name +'!<'+'/h3>');
		$("#floatingBox .content").append(new_project_form_html());
		noTours.new_project_form_init();
		$('#floatingBox').show();
		noTours.floatingBox = true;
		noTours.editing = false;
		noTours.author.loadProjects(function(){
			noTours.showNavigation();
		});
	} else {
		noTours.login_register_init();
	}
	if (callback) {
		callback();
	}
};
NotoursInterface.prototype.new_project = function (nom) {
	if (nom != "") {
		$("#projects").empty();
		$("#menu").empty();
		if(noTours.author.tips) {
			$("#floatingBox .content").empty();
			$("#floatingBox .arrow").remove();
			$("#floatingBox .wrapper").prepend('<div class="arrow"><'+'/div>');
			$("#floatingBox .content").append(project_tip_html());
			$("#floatingBox").show();
			noTours.floatingBox = true;
		}
		$("#actions .save_project").removeClass("saved");
		$("#actions .save_project").addClass("changes");
		project_0 = new NotoursProject();
		project_0.initialize(0, nom);
		var num = noTours.author.projects.push(project_0.id) - 1;
		project_0.number = num;
		project_0.saved = false;
		project_0.changes = true;
		$("#objects").empty();
		$("#projects").empty();
		$("#menu").empty();
		noTours.menu = true;
		noTours.editing = true;
		project_0.showMenu();
		$(".project .value").addClass("new");
		noTours.showNavigation();
		//showMenu();
		$("#project_0 .update_location").append(hidden_imput_html ('lat', 0, project_0.lat));
    	$("#project_0 .update_location").append(hidden_imput_html ('lonx', 0, project_0.lonx));
    	$("#project_0 .update_location").append(hidden_imput_html ('zoom', 0, project_0.zoom));
    	$("#project_0 .update_title").append(hidden_imput_html ('title', 0, project_0.title));
    	$("#project_0 .update_description").append(hidden_imput_html ('description', 0, project_0.description));
    	$("#project_0 .update_sticky").append(hidden_imput_html ('sticky', 0, 0));
    	$("#project_0  fieldset.data").prepend('\n\t\t\t\t\t\t\t\t\t'+hidden_imput_html ('author', 0, noTours.user));
    	$("#new_object").hide();
		geoLocate();
	}
};
NotoursInterface.prototype.new_object = function () {
	var project = eval($('.project').attr('id'));
	if (project.changes == false) {
		if(noTours.floatingBox) {
			$("#floatingBox .content").empty();
			$("#floatingBox .arrow").remove();
			$("#floatingBox").hide();
			noTours.floatingBox = false;
		}
		object_0 = new NotoursSoundpoint();
		var center = noTours.map.getCenter();
		object_0.initialize(0, 'soundpoint', project.id, '', '', '', 0, 0, center.lat(), center.lng(), 15, '', 'loop stopout');
		var num = project.objects.push(object_0.id) - 1;
		object_0.number = num;
		object_0.saved = false;
		$("#objects").prepend('\n\t\t\t\t\t\t<li id="object_'+ object_0.id +'" class="object l_'+ object_0.level +'_alpha"></li><!-- object_'+ object_0.id +' -->\n');
		$("#object_"+ object_0.id).append('\n'+object_0.htmlForm()+'\t\t\t\t\t\t');
		$("#object_0 .value").addClass("new");
		$("#object_0 .value").addClass("new");
		object_0.initForm();
		object_0.show();
		object_0.visible = true;
		object_0.dragstart();
	    $("#object_0 .update_title").append(hidden_imput_html ('title', 0, object_0.title));
	    object_0.changes[0] = true;
	    $("#object_0 .update_type").append(hidden_imput_html('type', 0, 'soundpoint'));
	    object_0.changes[1] = true;
	    $("#object_0 .update_level").append(hidden_imput_html('level', 0, object_0.level));
	    object_0.changes[2] = true;
	    $("#object_0 .update_milestone").append(hidden_imput_html('milestone', 0, object_0.milestone));
	    object_0.changes[3] = true;
		$("#object_0 .update_description").append(hidden_imput_html ('description', 0, object_0.description));
	    object_0.changes[4] = true;
	    $("#object_0 .update_attributes").append(hidden_imput_html('attributes', 0, object_0.parseAttributes()));
	    object_0.changes[6] = true;
	    $("#object_0 .update_location").append(hidden_imput_html ('lat', 0, object_0.lat));
	    $("#object_0 .update_location").append(hidden_imput_html ('lonx', 0, object_0.lonx));
	    $("#object_0 .update_location").append(hidden_imput_html ('radio', 0, object_0.radius));
	    object_0.changes[7] = true;
	    project.change();
	} else {
		var project = eval($('.project').attr('id'));
		project.save(function(){
			noTours.new_object();
		});
	}
};
NotoursInterface.prototype.checkSave = function(prj, msg, callback) {
	var saved = eval(prj+'.saved');
	var changes = eval(prj+'.changes');
	if ((!saved)||(changes)) {
		if (confirm(msg)) {
			eval(prj+'.unSave();');
			if (callback) {
				callback();
			}
		}
	} else {
		if (callback) {
			callback();
		}
	}
	return false;
};
NotoursInterface.prototype.saveRecursive = function(array, callback) {
	var obj = eval(array.pop());
	if (array.length>=1) {
		var values = $("#object_"+ obj.id +" .update_object").serialize();
		obj.postData(values,function(){
			noTours.saveRecursive(array,callback);
		});
	} else {
		var values = $("#object_"+ obj.id +" .update_object").serialize();
		obj.postData(values,function(){
			if ((noTours.author.dragging.toString()!="")&&(noTours.author.dragging!=0)) {
				eval("object_"+ noTours.author.dragging.toString() +".Gcircle.hideDrag();");
			}
			noTours.author.dragging = "";
			$('#floatingBox').hide();
			$("#floatingBox .content").empty();
			noTours.floatingBox = false;
			var prj = $(".project").attr("id");
			eval(prj+'.changes = false;');
			eval(prj+'.saved = true;');
			noTours.saving = false;
			if(callback) {
				callback();
			}
		});
	}
};
NotoursInterface.prototype.project_list_init = function() {
	$("#projects li").click( function(){
		$("#projects").empty();
		$("#menu").empty();
		var prj = $(this).attr("id");
		prj = prj.slice(3);
		noTours.menu = true;
		eval(prj +'.open();');
		$('#floatingBox').hide();
		noTours.floatingBox = false;
		noTours.editing = true;
	});
};
NotoursInterface.prototype.showFloatingBox = function(content, arrow, initfn) {
	$("#floatingBox .content").empty();
	$("#floatingBox .arrow").remove();
	if (arrow=='arrow') $("#floatingBox .wrapper").prepend('<div class="arrow"><'+'/div>');
	$("#floatingBox .content").append(content);
	if (initfn) initfn();
	$('#floatingBox').show();
	this.floatingBox = true;
};


//******************************
// Notours Author
//******************************
function NotoursAuthor() {
	// info
	this.id = 0;
	this.name = '';
	this.password = '';
	this.descripcion = '';
	this.type = 'standard';
	// Gmaps
	this.map;  ///?
	this.miniMap;  ///?
	// notours
	this.projects = null;
	this.tips = true;
	this.dragging = "";
};
NotoursAuthor.prototype.initialize = function(id, name, password, descripcion, type) {
	// Info
	if (id) this.id = id;
	if (name) this.name = name;
	if (password) this.password = password;
	if (descripcion) this.descripcion = descripcion;
	if ((type)&&(type!='')) this.type = type;
	$("#history").append('noTours.author = new NotoursAuthor();<br />'+ this.id +' '+ this.name +' ******* '+ this.descripcion +' '+ this.type +'.<br />');
	setCookie('userid', this.id, 7);
	noTours.user = this.id;
	noTours.logged = true;
};
NotoursAuthor.prototype.load = function() {
	$('#history').append('noTours.author.load();<br />'+ noTours.root +'exec/read.php?element_type=author&element_id='+ this.id +'.<br />');
	$("#floatingBox .content").append('<img src="'+ noTours.root +'inc/img/loading.gif" alt="'+ noTours.write.loading +'" />');
	jQuery.post( noTours.root +"exec/read.php", { element_type:'author', element_id:this.id }, function(json){
		if (typeof json.error == "undefined") {
			if (json.data.name!='') noTours.author.name = json.data.name;
			if (json.data.password!='') noTours.author.password = json.data.password;
			if (json.data.descripcion!='') noTours.author.descripcion = json.data.descripcion;
			if (json.data.type!='') noTours.author.type = json.data.type;
			noTours.author.show(true);
		} else {
			alert(json.msg);
			$('#history').append(json.msg+'<br />');
			$('#history').append(json.error_msg+'<br />');
			noTours.logged = false;
			noTours.login_register_init();
		}
	}, "json" );
};
NotoursAuthor.prototype.show = function(load) {
	$("#floatingBox .content").empty();
	$("#floatingBox .content").append('<h3>'+ noTours.write.welcome +' '+ this.name +'!<'+'/h3>');
	if(load){
		$("#floatingBox .content").append('<img src="'+ noTours.root +'inc/img/loading.gif" alt="'+ noTours.write.loading +'" />');
		noTours.author.loadProjects(function(){
			$("#floatingBox .content img").remove();
			$("#floatingBox .content").append(new_project_form_html());
			noTours.new_project_form_init();
			noTours.showNavigation();
		});
	} else {
		$("#floatingBox .content").append(new_project_form_html());
		noTours.new_project_form_init();
	}	
};
NotoursAuthor.prototype.loadProjects = function(callback) {
	$('#history').append('noTours.author.loadProjects();<br />'+ noTours.root +'exec/projects.php?author_id='+ this.id +'.<br />');
	if (noTours.author.projects==null) {
		jQuery.post( noTours.root+"exec/projects.php", { author_id:this.id }, function(json){
			noTours.author.projects = Array();
			if (typeof json.error == "undefined") {
				var total = json.data.notours_project.length;
				$('#menu').append('<h3>'+ noTours.write.project_header +' </h3>');
				$('#history').append(total+' projects found.<br />');
				$.each(json.data.notours_project, function(i,project){
				 	// creamos el proyecto con los datos almacenados en las variables
					eval('project_'+ project.id +' = new NotoursProject();');
					var proyecto = eval('project_'+ project.id);
					proyecto.initialize(project.id, project.title, project.description, project.icon, project.kml, project.latitude, project.longitude, project.zoom, project.levels, project.sticky);
					var num = noTours.author.projects.push(project.id) - 1;
					eval('project_'+ project.id +'.number='+num );
					// añadimos el proyecto a la lista correspondiente
					$("#projects").prepend(proyecto.htmlList());
				 	if (i==(total-1)) {
				 		noTours.project_list_init();
				 		$("#history").scrollTo('100%');
				 		if (callback) {
				 			callback();
				 		}
				 	}
    			});
			} else {
				if (json.error_type == 3) {
					$('#menu').append('<h3>'+ noTours.write.project_header +' </h3>');
					if (callback) {
				 		callback();
				 	}
				}
				$('#history').append(json.msg+'<br />');
				if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
			}
		}, "json" );
	} else {
		$('#menu').append('<h3>'+ noTours.write.project_header +' </h3>');
		var total = this.projects.length;
		for (i=0; i<total; i++) {
			if(this.projects[i]!=null) {
				var proyecto = eval('project_'+ this.projects[i]);
				$("#projects").prepend(proyecto.htmlList());
				if (i==(total-1)) {
					noTours.project_list_init();
					if (callback) {
						callback();
					}
				}
			}
		}
	}
};


//******************************
// Notours Project
//******************************
function NotoursProject() {
	//info
	this.id = 0;
	this.title = '';
	this.description = '';
	//icon
	this.icon = 'inc/img/logo_notours_screen.png';
	//kml
	this.kml = '';
	this.kmlLayer;
	//geodata
	this.lat = 48.13;
	this.lonx = 7.44;
	this.zoom = 4;
	//Gmaps
	this.map;
	this.miniMap;
	// notours
	this.levels = new NotoursOptions();
	this.sticky = false;
	this.objects = Array();
	//internal
	this.number  = false;
	this.saved = true;
	this.loaded = false;
	this.changes = false;
	this.self;
};
NotoursProject.prototype.initialize = function(id, title, description, icon, kml, lat, lonx, zoom, levels, sticky) {
	// Info
	if (id) this.id = id;
	if (title) this.title = title;
	if (description) this.description = description;
	// Icon
	if (icon) this.icon = icon;
	// kml
	if ((kml)&&(kml!='')&&(kml!=null)&&(kml!='NULL')) {
		this.kml = kml;
		this.kmlLayer = new google.maps.KmlLayer(noTours.root + kml);
	}
	// Geodata.split(" ")
	if (lat) this.lat = parseFloat(lat);
	if (lonx) this.lonx = parseFloat(lonx);
	if (zoom) this.zoom = parseFloat(zoom);
	var val = new Array();
	var key = new Array();
	for (i=0; i<=levels; i++) {
		val.push(i);
		key.push('level ' + i);
	}
	this.levels.initialize(key, val);
	if (parseInt(sticky)==1) this.sticky = true;
	$("#history").append('project_' + id + ' = new NotoursProject();<br />'+ this.title +', '+ this.description +', '+ this.icon +', '+' '+ this.kml +', '+ this.lat +', '+ this.lonx +', '+ this.zoom +', '+ levels +'.<br />');
	//internal
	this.self = this;
	
};
NotoursProject.prototype.loadObjects = function(callback) {
	if (!this.loaded) {
		$('#history').append('loadObjects(project_id='+ this.id +');<br />exec/read.php?element_type=project&element_id='+this.id+'&recursive=true.<br />');
		jQuery.post( noTours.root+"exec/read.php", { element_type:'project', element_id:this.id, recursive:true }, function(json){
			if (typeof json.error == "undefined") {
				var total = json.data.notours_object.data.length;
				$('#history').append(total +' objects found.<br />');
				$('#objects').append('\n');
				var prj = eval('project_'+json.data.id);
				if (total=='0') {
					$("#objects").append('\t\t\t\t\t');
					$("#history").scrollTo('100%');
					prj.loaded = true;
					if (callback) {
				 		callback();
			 		}
				} else {
					// Objects
					$.each(json.data.notours_object.data, function(i,object){
						eval('object_'+ object.id +' = new NotoursSoundpoint();');
						var obj = eval('object_'+ object.id);
						if(typeof object.notours_file.error == "undefined") {
							var t = object.notours_file.data.length;
							$('#history').append(t +' files found.<br />');
							// Files
							$.each(object.notours_file.data, function(u,file){
								var f = eval('file_'+ file.id +' = new NotoursFile();');
								f.initialize(file.id, file.object_id, file.project_id, file.url, file.length, file.type, file.volume, file.angles);
								obj.files.push(file.id);
    						});
    						obj.sortFiles(sortAngle);
    						$('#history').append('obj.files: '+ obj.files.toString() +'.<br />');
						}
						obj.initialize(object.id, object.type, object.project_id, object.title, object.description, object.modified, object.level, object.milestone, object.latitude, object.longitude, object.radius, object.geodata, object.attributes);
						var num = prj.objects.push(object.id) - 1;
						obj.number = num;
						$("#objects").prepend('\t\t\t\t\t\t<li id="object_'+ obj.id +'" class="object l_'+ obj.level +'_alpha"></li><!-- object_'+ obj.id +' -->\n');
						$("#object_"+ obj.id).append('\n'+obj.htmlForm()+'\t\t\t\t\t\t');
						obj.initForm();
						if (i==(total-1)) {
							$("#objects").append('\t\t\t\t\t');
							$("#history").scrollTo('100%');
							prj.loaded = true;
					 		if (callback) {
					 			callback();
			 				}
			 			}
    				});
    			}
			} else {
				alert(json.msg);
				$('#history').append(json.msg+'<br />');
				if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
			}
		}, "json" );
	} else {
		$('#history').append('loadObjects(project_id='+ this.id +');<br />Data allready loaded.<br />');
		for (u=0; u<this.objects.length; u++) {
			if(this.objects[u]!=null) {
				var obj = eval('object_'+this.objects[u]);
				obj.Gcircle.set();
				$("#objects").prepend('\t\t\t\t\t\t<li id="object_'+ obj.id +'" class="object "></li><!-- object_'+ obj.id +' -->\n');
				$("#object_"+ obj.id).append('\n'+obj.htmlForm()+'\t\t\t\t\t\t');
				obj.initForm();
			}
		}
		if (callback) {
			callback();
		}
	}
};
NotoursProject.prototype.hideList = function(id) {
	for (u=0; u<this.objects.length; u++) {
		if (this.objects[u]!=null) {
			if ((!id)||(id!=this.objects[u])) {
				var obj = eval('object_'+ this.objects[u]);
				if (obj.open!='') obj.toggle(obj.open);
			}
		}
	}
};
NotoursProject.prototype.htmlList = function() {
	var title_txt = this.title;
	if (title_txt.length>=20) title_txt = title_txt.slice(0, 20) + '...';
	var icon_url = noTours.root + this.icon;
	if (this.icon=='logo_notours_screen.png') icon_url = noTours.root +'inc/img/'+ this.icon;
	var html = '\t<li id="li_project_'+ this.id +'"><a><img class="icono" src="'+ icon_url +'" /><h3>'+ title_txt +'</h3></a></li>\n';
	return html;
};
NotoursProject.prototype.htmlForm = function() {
	var html = '';
	var title_txt = noTours.write.name_label;
	if (this.title!='') title_txt = this.title;
	var description_txt = noTours.write.description_label+'...';
	if (this.description!='') description_txt = this.description;
	html += '\n\t\t\t\t\t<div id="project_'+ this.id +'" class="project">\n';
	html += '\t\t\t\t\t\t<div class="buttons"><a id="toogle" class="close" title="'+ noTours.write.close_project +'"></a> <a id="next" title="'+ noTours.write.next_project +'"></a> <a id="back" title="'+ noTours.write.previous_project +'"></a></div>\n';
	html += dbclick_field_html('project', 'title', 'input', this.id, '', '', title_txt, 17, '\t\t\t\t\t\t');
	html += '\t\t\t\t\t\t<div class="wrapper all">\n';
	var icon_url = noTours.root + this.icon;
	if (this.icon=='logo_notours_screen.png') icon_url = noTours.root +'inc/img/'+ this.icon;
	html += dbclick_img_html('project', 'icon', this.id, '', noTours.write.icon_label, icon_url, '\t\t\t\t\t\t\t');
	html += '\t\t\t\t\t\t\t<div class="map" id="map_project_'+ this.id +'"></div>\n';
	html += geocode_form_html('\t\t\t\t\t\t\t');
	html += empty_field_html('project', 'kml', this.id, '', '', 50, '\t\t\t\t\t\t\t');
	html += dbclick_field_html('project', 'description', 'textarea', this.id, '', '', description_txt, 230, '\t\t\t\t\t\t\t');
	html += simple_checkbox_html_2('project', 'sticky', this.id, 'sticky', 'sticky', 'sticky', this.sticky, '\t\t\t\t\t\t\t');
	var lat_value = this.lat.toString();
	var lonx_value = this.lonx.toString();
	html += dbclick_text_html('project', Array('lat','lonx','zoom'), this.id, Array(noTours.write.lat_label, noTours.write.lonx_label, noTours.write.zoom_label), 'edit_location', Array(lat_value.substring(0,6), lonx_value.substring(0,6), this.zoom), '\t\t\t\t\t\t\t');
	html += update_project_form_html(this.id, '\t\t\t\t\t\t\t');
	html += '\t\t\t\t\t\t</div><!-- wrapper -->\n';
	html += '\t\t\t\t\t</div><!-- project_'+ this.id +' -->\n\t\t\t\t';
	return html;
};
NotoursProject.prototype.initForm = function() {
	// buttons
	$("#new_object").remove();
	$("#navigation").prepend('<a id="new_object" title="'+ noTours.write.new_object +'">'+ noTours.write.new_object_button +'</a>');
	$("#actions").show();
	$("#toogle").click( function(){
		if (noTours.menu) {
			noTours.hideMenu();
		} else {
			noTours.showMenu();
		}
	});
	$("#new_object").click( function(){
		noTours.new_object();
	});
	$("#next").click( function(){
		var siguiente;
		var num = 0;
		var total = noTours.author.projects.length;
		var actual = $('.project').attr('id');
		if (actual=='project_0') {
			if (total!=0) {
				siguiente = 0;
				noTours.checkSave(actual, noTours.write.leave_project, function(){
					eval(actual +'.close();');
					eval('project_'+ noTours.author.projects[siguiente] +'.open();');
				});
			} else {
				alert(noTours.write.no_projects);
			}
		} else {
			num = eval(actual+'.number');
			if (num == (total-1)) {
				siguiente = 0;
			} else {
				siguiente = num + 1;
			}
			noTours.checkSave(actual, noTours.write.leave_project, function(){
				$("#objects").fadeOut();
				noTours.hideMenu(function(){
					eval(actual +'.close();');
					eval('project_'+ noTours.author.projects[siguiente] +'.open();');
				});
			});
		}
	});
	$("#back").click( function(){
		var anterior;
		var num = 0;
		var total = noTours.author.projects.length;
		var actual = $('.project').attr('id');
		if (actual=='project_0') {
			if (total!=0) {
				anterior = total - 1;
				noTours.checkSave(actual, noTours.write.leave_project, function(){
					eval(actual +'.close();');
					eval('project_'+ noTours.author.projects[anterior] +'.open();');
				});
			} else {
				alert(noTours.write.no_projects);
			}
		} else {
			num = eval(actual+'.number');
			if (num == 0) {
				anterior = total - 1;
			} else {
				anterior = num - 1;
			}
			noTours.checkSave(actual, noTours.write.leave_project, function(){
				$("#objects").fadeOut();
				noTours.hideMenu(function(){
					eval(actual +'.close();');
					eval('project_'+ noTours.author.projects[anterior] +'.open();');
				});
			});
		}
	});
	// title description
    $("#project_"+ this.id +" .edit").dblclick( function(){
		var data = $(this).attr("name").split("_");
    	var campo = data[0];
    	var contexto = data[1];
    	var id = data[2];
    	if ($("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").attr("class")){
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box").hide();
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").show("slow");
		}
	});
	// name
	$("#project_"+ this.id +" .wrap_title input[type=\'text\']").blur( function(){
		update_field(this, 19);
    });
	// icon
	$("#project_"+ this.id +" .wrap_icon div span").hide();
	$("#project_"+ this.id +" .wrap_icon").mouseenter(function() {
		var id = $(this.parentNode.parentNode).attr('id');
		$("#"+ id +" .wrap_icon div span").fadeIn('slow');
    });
    $( "#project_"+ this.id +" .wrap_icon").mouseleave(function() {
    	var id = $(this.parentNode.parentNode).attr('id');
		$("#"+ id +" .wrap_icon div span").fadeOut('slow');
    });
	// map
	noTours.mini_map_init(this.id, this.lat, this.lonx, this.zoom);
	this.initLevelList();
	// geocode
	$("#project_"+ this.id +" .geocode").submit(function() {
    	var address = $("#address").attr("value");
		if (address != "") {
			codeAddress(address);
		}
		return false;
    });
    // description
	$("#project_"+ this.id +" .wrap_description textarea").blur( function(){
		update_field(this, 230);
    });
    // sticky
    $("#project_"+ this.id +" .wrap_sticky input[type=\'checkbox\']").change( function(){
		var value = $(this).attr("checked");
		var data = $(this).attr("name").split("_");
		var campo = data[0];
		var contexto = data[1];
		var id = data[2];
		var prj = eval('project_'+ id);
    	var old = prj.sticky;
		if (value!=old) {
    		$("#"+ contexto +"_"+ id +" .update_"+ campo).empty();
    		hidden_value = 0;
    		if (value) hidden_value = 1;
    		$("#"+ contexto +"_"+ id +" .update_"+ campo).append(hidden_imput_html(campo, id, hidden_value));
    		if (value==false) value='normal';
    		$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .value").text(value);
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .value").attr("class","value new");
			prj.saved = false;
			prj.change();
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .new").show();
		} else {
			$("#"+ contexto +"_"+ id +" .update_"+ campo).empty();
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .new").hide();
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .value").text(value);
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box .value").attr("class","value");
			prj.saved = false; // esto no es estrictamente cierto
			prj.change();
		}
	
    });
};
NotoursProject.prototype.initLevelList = function() {
	$('#LevelControl').empty();
	var levelList = simple_checklist_html('level', 'project', this.id, this.levels.keys, '\t\t\t\t\t\t\t');
	$('#LevelControl').append(levelList);
	$('#LevelControl input').click(function() {
		var name = $(this).attr("name");
		var a = name.split("_");
		var level = parseInt(a[1]);
		var project = parseInt(a[3]);
		var prj = eval('project_'+ project);
		var checked = $(this).attr("checked");
		if(checked) {
			prj.showCircles(level);
		} else {
			prj.hideCircles(level);
		}
	});
};
NotoursProject.prototype.postData = function(values, callback) {
	$("#history").append('project_' + this.id + '.postData();<br />'+ noTours.root +'exec/update_project.php?'+ values +'.<br />');
	jQuery.post(noTours.root+'exec/update_project.php', values, function(json){
		if (typeof json.error == "undefined") {
			var json_title = '';
			if (typeof json.data.title !="undefined") json_title = json.data.title;
			var json_description = '';
			if (typeof json.data.description !="undefined") json_description = json.data.description;
			var json_icon = '';
			if (typeof json.data.icon !="undefined") json_icon = json.data.icon;
			json_kml = '';
			if (typeof json.data.kml !="undefined") json_kml = json.data.kml;
			var json_latitude = '';
			if (typeof json.data.latitude !="undefined") json_latitude = json.data.latitude;
			var json_longitude = '';
			if (typeof json.data.longitude !="undefined") json_longitude = json.data.longitude;
			var json_zoom = '';
			if (typeof json.data.zoom !="undefined") json_zoom = json.data.zoom;
			var json_levels = '';
			if (typeof json.data.levels !="undefined") json_levels = json.data.levels;
			var json_sticky = '';
			if (typeof json.data.sticky !="undefined") json_sticky = json.data.sticky;
			// new
			if (eval('typeof project_' + json.data.id)=="undefined") {
				// create project
				eval('project_'+ json.data.id +' = new NotoursProject();');
				var project = eval('project_'+ json.data.id);
				var num = noTours.author.projects.push(json.data.id) - 1;
				project.initialize(json.data.id, json_title, json_description, json_icon, json_kml, json_latitude, json_longitude, json_zoom, json_levels, json_sticky);
				project.number = num;
				$("#menu").empty();
				$("#new_object").show();
				eval('project_'+ noTours.author.projects[num] +'.open();');
				noTours.author.projects[project_0.number] = null;
				project_0 = null;
			// old
			} else {
				var project = eval('project_'+ json.data.id);
				project.update(json_title, json_description, json_icon, json_kml, json_latitude, json_longitude, json_zoom, json_sticky);
			}
			if(callback) {
				callback();
			}
		} else {
			alert(json.msg);
			$('#history').append(json.msg+'<br />');
			if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
		}
	}, "json" );
};
NotoursProject.prototype.del = function(f) {
	if(typeof f== "undefined") f = false;
	$("#history").append('project_' + this.id + '.del();<br />'+ noTours.root +'exec/delete.php?element_type=project&element_id='+ this.id +'&force='+ f +'.<br />');
	jQuery.post(noTours.root + "exec/delete.php", { element_type:'project', element_id: this.id, force: f}, function(json){
		if (typeof json.error == "undefined") {
			$('#history').append(json.msg+'.<br />');
			var prj = 'project_'+ json.data.id;
			var num = eval(prj +'.number');
			//$("#history").append('projects list:<br />'+ noTours.author.projects.toString() +'.<br />');
			$("#history").append('delete '+ prj +' '+ num +' '+ noTours.author.projects[num] +'.<br />');
			//noTours.author.projects.splice(num, 1); //// esto haria cambiar la posición de todas las ids en el array y obligaria a cambiar el valor number de cada objeto
			noTours.author.projects[num] = null;
			noTours.main(function(){
				eval(prj+"=null;");  // esto podría eliminarse para hacer un control-z
			}); // main ahora es un reload de la página pero no debería ser así porque no hace falta recargar
		} else {
			alert(json.msg);
			$('#history').append(json.msg+'<br />');
			if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
		}
	}, "json" );
};
NotoursProject.prototype.update = function(title, description, icon, kml, lat, lonx, zoom, sticky) {
	// Info
	if (title) this.title = title;
	if (description) this.description = description;
	// Icon
	if (icon) this.icon = icon;
	// Icon
	if (kml) this.kml = kml;
	// Geodata
	if (lat) this.lat = parseFloat(lat);
	if (lonx) this.lonx = parseFloat(lonx);
	if (zoom) this.zoom = parseFloat(zoom);
	// sticky
	if (sticky) {
		this.sticky = false;
		if (parseInt(sticky)==1) this.sticky = true;
	}
	// Refresh
	this.saved = true;
	$("#menu").empty();
	$("#menu").append(this.htmlForm());
	this.initForm();
	if (noTours.menu==false){
		$(".project .wrapper").hide();
	}
};
NotoursProject.prototype.showMenu = function() {
	$("#menu").append(this.htmlForm());
	this.initForm();
	if(noTours.menu) {
		noTours.showMenu();
	}
};
NotoursProject.prototype.zip = function() {
	$("#history").append('project_' + this.id + '.zip();<br />'+ noTours.root +'exec/export_project.php?element_type=project&element_id='+ this.id +'.<br />');
	var self = this.self;
	jQuery.post(noTours.root + "exec/export_project.php", { element_type:'project', element_id: this.id}, function(json){
	 	if (typeof json.error == "undefined") {
			//alert(json.msg);
			self.download();
		} else {
			alert(json.msg);
			$('#history').append(json.msg+'<br />');
			if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
		}
	}, "json" );
};
NotoursProject.prototype.download = function() {
	$("#history").append(noTours.root + noTours.projectFolder + this.id + '.zip.<br />');
	window.open(noTours.root + noTours.projectFolder + this.id + ".zip", '_self');
};
NotoursProject.prototype.close = function() {
	$("#objects").empty();
	$("#projects").empty();
	$("#menu").empty();
	$("#new_object").remove();
	if (this.kml!='') {
		this.kmlLayer.setMap(null);
	}
	for (i=0; i<this.objects.length; i++) {
		if (this.objects[i]!=null) {
			eval('object_'+this.objects[i]+'.Gcircle.unset();');
		}
	}
};
NotoursProject.prototype.open = function() {
	noTours.menu = true;
	if ((this.kml)&&(this.kml!='')&&(this.kml!=null)&&(this.kml!='NULL')) {
		this.kmlLayer.setMap(noTours.map);
		$('#history').append('kml found in this project "'+this.kml+'".<br />');
	}
	this.showMenu();
	this.loadObjects(function(){
		$("#objects").fadeIn();
	});
};
NotoursProject.prototype.change = function() {
	if (!this.changes) {
		$("#actions .save_project").removeClass("saved");
		$("#actions .save_project").addClass("changes");
		this.changes = true;
	}
};
NotoursProject.prototype.unChange = function() {
	if (this.getChanges()=='') {
		$("#actions .save_project").removeClass("changes");
		$("#actions .save_project").addClass("saved");
		this.changes = false;
	}
};
NotoursProject.prototype.getChanges = function() {
	var changes = new Array();
	for (u=0; u<this.objects.length; u++) {
		if ((this.objects[u]!=null)&&(!eval('object_'+ this.objects[u] +'.isSaved();'))) {
			changes.push('object_'+ this.objects[u]);
		}
	}
	return changes;
};
NotoursProject.prototype.save = function(callback) {
	if((this.changes)&&(noTours.saving==false)) {
		noTours.saving = true;
		$("#history").append('project_'+ this.id +'.save();<br />starting to save all data recursively.<br />');
		$("#floatingBox .content").empty();
		$("#floatingBox .wrapper .arrow").remove();
		$("#floatingBox .content").append('<h3>'+ noTours.write.save_all +'!<'+'/h3>');
		$("#floatingBox .content").append('<img src="'+ noTours.root +'inc/img/loading.gif" alt="'+ noTours.write.saving +'" />');
		$("#floatingBox").show();
		noTours.floatingBox = true;
		$("#actions .save_project").removeClass("changes");
		$("#actions .save_project").addClass("saved");
		var self = this.self;
		if (!this.saved) {
			var values = $("#project_"+this.id+" .update_project").serialize();
			this.postData(values,function(){
				var toSave = self.getChanges();
				if (toSave.length>0) {
					noTours.saveRecursive(toSave,callback);
				} else {
					if((self.id==0)&&(noTours.author.tips)){
						$("#floatingBox .content").empty();
						$("#floatingBox .arrow").remove();
						$("#floatingBox .wrapper").prepend('<div class="arrow"><'+'/div>');
						$("#floatingBox .content").append(object_tip_html());
						$("#floatingBox").show();
						noTours.floatingBox = true;
					} else {
						$('#floatingBox').hide();
						$("#floatingBox .content").empty();
						noTours.floatingBox = false;
					}
					eval($(".project").attr("id") +'.changes = false;');
					eval($(".project").attr("id") +'.saved = true;');
					noTours.saving = false;
					if(callback) {
						callback();
					}
				}
			});
		} else {
			var toSave = self.getChanges();
			noTours.saveRecursive(toSave,callback);
		}
	}
	
};
NotoursProject.prototype.unSave = function() {
	this.saved = true;
	this.changes = false;
	for (u=0; u<this.objects.length; u++) {
		if (this.objects[i]!=null) {
			eval('object_'+ this.objects[u] +'.saved = true;');
		}
	}
};
NotoursProject.prototype.receiveIcon = function(icon) {
	$("#project_"+ this.id +" .wrap_icon .value_box .value").text('new icon');
	$("#project_"+ this.id +" .wrap_icon .value_box .value").attr("class","value new");
	$("#project_"+ this.id +" .wrap_icon .value_box img").attr("src", icon);
	$("#project_"+ this.id +" .update_icon").empty();
	$("#project_"+ this.id +" .update_icon").append(hidden_imput_html('icon', this.id, icon));
	$("#project_"+ this.id +" .wrap_icon .field_box").hide();
	$("#project_"+ this.id +" .wrap_icon .value_box").show("slow");
	this.saved = false;
	this.change();
};
NotoursProject.prototype.receiveKml = function(kml, folder) {
	alert('hola');
	$("#project_"+ this.id +" .wrap_kml .value_box .value").text('	kml overlay('+ kml +')');
	$("#project_"+ this.id +" .wrap_kml .value_box .value").attr("class","value new");
	$("#project_"+ this.id +" .update_kml").empty();
	$("#project_"+ this.id +" .update_kml").append(hidden_imput_html('kml', this.id, folder + kml));
	$("#project_"+ this.id +" .wrap_kml .value_box").show("slow");
	this.kmlLayer = new google.maps.KmlLayer(noTours.root + folder + kml);
  	this.kmlLayer.setMap(noTours.map);
	this.saved = false;
	this.change();
	$('#floatingBox').hide();
	this.floatingBox = false;
};
NotoursProject.prototype.pushLevels = function() {
	$("#history").append('project_'+ this.id +'.pushLevels();<br />');
	var num = this.levels.values.length;
	this.levels.values.push(num);
	this.levels.keys.push('level ' + num);
	$("#history").append(this.levels.keys +'<br />');
	this.resetLevels();
	$("#project_"+ this.id +" .update_levels").empty();
	$("#project_"+ this.id +" .update_levels").append(hidden_imput_html('levels', this.id, this.levels.values.length));
	this.saved = false;
	return num;
};
NotoursProject.prototype.resetLevels = function() {
	$("#history").append('project_'+ this.id +'.resetLevels();<br />');
	var num = this.levels.values.length - 1;
	var levelkeys = new Array();
	var levelvalues = new Array();
	for(i=0; i<this.levels.values.length; i++){
		levelkeys.push(this.levels.values[i]);
		levelvalues.push(this.levels.values[i]);
	}
	if (num != 9) {
		levelkeys.push('new level');
		levelvalues.push('new');
	}
	$("#history").append(levelkeys +'<br />');
	for (var u = 0; u < this.objects.length; u++) {
		if ((this.objects[u]!=null)&&(eval('typeof object_'+ this.objects[u])!="undefined")) {
			var obj = eval('object_'+ this.objects[u]);
			obj.updateSelectLevels(num,levelkeys,levelvalues);
			obj.updateSelectMilestone();
		}
	}
	this.initLevelList();
};
NotoursProject.prototype.hideCircles = function(l) {
	for (u=0; u<this.objects.length; u++) {
		if ((this.objects[u]!=null)&&(eval('typeof object_'+ this.objects[u])!="undefined")) {
			var obj = eval('object_'+ this.objects[u]);
			if(obj.level==l) {
				obj.Gcircle.circle.setMap(null);
				if (obj.type=="soundscape") {
					obj.Gcircle.hideArc();
				}
			}
		}
	}
};
NotoursProject.prototype.showCircles = function(l) {
	for (u=0; u<this.objects.length; u++) {
		if ((this.objects[u]!=null)&&(eval('typeof object_'+ this.objects[u])!="undefined")) {
			var obj = eval('object_'+ this.objects[u]);
			if(obj.level==l) {
				obj.Gcircle.circle.setMap(noTours.map);
				if (obj.type=="soundscape") {
					obj.Gcircle.showArc();
				}
			}
		}
	}
};
NotoursProject.prototype.countSounds = function(l) {
	var num = 0;
	for (u=0; u<this.objects.length; u++) {
		if ((this.objects[u]!=null)&&(eval('typeof object_'+ this.objects[u])!="undefined")) {
			var obj = eval('object_'+ this.objects[u]);
			$("#history").append('countSounds '+ u +'/'+ this.objects.length +' L: '+ obj.getLevel()+'<br />');
			if(obj.getLevel()==l) {
				num ++;
			}
		}
	}
	return num;
};
NotoursProject.prototype.checkLevels = function() {
	var numL = this.levels.values.length;
	var numS;
	for (var u = (numL-1); u >= 0; u--) {
		numS = this.countSounds(u);
		$("#history").append('el nivel '+ u +' tiene: '+ numS +'<br />');
		if (numS==0) {
			this.levels.keys.pop();
			this.levels.values.pop();
			this.resetLevels();
			$("#project_"+ this.id +" .update_levels").empty();
			$("#project_"+ this.id +" .update_levels").append(hidden_imput_html('levels', this.id, this.levels.values.length));
			this.saved = false;
		} else {
			
			break;
		}
	}
};

//******************************
// Notours Soundpoint
//******************************
function NotoursSoundpoint() {
	// Info
	this.id = 0;
	this.project_id = 0;
	this.title = '';
	this.description = '';
	this.modified = '';
	this.open = '';
	// Geodata
	this.lat = 0;
	this.lonx = 0;
	this.radius = 50;
	// Notours
	this.type = 'soundpoint';
	this.level = 0;
	this.milestone = 0;
	this.fadein = false;
	this.fadeout = false;
	this.walkin = 'play';
	this.walkout = '';
	this.repeat = '';
	this.attributes = '';
	this.effects = new NotoursEffects();
	this.files = Array();
	// Gmaps
	this.Gcircle;
	// Internal
	this.number  = false;
	this.saved = true;
	this.changes = Array(false,false,false,false,false,false,false,false); // title type level milestone description sound attributes location
	this.visible = false;
};
NotoursSoundpoint.prototype.initialize = function(id, type, project_id, title, description, modified, level, milestone, lat, lng, rad, geodata, attr) {
	// Info
	if ((id)&&(id!='')) this.id = id;
	if ((type)&&(type!='')) this.type = type;
	if ((project_id)&&(project_id!='')) this.project_id = project_id;
	if ((title)&&(title!='')) this.title = title;
	if ((description)&&(description!='')) this.description = description;
	if ((modified)&&(modified!='')) this.modified = modified;
	// Geodata
	if ((lat)&&(lat!='')&&(lng)&&(lng!='')&&(rad)&&(rad!='')) {
		this.lat = parseFloat(lat);
		this.lonx = parseFloat(lng);
		this.radius = parseFloat(rad);
	} else if ((typeof geodata == "string")&&(geodata!='')) {
		var geo = geodata.split(" ");
		this.lat = parseFloat(geo[0]);
		this.lonx = parseFloat(geo[1]);
		this.radius = parseFloat(geo[2]);
	} else if (typeof geodata == "object") {
		this.lat = geodata[0];
		this.lonx = geodata[1];
		this.radius = geodata[2];
	}
	// Notours
	if ((attr)&&(attr!='')) this.attributes = attr;
	this.getAttributes(this.attributes);
	this.attributes = this.parseAttributes();
	if ((level)&&(level!='')) this.level = level;
	if ((milestone)&&(milestone!='')) this.milestone = milestone;
	this.getIcon;
	$("#history").append('object_'+ id +' = new SoundDragControl();<br />object_'+ id +'.initialize('+ this.id +', '+ this.type +', '+ this.project_id +', '+ this.title +', '+ this.description +', '+ this.modified +', '+ this.level +', '+ this.milestone +', '+ this.lat +', '+ this.lonx +', '+ this.radius +', '+ geodata +', '+ this.attr +')<br />');	
	// Gmaps
	this.Gcircle = new SoundDragControl();
	this.Gcircle.initialize(noTours.map, this.id, this.lat, this.lonx, this.radius, this.type, this.getAngles());
	this.Gcircle.levelColor(this.level);
	if(this.type=="soundscape") {
		this.Gcircle.showArc();
	}
};
NotoursSoundpoint.prototype.htmlForm = function() {
	var html = '';
	var content = '';
	var menu = '';
	var tabs = '';
	var title_txt = noTours.write.title_label;
	if (this.title!='') title_txt = this.title;
	var description_txt = noTours.write.object_description_label +'...';
	if (this.description!='') description_txt = this.description;
	
	content = '\n';
	content += '<span class="id"></span>';
	content += dbclick_field_html('object', 'title', 'input', this.id, '', '', title_txt, 17, '\t\t\t\t\t\t\t\t')+ '\n';
	content += '\t\t\t\t\t\t\t\t'+ click_button_html('gps', noTours.write.soundpoint_gps_button)+ '\n';
	content += '\t\t\t\t\t\t\t\t'+ click_button_html('effects', noTours.write.soundpoint_effecs_button)+ '\n';
	content += '\t\t\t\t\t\t\t\t'+ click_button_html('flow', noTours.write.soundpoint_flow_button)+ '\n';
	content += '\t\t\t\t\t\t\t\t'+ click_button_html('media', noTours.write.soundpoint_media_button)+ '\n';
	content += '\t\t\t\t\t\t\t\t'+ click_button_html('info', noTours.write.soundpoint_info_button)+ '\n';
	menu += wrapper_tag_html('div', '', 'wrap_obj_menu', content, '\t\t\t\t\t\t\t', '');
	
	content = '\n';
	var prj = eval('project_'+ this.project_id);
	var levelkeys = new Array();
	var levelvalues = new Array();
	for(i=0; i<prj.levels.values.length; i++){
		levelkeys.push(prj.levels.values[i]);
		levelvalues.push(prj.levels.values[i]);
	}
	levelkeys.push('new level');
	levelvalues.push('new');
	var milestonetext = this.milestone;
	if (milestonetext==0) milestonetext = 'no';
	content += dbclick_option_html('object', 'type', this.id, noTours.write.type_label, noTours.write.type_label, Array('soundpoint', 'soundscape'), Array(0, 1), this.type, '\t\t\t\t\t\t\t\t');
	content += dbclick_option_html('object', 'level', this.id, noTours.write.level_label, noTours.write.level_label, levelvalues, levelvalues, this.level, '\t\t\t\t\t\t\t\t');
	var milestonekeys = new Array('no');
	var milestonevalues = new Array('0');
	if (this.level>0) {
		for(var i=1; i<prj.levels.keys.length; i++){
			if (prj.levels.values[i] == this.level) {
			} else {
				milestonekeys.push(prj.levels.keys[i]);
				milestonevalues.push(prj.levels.values[i]);
			}
		}
	}
	content += dbclick_option_html('object', 'milestone', this.id, noTours.write.milestone_label, noTours.write.milestone_label, milestonekeys, milestonevalues, milestonetext, '\t\t\t\t\t\t\t\t');
	content += dbclick_field_html('object', 'description', 'textarea', this.id, noTours.write.object_description_header, noTours.write.object_description_label, description_txt, 230, '\t\t\t\t\t\t\t\t');
	content += update_object_form_html(this.id, this.project_id, '\t\t\t\t\t\t\t\t');
	content += delete_object_form_html(this.id, '\t\t\t\t\t\t\t\t');
	tabs += wrapper_tag_html('div', '', 'wrap_obj_info', content, '\t\t\t\t\t\t\t', '');
	
	content = '\n';
	var default_angle = Array (0,90);
	for (i=0; i<4; i++) {
		if(typeof this.files[i] != "undefined") {
			if (eval('file_'+this.files[i]+'.angles')=='') {
				content += dbclick_sound_html('object', 'sound'+i, this.id, eval('file_'+this.files[i]+'.url'), eval('file_'+this.files[i]+'.offline'), default_angle, '\t\t\t\t\t\t\t\t');
				default_angle[0] += 90;
				default_angle[1] += 90;
			} else {
				content += dbclick_sound_html('object', 'sound'+i, this.id, eval('file_'+this.files[i]+'.url'), eval('file_'+this.files[i]+'.offline'), eval('file_'+this.files[i]+'.angles'), '\t\t\t\t\t\t\t\t');
			}
		} else {
			content += dbclick_sound_html('object', 'sound'+i, this.id, '', false, default_angle, '\t\t\t\t\t\t\t\t');
			default_angle[0] += 90;
			default_angle[1] += 90;
		}
	}
	content += '\t\t\t\t\t\t\t\t<li class="remember">'+ noTours.write.remember_optional_sound +'</li>\n';
	content += '\t\t\t\t\t\t\t\t<li class="alert">'+ noTours.write.alert_optional_sound +'</li>\n';
	tabs += wrapper_tag_html('ul', '', 'wrap_obj_media', content, '\t\t\t\t\t\t\t', '');
	
	content = '\n';
	content += '\t\t\t\t\t\t\t\t\t'+ click_button_html('walkin', '')+ '\n';
	content += '\t\t\t\t\t\t\t\t\t'+ click_button_html('walkout', '')+ '\n';
	content += '\t\t\t\t\t\t\t\t\t'+ click_text_html('fadein', noTours.write.fadein, '')+ '\n';
	content += '\t\t\t\t\t\t\t\t\t'+ click_text_html('fadeout', noTours.write.fadeout, '')+ '\n';
	content += '\t\t\t\t\t\t\t\t\t'+ click_button_html('repeat', '')+ '\n';
	tabs += wrapper_tag_html('div', '', 'wrap_obj_flow', wrapper_tag_html('div', '', 'obj_flow', content, '\t\t\t\t\t\t\t\t', ''), '\t\t\t\t\t\t\t', '');
	
	content = '\n';
	content += simple_checkbox_html('object', this.effects.key, this.id, noTours.write.effects_header, '', 'effects', this.effects.toString(), '\t\t\t\t\t\t\t');
	//content += dbclick_option_html('object', 'effects', this.id, noTours.write.effects_label, noTours.write.effects_label +": ", Array('none', 'speaker'), Array(0, 1), this.effects, '\t\t\t\t\t\t\t\t');
	tabs += wrapper_tag_html('div', '', 'wrap_obj_effects', content, '\t\t\t\t\t\t\t', '');
	
	content = '\n'; // aqui sobra el wrapper juntar con edit location
	content += dbclick_text_html('object', Array('lat','lonx','radius'), this.id, Array(noTours.write.lat_label, noTours.write.lonx_label, noTours.write.radius_label), 'edit_location', Array(round(this.lat, 6), round(this.lonx, 6), round(this.radius, 1)), '\t\t\t\t\t\t\t');
	tabs += wrapper_tag_html('div', '', 'wrap_obj_gps', content, '\t\t\t\t\t\t\t', '');
	
	html += wrapper_tag_html('div', '', 'wrap_obj', menu + tabs, '\t\t\t\t\t\t\t', '');
	return html;
};
NotoursSoundpoint.prototype.initForm = function() {
	this.hide();
	var obj = eval('object_'+ this.id);
	var prj = eval('project_'+ this.project_id);
	
	$("#object_"+ this.id).mouseenter(function(){
		obj.mouseover();
	});
	$("#object_"+ this.id).mouseleave(function(){
		obj.mouseout();
	});
    $("#object_"+ this.id +" .edit").dblclick( function(){
		var data = $(this).attr("name").split("_");
    	var campo = data[0];
    	var contexto = data[1];
    	var id = data[2];
    	if ($("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").attr("class")){
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box").hide();
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").show();
		}
	});
	
	// wrap_obj_menu
	if (this.milestone!=0) $("#object_"+ this.id +" .wrap_obj_menu .info").addClass('milestone');
	$("#object_"+ this.id +" .wrap_title input[type=\'text\']").blur( function(){
		var value = $(this).attr("value");
		obj.changeTitle(value);
    });
	$("#object_"+ this.id +" .wrap_obj_menu .button").click(function() {
		var clss = $(this).attr('class');
		var box = clss.split(' ');
		prj.hideList(obj.id);
		obj.toggle(box[1]);
	});
	// wrap_obj_info
    $("#object_"+ this.id +" .wrap_type select").change( function(){
    	obj.changeType();
    });
	$("#object_"+ this.id +" .wrap_level select").change( function(){
    	obj.changeLevel();
    });
	$("#object_"+ this.id +" .wrap_milestone select").change( function(){
    	obj.changeMilestone();
    });
	$("#object_"+ this.id +" textarea").blur(function(){
		var value = $(this).attr("value");
    	obj.changeDescription(value);
    });
    $("#object_"+ this.id +" .delete").click(function() {
		var ok = confirm(noTours.write.delete_object_q);
		if (ok==true) {
			obj.del();
	  	}
	});
    // wrap_obj_media
	$("#object_"+ this.id +" .remember").hide();
	this.infoSound(this.type);
    if (this.type=="soundpoint") {
		$("#object_"+ this.id +" .wrap_sound0").addClass("simple");
		$("#object_"+ this.id +" .wrap_sound1").hide();
		$("#object_"+ this.id +" .wrap_sound2").hide();
		$("#object_"+ this.id +" .wrap_sound3").hide();
		$("#object_"+ this.id +" .angle").hide();
		if (this.files.length>=1) {
			$("#object_"+ this.id +" .alert").hide();
		}
	} else if (this.type=="soundscape") {
		$("#object_"+ this.id +" .angle").show();
		if (this.files.length>=4) {
			$("#object_"+ this.id +" .alert").hide();
		}
	}
	$("#object_"+ this.id +" .wrap_obj_media input[type=\'text\']").blur( function(){
		var data = $(this).attr("name").split("_");
		obj.changeSound(data[0]);
    });
	// wrap_obj_flow
	this.setRepeat('');
	this.setFadein('');
	this.setFadeout('');
	this.setWalkin();
	this.setWalkout('');
	$("#object_"+ this.id +" .wrap_obj_flow .repeat").click(function() {
		obj.setRepeat('toggle');
	});
	$("#object_"+ this.id +" .wrap_obj_flow .walkout").click(function() {
		obj.setWalkout('toggle');
	});
	$("#object_"+ this.id +" .wrap_obj_flow .fadein").click(function() {
		obj.setFadein('toggle');
	});
	$("#object_"+ this.id +" .wrap_obj_flow .fadeout").click(function() {
		obj.setFadeout('toggle');
	});
	// wrap_obj_effects
	$("#object_"+ this.id +" .wrap_obj_effects input[type=\'checkbox\']").change( function(){
		obj.changeEffects();
    });
	// wrap_obj_gps
	$("#object_"+ this.id +" .wrap_edit_location .value").dblclick( function(){
		obj.dragstart();
	});
};
NotoursSoundpoint.prototype.postData = function(values, callback) {
	$("#history").append('object_' + this.id + '.postData();<br />exec/update_object.php?'+ values +'.<br />');
	jQuery.post( 'exec/update_object.php', values, function(json){
		// update object
		if (typeof json.error == "undefined") {
			var json_title = '';
			if (typeof json.data.title !="undefined") json_title = json.data.title;
			var json_description = '';
			if (typeof json.data.description !="undefined") json_description = json.data.description;
			var json_modified = '';
			if (typeof json.data.modified !="undefined") json_modified = json.data.modified;
			var json_level = '';
			if (typeof json.data.level !="undefined") json_level = json.data.level;
			var json_milestone = '';
			if (typeof json.data.milestone !="undefined") json_milestone = json.data.milestone;
			var json_latitude = '';
			if (typeof json.data.latitude !="undefined") json_latitude = json.data.latitude;
			var json_longitude = '';
			if (typeof json.data.longitude !="undefined") json_longitude = json.data.longitude;
			var json_radius = '';
			if (typeof json.data.radius !="undefined") json_radius = json.data.radius;
			var json_attributes = '';
			if (typeof json.data.attributes !="undefined") json_attributes = json.data.attributes;
			// create new object
			if (eval('typeof object_'+json.data.id)=="undefined") {
				eval('object_'+ json.data.id +' = new NotoursSoundpoint();');
				var obj = eval('object_'+ json.data.id);
				var prj = eval('project_'+ json.data.project_id);
				var num = prj.objects.push(json.data.id) - 1;
				obj.number = num;
				if (typeof json.data.notours_file != "undefined") {
					var t = json.data.notours_file.data.length;
					$('#history').append(t +' files found.<br />');
					// Files
					$.each(json.data.notours_file.data, function(u, file){
						eval('file_'+ file.data.id +' = new NotoursFile();');
						var f = eval('file_'+ file.data.id);
						f.initialize(file.data.id, file.data.object_id, file.data.project_id, file.data.url, file.data.length, file.data.type, file.data.volume, file.data.angles);
						var n = eval('object_'+ file.data.object_id +'.files.push("'+ file.data.id +'") - 1;');
						f.number = n;
					});
				}
				$("#object_0").remove();
				object_0.Gcircle.unset();
				prj.objects[object_0.number] = null;
				object_0 = null;
				obj.initialize(json.data.id, json.data.type, json.data.project_id, json_title, json_description, json_modified, json_level, json_milestone, json_latitude, json_longitude, json_radius, '', json_attributes);
				$("#objects").prepend('\t\t\t\t\t\t<li id="object_'+ obj.id +'" class="object l_'+ obj.level +'_alpha"></li><!-- object_'+ obj.id +' -->\n');
				$("#object_"+ obj.id).append('\n'+obj.htmlForm()+'\t\t\t\t\t\t');
				obj.initForm();
				prj.objects.sort(sortNumber);
				prj.objects.shift();
			// update object
			} else {
				var obj = eval('object_'+ json.data.id);
				if (typeof json.data.notours_file != "undefined") {
					var t = json.data.notours_file.data.length;
					$('#history').append(t +' files found.<br />');
					// Files
					$.each(json.data.notours_file.data, function(u,file){
						if(eval('typeof file_'+ file.data.id) != "undefined") {
							var f = eval('file_'+ file.data.id);
							f.update(file.data.url, file.data.length, file.data.type, file.data.volume, file.data.angles);
						} else {
							eval('file_'+ file.data.id +' = new NotoursFile();');
							var f = eval('file_'+ file.data.id);
							f.initialize(file.data.id, file.data.object_id, file.data.project_id, file.data.url, file.data.length, file.data.type, file.data.volume, file.data.angles);
							var n = eval('object_'+ file.data.object_id +'.files.push("'+ file.data.id +'") - 1;');
							f.number = n;
						}
					});
				}
				obj.update(json_title, json_description, json_modified, json_level, json_milestone, json_latitude, json_longitude, json_radius, '', json_attributes);
			}
			if(callback) {
				callback();
			}
		} else {
			alert(json.msg);
			$('#history').append(json.msg+'<br />');
			if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
		}
	}, "json" );
};
NotoursSoundpoint.prototype.del = function(f) {
	if(typeof f== "undefined") f = false;
	$("#history").append('object_' + this.id + '.del();<br />'+ noTours.root +'exec/delete.php?element_type=object&element_id='+ this.id +'&force='+ f +'.<br />');
	jQuery.post(noTours.root + "exec/delete.php", { element_type:'object', element_id: this.id, force: f}, function(json){
		if (typeof json.error == "undefined") {
			$('#history').append(json.msg+'.<br />');
			var obj = eval('object_'+json.data.id);
			var prj = eval('project_'+json.data.project_id);
			if (!obj.saved) {
				if (prj.getChanges()=="") {
					prj.changes = false;
					if (prj.saved) {
						$("#actions .save_project").removeClass("changes");
						$("#actions .save_project").addClass("saved");
					}
				}
			}
			obj.Gcircle.unset();
			//prj.objects.splice(obj.number, 1);	//// esto haria cambiar la posición de todas las ids en el array y obligaria a cambiar el valor number de cada objeto
			prj.objects[obj.number] = null;
			obj = null;  // esto podría eliminarse para hacer un control-z
			$('#object_'+json.data.id).remove();
		} else {
			alert(json.msg);
			$('#history').append(json.msg+'<br />');
			if (json.error_msg!='') $('#history').append(json.error_msg+'<br />');
		}
	}, "json" );
};
NotoursSoundpoint.prototype.update = function(title, description, modified, level, milestone, lat, lng, rad, geodata, attributes) {
	// Info
	if ((title)&&(title!='')) this.title = title;
	if ((description)&&(description!='')) this.description = description;
	if ((modified)&&(modified!='')) this.modified = modified;
	if ((level)&&(level!='')) this.level = level;
	if ((milestone)&&(milestone!='')) this.milestone = milestone;
	// Geodata
	if ((lat)&&(lat!='')&&(lng)&&(lng!='')&&(rad)&&(rad!='')) {
		this.lat = parseFloat(lat);
		this.lonx = parseFloat(lng);
		this.radius = parseFloat(rad);
	} else if ((typeof geodata == "string")&&(geodata!='')) {
		var geo = geodata.split(" ");
		this.lat = parseFloat(geo[0]);
		this.lonx = parseFloat(geo[1]);
		this.radius = parseFloat(geo[2]);
	} else if (typeof geodata == "object") {
		this.lat = geodata[0];
		this.lonx = geodata[1];
		this.radius = geodata[2];
	}
	// Notours
	if ((attributes)&&(attributes!='')) {
		this.attributes = attributes;
		this.getAttributes(this.attributes);
		this.attributes = this.parseAttributes();
	}
	// Refresh
	this.changes = Array(false,false,false,false,false,false,false,false); // title type level milestone description sound attributes location
	this.saved = true;
	$("#object_"+this.id).empty();
	$("#object_"+this.id).append(this.htmlForm());
	this.initForm();
	if(this.visible) {
		this.show();
	}
};
NotoursSoundpoint.prototype.geodata = function (){
	$("#object_"+ this.id +" .wrap_edit_location .lat").text(round(this.Gcircle.center.point.lat(), 6));
	$("#object_"+ this.id +" .wrap_edit_location .lonx").text(round(this.Gcircle.center.point.lng(), 6));
	$("#object_"+ this.id +" .wrap_edit_location .radius").text(round(this.Gcircle.radius, 1));
	$("#object_"+ this.id +" .wrap_edit_location .lat").attr("class","value lat new");
	$("#object_"+ this.id +" .wrap_edit_location .lonx").attr("class","value lonx new");
	$("#object_"+ this.id +" .wrap_edit_location .radius").attr("class","value radius new");
};
NotoursSoundpoint.prototype.angles = function (){
	$("#object_"+ this.id +" .wrap_sound0 .angle").text(parseInt(this.Gcircle.angles[0]) +" "+ parseInt(this.Gcircle.angles[1]));
	$("#object_"+ this.id +" .wrap_sound1 .angle").text(parseInt(this.Gcircle.angles[1]) +" "+ parseInt(this.Gcircle.angles[2]));
	$("#object_"+ this.id +" .wrap_sound2 .angle").text(parseInt(this.Gcircle.angles[2]) +" "+ parseInt(this.Gcircle.angles[3]));
	$("#object_"+ this.id +" .wrap_sound3 .angle").text(parseInt(this.Gcircle.angles[3]) +" "+ parseInt(this.Gcircle.angles[0]));
	$("#object_"+ this.id +" .wrap_sounds .angle").attr("class","angle new");
	var type = $("#object_"+ this.id +" .wrap_type option:selected").html();
	$("#hidden_sound0_"+ this.id).attr("value", this.serializeSound(0,type));
	$("#hidden_sound1_"+ this.id).attr("value", this.serializeSound(1,type));
	$("#hidden_sound2_"+ this.id).attr("value", this.serializeSound(2,type));
	$("#hidden_sound3_"+ this.id).attr("value", this.serializeSound(3,type));
	$("#object_"+ this.id +" .update_sound").empty();
	$("#object_"+ this.id +" .update_sound").append(hidden_imput_html('sound', this.id, this.soundData(type)));
	this.saved = false;
	eval("project_"+ this.project_id +".change();");
};
NotoursSoundpoint.prototype.getAngles = function (){
	if (this.files.length>0) {
		var a = Array();
		for(i=0; i<this.files.length; i++) {
			if(this.files[i]!=null) {
				var e = eval('file_'+this.files[i]+'.angles');
				if (e.length==2) a.push(parseInt(e[0]));
			}
		}
		a.sort(sortNumber);
		$('#history').append('object_'+ this.id +' angles: '+ a.toString() +'<br />');
		return a;
	} else {
		return '';
	}
};
NotoursSoundpoint.prototype.sortFiles = function(criterio) {
	this.files.sort(criterio);
	for(i=0; i<this.files.length; i++) {
		if(this.files[i]!=null) {
			eval('file_'+ this.files[i] +'.number = '+ i +';');
		}
	}
};
NotoursSoundpoint.prototype.geodataHidden = function (){
	var hidden = '';
	hidden += hidden_imput_html("lat", this.id, this.Gcircle.center.point.lat());
	hidden += hidden_imput_html("lonx", this.id, this.Gcircle.center.point.lng());
	hidden += hidden_imput_html("radio", this.id, this.Gcircle.radius);
	$("#object_"+ this.id +" .update_location").empty();
	$("#object_"+ this.id +" .update_location").append(hidden);
	this.changes[7] = true;
	var prj = eval('project_'+ this.project_id);
	prj.change();
};
NotoursSoundpoint.prototype.receiveSound = function(sound, folder) {
	$("#object_"+ this.id +" .wrap_sound .value_box .value").text(sound, folder);
	$("#object_"+ this.id +" .wrap_sound .value_box .value").attr("class","value new");
	$("#object_"+ this.id +" .wrap_sound .field_box").append(sound_html(noTours.root + folder + sound,"&bg=c2dbec&leftbg=7dbeec&rightbg=7193d1&rightbghover=3b65b0"));
	$("#object_"+ this.id +" .wrap_sound .field_box object").css("background-color","#7dbeec");
	$("#object_"+ this.id +" .update_sound").empty();
	if ( typeof this.files[0] == "undefined") {
		var id_file = 0;
	} else {
		var id_file = this.files[0];
	}
	$("#object_"+ this.id +" .update_sound").append(hidden_imput_html('sound', this.id, sound+'{uploaded-'+ id_file +'}'));
	this.saved = false;
	eval("project_"+ this.project_id +".change();");
	$("#object_"+ this.id +" .wrap_sound .field_box").hide();
	$("#object_"+ this.id +" .wrap_sound .value_box").show("slow");
	$("#object_"+ this.id +" .wrap_sound .value_box .remember").show("slow");
	$("#object_"+ this.id +" .wrap_sound .field_box object").fadeTo("fast", 0.6);
};
NotoursSoundpoint.prototype.toggle = function (box){
	var boxes = Array ('info', 'media', 'flow', 'effects', 'gps');
	for (i=0; i<boxes.length; i++) {
		if ((boxes[i]==this.open)&&(boxes[i]=!box)) $("#object_"+ this.id +" .wrap_obj_"+ boxes[i]).slideUp();
	}
	if (this.open==box) { 
		$("#object_"+ this.id +" .wrap_obj_"+ box).slideUp();
		this.open = '';
	} else if (this.open=='') {
		$("#object_"+ this.id +" .wrap_obj_"+ box).slideDown();
		this.open = box;
	} else {
		var id = this.id;
		$("#object_"+ this.id +" .wrap_obj_"+ this.open).slideUp(function(){
			$("#object_"+ id +" .wrap_obj_"+ box).slideDown();
		});
		this.open = box;
	}
};
NotoursSoundpoint.prototype.hide = function (){
	var boxes = Array ('info', 'media', 'flow', 'effects', 'gps');
	for (i=0; i<boxes.length; i++) {
		$("#object_"+ this.id +" .wrap_obj_"+ boxes[i]).hide();
	}
	this.visible = false;
};
NotoursSoundpoint.prototype.show = function (){
	$("#object_"+ this.id +" .wrap_type").show();
	$("#object_"+ this.id +" .wrap_description").show();
	$("#object_"+ this.id +" .wrap_edit_location").show();
	/*if (this.type=="soundpoint") {
		$("#object_"+ this.id +" .wrap_attributes").show();
	}*/
	$("#object_"+ this.id +" .wrap_sounds").show();
	$("#object_"+ this.id +" .update_object").show();
	$("#object_"+ this.id +" .delete_object").show();
	this.visible = true;
};
NotoursSoundpoint.prototype.mouseover = function (){
	$("#object_"+ this.id).removeClass('l_'+ this.getLevel() +'_alpha');
	$("#object_"+ this.id).addClass('l_'+ this.getLevel());
	this.Gcircle.circle.setOptions({fillOpacity:0.6});
	this.Gcircle.shape.setOptions({fillOpacity:0.6});
	//alert(this.getLevel());
};
NotoursSoundpoint.prototype.mouseout = function (){
	$("#object_"+ this.id).removeClass('l_'+ this.getLevel());
	$("#object_"+ this.id).addClass('l_'+ this.getLevel() +'_alpha');
	this.Gcircle.circle.setOptions({fillOpacity:0.3});
	this.Gcircle.shape.setOptions({fillOpacity:0.3});
	//alert(this.getLevel());
};
NotoursSoundpoint.prototype.mapMouseover = function (){
	$("#object_"+ this.id).removeClass('l_'+ this.getLevel() +'_alpha');
	$("#object_"+ this.id).addClass('l_'+ this.getLevel());
};
NotoursSoundpoint.prototype.mapMouseout = function (){
	$("#object_"+ this.id).removeClass('l_'+ this.getLevel());
	$("#object_"+ this.id).addClass('l_'+ this.getLevel() +'_alpha');
};
NotoursSoundpoint.prototype.dragstart = function (){
	if (noTours.author.dragging.toString()!="") {
		eval("object_"+ noTours.author.dragging.toString() +".Gcircle.hideDrag();");
	}
	this.Gcircle.showDrag();
	noTours.author.dragging = this.id;
	noTours.map.setCenter(this.Gcircle.center.point);
};
NotoursSoundpoint.prototype.darker = function() {
	this.Gcircle.alpha += 0.1;
	if (this.Gcircle.alpha<1) {
		this.Gcircle.circle.setOptions({fillOpacity: this.Gcircle.alpha});
		setTimeout("object_"+ this.id +".darker();",100);
	}
};
NotoursSoundpoint.prototype.lighter = function() {
	this.Gcircle.alpha -= 0.1;
	if (this.Gcircle.alpha>0.4) {
		this.Gcircle.circle.setOptions({fillOpacity: this.Gcircle.alpha});
		setTimeout("object_"+ this.id +".lighter();",100);
	}
};
NotoursSoundpoint.prototype.changeTitle = function(t) {
	var prj = eval('project_'+ this.project_id);
	$("#object_"+ this.id +" .update_title").empty();
	if(t!=this.title) {
		if (t.length>17) t = t.slice(0,17) + '...';
		$("#object_"+ this.id +" .update_title").append(hidden_imput_html('title', this.id, t));
		$("#object_"+ this.id +" .wrap_title .value_box .value").text(t);
		$("#object_"+ this.id +" .wrap_title .value_box .value").attr("class","value new");
		this.changes[0] = true;
		prj.change();
	} else {
		$("#object_"+ this.id +" .wrap_title .value_box .value").text(t);
		$("#object_"+ this.id +" .wrap_title .value_box .value").attr("class","value");
		this.changes[0] = false;
		prj.unChange();
	}
	$("#object_"+ this.id +" .wrap_title  .field_box").hide();
	$("#object_"+ this.id +" .wrap_title  .value_box").show("slow");
};
NotoursSoundpoint.prototype.changeType = function() {
	var text = $("#object_"+ this.id +" .wrap_type option:selected").html();
	var prj = eval('project_'+ this.project_id);
	if (text=="soundpoint") {
		$("#object_"+ this.id +" .wrap_sound0").addClass("simple");
		$("#object_"+ this.id +" .wrap_sound1").hide();
		$("#object_"+ this.id +" .wrap_sound2").hide();
		$("#object_"+ this.id +" .wrap_sound3").hide();
		$("#object_"+ this.id +" .angle").hide();
		this.Gcircle.hideArc();
		$("#hidden_sound0_"+ this.id).attr("value", this.serializeSound(0,'soundpoint'));
		$("#object_"+ this.id +" .update_sound").empty();
		$("#object_"+ this.id +" .update_sound").append(hidden_imput_html('sound', this.id, this.soundData('soundpoint')));
		this.Gcircle.type = "soundpoint";
	} else {
		$("#object_"+ this.id +" .wrap_sound0").removeClass("simple");
		$("#object_"+ this.id +" .wrap_sound1").show();
		$("#object_"+ this.id +" .wrap_sound2").show();
		$("#object_"+ this.id +" .wrap_sound3").show();
		$("#object_"+ this.id +" .angle").show();
		if (this.files.length<4) {
			$("#object_"+ this.id +" .angle").addClass("new");
		}
		this.Gcircle.type = "soundscape";
		this.Gcircle.showArc();
		$("#object_"+ this.id +" .update_sound").empty();
		$("#object_"+ this.id +" .update_sound").append(hidden_imput_html('sound', this.id, this.soundData('soundscape')));
	}
	$("#object_"+ this.id +" .update_type").empty();
	$("#object_"+ this.id +" .wrap_type .value").text(text);
	if(text!=this.type) {
		$("#object_"+ this.id +" .update_type").append(hidden_imput_html('type', this.id, text));
		$("#object_"+ this.id +" .wrap_type .value").attr("class","value new");
		this.changes[1] = true;
		prj.change();
	} else {
		$("#object_"+ this.id +" .wrap_type .value").attr("class","value");
		this.changes[1] = false;
		prj.unChange();
	}
	$("#object_"+ this.id +" .wrap_type .field_box").hide();
	$("#object_"+ this.id +" .wrap_type .value_box").show();
};
NotoursSoundpoint.prototype.changeLevel = function() {
	var value = $("#object_"+ this.id +" .wrap_level option:selected").attr("value");
	//var text = $("#object_"+ this.id +" .wrap_level option:selected").html();
	var prj = eval('project_'+ this.project_id);
	if (value=="new") {
		value = prj.pushLevels();
	} else {
		this.updateSelectMilestone();
	}
	$("#object_"+ this.id +" .update_level").empty();
	if(value!=this.level) {
		$("#object_"+ this.id +" .wrap_level .value").attr("class","value new");
		$("#object_"+ this.id +" .update_level").append(hidden_imput_html('level', this.id, value));
		this.Gcircle.levelColor(value);
		$("#object_"+ this.id).removeClass('l_'+ this.level);
		$("#object_"+ this.id).addClass('l_'+ value);
		this.changes[2] = true;
		prj.change();
		prj.checkLevels();
	} else {
		$("#object_"+ this.id +" .wrap_level .value").attr("class","value");
		
		var val = $("#object_"+ this.id +" .update_level input").attr("value");
		this.Gcircle.levelColor(value);
		$("#object_"+ this.id).removeClass('l_'+ val);
		$("#object_"+ this.id).addClass('l_'+ value);
		
		this.changes[2] = false;
		prj.unChange();
	}
};
NotoursSoundpoint.prototype.changeMilestone = function() {
	var value = $("#object_"+ this.id +" .wrap_milestone option:selected").attr("value");
	var text = $("#object_"+ this.id +" .wrap_milestone option:selected").html();
	var prj = eval('project_'+ this.project_id);
	$("#object_"+ this.id +" .update_milestone").empty();
	if(value!=this.milestone) {
		$("#object_"+ this.id +" .wrap_milestone .value").attr("class","value new");
		$("#object_"+ this.id +" .update_milestone").append(hidden_imput_html('milestone', this.id, value));
		this.changes[3] = true;
		prj.change();
	} else {
		$("#object_"+ this.id +" .wrap_milestone .value").attr("class","value");
		this.changes[3] = false;
		prj.unChange();
	}
	$("#object_"+ this.id +" .wrap_milestone .value").text(text);
	$("#object_"+ this.id +" .wrap_milestone .field_box").hide();
	$("#object_"+ this.id +" .wrap_milestone .value_box").show();
};
NotoursSoundpoint.prototype.changeDescription = function(t) {
	var prj = eval('project_'+ this.project_id);
	$("#object_"+ this.id +" .update_description").empty();
	if(t!=this.description) {
		if (t.length>230) t = t.slice(0,230) + '...';
		$("#object_"+ this.id +" .update_description").append(hidden_imput_html('description', this.id, t));
		$("#object_"+ this.id +" .wrap_description .value_box .value").text(t);
		$("#object_"+ this.id +" .wrap_description .value_box .value").attr("class","value new");
		this.changes[4] = true;
		prj.change();
	} else {
		$("#object_"+ this.id +" .wrap_description .value_box .value").text(t);
		$("#object_"+ this.id +" .wrap_description .value_box .value").attr("class","value");
		this.changes[4] = false;
		prj.unChange();
	}
	$("#object_"+ this.id +" .wrap_description  .field_box").hide();
	$("#object_"+ this.id +" .wrap_description  .value_box").show("slow");
};
NotoursSoundpoint.prototype.changeSound = function(campo) {
	var old = $("#object_"+ this.id +" .wrap_"+ campo +" .value").text();
	var val = $("#object_"+ this.id +" .wrap_"+ campo +" input[type=\'text\']" ).attr("value");
	var num = campo.slice(5);
	var url = '';
	if(eval('typeof(file_'+this.files[num]+')')!='undefined') {
		var f = eval ('file_'+this.files[num]);
		url = f.url;
	}
	var prj = eval('project_'+ this.project_id);
	if ((val)&&(val!="")&&(val!=old)&&(val.indexOf(' ')!=(-1))) {
		alert(noTours.write.wrong_sound_name);
	} else if ((val)&&(val!="")&&(val!=old)&&(val.charAt(val.length-1)=='/')&&(val.indexOf('.')!=(-1))) {
		alert(noTours.write.wrong_folder_name);
	} else if ((val)&&(val!="")&&(val!=old)&&((getsSufix(val)=="mp3")||(getsSufix(val)=="wav")||(val.charAt(val.length-1)=='/'))) {
    	$("#object_"+ this.id +" .wrap_"+ campo +" .value_box .value").text(val);
    	$("#object_"+ this.id +" .update_sound").empty();
		$("#hidden_"+ campo +"_"+ this.id).attr("value", '');
    	if(val!=url) {
    		$("#object_"+ this.id +" .wrap_"+ campo +" .value_box .value").attr("class","value new");
    		var type = $("#object_"+ this.id +" .wrap_type option:selected").html();
			$("#hidden_"+ campo +"_"+ this.id).attr("value", this.serializeSound(num,type));
			$("#object_"+ this.id +" .update_sound").append(hidden_imput_html('sound', this.id, this.soundData(type)));
			this.changes[5] = true;
			prj.change();
    	} else {
    		$("#object_"+ this.id +" .wrap_"+ campo +" .value_box .value").attr("class","value");
    		this.changes[5] = false;
			prj.unChange();
    	}
		$("#object_"+ this.id +" .wrap_"+ campo +" .field_box").hide();
		$("#object_"+ this.id +" .wrap_sounds .remember").show();
		$("#object_"+ this.id +" .wrap_"+ campo +" .value_box .value").show();
		$("#object_"+ this.id +" .wrap_"+ campo +" .value_box").show("slow");		
	} else if (val==old) {
		$("#object_"+ this.id +" .wrap_"+ campo +" .field_box").hide();
		$("#object_"+ this.id +" .wrap_"+ campo +" .value_box").show("slow");
		$("#object_"+ this.id +" .wrap_"+ campo +" .value_box .new").show();
	} else {
		alert(noTours.write.wrong_sound_sufix);
	}
};
NotoursSoundpoint.prototype.changeEffects = function() {
	var value = "";
	var num = 0;
	var obj = eval('object_'+ this.id);
	var prj = eval('project_'+ this.project_id);
	obj.effects.value[0] = false;
	obj.effects.value[1] = false;
	$("#object_"+ this.id +" .wrap_obj_effects input:checked").each(function() {
		if (num!=0) value += ' ';
		num++;
		var val = $(this).attr("value");
		obj.effects.setEffect(val);
		value += val;
	});
	$("#object_"+ this.id +" .update_attributes").empty();
	$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
	if(this.checkAttributes()) {
		$("#object_"+ this.id +" .wrap_obj_effects .value").text('');
		$("#object_"+ this.id +" .wrap_obj_effects .value").attr("class","value");
		$("#object_"+ this.id +" .update_attributes").empty();
		this.changes[6] = false;
		prj.unChange();
	} else {
		if (num==0) {
			$("#object_"+ this.id +" .wrap_obj_effects .value").text("(none)");
		} else {
			$("#object_"+ this.id +" .wrap_obj_effects .value").text(value);
		}
		$("#object_"+ this.id +" .wrap_obj_effects .value").attr("class","value new");
		this.changes[6] = true;
		prj.change();
	}
};
NotoursSoundpoint.prototype.updateSelectLevels = function(l,lkeys,lvalues) {
	$("#history").append('object_'+ this.id +'.updateSelectLevels('+ l +','+ lkeys +','+ lvalues +');<br />');
	var value = $("#object_"+ this.id +" .wrap_level option:selected").attr("value");
	if (value=="new") value = l;
	$("#object_"+ this.id +" .wrap_level").remove();
	$("#object_"+ this.id +" .wrap_type").after(dbclick_option_html('object', 'level', this.id, noTours.write.level_label, noTours.write.level_label, lkeys, lvalues, value, '\t\t\t\t\t\t\t\t'));
	this.initSelectLevels();
};
NotoursSoundpoint.prototype.updateSelectMilestone = function() {
	var m = $("#object_"+ this.id +" .wrap_milestone option:selected").attr("value");
	var milestonetext = m;
	if (milestonetext==0) {
		milestonetext = 'no';
	} else {
		milestonetext = 'level'+ milestonetext;
	}
	var prj = eval('project_'+ this.project_id);
	var milestonekeys = new Array('no');
	var milestonevalues = new Array('0');
	var level = $("#object_"+ this.id +" .wrap_level option:selected").attr("value");
	if (level>0) {
		for(var i=1; i<prj.levels.keys.length; i++){
			if (prj.levels.values[i] == level) {
			} else {
				milestonekeys.push(prj.levels.keys[i]);
				milestonevalues.push(prj.levels.values[i]);
			}
		}
	}
	$("#object_"+ this.id +" .wrap_milestone").remove();
	$("#object_"+ this.id +" .wrap_level").after(dbclick_option_html('object', 'milestone', this.id, noTours.write.milestone_label, noTours.write.milestone_label, milestonekeys, milestonevalues, milestonetext, '\t\t\t\t\t\t\t\t'));
	if (m==level) {
		$("#object_"+ this.id +" .wrap_milestone option:first").attr("selected","selected");
		this.changeMilestone();
	}
	this.initSelectMilestone();
};
NotoursSoundpoint.prototype.initSelectLevels = function() {
	$("#object_"+ this.id +" .wrap_level .edit").dblclick( function(){
		var data = $(this).attr("name").split("_");
    	var campo = data[0];
    	var contexto = data[1];
    	var id = data[2];
    	if ($("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").attr("class")){
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box").hide();
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").show();
		}
	});
	$("#object_"+ this.id +" .wrap_level select").change( function(){
    	var data = $(this).attr("name").split("_");
    	eval('object_'+ data[2] +'.changeLevel();');
    });
};
NotoursSoundpoint.prototype.initSelectMilestone = function() {
	$("#object_"+ this.id +" .wrap_milestone .edit").dblclick( function(){
		var data = $(this).attr("name").split("_");
    	var campo = data[0];
    	var contexto = data[1];
    	var id = data[2];
    	if ($("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").attr("class")){
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .value_box").hide();
			$("#"+ contexto +"_"+ id +" .wrap_"+ campo +" .field_box").show();
		}
	});
	var obj = eval('object_'+ this.id);
	$("#object_"+ this.id +" .wrap_milestone select").change( function(){
    	obj.changeMilestone();
    });
};
NotoursSoundpoint.prototype.infoSound = function(type) {
	var newSounds = $("#hidden_sound0_"+ this.id).attr("value");
	if (type=="soundpoint") {
		if (this.files.length>=1) {
			$("#object_"+ this.id +" .alert").hide();
		}
	} else if (type=="soundscape") {
		if (this.files.length>=4) {
			$("#object_"+ this.id +" .alert").hide();
		}
		newSounds += $("#hidden_sound1_"+ this.id).attr("value");
		newSounds += $("#hidden_sound2_"+ this.id).attr("value");
		newSounds += $("#hidden_sound3_"+ this.id).attr("value");
	}
	
};
NotoursSoundpoint.prototype.serializeSound = function(num,type) {
	var value = '';
	var name = $("#object_"+ this.id +" .wrap_sound"+ num +" .value").text();
	if ((name!="")&&(name.indexOf(".")!=(-1))) {
		name = name.replace(/\|/g, 'I');
		name = name.replace(/\{/g, '(');
		name = name.replace(/\}/g, ')');
		value += name + '{file|'
	} else if ((name!="")&&(name.charAt(name.length-1)=='/')) {
		name = name.replace(/\|/g, 'I');
		name = name.replace(/\{/g, '(');
		name = name.replace(/\}/g, ')');
		value += name + '{folder|'
	} else {
		value += 'none{';
	}
	if (typeof this.files[num]=="undefined") {
		value += 'offline|0';
	} else {
		value += 'offline|'+this.files[num];
	}
	if (type=="soundscape") {
		var angle = $("#object_"+ this.id +" .wrap_sound"+ num +" .angle").text();
		if (angle!="") value += '|'+ angle;
	}
	value += '}';
	return value;
};
NotoursSoundpoint.prototype.soundData = function(type) {
	var value = '';
	value += $("#hidden_sound0_"+ this.id).attr("value");
	if (type=="soundscape") {
		value += $("#hidden_sound1_"+ this.id).attr("value");
		value += $("#hidden_sound2_"+ this.id).attr("value");
		value += $("#hidden_sound3_"+ this.id).attr("value");
	}
	return value;
};
NotoursSoundpoint.prototype.getAttributes = function(attr) {
	var attributes = attr.split(" ");
	this.repeat = 'once';
	this.walkout = 'playout';
	for (i=0; i<attributes.length; i++) {
		switch(attributes[i]) {
			case 'speaker':
				this.effects.value[0] = true;
				break;
			case 'vibrate':
				this.effects.value[1] = true;
				break;
			case 'loop':
				this.repeat = 'loop';
				break;
			case 'playout':
				this.walkout = 'playout';
				break;
			case 'pauseout':
				this.walkout = 'pauseout';
				break;
			case 'stopout':
				this.walkout = 'stopout';
				break;
			case 'fadein':
				this.fadein = true;
				break;
			case 'fadeout':
				this.fadeout = true;
				break;
		}
	}
};
NotoursSoundpoint.prototype.isSaved = function() {
	var saved = true;
	for (i=0; i<this.changes.length; i++) {
		if (this.changes[i]) saved = false;
	}
	return saved;
};
NotoursSoundpoint.prototype.parseAttributes = function() {
	var attr = '';
	attr += this.walkout;
	if (this.repeat!='once') attr += ' '+this.repeat;
	if (this.effects.toString()!='') attr += ' '+ this.effects.toString();
	if (this.fadein) attr += ' fadein';
	if (this.fadeout) attr += ' fadeout';
	return attr;
};
NotoursSoundpoint.prototype.checkAttributes = function() {
	var check = true;
	if (this.attributes.indexOf(this.walkout)<0) check = false;
	if (this.repeat=='once') {
		if (this.attributes.indexOf('loop')>=0) check = false;
	} else {
		if (this.attributes.indexOf('loop')<0) check = false;
	}
	if ((this.effects.value[0])&&(this.attributes.indexOf('speaker')<0)) check = false;
	if ((!this.effects.value[0])&&(this.attributes.indexOf('speaker')>=0)) check = false;
	if ((this.effects.value[1])&&(this.attributes.indexOf('vibrate')<0)) check = false;
	if ((!this.effects.value[1])&&(this.attributes.indexOf('vibrate')>=0)) check = false;
	if ((this.fadein)&&(this.attributes.indexOf('fadein')<0)) check = false;
	if ((!this.fadein)&&(this.attributes.indexOf('fadein')>=0)) check = false;
	if ((this.fadeout)&&(this.attributes.indexOf('fadeout')<0)) check = false;
	if ((!this.fadeout)&&(this.attributes.indexOf('fadeout')>=0)) check = false;
	return check;
};
NotoursSoundpoint.prototype.setRepeat = function(attr) {
	if (attr=='toggle') {
		var prj = eval('project_'+ this.project_id);
		prj.change();
		if (this.repeat=='once') {
			this.repeat = 'loop';
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").removeClass('once');
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").removeClass('newonce');
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").attr('title', noTours.write.loop);
			if (this.attributes.indexOf('loop')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .repeat").addClass('loop');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .repeat").addClass('newloop');
				this.changes[6] = true;
			}
		} else if (this.repeat=='loop') {
			this.repeat = 'once';
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").removeClass('loop');
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").removeClass('newloop');
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").attr('title', noTours.write.loop);
			if (this.attributes.indexOf('loop')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .repeat").addClass('newonce');
				this.changes[6] = true;
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .repeat").addClass('once');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			}
		}
	} else if (attr!='') {
		this.repeat = attr;
	} else {
		if (this.repeat == 'once') {
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").addClass('once');
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").attr('title', noTours.write.once);
		} else if (this.repeat == 'loop') {
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").addClass('loop');
			$("#object_"+ this.id +" .wrap_obj_flow .repeat").attr('title', noTours.write.loop);
		}
	}
};
NotoursSoundpoint.prototype.setFadein = function(attr) {
	if (attr=='toggle') {
		var prj = eval('project_'+ this.project_id);
		prj.change();
		if (this.fadein) {
			this.fadein = false;
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").removeClass('yes');
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").removeClass('newyes');
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").attr('title', noTours.write.fadein_of);
			if (this.attributes.indexOf('fadein')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .fadein").addClass('newno');
				this.changes[6] = true;
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .fadein").addClass('no');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			}
		} else {
			this.fadein = true;
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").removeClass('no');
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").removeClass('newno');
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").attr('title', noTours.write.fadein_text);
			if (this.attributes.indexOf('fadein')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .fadein").addClass('yes');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .fadein").addClass('newyes');
				this.changes[6] = true;
			}
		}
	} else if (attr!='') {
		this.fadein = attr;
	} else {
		if (this.fadein) {
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").addClass('yes');
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").attr('title', noTours.write.fadein_text);
		} else {
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").addClass('no');
			$("#object_"+ this.id +" .wrap_obj_flow .fadein").attr('title', noTours.write.fadein_of);
		}
	
	}
};
NotoursSoundpoint.prototype.setFadeout = function(attr) {
	if (attr=='toggle') {
		var prj = eval('project_'+ this.project_id);
		prj.change();
		if (this.fadeout) {
			this.fadeout = false;
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").removeClass('yes');
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").removeClass('newyes');
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").attr('title', noTours.write.fadeout_of);
			if (this.attributes.indexOf('fadeout')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .fadeout").addClass('newno');
				this.changes[6] = true;
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .fadeout").addClass('no');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			}
		} else {
			this.fadeout = true;
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").removeClass('no');
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").removeClass('newno');
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").attr('title', noTours.write.fadeout_text);
			if (this.attributes.indexOf('fadeout')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .fadeout").addClass('yes');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .fadeout").addClass('newyes');
				this.changes[6] = true;
			}
		}
	} else if (attr!='') {
		this.fadeout = attr;
	} else {
		if (this.fadeout) {
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").addClass('yes');
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").attr('title', noTours.write.fadeout_text);
		} else {
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").addClass('no');
			$("#object_"+ this.id +" .wrap_obj_flow .fadeout").attr('title', noTours.write.fadeout_of);
		}
	
	}
};
NotoursSoundpoint.prototype.setWalkin= function() {
	if (this.walkin == 'play') {
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").removeClass('stop');
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").addClass('play');
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").attr('title', noTours.write.enter_play);
	} else if (this.walkin == 'pause') {
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").removeClass('play');
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").addClass('pause');
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").attr('title', noTours.write.enter_pause);
	} else if (this.walkin == 'stop') {
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").removeClass('pause');
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").addClass('stop');
		$("#object_"+ this.id +" .wrap_obj_flow .walkin").attr('title', noTours.write.enter_stop);
	}
};
NotoursSoundpoint.prototype.setWalkout = function(attr) {
	if (attr=='toggle') {
		var prj = eval('project_'+ this.project_id);
		prj.change();
		if (this.walkout=='playout') {
			this.walkout = 'pauseout';
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").removeClass('play');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").removeClass('newplay');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").attr('title', noTours.write.out_pause);
			if (this.attributes.indexOf('pauseout')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('pause');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('newpause');
				this.changes[6] = true;
			}
		} else if (this.walkout=='pauseout') {
			this.walkout = 'stopout';
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").removeClass('pause');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").removeClass('newpause');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").attr('title', noTours.write.out_stop);
			if (this.attributes.indexOf('stopout')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('stop');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('newstop');
				this.changes[6] = true;
			}
		} else if (this.walkout=='stopout') {
			this.walkout = 'playout';
			$("#object_"+ this.id +" .update_attributes").empty();
			$("#object_"+ this.id +" .update_attributes").append(hidden_imput_html('attributes', this.id, this.parseAttributes()));
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").removeClass('stop');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").removeClass('newstop');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").attr('title', noTours.write.out_play);
			if (this.attributes.indexOf('playout')>=0) {
				$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('play');
				if(this.checkAttributes()) {
					$("#object_"+ this.id +" .update_attributes").empty();
					this.changes[6] = false;
					prj.unChange();
				}
			} else {
				$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('newplay');
				this.changes[6] = true;
			}
		}
	} else if (attr!='') {
		this.walkout = attr;
	} else {
		if (this.walkout == 'playout') {
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('play');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").attr('title', noTours.write.out_play);
		} else if (this.walkout == 'pauseout') {
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('pause');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").attr('title', noTours.write.out_pause);
		} else if (this.walkout == 'stopout') {
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").addClass('stop');
			$("#object_"+ this.id +" .wrap_obj_flow .walkout").attr('title', noTours.write.out_stop);
		}
	}
};
NotoursSoundpoint.prototype.getLevel = function(attr) {
	if (this.changes[2]) {
		return $('#hidden_level_'+ this.id).attr('value');
	} else {
		return this.level;
	}
};

//******************************
// Notours File
//******************************
function NotoursFile() {
	this.id = 0;
	this.object_id = 0;
	this.project_id = 0;
	this.url = '';
	this.length = 0;
	this.type = '';
	this.volume = 100;
	this.angles = Array();
	this.offline = true;
	//internal
	this.number  = false;
};
NotoursFile.prototype.initialize = function(id, object_id, project_id, url, length, type, volume, angles) {
	if (id) this.id = id;
	if (object_id) this.object_id = object_id;
	if (project_id) this.project_id = project_id;
	if (url) this.url = url;
	if (length) this.length = length;
	if (type) this.type = type;
	if (volume) this.volume = volume;
	if ((angles)&&(angles!="")) this.angles = angles.split(" ");
	$("#history").append('file_'+ id +' = new NotoursFile();<br />'+ this.id +', '+ this.object_id +', '+ this.project_id +', '+ this.url +', '+ this.length +', '+ this.type +', '+ this.volume +', '+ this.angles +'.<br />');
};
NotoursFile.prototype.update = function(url, length, type, volume, angles) {
	if ((url)&&(url!="")) this.url = url;
	if ((length)&&(length!=""))  this.length = length;
	if ((type)&&(type!=""))  this.type = type;
	if ((volume)&&(volume!=""))  this.volume = volume;
	if ((angles)&&(angles!="")) this.angles = angles.split(" ");
};

//******************************
// Notours Effects
//******************************
function NotoursEffects() {
	this.key = new Array("speaker", "vibrate");
	this.value = new Array(false, false);
};
NotoursEffects.prototype.setEffect = function(attr) {
	switch(attr) {
		case 'speaker':
			this.value[0] = true;
			break;
		case 'vibrate':
			this.value[1] = true;
			break;
	}
};
NotoursEffects.prototype.toString = function() {
	var string = '';
	var first = true;
	for (i=0; i<this.key.length; i++) {
		if((first)&&(this.value[i])) {
			string += this.key[i];
			first = false;
		} else if (this.value[i]) {
			string +=  ' '+ this.key[i];
		}
	}
	return string;
};

//******************************
// Notours Options
//******************************
function NotoursOptions() {
	this.keys;
	this.values;
};
NotoursOptions.prototype.initialize = function(k,v) {
	this.keys = k;
	this.values = v;
};