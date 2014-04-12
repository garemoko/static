function static_markdownParser(content, target) {
	$.get(content, function (data){
		//create the markdown parser object (requires Markdown.Converter.js and Markdown.Sanitizer.js)
		var converter = new Markdown.Converter();
		
		//parse the contents of the file
		var htmlToAdd = converter.makeHtml(data);
		
		//Add to the page
		target.html(htmlToAdd);
	});
	return true;
}





