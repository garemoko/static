var static_load_timestamp = new Date().getTime();

$(function(){
	//TODO: Get the address of the site definition  from the querystring
	var siteDefinitionAddress = 'static-example/static-example-sitedef.json';
	
	//load the site definition object and start the process of loading the page
	static_getSiteDefinition(siteDefinitionAddress);
	
});

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
	//TODO: get the current page from the querystring
	var currentPage ='home';
	//get the address of the page layout from the site definition and load it in. 
	$.get(siteDefinition.pages[currentPage].layout, function (data){
		//add the structure to the page
		$('.static-main:first').html(data);
		//load the page content
		static_loadParsers (siteDefinition,currentPage, 0);
	});
	return true;
};

function static_loadParsers (siteDefinition,currentPage,groupIndex){
	var function_counter = siteDefinition.parsers[groupIndex].length;
	//load each parser script
	$.each(siteDefinition.parsers[groupIndex], function(index,value){
		$.getScript(value, function(){
			function_counter--;;
			//if this is the last parser to be got in this priority group...
			if (function_counter == 0)
			{
				groupIndex++;
				if (groupIndex == siteDefinition.parsers.length){
					//proceed to load site content
					static_loadContent (siteDefinition,currentPage);
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
	$('.static-box').each(function(index){
		boxid = $(this).attr('data-static-blockid');
		//call the correct parser to add the content
		window[siteDefinition.pages[currentPage].blocks[boxid].parser](siteDefinition.pages[currentPage].blocks[boxid].content, $(this))

	});

	console.log('Static: Loading took ' + ((new Date().getTime() - static_load_timestamp)/1000) + ' seconds.');
	return true;
}