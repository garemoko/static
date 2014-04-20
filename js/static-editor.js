//Globals
var static_dragSelectorLeftRight ='',
static_dragSelectorUnprocessedTargetChange = false,
static_currentDragBlock, 
static_zoom = 0.5;


var static_dragTargetTemplate = $('<div id="static-editorDragTarget" class="col-md-4"></div>');
static_dragTargetTemplate.append('<div class="static-protoBlockInterface"><span class="glyphicon glyphicon-question-sign"></span><p>New Block</p></div>');

var static_recyclebin = $('<div id="static-recyclebin"></div>');
static_recyclebin.append('<div class="static-recyclebin-inner"><span class="glyphicon glyphicon-trash"></span><p>Bin</p></div>');

var static_protoBlockOptionContent = $('<div class="static-protoBlockInterface-option" class="hidden"><span class="glyphicon glyphicon-align-center"></span><p>Content</p></div>'),
static_protoBlockOptionContainer = $('<div class="static-protoBlockInterface-option" class="hidden"><span class="glyphicon glyphicon-th"></span><p>Container</p></div>'),
static_protoBlockOptionDesc = $('<div style="width:100%;height:150px;"></div><p>What type of block is this?</p>');
//End Globals




$(function(){
	staticEditor_addClickFunctions();	
	
	$(static_recyclebin).children('.static-recyclebin-inner').mouseenter(function(){
		$(this).addClass('text-danger');
		$(static_currentDragBlock).detach();
	});
	$(static_recyclebin).children('.static-recyclebin-inner').mouseleave(function(){
		$(this).removeClass('text-danger');
	});
});

function staticEditor_addClickFunctions(){
	$('.static-editorAddBlock').mousedown(function(){
		staticEditor_dragBlockStart(-1);
		return false;
	});
	$('.static-editorEditNav').click(function(){
		
	});
	$('.static-editorSiteSettings').click(function(){
		
	});
	$('.static-editorHelp').click(function(){
		
	});
	$('.static-editorSave').click(function(){
		
	});
	$('.static-editorLaunch').click(function(){
		staticEditor_launch();
	});
	$('.static-editorClose').click(function(){
		staticEditor_close();
	});
}

function staticEditor_close(){
	//TODO: tidy up any other open editor stuff
	//TODO: warning! Please save first!
	
	$('.static-editorLeftNav').addClass('hidden');
	$('.static-editorLaunch').removeClass('hidden');
	$('.static-editorClose').addClass('hidden');
}

function staticEditor_launch(){
	$('.static-block').mousedown(function(){
		staticEditor_blockMousedown(this);
		return false;
	});
	$('.static-editorLeftNav').removeClass('hidden');
	$('.static-editorLaunch').addClass('hidden');
	$('.static-editorClose').removeClass('hidden');
	
	//turn all blocks into flippers
	$('.static-block').each(function(){
		$(this).addClass('flip');
		$(this).html(static_buildFlipper($(this).html(),'<h2>Settings</h2>'));
		//TODO: create a settigns panel (edit content)
	});
	
}

/* BLOCK DRAGGING */

function staticEditor_blockMousedown(block){
	//TODO: add resize if the edges are selected
	
	//if the user keeps the mouse down on this block for 1 second, open the options. 
	var mousedownTimer = setTimeout(function(){
		//prevent the other outcomes from firing
		$(block).unbind('mouseleave');
		$(block).unbind('mouseup');
		
		//open settings for this block
		console.log('flip');
		
		$(block).find('.card').addClass('flipped');
		$(block).mouseleave(function(){
			$(this).find('.card').removeClass('flipped');
		});
	},1000);	
	
	//If the user tries to drag the block, turn on drag mode. 
	$(block).mouseleave(function(){
		//prevent the other outcomes from firing
		clearTimeout(mousedownTimer);
		$(this).unbind('mouseleave');
		$(this).unbind('mouseup');
		//turn on drag mode for this block
		staticEditor_dragBlockStart($(this).attr('data-static-blockid'), $(this));
	});
	//If the user raises the mouse, prevent drag mode from triggering
	$(block).mouseup(function(){
		//prevent the other outcomes from firing
		clearTimeout(mousedownTimer);
		$(this).unbind('mouseleave');
		$(this).unbind('mouseup');
	});
	
	
	
}

function staticEditor_dragBlockStart(blockIndex,block){
	//TODO: add recycle bin
	$('body').append(static_recyclebin);
	
	//if supported, zoom out to 50%
	static_pageZoom(1,static_zoom,100);

	if (blockIndex == -1){
		//add the box at the bottom of the page
		static_currentDragBlock = static_dragTargetTemplate.clone();
		$('.static-block:last').after(static_currentDragBlock);
		staticEditor_recalcRows();
	} else {
		static_currentDragBlock = block;
	}
	
	
	
	$('body').css('cursor', 'no-drop');
	$('.static-block').css('cursor', 'move');
	
	$('.row').mouseenter(function(event){
		if (static_dragSelectorUnprocessedTargetChange){
			static_dragSelectorUnprocessedTargetChange = false;
			$(event.target).append(static_currentDragBlock);
			staticEditor_recalcRows();
		}
	});
	
	$('.static-block').mousemove(function(event){
		staticEditor_dragBlockMove(this,(event.pageX/static_zoom) - $(this)[0].getBoundingClientRect().left - window.scrollX);
	});
	
	
	/*
	$('.row').mousemove(function(event){
		if ($(event.target).hasClass('row')){
			if (static_dragSelectorUnprocessedTargetChange){
				static_dragSelectorUnprocessedTargetChange = false;
				$(event.target).append(static_currentDragBlock);
				staticEditor_recalcRows();
			}
		}
		else if ($(event.target).hasClass('static-block')){
			staticEditor_dragBlockMove(event.target,(event.pageX/static_zoom) - $(event.target)[0].getBoundingClientRect().left - window.scrollX);
		}
		else {
			var targetBlock = $(event.target).parents('.static-block:first');
			if ($(event.target).parents('.static-block:first').length > 0){
				staticEditor_dragBlockMove(targetBlock,(event.pageX/static_zoom) - $(targetBlock)[0].getBoundingClientRect().left - window.scrollX);
			} 
		}
	});*/
	
	
	
	//TODO: row mousemove (put it at the end of row) body mo
	
	$('.static-block').hover(function(){
		static_dragSelectorUnprocessedTargetChange = true;
	});
	
	$('.row').hover(function(){
		static_dragSelectorUnprocessedTargetChange = true;
	});
	
	$('body').mouseup(staticEditor_dragBlockEnd);
}

function staticEditor_dragBlockMove(target,mouseX){
	if (mouseX < ($(target)[0].getBoundingClientRect().width/2)){
		if (static_dragSelectorUnprocessedTargetChange || static_dragSelectorLeftRight != 'left'){
			static_dragSelectorUnprocessedTargetChange = false;
			static_dragSelectorLeftRight = 'left';
			staticEditor_dragBlockSelectLeft (target);
		}
	}
	else
	{
		if (static_dragSelectorUnprocessedTargetChange || static_dragSelectorLeftRight != 'right'){
			static_dragSelectorUnprocessedTargetChange = false;
			static_dragSelectorLeftRight = 'right';
			staticEditor_dragBlockSelectRight (target)
		}
	}
}

function staticEditor_dragBlockSelectLeft (target){

	$(target).before(static_currentDragBlock);
	staticEditor_recalcRows();
}

function staticEditor_dragBlockSelectRight (target){

	$(target).after(static_currentDragBlock);
	staticEditor_recalcRows();
}


function staticEditor_dragBlockEnd (){
	//reset zoom
	static_pageZoom(static_zoom,1,100);
	
	//turn off drag mode
	$('.static-block').unbind('mouseup');
	$('.static-block').unbind('mouseenter');
	$('.static-block').unbind('mouseleave');
	$('.static-block').unbind('mousemove');
	$('.row').unbind('mouseenter');
	$('body').unbind('mouseup');
	$('body').css('cursor', 'auto');
	$('.static-block').css('cursor', 'auto');
	
	$('#static-recyclebin').detach();
	
	//add options to the new proto-block
	var protoBlock = $('#static-editorDragTarget .static-protoBlockInterface');
	$('#static-editorDragTarget').addClass('static-block').attr('id', '').mousedown(function(){
		staticEditor_blockMousedown(this);
		return false;
	});;
	protoBlock.children('span, p').fadeOut("slow"); 
	
	staticEditor_addProtoBlockOption(protoBlock,static_protoBlockOptionContent.clone(),'-=27');
	staticEditor_addProtoBlockOption(protoBlock,static_protoBlockOptionContainer.clone(),'+=97');
  	
  	protoBlock.append(static_protoBlockOptionDesc.clone().fadeIn( "slow"));
}


function staticEditor_addProtoBlockOption(target,option,left){
	//add content option
	target.append(option);
	
	//replace the bootstrap hidden class with opacity
	option.css('opacity', 0);
	option.removeClass('hidden');
	
	//animate into position, size and view
	option.animate({
	    left: left,
	    opacity: 1
  	}, 1000);
  	option.children('.glyphicon').animate({
	    fontSize:'90px'
  	}, 1000);
	
}

/* WIDTH AND ROW FUNCTIONS */

function staticEditor_recalcRows(){
	
	$('.row').each(function(index){ 

		
		var rowWidth = staticEditor_getRowWidth(this), fuse=0;
		//Note: the fuse should not be needed, but stops the browser crashing in the event the while loop goes wrong. 
		
		//if the row is not full, grab blocks from the next row to fill it up until overflowing
		
		while ((rowWidth < 12) && (fuse < 13) )
		{
			var divToAppend = $(this).next().children('div:first');
			if (divToAppend.length > 0){
				divToAppend.appendTo($(this));
				rowWidth = staticEditor_getRowWidth(this);
			}
			else
			{
				break;
			}		
			fuse++;
			if (fuse == 13){console.log ('fuse blown - check the code')}
		}
		
		fuse = 0;
		
		//Empty blocks back into the next row until no longer overflowing
		while ((rowWidth > 12)&& (fuse < 13))
		{
			//check if next row exists - create it if not. 
			var nextRow = $(this).next()
			if (nextRow.length == 0){
				//TODO: use a template row so that it gets the hover enter
				nextRow = $('<div class="row"></div>').insertAfter($(this));
			}
			$(this).children('div:last').prependTo(nextRow);
			rowWidth = staticEditor_getRowWidth(this);
			fuse++;
			if (fuse == 13){console.log ('fuse blown - check the code')}
		}
		
		//remove empty rows after processing
		if (rowWidth ==0){
			$(this).remove();
		}
		
		
	});
	
	//add one empty row at the bottom
	$('<div class="row row-last"></div>').insertAfter($('.row:last'));
}

function staticEditor_getRowWidth (row){
	
	var rowWidth = 0;
	$(row).children('div').each(function(index){
		rowWidth += staticEditor_getBlockWidth (this);
	});
	
	return rowWidth;
}

function staticEditor_getBlockWidth (block){
	var classString = $(block).attr('class');
	var widthIndex = classString.indexOf('col-md-') + 7;
	return Number(classString.substring(widthIndex, widthIndex + 2));
}



function static_pageZoom(oldScale,newScale, duration){
	var originalBodyWidth = ($('body').width());	
	$({scale: oldScale}).animate({scale: newScale}, {
      duration: duration,
      easing:'swing',
      step: function() { 
      	$('body').css('MozTransform','scale('+ this.scale +')');
		$('body').css('zoom', ' '+ (this.scale * 100) +'%');
      },
      complete: function() { 
      	//if the page has not scaled, it's not supported so tell the rest of the code we haven't zoomed. 
      	if ($('body')[0].getBoundingClientRect().width == originalBodyWidth){
      		console.log('zoom not supported');
      		static_zoom = 1;
      	}
      }
  	});
	
}

function static_buildFlipper(front,back){
	return '<div class="card"><div class="face front">'+front+'</div><div class="face back">'+back+'</div></div>';
}


