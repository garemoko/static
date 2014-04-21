function static_markdownParser(content, target) {
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





