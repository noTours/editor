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
 * http://vhplab.net/editor/inc/js/noTours-gmaps.js
 * 
 * enjoy the code and drop me a line for comments and questions!
 * dev@escoitar.org
 *
 */
 
function geoLocate() {
	// Try W3C Geolocation method (Preferred)
	if(navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			var zoom = noTours.map.getZoom() + 10;
			initialLocation = new google.maps.LatLng(latitude, longitude);
			noTours.map.setCenter(initialLocation);
			noTours.map.setZoom(noTours.map.getZoom() + 10);
			var prj = $(".project").attr('id');
			var id = prj.slice(8);
			$("#update_"+ prj +" fieldset .update_location").empty();
			$("#update_"+ prj +" fieldset .update_location").append(hidden_imput_html("lat", id, round(latitude, 10)) +" "+ hidden_imput_html("lonx", id, round(longitude, 10)) +" "+ hidden_imput_html("zoom", id, zoom));
    		$("#"+ prj +" .wrap_edit_location .value_box .value[name='lat_project_"+ id +"']").text(round(latitude, 4));
    		$("#"+ prj +" .wrap_edit_location .value_box .value[name='lonx_project_"+ id +"']").text(round(longitude, 4));
    		$("#"+ prj +" .wrap_edit_location .value_box .value[name='zoom_project_"+ id +"']").text(zoom);
    		$("#"+ prj +" .wrap_edit_location .value_box .value").attr("class","value new");
			eval(prj +".change();");
			eval(prj +".saved = false;");
		}, function() {
			handleNoGeolocation(browserSupportFlag);
		});
	// Try Google Gears Geolocation
	} else if (google.gears) {
		browserSupportFlag = true;
		var geo = google.gears.factory.create('beta.geolocation');
		geo.getCurrentPosition(function(position) {
			initialLocation = new google.maps.LatLng(position.latitude,position.longitude);
			noTours.map.setCenter(initialLocation);
		}, function() {
			handleNoGeolocation(browserSupportFlag);
		});
	// Browser doesn't support Geolocation
	} else {
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}
};
function handleNoGeolocation(errorFlag) {
	var contentString;
	initialLocation = new google.maps.LatLng(48.13, 7.44);
	noTours.map.setCenter(initialLocation);
	if (errorFlag == true) {
		contentString = "Error: The Geolocation service failed.";
	} else {
		contentString = "Error: Your browser doesn't support geolocation.";
	}
	alert(contentString);
};
function codeAddress(address) {
	geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			noTours.miniMap.setCenter(results[0].geometry.location);
			noTours.map.setCenter(results[0].geometry.location);
			var latitude = results[0].geometry.location.lat();
			var longitude = results[0].geometry.location.lng();
			var zoom = noTours.map.getZoom();
			if (zoom==4) zoom += 10;
			noTours.map.setZoom(zoom);
			var prj = $(".project").attr('id');
			var id = prj.slice(8);
			$("#update_"+ prj +" fieldset .update_location").empty();
			$("#update_"+ prj +" fieldset .update_location").append(hidden_imput_html("lat", id, round(latitude, 10)) +" "+ hidden_imput_html("lonx", id, round(longitude, 10)) +" "+ hidden_imput_html("zoom", id, zoom));
    		$("#"+ prj +" .wrap_edit_location .value_box .value[name='lat_project_"+ id +"']").text(round(latitude, 4));
    		$("#"+ prj +" .wrap_edit_location .value_box .value[name='lonx_project_"+ id +"']").text(round(longitude, 4));
    		$("#"+ prj +" .wrap_edit_location .value_box .value[name='zoom_project_"+ id +"']").text(zoom);
    		$("#"+ prj +" .wrap_edit_location .value_box .value").attr("class","value new");
			eval(prj +".change();");
			eval(prj +".saved = false;");
		
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
};
function distance(lat1,lon1,lat2,lon2) {
	var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180; 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
		Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c *1000;
	return d;
};
function angle(lat1,lon1,lat2,lon2) {
	var co = distance(lat1,lon1,lat2,lon1);
	if(lat1>=lat2) {
		co = co*(-1);
	}
	var cc = distance(lat1,lon1,lat1,lon2);
	if(lon2>=lon1) {
		cc = cc*(-1);
	}
	var a = Math.atan2(cc, co);
	var b = Math.atan2(cc*(-1), co*(-1));
	return Array(a,b);
};
function circ(d, lat1, lng1, a) {
	var tc = (Math.PI/180)*a;
	var y = Math.asin(Math.sin(lat1)*Math.cos(d)+Math.cos(lat1)*Math.sin(d)*Math.cos(tc));
	var dlng = Math.atan2(Math.sin(tc)*Math.sin(d)*Math.cos(lat1),Math.cos(d)-Math.sin(lat1)*Math.sin(y));
	var x = ((lng1-dlng+Math.PI) % (2*Math.PI)) - Math.PI ; // MOD function
	point = new google.maps.LatLng(parseFloat(y*(180/Math.PI)),parseFloat(x*(180/Math.PI)));
	return point;
};
function parseCen(a) {
	if (a<=0) {
		var cen = 360-(a*(-1)*180/Math.PI);
	} else {
		var cen = a*180/Math.PI;
	}
	return cen;
};
function parseRad(a) {
	if (a<=180) {
		var rad = a*Math.PI*(-1)/180;
	} else {
		var rad = Math.PI-((a-180)*Math.PI/180);
	}
	return rad;
};

function addKmlControl(map) {
	var controlDiv = document.createElement('DIV');
	controlDiv.style.padding = '5px';
	controlDiv.index = -1;
	var controlUI = document.createElement('div');
	controlDiv.style.cursor = 'pointer';
	controlUI.setAttribute("id", "KmlControl");
	controlDiv.appendChild(controlUI);
	var controlImg = document.createElement('IMG');
	controlImg.src = noTours.root  + "inc/img/icon/kml.png";
	controlImg.title = noTours.write.use_kml_title;
	controlUI.appendChild(controlImg);
	google.maps.event.addDomListener(controlUI, 'click', function() {
		if (noTours.editing) {
			noTours.showFloatingBox(kml_form_html(),'');
		} else {
			noTours.showFloatingBox(kml_alert_html(),'');
		}
	});
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
};
function addLevelControl(map) {
	var controlDiv = document.createElement('DIV');
	controlDiv.style.margin = '8px';
	controlDiv.style.padding = '2px';
	controlDiv.index = -2;
	var controlUI = document.createElement('div');
	controlUI.setAttribute("id", "LevelControl");
	controlUI.style.background = '#fff';
	controlDiv.appendChild(controlUI);
	/*
	google.maps.event.addDomListener(controlUI, 'click', function() {
		var prj = eval($('.project').attr('id'));
		prj.hideCircles();
	});
	*/
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
};

SoundDragControl = function() {
	//general
	this.type = 'soundpoint';
	this.target;
	this.alpha = 0.4;
	this.self;
	// center
	this.center = new dragControl();
	// circle
	this.radius;
	this.circle;
	this.radiusPoint = new dragControl();
	this.colors = new Array("#fb61ff", "#e813e1", "#7790f8", "#334ae0", "#ffb761", "#fb9600", "#b2e785", "#7aca46", "#f47a81", "#db3838", "#5ec2d1", "#1e9db9", "#fff167", "#f0da09", "#9aad52", "#6b8916", "#a956f5", "#7309c2", "#a2dcf4", "#5aaad4", "#c19c63", "#9e6d25");
	// soundscape
	this.angles = Array();
	this.twister = new transparentDragControl();
	this.puller1 = new transparentDragControl();
	this.puller2 = new transparentDragControl();
	this.puller3 = new transparentDragControl();
	this.path = Array();
	this.shape;
	this.one = new mapMarker();
	this.two = new mapMarker();
	this.three = new mapMarker();
	this.four = new mapMarker();
};
SoundDragControl.prototype.initialize = function(map, target, clat, clong, rad, type, angles) {
	this.self = this;
	if (type!="") {
		this.type = type;
	}
	this.target = target;
	// center
	var point = new google.maps.LatLng(clat, clong);
	this.center.initialize(point, 'microfone', 'microfone-shadow', 20, 32, 10, 32);
	this.center.dragMarker.setOptions({
        raiseOnDrag: true
	});
	// circle
	this.radius = rad;
	this.circle = new google.maps.Circle({
    	center: this.center.point,
    	map: noTours.map,
    	fillColor: "#e813e1",
    	fillOpacity: this.alpha,
    	radius: this.radius,
    	strokeColor: "#e813a9",
    	strokeOpacity: 0.8,
    	strokeWeight: 1,
    	zIndex: 0,
    });
	var bounds = this.circle.getBounds();
    var southWest = bounds.getSouthWest();
	var point = new google.maps.LatLng(this.center.point.lat(), southWest.lng());
	this.radiusPoint.initialize(point, 'circle', 'circle-shadow', 19, 19, 10, 10);
	// soundscape
	if ((typeof angles == "object")&&(angles.length==4)) {
		this.angles = angles;
	} else {
		this.angles = Array(0,90,180,270);
	}
	this.setPath();
	this.shape = new google.maps.Polygon({
		paths: this.path,
		fillColor: "#e813e1",
		fillOpacity: this.alpha,
		map: noTours.map,
        visible: false,
		strokeColor: "#e813a9",
		strokeOpacity: 0.8,
		strokeWeight: 1,
		zIndex: 0
	});
	this.twister.initialize(this.circlePoint(this.angles[0]), 'circle-small-p');
	this.puller1.initialize(this.circlePoint(this.angles[1]), 'circle-small-p');
	this.puller2.initialize(this.circlePoint(this.angles[2]), 'circle-small-p');
	this.puller3.initialize(this.circlePoint(this.angles[3]), 'circle-small-p');
	this.one.initialize(this.insidePoint(this.angles[0],this.angles[1]), 'N1p');
	this.two.initialize(this.insidePoint(this.angles[1],this.angles[2]), 'N2p');
	this.three.initialize(this.insidePoint(this.angles[2],this.angles[3]), 'N3p');
	this.four.initialize(this.insidePoint(this.angles[3],this.angles[0]+360), 'N4p');
	$("#history").append('this.Gcircle = new NotoursSoundpoint();<br />this.Gcircle.initialize('+ map +', '+ target +', '+ clat +', '+ clong +', '+ rad +', '+ type +', '+ angles +')<br />');	
	// listeners
	var self = this.self;
	google.maps.event.addListener(this.center.dragMarker, 'dragstart', function() {
    	if (self.type=='soundscape') {
    		self.hideArc();
    	}
    });
    google.maps.event.addListener(this.center.dragMarker, 'drag', function() {
    	self.moveCircle();
    	eval('object_'+ self.target +'.geodata();');
    });
	google.maps.event.addListener(this.center.dragMarker, 'dragend', function() {
    	eval('object_'+ self.target +'.geodataHidden();');
		self.drawArc();
    	if (self.type=='soundscape') {
    		self.showArc();
    	}
    });
    google.maps.event.addListener(this.radiusPoint.dragMarker, 'dragstart', function() {
    	if (self.type=='soundscape') {
    		self.hideArc();
    	}
    });
	google.maps.event.addListener(this.radiusPoint.dragMarker, 'drag', function() {
    	self.transformCircle();
    	eval('object_'+ self.target +'.geodata();');
    });
	google.maps.event.addListener(this.radiusPoint.dragMarker, 'dragend', function() {
    	eval('object_'+ self.target +'.geodataHidden();');
		self.drawArc();
    	if (self.type=='soundscape') {
    		self.showArc();
    	}
    });
    google.maps.event.addListener(this.circle, 'mouseover', function() {
    	eval('object_'+ self.target +'.mapMouseover();');
    });
	google.maps.event.addListener(this.circle, 'mouseout', function() {
    	eval('object_'+ self.target +'.mapMouseout();');
    });
    google.maps.event.addListener(this.circle, 'click', function() {
    	eval('object_'+ self.target +'.toggle();');
    });
    google.maps.event.addListener(this.circle, 'dblclick', function() {
    	eval('object_'+ self.target +'.dragstart();');
    	eval('object_'+ self.target +'.show();');
    });
    google.maps.event.addListener(this.shape, 'mouseover', function() {
    	eval('object_'+ self.target +'.mapMouseover();');
    });
	google.maps.event.addListener(this.shape, 'mouseout', function() {
    	eval('object_'+ self.target +'.mapMouseout();');
    });
    google.maps.event.addListener(this.shape, 'click', function() {
    	eval('object_'+ self.target +'.toggle();');
    });
    google.maps.event.addListener(this.shape, 'dblclick', function() {
    	eval('object_'+ self.target +'.dragstart();');
    	eval('object_'+ self.target +'.show();');
    });
    google.maps.event.addListener(this.puller1.dragMarker, 'drag', function() {
		self.pull(this.getPosition(), 1);
	});
	 google.maps.event.addListener(this.puller2.dragMarker, 'drag', function() {
		self.pull(this.getPosition(), 2);
	});
	 google.maps.event.addListener(this.puller3.dragMarker, 'drag', function() {
		self.pull(this.getPosition(), 3);
	});
	google.maps.event.addListener(this.twister.dragMarker, 'drag', function() {
		self.pull(this.getPosition(), 0);
	});
	// visibility
	this.hideArc();
	this.hideDrag();
};
SoundDragControl.prototype.moveCircle = function() {
	var difLat = this.radiusPoint.point.lat() - this.center.point.lat();
	var difLng = this.radiusPoint.point.lng() - this.center.point.lng();
	this.center.point = this.center.dragMarker.getPosition();
	this.radiusPoint.point = new google.maps.LatLng(difLat + this.center.point.lat(), difLng + this.center.point.lng());
	this.radiusPoint.dragMarker.setPosition(this.radiusPoint.point);
	this.circle.setCenter(this.center.point);
};
SoundDragControl.prototype.transformCircle = function() {
	this.radiusPoint.point = this.radiusPoint.dragMarker.getPosition();
	this.radius = distance(this.center.point.lat(), this.center.point.lng(), this.radiusPoint.point.lat(), this.radiusPoint.point.lng());
	this.circle.setRadius(this.radius);
};
SoundDragControl.prototype.set = function() {
	this.center.set();
	this.radiusPoint.set();
	this.circle.setMap(noTours.map);
	this.twister.set();
	this.puller1.set();
	this.puller2.set();
	this.puller3.set();
	this.one.set();
	this.two.set();
	this.three.set();
	this.four.set();
	if(this.type=="soundscape") {
		this.showArc();
	}
};
SoundDragControl.prototype.unset = function() {
	this.center.unset();
	this.radiusPoint.unset();
	this.circle.setMap(null);
	this.shape.setMap(null);
	this.twister.unset();
	this.puller1.unset();
	this.puller2.unset();
	this.puller3.unset();
	this.one.unset();
	this.two.unset();
	this.three.unset();
	this.four.unset();
};
SoundDragControl.prototype.setPath = function() {
	this.path = Array();
	var d = this.radius/6378800;	// circle radius / meters of Earth radius = radians
	var lat1 = (Math.PI/180)* this.center.point.lat(); // radians
	var lng1 = (Math.PI/180)* this.center.point.lng(); // radians
	this.path.push(this.center.point);
	for (var a=this.angles[0]; a<this.angles[1]; a+=2) {
		var point = circ(d, lat1, lng1, a);
		this.path.push(point);
	}
	var point = circ(d, lat1, lng1, this.angles[1]);
	this.path.push(point);
	this.path.push(this.center.point);
	for (var a=this.angles[2]; a<this.angles[3]; a+=2) {
		var point = circ(d, lat1, lng1, a);
		this.path.push(point);
	}
	var point = circ(d, lat1, lng1, this.angles[3]);
	this.path.push(point);
	this.path.push(this.center.point);
};
SoundDragControl.prototype.circlePoint = function(angle) {
	var d = this.radius/6378800;	// circle radius / meters of Earth radius = radians
	var lat1 = (Math.PI/180)* this.center.point.lat(); // radians
	var lng1 = (Math.PI/180)* this.center.point.lng(); // radians
	var point = circ(d, lat1, lng1, angle);
	return point;
};
SoundDragControl.prototype.insidePoint = function(a, b) {
	var d = this.radius/(6378800*2);	// circle radius / meters of Earth radius = radians
	var lat1 = (Math.PI/180)* this.center.point.lat(); // radians
	var lng1 = (Math.PI/180)* this.center.point.lng(); // radians
	var angle = a + (b - a)/2;
	var point = circ(d, lat1, lng1, angle);
	return point;
};
SoundDragControl.prototype.drawArc = function() {
	this.setPath();
	this.shape.setPath(this.path);
	this.twister.setPosition(this.circlePoint(this.angles[0]));
	this.puller1.setPosition(this.circlePoint(this.angles[1]));
	this.puller2.setPosition(this.circlePoint(this.angles[2]));
	this.puller3.setPosition(this.circlePoint(this.angles[3]));
	this.one.setPosition(this.insidePoint(this.angles[0],this.angles[1]));
	this.two.setPosition(this.insidePoint(this.angles[1],this.angles[2]));
	this.three.setPosition(this.insidePoint(this.angles[2],this.angles[3]));
	this.four.setPosition(this.insidePoint(this.angles[3],this.angles[0]+360));
};
SoundDragControl.prototype.hideArc = function() {
	this.shape.setMap(null);
	this.twister.hide();
	this.puller1.hide();
	this.puller2.hide();
	this.puller3.hide();
	this.one.hide();
	this.two.hide();
	this.three.hide();
	this.four.hide();
};
SoundDragControl.prototype.showArc = function() {
	this.shape.setMap(noTours.map);
	this.twister.show();
	this.puller1.show();
	this.puller2.show();
	this.puller3.show();
	this.one.show();
	this.two.show();
	this.three.show();
	this.four.show();
};
SoundDragControl.prototype.hideDrag = function() {
	this.center.hide();
	this.radiusPoint.hide();
};
SoundDragControl.prototype.showDrag = function() {
	this.center.show();
	this.radiusPoint.show();
};
SoundDragControl.prototype.twist = function(pos) {
	var a = angle(this.center.point.lat(), this.center.point.lng(), pos.lat(), pos.lng());
	var b = parseCen(a[0]);
	var dif1 = this.angles[1] - this.angles[0];
	var dif2 = this.angles[2] - this.angles[1];
	var dif3 = this.angles[3] - this.angles[2];
	if (b+dif1+dif2+dif3<=360) {
		this.angles[0] = b;
		this.angles[1] = this.angles[0] + dif1;
		this.angles[2] = this.angles[1] + dif2;
		this.angles[3] = this.angles[2] + dif3;
		this.drawArc();
	}
	eval('object_'+ this.target +'.angles();');
};
SoundDragControl.prototype.pull = function(pos,num) {
	var a = angle(this.center.point.lat(), this.center.point.lng(), pos.lat(), pos.lng());
	var b = parseCen(a[0]);
	if (num==0) {
		var prev = 0;
		if (this.angles[3]>340) prev = this.angles[3]%340;
		var next = this.angles[num+1] -20;
	} else if (num==3) {
		var prev = this.angles[num-1] + 20;
		var next = 360;
		if (this.angles[0]<20) next -= (20 - this.angles[0]);
	} else {
		var prev = this.angles[num-1] + 20;
		var next = this.angles[num+1] -20;
	}
	if ((b>=prev)&&(b<=next)) {
		this.angles[num] = b;
		this.drawArc();
	}
	eval('object_'+ this.target +'.angles();');
};
SoundDragControl.prototype.levelColor = function(l) {
	var colors = this.colors.length/2;
	var ncolor = (l%colors)*2;
	this.circle.setOptions({fillColor: this.colors[ncolor], strokeColor: this.colors[ncolor+1]})
};

dragControl = function() {
	// internal
	this.self;
	//points
	this.point;
	// icons
	this.icon;
	this.shadow;
	// markers
	this.dragMarker;
};
dragControl.prototype.initialize = function(point, icon, shadow, a, b, c, d) {
	// internal
	this.self = this;
	//points
	this.point = point;
	// icons
	/*this.icon = new google.maps.MarkerImage(
		noTours.root +'inc/img/icon/'+ icon +'.png',
		new google.maps.Size(a, b),
		new google.maps.Point(0, 0),
		new google.maps.Point(c, d)
	);*/
	this.icon = {
		url: noTours.root +'inc/img/icon/'+ icon +'.png',
		size: google.maps.Size(a, b),
		origin: google.maps.Point(0, 0),
		anchor: google.maps.Point(c, d)
	};
	/*this.shadow = new google.maps.MarkerImage(
		noTours.root +'inc/img/icon/'+ shadow +'.png',
		new google.maps.Size(a, b),
		new google.maps.Point(0, 0),
		new google.maps.Point(c, d)
	);*/
	this.shadow = {
		url: noTours.root +'inc/img/icon/'+ shadow +'.png',
		size: google.maps.Size(a, b),
		origin: google.maps.Point(0, 0),
		anchor: google.maps.Point(c, d)
	};
	// markers
	this.dragMarker = new google.maps.Marker({
	 	position: this.point,
        map: noTours.map,
        zIndex: 2,
        shadow: this.shadow,
        icon: this.icon,
        draggable: true,
        raiseOnDrag: false,
	});
};
dragControl.prototype.set = function() {
	this.dragMarker.setMap(noTours.map);
};
dragControl.prototype.unset = function() {
	this.dragMarker.setMap(null);
};
dragControl.prototype.show = function() {
	this.dragMarker.setVisible(true);
};
dragControl.prototype.hide = function() {
	this.dragMarker.setVisible(false);
};
dragControl.prototype.setPosition = function(point) {
	this.point = point;
	this.dragMarker.setPosition(this.point);
};

transparentDragControl = function() {
	// internal
	this.self;
	this.drag = false;
	//points
	this.point;
	// icons
	this.icon;
	this.transparent;
	// markers
	this.marker;
	this.dragMarker;
};
transparentDragControl.prototype.initialize = function(point, icon) {
	// internal
	this.self = this;
	//points
	this.point = point;
	// icons
	/*this.icon = new google.maps.MarkerImage(
		noTours.root +'inc/img/icon/'+ icon +'.png',
		new google.maps.Size(20, 20),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 10)
	);*/
	this.icon = {
		url: noTours.root +'inc/img/icon/'+ icon +'.png',
		size: google.maps.Size(20, 20),
		origin: google.maps.Point(0, 0),
		anchor: google.maps.Point(10, 10)
	};
	/*this.transparent = new google.maps.MarkerImage(
		noTours.root +'inc/img/icon/circle-transparent.png',
		new google.maps.Size(20, 20),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 10)
	);*/
	this.transparent = {
		url: noTours.root +'inc/img/icon/circle-transparent.png',
		size: google.maps.Size(20, 20),
		origin: google.maps.Point(0, 0),
		anchor: google.maps.Point(10, 10)
	};
	// markers
	this.marker = new google.maps.Marker({
		position: this.point,
		map: noTours.map,
		zIndex: 0,
		flat: true,
		icon: this.icon,
		draggable: false,
	});
	this.dragMarker = new google.maps.Marker({
		position: this.point,
		map: noTours.map,
		zIndex: 1,
		flat: true,
		icon: this.transparent,
		draggable: true,
		raiseOnDrag: false,
	});
	// listeners
	var self = this.self;
	google.maps.event.addListener(this.dragMarker, 'dragstart', function() {
		self.drag = true;
	});
	google.maps.event.addListener(this.dragMarker, 'dragend', function() {
		this.setPosition(self.point);
		self.drag = false;
	});
};
transparentDragControl.prototype.set = function() {
	this.marker.setMap(noTours.map);
	this.dragMarker.setMap(noTours.map);
};
transparentDragControl.prototype.unset = function() {
	this.marker.setMap(null);
	this.dragMarker.setMap(null);
};
transparentDragControl.prototype.show = function() {
	this.marker.setVisible(true);
	this.dragMarker.setVisible(true);
};
transparentDragControl.prototype.hide = function() {
	this.marker.setVisible(false);
	this.dragMarker.setVisible(false);
};
transparentDragControl.prototype.setPosition = function(point) {
	this.point = point;
	if (!this.drag) {
		this.dragMarker.setPosition(this.point);
	}
	this.marker.setPosition(this.point);
};

mapMarker = function() {
	// internal
	this.self;
	// point
	this.point;
	// icon
	this.icon;
	// marker
	this.marker;
};
mapMarker.prototype.initialize = function(point, icon) {
	// internal
	this.self = this;
	// point
	this.point = point;
	// icon
	/*this.icon = new google.maps.MarkerImage(
		noTours.root +'inc/img/icon/'+ icon +'.png',	// src.
		new google.maps.Size(19, 19),					// wide - tall.
		new google.maps.Point(0, 0),					// origin.
		new google.maps.Point(10, 10)					// anchor.
	);*/
	this.icon = {
		url: noTours.root +'inc/img/icon/'+ icon +'.png',	// src.
		size: new google.maps.Size(19, 19),					// wide - tall.
		origin: new google.maps.Point(0, 0),					// origin.
		anchor: new google.maps.Point(10, 10)					// anchor.
	};
	// marker
	this.marker = new google.maps.Marker({
		position: this.point,
		map: noTours.map,
		zIndex: 0,
		flat: true,
		icon: this.icon,
		draggable: false,
	});
};
mapMarker.prototype.set = function() {
	this.marker.setMap(noTours.map);
};
mapMarker.prototype.unset = function() {
	this.marker.setMap(null);
};
mapMarker.prototype.show = function() {
	this.marker.setVisible(true);
};
mapMarker.prototype.hide = function() {
	this.marker.setVisible(false);
};
mapMarker.prototype.setPosition = function(point) {
	this.point = point;
	this.marker.setPosition(this.point);
};