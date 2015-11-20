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
 
function load_to_tag(opts, createTag, callback) {
	$.post('../exec/read_2.php', {table:opts.table, query_key:opts.key, query_value:opts.value}, function(json) {
		if (typeof json.error == "undefined") {
			list = eval('json.data.notours_'+opts.table);
			$.each(list, function(i, entry){
				createTag('#'+opts.target, entry);
			});
			if(callback) callback();
		} else {
			//alert(json.msg);
		}
	}, "json");
};

function load_to_category_list(id, v) {
	$('#'+ id).append('<ul></ul>');
	load_to_tag({
		table: 'soundmanager_tag',
		key: 'group_id',
		value: v,
		target: id +' ul'
	}, function(target, entry){
		element = wrapper_tag_html_2({
			tag: 'li',
			content: entry.name,
			id: entry.name.replace(" ","_")
		});
		$(target).append(element);
	}, function(){
		$('#'+ id +' ul li').click(function(){
			$(this).toggleClass('selected');
		});
	});
};

function load_category_tags(id) {
	$('#list li ul li').each(function(){
		$(this).removeClass('selected');
	});
	$.post('../exec/read_2.php', {table:'soundmanager_relation', query_key:'sound_id', query_value:id}, function(json) {
		if (typeof json.error == "undefined") {
			list = eval('json.data.notours_soundmanager_relation');
			$.each(list, function(i, entry){
				$.post('../exec/read_2.php', {table:'soundmanager_tag', query_key:'id', query_value:entry.tag_id}, function(j) {
					if (typeof j.error == "undefined") {
						l = eval('j.data.notours_soundmanager_tag');
						$.each(l, function(u, e){
							//alert(e.name +" "+ e.group_id);
							$('#'+e.name.replace(" ","_")).toggleClass('selected');
						});
					} else {
						//alert(j.msg);
					}
				}, "json");
			});
		} else {
			//alert(json.msg);
		}
	}, "json");
};
			
function wrapper_tag_html_2(opts) {
	var html = '\n';
	if (typeof opts.tab == "undefined") opts.tab = '';
	html += opts.tab +'<'+ opts.tag;
	if (typeof opts.id != "undefined") html += ' id="'+ opts.id +'"';
	if (typeof opts.clss != "undefined") html += ' class="'+ opts.clss +'"';
	if (typeof opts.extra != "undefined") html += ' ' + opts.extra;
	html += '>\n';
	if (typeof opts.content != "undefined") html += opts.tab +'\t'+ opts.content+'\n';
	html += opts.tab +'</'+ opts.tag +'>';
	if (typeof opts.id != "undefined") {
		html += '<!-- '+ opts.id +' -->';
	} else if (typeof opts.clss != "undefined") {
		html += '<!-- '+ opts.clss +' -->';
	}
	html += '\n';
	return html;
};

function simple_tag_html_2(opts) {
	var html = '';
	html += '<'+ opts.tag;
	if (typeof opts.id != "undefined") html += ' id="'+ opts.id +'"';
	if (typeof opts.clss != "undefined") html += ' class="'+ opts.clss +'"';
	if (typeof opts.extra != "undefined") html += ' ' + opts.extra;
	html += '>';
	if (typeof opts.content != "undefined") html += opts.content;
	html += '</'+ opts.tag +'>';
	return html;
};

function init(opts) {
	load_to_tag({
		table: 'soundmanager_sound',
		target: 'dropbox .graphic',
	}, function(target, entry){
		element = wrapper_tag_html_2({
			tag: 'li',
			tab: '\t\t\t\t',
			content: simple_tag_html_2({
				tag: 'a',
				content: entry.name,
				extra: ' href="http://editor.notours.org/sound/ContinentRouge/'+ entry.name +'"',
				id: 'sound_'+ entry.id,
			})
		});
		
		$(target).append(element);
		$('#sound_'+ entry.id).data({ active: false, tagsLoaded: false, track: 'track_'+ entry.id, id: entry.id });
		
		// **Create the sound using SoundManager2**
		soundManager.createSound({
			// Give the sound an id and the SoundCloud stream url we created above.
			id: 'track_' + entry.id,
			url: 'http://editor.notours.org/sound/ContinentRouge/'+ entry.name,
			// On play & resume add a *playing* class to the main player div.
			// This will be used in the stylesheet to hide/show the play/pause buttons depending on state.
			onplay: function() {
			},
			onresume: function() {
			},
			onpause: function() {
			},
			onfinish: function() {
			},
			whileplaying: function() {
			}				
		});
	}, function(){
		
		/*
		$('#dropbox .graphic li a').each(function(index){
			$(this).data('active', false);
		});
		*/
		$('#dropbox .graphic li a').click(function(){
			
			// Create a track variable, grab the data from it, and find out if it's already playing *(set to active)*
			var active = $(this).data('active');
			var track = $(this).data('track');
			var tagsLoaded = $(this).data('tagsLoaded');
			var id = $(this).data('id');
			if (!tagsLoaded) {
				load_category_tags(id);
			}
			//alert(active +" "+ track);
			$('#dropbox .graphic li a').each(function(){
				$(this).data('active', false);	
				$(this).removeClass('sm2_paused');
			});
			if (active) {
				// If it is playing: pause it.
				soundManager.stop(track);
			} else {
				soundManager.play(track);
				$(this).data('active', true);
				$(this).addClass('sm2_paused');
			}
			
			
			/*
			playing = $track.is('.active');
			if (playing) {
				// If it is playing: pause it.
				soundManager.pause('track_' + data.id);				
			} else {
				// If it's not playing: stop all other sounds that might be playing and play the clicked sound.
				if ($track.siblings('li').hasClass('active')) {
					soundManager.stopAll();
				}
				soundManager.play('track_' + data.id);
				playingSound = data.id;
				var sMarker = eval('marker_'+ data.id);
				sMarker.showInfoWindow();
			}
			// Finally, toggle the *active* state of the clicked li and remove *active* from and other tracks.
			$track.toggleClass('active').siblings('li').removeClass('active');
							
					*/		
							
			return false;
		});
	});
	load_to_tag({
		table: 'soundmanager_group',
		target: 'list',
	}, function(target, entry){
		element = wrapper_tag_html_2({
			tag: 'li',
			content: entry.name,
			id: entry.name,
			clss: 'list'
		});
		$(target).append(element);
	}, function(){
		load_to_category_list('niveau', 1);
		load_to_category_list('catgorie', 2);
		load_to_category_list('sous-catgorie', 3);
		load_to_category_list('famille', 4);
	});
};