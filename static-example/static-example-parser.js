function static_exampleParser(content, target) {
	target.load(content);
	$.get(content, function (data){
		//Replace the line breaks with HTML
		var htmlToAdd = '<p>'+ data.replace(/(\r\n|\n|\r)/gm, "</p><p>") + '</p>';
		
		//Add to the page
		target.html(htmlToAdd);
	});
	return true;
}