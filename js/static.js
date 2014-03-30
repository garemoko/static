var static_load_timestamp = new Date().getTime();

$(function(){
	//Get the address of the site definition  from the querystring
	var siteDefinitionAddress = 'static-example/static-example-sitedef.json';
	
	//load the site definition object and start the process of loading the page
	static_getSiteDefinition(siteDefinitionAddress);
	
})

//TODO: class
function static_getSiteDefinition (siteDefinitionAddress){
	//get the site definition
	$.getJSON(siteDefinitionAddress, function(siteDefinition ) {
		//load the page structure
		 static_loadStructure (siteDefinition);
	})
	return true;
}

function static_loadStructure (siteDefinition){
	//get the current page from the querystring
	var currentPage ='home';
	//get the address of the page layout from the site definition and load it in. 
	$.get(siteDefinition.pages[currentPage].layout, function (data){
		//add the structure to the page
		$('.static-main:first').html(data);
		//load the page content
		static_loadParsers (siteDefinition,currentPage);
	});
	return true;
};

function static_loadParsers (siteDefinition,currentPage){
	var function_counter = siteDefinition.parsers.length;
	//load each parser script
	$.each(siteDefinition.parsers, function(index,value){
		$.getScript(value, function(){
			function_counter--;
			//if this is the last parser to be got...
			if (function_counter == 0)
			{
				//proceed to load site content
				static_loadContent (siteDefinition,currentPage);
			}
		})
	});
}

function static_loadContent (siteDefinition,currentPage){
	
	//for each static box
	$('.static-box').each(function(index){
		boxid = $(this).attr('data-static-boxid');
		//call the correct parser to add the content
		window[siteDefinition.pages[currentPage].blocks[boxid].parser](siteDefinition.pages[currentPage].blocks[boxid].content, $(this));
	});

	console.log('Static: Loading took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
	return true;
};