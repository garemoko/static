/*function static_markdownParser(content, target) {
	//create the markdown parser object (requires Markdown.Converter.js and Markdown.Sanitizer.js)
	var converter = new Markdown.Converter();

	//parse the contents of the file
	var htmlToAdd = $(converter.makeHtml(content));
	//convert in site links
	htmlToAdd.find('a').each(function(index){
		if ($(this).is('[data-static-page]')) {
			$(this).click(function(event){
				static_changePage($(this).attr('data-static-page'));
				return false;
			});
		}
	});
	//Add to the page
	target.html(htmlToAdd);
	return true;
}*/

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
		//convert in site links
		htmlToAdd.find('a').each(function(index){
			if ($(this).is('[data-static-page]')) {
				$(this).click(function(event){
					static_changePage($(this).attr('data-static-page'));
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




