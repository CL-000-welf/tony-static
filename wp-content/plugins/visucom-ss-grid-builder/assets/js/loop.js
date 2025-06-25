(function ( $ ) {
	
	$.fn.load_more = function( options ) {
		
		var loading = true;
		var jwindow = $(window);
		var jcontent = $(this);
		var grid_selector = '#' + $(this).attr('id') + ' .gusta-grid';
		var load_more_button = $(this).find('.load-more-button');
		var query_vars = jcontent.data('query_vars');
		var items_per_page = jcontent.data('items');
		var card_design = jcontent.data('card_design');
		
        	var settings = $.extend({
			items_per_page: items_per_page,
			offset: 0,
			page: 1,
			tax_id: jcontent.data('tax'),
			load_more_style: 'load_more_button',
			load_more_text: 'Load More',
			load_more_icon: 'fa fa-circle-o-notch fa-spin fa-fw'
       		}, options );
		
		var load_loop = function(){ 
			$.ajax({
				type       : 'post',
				data       : {
					page: settings.page,
					items: settings.items_per_page,
					card_design: card_design, 
					grid_selector: grid_selector, 
					tax_id: settings.tax_id, 
					offset: settings.offset,
					query_vars: query_vars, 
					action: 'gusta_ajax_load_more'
				},
				dataType   : 'html',
				url        : loop.ajaxurl,
				beforeSend : function(){
					if (settings.load_more_style == 'load_more_button') {
						$('.gusta-no-results').html('').removeClass('gusta-show');
						var jlmid = load_more_button.attr('id');
						var jload_more_button = jQuery('#' + jlmid);
						jload_more_button.show();
						jload_more_button.html('<i class=\"' + settings.load_more_icon + '\"></i>');
						jload_more_button.addClass('loading');
					}
				},
				success    : function(response){
					if (response) {
						var jlmid = load_more_button.attr('id');
						var jload_more_button = jQuery('#' + jlmid);
						loading = false;
						var grid = document.querySelector(grid_selector);
						var results = response.slice(0,-1).split('<div class="post-listing-container"');
						var count = results.length;
						var newElements = new Array();
						var append = [];
						var item = [];
						
						$.each(results, function( index, value ) {
							if (index!=0) {
								append[index] = '<div class="post-listing-container"' + value;
								item[index] = document.createElement('div');
								newElements.push(item[index]);
							}
						});
						
						salvattore['append_elements'](grid, newElements);
						
						$.each(results, function( index, value ) {
							if (index!=0) {
								item[index].outerHTML = append[index];
							}
						});
						$('.post-listing-container').fadeIn('slow');
						$('body').element_cover();
						
						var found_posts = jcontent.find('.gusta-found-posts').html();
						jcontent.find('.gusta-found-posts').remove();
						
						if (((settings.items_per_page * settings.page) >= found_posts) || (found_posts===undefined)) {
							jload_more_button.hide();
						} else {
							jload_more_button.html(settings.load_more_text);
							jload_more_button.removeClass('loading');
						}
						$('.wpb_animate_when_almost_visible').addClass('wpb_start_animation');
						settings.page++;
						jcontent.attr('data-page', settings.page);
						if (found_posts===undefined) {
							$('.gusta-no-results').html('<h2>Sorry, no results were found.</h2> <p>Please refine your search.</p>').addClass('gusta-show');
						}
						grid_layout_init();
					} else {
						if (settings.load_more_style == 'load_more_button') {
							var jlmid = load_more_button.attr('id');
							var jload_more_button = jQuery('#' + jlmid);
							jload_more_button.hide();
						}
					}
				},
				error     : function(jqXHR, textStatus, errorThrown) {
					var jlmid = load_more_button.attr('id');
					var jload_more_button = jQuery('#' + jlmid);
					jload_more_button.hide();
					alert(jqXHR + ' :: ' + textStatus + ' :: ' + errorThrown);
				}
			});
		};
		
		if (settings.load_more_style=='scroll') {
			loading = false;
			jQuery(window).on('load scroll', function() {
				var jid = jcontent.attr('id');
				var jgrid = jQuery('#' + jid);
				var jcontent_height = jgrid.height();
				var jcontent_offset = jgrid.offset().top;
				var scroll_point = jcontent_offset + jcontent_height;
				if(!loading && (jwindow.scrollTop() +
					jwindow.height()) > scroll_point) {
						if (jcontent.length) {
							var post_listing = $(this).closest('.gusta-post-listing');
							var tax_id = post_listing.attr('data-tax');
							settings.tax_id = tax_id;
							settings.page = post_listing.attr('data-page');
							loading = true;
							load_loop();
						}
				}
			});
		}
		if (settings.load_more_style=='load_more_button') {
			jQuery(window).on('load', function() { 
				var jlmid = load_more_button.attr('id');
				var jload_more_button = jQuery('#' + jlmid);
				jload_more_button.on('click', function(){
					if (jcontent.length) {
						var post_listing = $(this).closest('.gusta-post-listing');
						var tax_id = post_listing.attr('data-tax');
						settings.tax_id = tax_id;
						settings.page = post_listing.attr('data-page');
						loading = true;
						load_loop();
					}
				});
			});
		}
		
		$(document).ready(function(){
			
			$('.gusta-post-filter ul li').on('click', function(){
				tax_id = '';
				$(this).closest('ul').find('li').removeClass('gusta-active');
				$(this).addClass('gusta-active');
				if ($(this).parent().hasClass('gusta-type-dropdown')) {
					var thisval = $(this).find('a').html();
					$(this).closest('.gusta-type-dropdown-container').find('.gusta-type-button').html(thisval + '<i class="fa fa-sort-down"></span>');
				}
				var post_listing_id = $(this).closest('.gusta-post-filter').attr('data-post-listing');
				if (post_listing_id != '') {
					var post_listing = $('#' + post_listing_id);
				} else {
					var post_listing = $('.gusta-post-listing').first(); 
				}
				post_listing.find('.gusta-grid .post-listing-container').remove();
				$('.gusta-post-filter ul li.gusta-active').each(function() {
					tax_id = tax_id + ',' + $(this).attr('id');
				});
				tax_id = tax_id.substring(1);
				post_listing.attr('data-tax', tax_id);
				settings.tax_id = tax_id;
				if (jcontent.length) {
					loading = true;
					settings.page = 1;
					post_listing.attr('data-page', settings.page);
					if (jcontent.attr('id') === post_listing.attr('id')) {
						load_loop();
					}
				}
			});
		});
		
	};
	
	function grid_layout_init() {
		$('.gusta-grid-layout').each(function() {
			var grids = $(this).find('.column').length;
			var items = $(this).find('.post-listing-container').length;
			var gridar = [];
			if (items>0) {
				var rows = Math.ceil(parseFloat(items / grids));
				for (i=1; i<=rows; i++) {
					var maxHeight=0;
					for (j=1; j<=grids; j++) {
						var griditem = $(this).find('.column:nth-child('+j+')').find('.post-listing-container:nth-child('+i+')');
						maxHeight = maxHeight > griditem.height() ? maxHeight : griditem.height();
					}
					gridar[i] = maxHeight;
				}
				for (i=1; i<=rows; i++) {
					$(this).find('.post-listing-container:nth-child('+i+')').height(gridar[i]);
				}
			}
		});		
	}
	
	$(document).ready(function(){
		
		grid_layout_init();
		
		$('.gusta-type-dropdown-container').on('click', function(e) {           
			$('.gusta-type-dropdown-container').not(this).removeClass('show-gusta-type-dropdown');
		        $('.gusta-type-dropdown-container').closest('.vc_row').removeClass('gusta-row-higher');
			$(this).toggleClass('show-gusta-type-dropdown');
			$(this).closest('.vc_row').addClass('gusta-row-higher');
		});
		
		$(document).on('click', function (e) {
		    if ($(e.target).closest(".show-gusta-type-dropdown").length === 0) {
		        $('.show-gusta-type-dropdown').removeClass('show-gusta-type-dropdown');
		        $('.gusta-type-dropdown-container').closest('.vc_row').removeClass('gusta-row-higher');
		    } else {
		    	$(this).toggleClass('show-gusta-type-dropdown');  
		    }
		});
	
		salvattore.recreateColumns(document.querySelector('.gusta-grid'));
		$('.gusta-grid').each(function() { $(this).closest('.vc_row').css('opacity', 1); });
	});
 
}( jQuery ));