//Globals
var static_dragSelectorLeftRight = '', 
static_dragSelectorUnprocessedTargetChange = false, 
static_currentDragBlock, 
static_currentDragBlockRelativeWidth, 
static_zoom = 0.5,
static_dragPauseTimer,
static_dragPauseTimerDuration=100;

//templates
var static_dragTargetTemplate, 
static_protoBlockInterface, 
static_blockTemplate, 
static_recyclebin, 
static_protoBlockOptionContent;

//End Globals

$(function() {
	staticEditor_addClickFunctions();
	staticEditor_setupTemplates();

});

function staticEditor_addClickFunctions() {
	$('.static-editorAddBlock').mousedown(function() {
		staticEditor_dragBlockStart(-1);
		return false;
	});
	$('.static-editorEditNav').click(function() {

	});
	$('.static-editorSiteSettings').click(function() {

	});
	$('.static-editorHelp').click(function() {

	});
	$('.static-editorSave').click(function() {
		//TODO: update the working site def as we go to preserve changes as we navigate round the site.
	});
	$('.static-editorLaunch').click(function() {
		staticEditor_launch();
	});
	$('.static-editorClose').click(function() {
		staticEditor_close();
	});
}

function staticEditor_close() {
	//TODO: tidy up any other open editor stuff
	//TODO: warning! Please save first!

	$('.static-editorLeftNav').addClass('hidden');
	$('.static-editorLaunch').removeClass('hidden');
	$('.static-editorClose').addClass('hidden');

	$('.static-sub-editor').removeClass('static-sub-editor');
	$('.static-block-editor').removeClass('static-block-editor');
	
	
	static_removeFlipper($('.static-main'));
	
	$('.static-resizer').remove();
	
	//reset zoom
	static_pageZoom(static_zoom, 1, 100);
}

function staticEditor_launch() {
	//TODO: add a 1px border on blocks
	$('.static-sub').addClass('static-sub-editor');
	$('.static-block').addClass('static-block-editor');

	$('body').mousedown(function(event) {
		staticEditor_blockMousedown(event);
		return false;
	});
	$('.static-editorLeftNav').removeClass('hidden');
	$('.static-editorLaunch').addClass('hidden');
	$('.static-editorClose').removeClass('hidden');
	
	

	//set each block into edit mode
	$('.static-block').each(function() {
		
		//add resize handles
		$(this).append(staticEditor_resizeHandles ());
	});
	
	static_buildFlipper($('.static-main'), $('.static-main').children(), staticEditor_settings ());
	
	//if supported, zoom out to 50%
	static_pageZoom(1, static_zoom, 100);

}

/* BLOCK OPTIONS */

function staticEditor_blockMousedown(event) {

	//get the lowest level static block above the target.
	var block = $(event.target).closest('.static-block');
	
	if (block.length == 0){
		return;
	}

	//For some reason the click event on links wasn't firing in edit mode. This fixes it.
	if($(event.target).is('a')) {
		$(block).mouseup(function() {
			$(block).unbind('mouseup');
			static_changePage($(event.target).attr('data-static-page'));
		});
	}

	if($(event.target).is('.static-protoBlockInterface-option-container') || ($(event.target).parent().is('.static-protoBlockInterface-option-container'))) {
		$(block).mouseup(function() {
			$(block).unbind('mouseup');
			staticEditor_createContainer(this);
		});
	}

	if($(event.target).is('.static-protoBlockInterface-option-content') || ($(event.target).parent().is('.static-protoBlockInterface-option-content'))) {
		$(block).mouseup(function() {
			$(block).unbind('mouseup');
			staticEditor_createContent(this);
		});
	}

	//if the user keeps the mouse down on this block for 1 second, open the options.
	var mousedownTimer= setTimeout(function() {
		//prevent the other outcomes from firing
		$(block).unbind('mouseleave');
		$(block).unbind('mouseup');
		$(block).unbind('mousemove');

		//open settings for this block
		var card = $('.static-main').children('.card');
		card.addClass('flipped');
		
		$('.static-main').mouseleave(function() {
			//TODO: save settings
			//TODO: close button
			card.removeClass('flipped');
		});
		
		staticEditor_addBlockSettings(card.find('.static-settings'), block);
		
	}, 1000);

	//if the reszier has been selected and the user tries to drag the block, resize it

	if(($(event.target).hasClass('static-resizer')) || ($(event.target).parent().hasClass('static-resizer'))) {
		$(block).mousemove(function() {
			//prevent the other outcomes from firing
			clearTimeout(mousedownTimer);
			$(this).unbind('mousemove');
			$(this).unbind('mouseup');
			//turn on resize mode for this block
			staticEditor_resizeBlockStart($(this));
		});
	} else {
		$(block).mouseleave(function() {
			//prevent the other outcomes from firing
			clearTimeout(mousedownTimer);
			$(this).unbind('mouseleave');
			$(this).unbind('mouseup');
			//turn on drag mode for this block
			staticEditor_dragBlockStart($(this).attr('data-static-blockid'), $(this));
		});
	}
	//If the user raises the mouse, prevent drag mode from triggering
	$(block).mouseup(function() {
		//prevent the other outcomes from firing
		clearTimeout(mousedownTimer);
		$(this).unbind('mouseleave');
		$(this).unbind('mousemove');
		$(this).unbind('mouseup');
	});

}
//=========OPEN SETTINGS========

function staticEditor_addBlockSettings(settingsBlock, block) {
	settingsBlock.empty();
	settingsBlock.append('<h2>Block settings</h2>');
	
}


//==========MOVE BLOCK========

function staticEditor_dragBlockStart(blockIndex, block) {
	
	
	//add recycle bin
	
	$('body').append(static_recyclebin);
	$('.static-recyclebin-inner').removeClass('text-danger');

	if(blockIndex == -1) {
		//add the box at the bottom of the page
		static_currentDragBlock = static_dragTargetTemplate.clone();
		$('.static-block:last').after(static_currentDragBlock);
		staticEditor_recalcRows();
	} else {
		static_currentDragBlock = block;
	}
	
	//get current relative width (in cols) of the block
	static_currentDragBlockRelativeWidth = staticEditor_getRelativeBlockWidth(static_currentDragBlock);

	$('body').css('cursor', 'no-drop');
	$('.row').css('cursor', 'move');

	$('.row').mousemove(function(event) {
		staticEditor_handleDrag(event.target, event);
	});

	$('.static-block').hover(function() {
		static_dragSelectorUnprocessedTargetChange = true;
	});

	$('.row').hover(function() {
		static_dragSelectorUnprocessedRowChange = true;
	});

	$('body').mouseup(function() {
		staticEditor_dragBlockEnd(blockIndex);
	});
}

function staticEditor_handleDrag(target, event) {
	//TODO: when dropping in a container, resize the block based on the container size.
	//TODO: prevent containers being dragged into themselves

	if(target == false) {
		//We tried to see if the parent was anything interesting and bubbled up to teh body without finding anything

	} else if($(target).hasClass('row')) {
		//If we're not trying to drag the block onto its parent row or its children (it might be a container)
		if(!($(target)[0] == static_currentDragBlock.parent()[0]) && !(staticEditor_isAncestor($(target), static_currentDragBlock))) {
			
			//if the user hovers here, not just moving the mouse over it...
			clearTimeout( static_dragPauseTimer ); 
			static_dragPauseTimer = setTimeout(function() {
				//stick it on the end of the row
				$(target).append(static_currentDragBlock);
				staticEditor_adjustBlockWidth(static_currentDragBlock, static_currentDragBlockRelativeWidth);
				staticEditor_recalcRows();
			}, static_dragPauseTimerDuration);
		}

	} else if($(target).hasClass('static-block')) {
		//If we're not trying to drag the block onto itself or its children (it might be a container)
		if(!($(target)[0] == static_currentDragBlock) && !(staticEditor_isAncestor($(target), static_currentDragBlock))) {
			//check if we're over the left or right of the block and stick it before or after accordingly.
			staticEditor_dragBlockMove(target, (event.pageX / static_zoom) - $(target)[0].getBoundingClientRect().left);
		}
	} else if($(target).hasClass('static-editorDragTarget')) {
		//We're dragging the block over itself. Do nothing
	} else {
		//its an unknown object, so probably a child - see if it's parent matches anything interesting.
		staticEditor_handleDrag(staticEditor_getMatchingParentByClass(target, ['row', 'static-block', 'static-editorDragTarget']), event);
	}
}

function staticEditor_getMatchingParentByClass(element, classes) {
	var parent = $(element).parent();
	var match = false;
	//if we reached the top of the tree, return false
	if(parent.is('body')) {
		return false;
	}

	//if we have a match, return it
	$.each(classes, function(index, value) {
		if(parent.hasClass(value)) {
			match = true;

		}
	});

	if(match) {
		return parent;
	} else {
		//else, keep moving up.
		return staticEditor_getMatchingParentByClass(parent, classes);
	}
}

function staticEditor_isAncestor(child, ancestorCandidate) {
	var parent = $(child).parent();
	var match = false;
	//if we reached the top of the tree, return false
	if(parent.is('body')) {
		return false;
	}

	//if we have a match, return true
	if($(parent)[0] == $(ancestorCandidate)[0]) {
		match = true;
	}


	if(match) {
		return true;
	} else {
		//else, keep moving up.
		return staticEditor_isAncestor(parent, ancestorCandidate);
	}
}

function staticEditor_dragBlockMove(target, mouseX) {
	if(mouseX < ($(target)[0].getBoundingClientRect().width / 2)) {
		if(static_dragSelectorUnprocessedTargetChange || static_dragSelectorLeftRight != 'left') {
			static_dragSelectorUnprocessedTargetChange = false;
			static_dragSelectorLeftRight = 'left';
			staticEditor_dragBlockSelectLeft(target);
		}
	} else {
		if(static_dragSelectorUnprocessedTargetChange || static_dragSelectorLeftRight != 'right') {
			static_dragSelectorUnprocessedTargetChange = false;
			static_dragSelectorLeftRight = 'right';
			staticEditor_dragBlockSelectRight(target)
		}
	}
}

function staticEditor_dragBlockSelectLeft(target) {
	//if the user hovers here, not just moving the mouse over it...
	clearTimeout( static_dragPauseTimer ); 
	static_dragPauseTimer = setTimeout(function() {
		$(target).before(static_currentDragBlock);
		staticEditor_adjustBlockWidth(static_currentDragBlock, static_currentDragBlockRelativeWidth);
		staticEditor_recalcRows();
	}, static_dragPauseTimerDuration);
}

function staticEditor_dragBlockSelectRight(target) {
	//if the user hovers here, not just moving the mouse over it...
	clearTimeout( static_dragPauseTimer );
	static_dragPauseTimer = setTimeout(function() {
		$(target).after(static_currentDragBlock);
		staticEditor_adjustBlockWidth(static_currentDragBlock, static_currentDragBlockRelativeWidth);
		staticEditor_recalcRows();
	}, static_dragPauseTimerDuration);
}

function staticEditor_dragBlockEnd(blockIndex) {
	
	
	clearTimeout( static_dragPauseTimer );

	//turn off drag mode
	$('.static-block').unbind('mouseup');
	$('.static-block').unbind('mouseenter');
	$('.static-block').unbind('mouseleave');
	$('.row').unbind('mousemove');
	$('.row').unbind('mouseenter');
	$('body').unbind('mouseup');
	$('body').css('cursor', '');
	$('row').css('cursor', '');

	$('#static-recyclebin').detach();

	if( blockIndex == -1) {
		var protoBlock = static_blockTemplate.clone(true);

		protoBlock.find('.front').append(static_protoBlockInterface.clone());

		$('#static-editorDragTarget').replaceWith(protoBlock);

		//Add the protoblock goodies
		staticEditor_makeProtoblockInterface(protoBlock.find('.static-protoBlockInterface'));
	}
	
	staticEditor_recalcRows();

}

//==========RESIZE BLOCK========
function staticEditor_resizeBlockStart(block) {


	//end the resize onmouseup
	$('body').mouseup(function(event) {
		staticEditor_resizeBlockEnd(block)
	});
	
	//or if the mouse leaves the browser
	$(document).mouseout(function(event) {
		if ($(event.relatedTarget).is('html')){
			staticEditor_resizeBlockEnd(block)
		}
	});


	//set the reference as a fixed point that won't move as the block resizes
	//set the zero point on the left hand side
	var referenceLeft = $(block)[0].getBoundingClientRect().left,
	referenceRight = $(block)[0].getBoundingClientRect().right;


	$('body').addClass('cursorNone');
	$(block).addClass('static-resizeActive');

	//track movement away from edges of the block
	$('body').mousemove(function(event) {
		staticEditor_resizeBlock(event, referenceLeft, referenceRight, block)
	});

}

function staticEditor_resizeBlockEnd(block){
	$('body').unbind('mousemove');
		$('body').unbind('mouseup');
		$(document).unbind('mouseout');
		$('body').removeClass('cursorNone');
		$(block).removeClass('static-resizeActive');
		staticEditor_recalcRows();
}

function staticEditor_resizeBlock(event, referenceLeft, referenceRight, block) {
	var realPageX = event.pageX / static_zoom;

	//calculate the distance moved and resize the block
	var sensitivity = 2,
	distance;
	
	//if the mosue is on the right of the block, any movement past thr block is more sensitive
	if (realPageX > referenceRight){
		var distanceWithinBlock = referenceRight - referenceLeft;
		distancePastBlock =  Math.abs((referenceRight - realPageX) * 2);
		distance = distanceWithinBlock + distancePastBlock;
	} else {
		distance = Math.abs(referenceLeft- realPageX)
	}
	
	var OldBlockWidth = staticEditor_getBlockWidth(block), 
	colWidth = staticEditor_getColWidth(block), 
	newBlockWidth = Math.floor(distance / colWidth);

	//the minimum block width is 1
	newBlockWidth = newBlockWidth > 0 ? newBlockWidth : 1;
	//the maximum block width is 12
	newBlockWidth = newBlockWidth < 13 ? newBlockWidth : 12;

	$(block).removeClass('col-md-' + OldBlockWidth);
	$(block).addClass('col-md-' + newBlockWidth);
}

/* TEMPLATE BLOCK FUNCTIONS */

//TODO: make each of these a function rather than global variables
function staticEditor_setupTemplates() {
	//Drag template
	static_dragTargetTemplate = $('<div id="static-editorDragTarget" class="static-editorDragTarget col-md-4"></div>');
	static_protoBlockInterface = $('<div class="static-protoBlockInterface"><span class="glyphicon glyphicon-question-sign"></span><p>New Block</p></div>')
	static_dragTargetTemplate.append(static_protoBlockInterface);

	//recycle bin
	static_recyclebin = $('<div id="static-recyclebin"></div>');
	static_recyclebin.append('<div class="static-recyclebin-inner"><span class="glyphicon glyphicon-trash"></span><p>Bin</p></div>');
	static_recyclebin.children('.static-recyclebin-inner').mouseenter(function() {
		$(this).addClass('text-danger');
		$(static_currentDragBlock).detach();
	});
	static_recyclebin.children('.static-recyclebin-inner').mouseleave(function() {
		$(this).removeClass('text-danger');
	});

	//Proto-blocks
	static_protoBlockOptionContent = $('<div class="static-protoBlockInterface-option static-protoBlockInterface-option-content" class="hidden"><span class="glyphicon glyphicon-align-center"></span><p>Content</p></div>'), static_protoBlockOptionContainer = $('<div class="static-protoBlockInterface-option static-protoBlockInterface-option-container" class="hidden"><span class="glyphicon glyphicon-th"></span><p>Container</p></div>'), static_protoBlockOptionDesc = $('<div style="width:100%;height:150px;"></div><p>What type of block is this?</p>');

	//static block template
	static_blockTemplate = $('<div class="static-block static-block-editor col-md-4" data-static-blockid="x"></div>');
	static_buildFlipper(static_blockTemplate, static_blockTemplate.html(), staticEditor_settings ());
	static_blockTemplate.append(staticEditor_resizeHandles ());
	
}

function staticEditor_resizeHandles (){
	
	
	var resizeHandles = $('<div class="static-resizer"></div>');
	resizeHandles.append ($('<span class="glyphicon glyphicon-chevron-right"></span>'));
	resizeHandles.append ($('<span class="glyphicon glyphicon-chevron-left"></span>'));
	
	var resizeHandlesContainer = $('<div class="static-resizer-container"></div>');
	resizeHandlesContainer.append(resizeHandles);
	
	return resizeHandles;
}

function staticEditor_settings (){
	var settingsContainer = $('<div></div>').addClass('static-settings col-md-12');
	settingsContainer.css('MozTransform', 'scale(' + (1/static_zoom) + ')');
	settingsContainer.css('zoom', ' ' + ((1/static_zoom) * 100) + '%');
	
	return settingsContainer;
}

function staticEditor_addProtoBlockOption(target, option, left) {
	//add content option
	target.append(option);

	//replace the bootstrap hidden class with opacity
	option.css('opacity', 0);
	option.removeClass('hidden');

	//animate into position, size and view
	option.animate({
		left : left,
		opacity : 1
	}, 1000);
	option.children('.glyphicon').animate({
		fontSize : '90px'
	}, 1000);

}

function staticEditor_makeProtoblockInterface(block) {
	block.children('span, p').fadeOut("slow");
	staticEditor_addProtoBlockOption(block, static_protoBlockOptionContent.clone(), '-=27');
	staticEditor_addProtoBlockOption(block, static_protoBlockOptionContainer.clone(), '+=97');
	block.append(static_protoBlockOptionDesc.clone().fadeIn("slow"));
}

function staticEditor_createContainer(block) {
	//create a container
	var container = $('<div class="static-sub static-sub-editor"></div>');
	//create a row by copying the last row on the DOM
	var row = $('.row:last').clone().empty();
	
	container.append(row);
	//put the container in the block
	$(block).html(container);
	$(block).append(staticEditor_resizeHandles ());

	staticEditor_recalcRows();
}

function staticEditor_createContent(block) {
	$(block).find('.front').html('<h2>Add content here...</h2><p>Hold mouse down here to flip.</p>');

	
}

function static_buildFlipper(target, front, back) {
	target.addClass('flip');

	var card = $('<div></div>').addClass('card'),
	cardFront = $('<div></div>').addClass('face front'),
	cardBack = $('<div></div>').addClass('face back');
	
	cardFront.append($(front));
	cardBack.append($(back));
	
	card.append(cardFront);
	card.append(cardBack);
	
	target.empty();
	target.append(card);
	
	return false;
}

function static_removeFlipper(target){
	content = target.find('.front').children();
	target.children('.card').replaceWith(content);
}

/* WIDTH AND ROW FUNCTIONS */

function staticEditor_recalcRows() {

	$('.static-main').children('.card').children('.front').each(function(index, container) {
		staticEditor_recalcRowsInContainer(container)
	});
	$('.static-sub').each(function(index, container) {
		staticEditor_recalcRowsInContainer(container)
	});
	
	$('body').find('.row:last').clone().empty().appendTo($('.static-main').children('.card').children('.front')).addClass('row-last');
}

function staticEditor_recalcRowsInContainer(container) {
	$(container).children('.row').each(function(index) {

		var rowWidth = staticEditor_getRowWidth(this), fuse = 0;
		//Note: the fuse should not be needed, but stops the browser crashing in the event the while loop goes wrong.

		//if the row is not full, grab blocks from the next row to fill it up until overflowing

		while((rowWidth < 12) && (fuse < 13)) {
			var divToAppend = $(this).next().children('div:first');
			if(divToAppend.length > 0) {
				divToAppend.appendTo($(this));
				rowWidth = staticEditor_getRowWidth(this);
			} else {
				break;
			}
			fuse++;
			if(fuse == 13) {
				console.log('fuse blown - check the code')
			}
		}

		fuse = 0;

		//Empty blocks back into the next row until no longer overflowing
		while((rowWidth > 12) && (fuse < 13)) {
			//check if next row exists - create it if not.
			var nextRow = $(this).next()
			if(nextRow.length == 0) {
				//TODO: use a template row so that it gets the hover enter
				nextRow = $(this).clone().empty().insertAfter($(this));
			}
			$(this).children('div:last').prependTo(nextRow);
			rowWidth = staticEditor_getRowWidth(this);
			fuse++;
			if(fuse == 13) {
				console.log('fuse blown - check the code')
			}
		}

		//remove empty rows after processing
		if(rowWidth == 0) {
			$(this).remove();
		}

	});
	
	//remove the row-last flag from the current bottom row (if it has it)
	//$(container).children('.row-last').removeClass('row-last');
	
	if ($(container).children('.row').length ==0){
		$('body').find('.row:last').clone().empty().appendTo($(container)).addClass('row-last');
	}
}

function staticEditor_getRowWidth(row) {

	var rowWidth = 0;
	$(row).children('div').each(function(index) {
		rowWidth += staticEditor_getBlockWidth(this);
	});

	return rowWidth;
}

function staticEditor_getBlockWidth(block) {
	
	var classString = $(block).attr('class');
	var widthIndex = classString.indexOf('col-md-') + 7;
	return Number(classString.substring(widthIndex, widthIndex + 2));
}

function staticEditor_getColWidth(block) {
	return $(block)[0].getBoundingClientRect().width / staticEditor_getBlockWidth(block);
}

function staticEditor_getRelativeBlockWidth(block) {
	var relativeBlockWidth = staticEditor_getBlockWidth(block),
	parents = $(block).parents('.static-sub');

	
	parents.each(function(index, parent){
		var parentWidth = staticEditor_getBlockWidth($(parent).parent());
		relativeBlockWidth = Math.ceil(relativeBlockWidth * parentWidth / 12);
	});
	
	//maximum relative block width of 12
	relativeBlockWidth = (relativeBlockWidth > 12 ? 12 : relativeBlockWidth);
	
	return relativeBlockWidth;
}

function staticEditor_getProportionalBlockWidth(block, targetRelativeWidth){

	var currentWidth = staticEditor_getBlockWidth(block),
	relativeWidth = staticEditor_getRelativeBlockWidth(block);
	var proportionalWidth = Math.ceil(currentWidth * (targetRelativeWidth / relativeWidth));

	return proportionalWidth;
}

function staticEditor_adjustBlockWidth(block, targetRelativeWidth){
	
	//get the new and old widths before they change!
	var oldWidth = staticEditor_getBlockWidth(block),
	newWidth = staticEditor_getProportionalBlockWidth(block, targetRelativeWidth);
	
	if (oldWidth != newWidth){
		//add the new width 
		$(block).addClass('col-md-' + newWidth);
		
		//remove the old width
		$(block).removeClass('col-md-' + oldWidth);
	}
	
}


function static_pageZoom(oldScale, newScale, duration) {
	var originalBodyWidth = ($('body').width());
	$({
		scale : oldScale
	}).animate({
		scale : newScale
	}, {
		duration : duration,
		easing : 'swing',
		step : function() {
			$('body').css('MozTransform', 'scale(' + this.scale + ')');
			$('body').css('zoom', ' ' + (this.scale * 100) + '%');
			$('#footer').css('MozTransform', 'scale(' + (1/this.scale) + ')');
			$('#footer').css('zoom', ' ' + ((1/this.scale) * 100) + '%');
		},
		complete : function() {
			//if the page has not scaled, it's not supported so tell the rest of the code we haven't zoomed.
			if($('body')[0].getBoundingClientRect().width == originalBodyWidth) {
				console.log('zoom not supported');
				static_zoom = 1;
			}
		}
	});

}


/*  SAVE FUNCTIONS */
//TODO: call this function at revelant points!!! Currently it is not called at all. 
function staticEditor_updateInternalSiteDefPageBlocks(){
	
	var newBlocks = [],
	topBlocks = $('.row:first').parent().children('.row').children('.static-block');
	
	topBlocks.each(function(index,block){
		newBlocks.push(staticEditor_getBlockData(block));
	});

}

function staticEditor_getBlockData(block){
	var newBlockData = {};
	newBlockData.classes = $(block).attr('data-static-classes');
	newBlockData.width = staticEditor_getBlockWidth(block);
	
	if ($(block).attr('data-static-blockType') == 'content'){
		newBlockData.parser = $(block).attr('data-static-parser');
		newBlockData.contentAddress = $(block).attr('data-static-contentAddress'); //check if this is case senstive. If it works, its OK!
	} 
	else if ($(block).attr('data-static-blockType') == 'container'){
		newBlockData.children = [];
		var topBlocks = $(block).children().children('.row').children('.static-block');
		
		topBlocks.each(function(index,childBlock){
			newBlockData.children.push(staticEditor_getBlockData(childBlock));
		});
	}
	
	return newBlockData;
}

