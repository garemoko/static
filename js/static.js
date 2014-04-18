//Globals
var static_load_timestamp = new Date().getTime(),
static_parsersLoaded = false,
static_stuctureLoaded = false,
static_contentLoaded = false,
static_content = [],
static_siteDefinitionAddress,
static_siteDefinition,
static_currentPage;
//End Globals

$(function(){
	//Get the address of the site definition  from the querystring or use a default
	static_siteDefinitionAddress = $.getUrlVar('sd');
	static_siteDefinitionAddress = (typeof static_siteDefinitionAddress === 'undefined') ? 'https://googledrive.com/host/0B9fyoDEGTP0NV29BZWhQMDVHX00' : static_siteDefinitionAddress;
	
	//Get the current page from the querystring or default to home
	static_currentPage = $.getUrlVar('p');
	static_currentPage = (typeof static_currentPage === 'undefined') ? 'home' : static_currentPage;
	//load the site definition object and start the process of loading the page
	static_getstatic_siteDefinition(static_siteDefinitionAddress, static_currentPage);
	
});

//TODO: class
function static_getstatic_siteDefinition (static_siteDefinitionAddress, static_currentPage){
	
	//get the site definition
	$.getScript(static_siteDefinitionAddress + '/site-def.js', function() {
		
		//replace [root] with the site defintiion directory throughout. It's simpliest to convert the object to a string and back in order to achieve this. 
		static_siteDefinition = JSON.parse(JSON.stringify(static_returnedSiteDefinition).replace(/\[root\]/g, static_siteDefinitionAddress));

		//load the page structure
		console.log('%c Static:', 'color:#a64802',' Getting site definition took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
		
		$('head').append('<link rel="stylesheet" href="' + static_siteDefinition.theme.css + '" type="text/css" />');
		
		//TODO: add page titles to site def
		$('head').append('<title>' + static_siteDefinition.title + ' - ' + static_currentPage + '</title>');
		
		//get the structure, content, nav and parsers asynchronously

		static_renderStructure ();
		static_loadContent ();
		static_loadParsers (0);
		if (static_siteDefinition.hasOwnProperty('navigation')){
			static_renderNav (static_siteDefinition,static_currentPage);
		}
	});

	return true;
}

function static_renderStructure (){
	var widthCounter = 0; 
	//add the first row
	$('.static-main:first').append('<div class="row"></div>');
	
	//add each block to the page
	$.each(static_siteDefinition.pages[static_currentPage].blocks, function(index,blockObj){
		
		//create block object
		var blockHtml = $('<div class="static-block"></div>');
		//set the index
		blockHtml.attr('data-static-blockid', index);
		//add any classes e.g. jumbotron 
		if (blockObj.hasOwnProperty('classes')){
			blockHtml.addClass(blockObj.classes);
		}
		//add bootstrap width
		if (!blockObj.hasOwnProperty('width')){
			blockObj.width = 4;
		} 
		blockHtml.addClass('col-md-' + blockObj.width);
		
		widthCounter += blockObj.width;
		if (widthCounter > 12) {
			//add a new row
			$('.static-main:first').append('<div class="row"></div>');
			widthCounter = blockObj.width;
		}
		
		//add the block to the bottom row		
		$('.row:last').append(blockHtml);
	});
	console.log()
	static_stuctureLoaded = true;
	console.log('%c Static:', 'color:#a64802',' Render structure took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
	//load the page content
	if (static_allLoaded()){
		static_renderContent();
	}

	return true;
}; 

function static_loadParsers (groupIndex){
	var function_counter = static_siteDefinition.pages[static_currentPage].parsers[groupIndex].length;
	//load each parser script
	$.each(static_siteDefinition.pages[static_currentPage].parsers[groupIndex], function(index,value){
		$.getScript(value, function(){
			function_counter--;
			//if this is the last parser to be got in this priority group...
			if (function_counter == 0)
			{
				console.log('%c Static:', 'color:#a64802',' Loading parser group ' + groupIndex + ' took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
				groupIndex++;
				if (groupIndex == static_siteDefinition.pages[static_currentPage].parsers.length){
					//proceed to load site content
					console.log('%c Static:', 'color:#a64802',' Loading all parsers took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
					static_parsersLoaded = true;
					if (static_allLoaded()){
						static_renderContent();
					}
				}
				else { //load the next priority group
					static_loadParsers(groupIndex);
				}
			}
		}).fail(function(){
		    if(arguments[0].readyState==0){
		        console.log('fail');
		    }else{
		        //script loaded but failed to parse
		       console.log(arguments[2].toString());
		    }
		});
	});
}

function static_loadContent (){
	//for each static box
	var block_counter = static_siteDefinition.pages[static_currentPage].blocks.length;
	$.each(static_siteDefinition.pages[static_currentPage].blocks,function(index,block){
		$.get(block.content, function (data){
			static_content[index] = data;
		}).fail(function() {
		    static_content[index] = '';
		}).always(function() {
			block_counter--;
			if (block_counter == 0){
				console.log('%c Static:', 'color:#a64802',' Loading content took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
				static_contentLoaded = true;
				if (static_allLoaded()){
					static_renderContent();
				}
			}
		});;
	});
	return true;
}




function static_allLoaded()
{
	if (static_parsersLoaded && static_stuctureLoaded && static_contentLoaded){
		return true;
	} else {
		return false;
	}
}

function static_renderNav (){
	
	if (static_siteDefinition.navigation.hasOwnProperty('brand')){
		$('.navbar-header').append(static_buildNavLink(static_siteDefinition.navigation.brand).addClass('navbar-brand'));
	}
	
	static_appendNav('left', static_siteDefinition, '#navbar-collapse-1');
	static_appendNav('right', static_siteDefinition, '#navbar-collapse-1');
	
	var currentURL = window.location.href;
	$('#main-nav a').each(function(index){
		if (currentURL.indexOf($(this).attr('data-static-page')) != -1){
			$(this).parent().addClass('active');
		}
	});
}

function static_appendNav (type, static_siteDefinition, target){
	if (static_siteDefinition.navigation.hasOwnProperty(type)){
		$(target).append(static_buildNav (type, static_siteDefinition.navigation[type]));
	}	
}

function static_buildNav (type, navObj){
	var navHtml = $('<ul class="nav navbar-nav navbar-' + type + '"></ul>');
	$.each(navObj, function(index,linkObj){
		var liHtml = $('<li></li>').append(static_buildNavLink(linkObj));
		navHtml.append(liHtml);
	});
	return navHtml;
}

function static_buildNavLink (linkObj){
	var linkHtml = $('<a></a>');
	if (linkObj.hasOwnProperty('page')){
		linkHtml.click(function(){
			static_changePage(linkObj.page);
		});
		linkHtml.attr('data-static-page', linkObj.page)
	}
	else
	{
		linkHtml.attr('data-static-page', '')
	}
	
	if (linkObj.hasOwnProperty('glyph')){
		linkHtml.append('<span class="glyphicon glyphicon-' + linkObj.glyph + '"></span> ');
	};
	
	if (linkObj.hasOwnProperty('title')){
		linkHtml.append(linkObj.title);
	};
	
	return linkHtml;
}

function static_renderContent(){

	//for each static box
	$('.static-block').each(function(index){
		console.log ('block found: ' + index);
		boxid = $(this).attr('data-static-blockid');
		//call the correct parser to add the content (if defined in the sitedef)
		if (typeof static_siteDefinition.pages[static_currentPage].blocks[boxid] !== 'undefined' && typeof static_siteDefinition.pages[static_currentPage].blocks[boxid].parser !== 'undefined'){
			window[static_siteDefinition.pages[static_currentPage].blocks[boxid].parser](static_content[index], $(this));
		} else {
			$(this).addClass('hidden');
		}
	});
	

	
	$.getScript(static_siteDefinition.theme.js, function(){
		$('body').removeClass('hidden');
		console.log('%c Static:', 'color:#a64802', ' Loading took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
	});
	return true;
}

function static_changePage(page){
	static_load_timestamp = new Date().getTime();
	console.log('%c Static page change:', 'color:#48a602', page);
	
	static_currentPage = page; 
	
	//get the structure, content, nav and parsers asynchronously
	static_renderStructure();
	static_loadContent ();
	//TODO: only load parsers if not already loaded
	static_loadParsers (0);
}


$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

