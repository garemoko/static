var static_returnedSiteDefinition = 
{
	"theme" : {
		"css" : "static-example/static-theme.css",
		"js" : "static-example/static-theme.js"
	},
	"pages" : {
		"home" : {
			"parsers" :[
				["http://garemoko.github.io/static/parsers/markdown/Markdown.Converter.js"],
				["parsers/markdown/markdown.js"]
			],	
			"layout" : "static-example/page-layout-example.html",
			"blocks" : [{
					"parser" : "static_markdownParser",
					"content" : "https://googledrive.com/host/0B9fyoDEGTP0NV29BZWhQMDVHX00/home/title.txt"
				},
				{
					"parser" : "static_markdownParser",
					"content" : "https://googledrive.com/host/0B9fyoDEGTP0NV29BZWhQMDVHX00/home/2.txt"
				},
				{
					"parser" : "static_markdownParser",
					"content" : "https://googledrive.com/host/0B9fyoDEGTP0NV29BZWhQMDVHX00/home/3.txt"
				},
				{
					"parser" : "static_markdownParser",
					"content" : "https://googledrive.com/host/0B9fyoDEGTP0NV29BZWhQMDVHX00/home/4.txt"
				},
				{
					"parser" : "static_markdownParser",
					"content" : "https://googledrive.com/host/0B9fyoDEGTP0NV29BZWhQMDVHX00/home/5.txt"
				}
			]
		}
	}
};
