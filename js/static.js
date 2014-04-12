var static_load_timestamp = new Date().getTime(),
static_parsersLoaded = false,
static_stuctureLoaded = false,
static_contentLoaded = false,
static_content = [];

$(function(){
	//Get the address of the site definition  from the querystring or use a default
	var siteDefinitionAddress = $.getUrlVar('sd');
	siteDefinitionAddress = (typeof siteDefinitionAddress === 'undefined') ? 'http://garemoko.github.io/static/static-example/static-example-sitedef.js' : siteDefinitionAddress;

	//Get the current page from the querystring or default to home
	var currentPage = $.getUrlVar('p');
	currentPage = (typeof currentPage === 'undefined') ? 'home' : currentPage;
	
	//load the site definition object and start the process of loading the page
	static_getSiteDefinition(siteDefinitionAddress, currentPage);
	
});

//TODO: class
function static_getSiteDefinition (siteDefinitionAddress, currentPage){
	
	//get the site definition
	$.getScript(siteDefinitionAddress, function() {
		var siteDefinition = static_returnedSiteDefinition;
		//load the page structure
		console.log('%c Static:', 'color:#a64802',' Getting site definition took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
		
		$('head').append('<link rel="stylesheet" href="' + siteDefinition.theme.css + '" type="text/css" />');
		
		//get the structure, content and parsers asynchronously
		static_loadStructure (siteDefinition,currentPage);
		static_loadContent (siteDefinition,currentPage);
		static_loadParsers (siteDefinition,currentPage, 0);
	});

	return true;
}

function static_loadStructure (siteDefinition,currentPage){
	
	//get the address of the page layout from the site definition and load it in. 
	$.get(siteDefinition.pages[currentPage].layout, function (data){
		//add the structure to the page
		$('.static-main:first').html(data);
		console.log('%c Static:', 'color:#a64802',' Loading page structure took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
		static_stuctureLoaded = true;
		//load the page content
		if (static_allLoaded()){
			render_content(siteDefinition,currentPage);
		}
	});
	return true;
};

function static_loadParsers (siteDefinition,currentPage,groupIndex){
	var function_counter = siteDefinition.pages[currentPage].parsers[groupIndex].length;
	//load each parser script
	$.each(siteDefinition.pages[currentPage].parsers[groupIndex], function(index,value){
		$.getScript(value, function(){
			function_counter--;
			//if this is the last parser to be got in this priority group...
			if (function_counter == 0)
			{
				console.log('%c Static:', 'color:#a64802',' Loading parser group ' + groupIndex + ' took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
				groupIndex++;
				if (groupIndex == siteDefinition.pages[currentPage].parsers.length){
					//proceed to load site content
					console.log('%c Static:', 'color:#a64802',' Loading all parsers took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
					static_parsersLoaded = true;
					if (static_allLoaded()){
						render_content(siteDefinition,currentPage);
					}
				}
				else { //load the next priority group
					static_loadParsers(siteDefinition,currentPage,groupIndex);
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

function static_loadContent (siteDefinition,currentPage){
	//for each static box
	var block_counter = siteDefinition.pages[currentPage].blocks.length;
	$.each(siteDefinition.pages[currentPage].blocks,function(index,block){
		$.get(block.content, function (data){
			static_content[index] = data;
			block_counter--;
			if (block_counter == 0){
				console.log('%c Static:', 'color:#a64802',' Loading content took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
				static_contentLoaded = true;
				if (static_allLoaded()){
					render_content(siteDefinition,currentPage);
				}
			}
		});
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

function render_content(siteDefinition,currentPage){
	//for each static box
	$('.static-box').each(function(index){
		boxid = $(this).attr('data-static-blockid');
		//call the correct parser to add the content
		window[siteDefinition.pages[currentPage].blocks[boxid].parser](static_content[index], $(this));

	});
	$.getScript(siteDefinition.theme.js, function(){
		$('.static-main').removeClass('hidden');
		console.log('%c Static:', 'color:#a64802', ' Loading took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
	});
	return true;
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

