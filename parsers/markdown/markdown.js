/**
Static

@module Static
@submodule markdownParser
**/

/**
@class Static.markdownParser
@constructor
*/

var markdownParser = Static.parsers.markdownParser = function (cfg){
	this.init(cfg);
};
markdownParser.prototype = {
	/**
    @property {Array} [dependancies] A list of any dependancies to get before running this script
    */
    dependancies: [
    	"parsers/markdown/Markdown.Converter.js"
    ],
	
	/**
    @method init
    @param {Object} [cfg] Configuration used to initialize
    */
	init: function (cfg) {
		
	},
	
	/**
    @method parse
    @param {String} [content] data laoded from the content file to parse
    @param {Object} [target] A JQuery object representing a DOM element to put the content in. 
    */
	parse: function (content, target){
		//create the markdown parser object (requires Markdown.Converter.js and Markdown.Sanitizer.js)
		var converter = new Markdown.Converter();
	
		//parse the contents of the file
		var htmlToAdd = $(converter.makeHtml(content));
		
		//convert intra-site links
		htmlToAdd.find('a').each(function(index){
			//fior each link, check if it has a data-static-page property
			if ($(this).is('[data-static-page]')) {
				//if it does, add a click event
				$(this).click(function(event){
					//on click, change the page to the value of data-static-page
					static_changePage($(this).attr('data-static-page'));
					//prevent the link from firing in case it points somehwere. 
					return false;
				});
			}
		});
		//Add to the page
		target.html(htmlToAdd);
		return true;
	}
};

//Add the parser to the Static.parsers class. This is inherited by all instances (not just new ones). 
Static.parsers.prototype.markdownParser = new Static.parsers.markdownParser;




