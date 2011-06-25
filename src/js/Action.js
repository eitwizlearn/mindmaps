mindmaps.action = {};

mindmaps.action.Action = function() {
};

mindmaps.action.Action.prototype = {
	/**
	 * Make this action un-undoable.
	 * 
	 * @returns {mindmaps.action.Action}
	 */
	noUndo : function() {
		delete this.undo;
		delete this.redo;
		return this;
	},

	/**
	 * Don't emit an event after execution.
	 * 
	 * @returns {mindmaps.action.Action}
	 */
	noEvent : function() {
		delete this.event;
		return this;
	},

	/**
	 * Executes this action. Explicitly returning false will cancel this action
	 * and not raise an event or undoable action.
	 * 
	 */
	execute : function() {
	},

	cancel : function() {
		this.cancelled = true;
	}
};

mindmaps.action.MoveNodeAction = function(node, offset) {
	var oldOffset = node.offset;

	this.execute = function() {
		node.offset = offset;
	};

	this.event = [ mindmaps.Event.NODE_MOVED, node ];
	this.undo = function() {
		return new mindmaps.action.MoveNodeAction(node, oldOffset);
	};
};
mindmaps.action.MoveNodeAction.prototype = new mindmaps.action.Action();

mindmaps.action.DeleteNodeAction = function(node, mindmap) {
	var parent = node.getParent();

	this.execute = function() {
		if (node.isRoot()) {
			return false;
		}
		mindmap.removeNode(node);
	};

	this.event = [ mindmaps.Event.NODE_DELETED, node, parent ];
	this.undo = function() {
		return new mindmaps.action.CreateNodeAction(node, parent, mindmap);
	};
};
mindmaps.action.DeleteNodeAction.prototype = new mindmaps.action.Action();

mindmaps.action.CreateAutoPositionedNodeAction = function(parent, mindmap) {
	if (parent.isRoot()) {
		var branchColor = mindmaps.Util.randomColor();

		// calculate position
		// magic formula
		var leftRight = Math.random() > 0.49 ? 1 : -1;
		var topBottom = Math.random() > 0.49 ? 1 : -1;
		var x = leftRight * (100 + Math.random() * 250);
		var y = topBottom * (Math.random() * 250);
	} else {
		var branchColor = parent.branchColor;

		// calculate position
		var leftRight = parent.offset.x > 0 ? 1 : -1;
		var x = leftRight * (150 + Math.random() * 10);

		// put into random height when child nodes are there
		if (parent.isLeaf()) {
			var max = 5, min = -5;
		} else {
			var max = 150, min = -150;
		}

		var y = Math.floor(Math.random() * (max - min + 1) + min);
	}
	var node = new mindmaps.Node();
	node.branchColor = branchColor;
	node.shouldEditCaption = true;
	node.offset = new mindmaps.Point(x, y);

	return new mindmaps.action.CreateNodeAction(node, parent, mindmap);
};

mindmaps.action.CreateNodeAction = function(node, parent, mindmap) {
	this.execute = function() {
		mindmap.addNode(node);
		parent.addChild(node);
	};

	this.event = [ mindmaps.Event.NODE_CREATED, node ];
	this.undo = function() {
		return new mindmaps.action.DeleteNodeAction(node, mindmap);
	};
};
mindmaps.action.CreateNodeAction.prototype = new mindmaps.action.Action();

mindmaps.action.ToggleNodeFoldAction = function(node) {
	if (node.foldChildren) {
		return new mindmaps.action.OpenNodeAction(node);
	} else {
		return new mindmaps.action.CloseNodeAction(node);
	}
};
mindmaps.action.ToggleNodeFoldAction.prototype = new mindmaps.action.Action();

mindmaps.action.OpenNodeAction = function(node) {
	this.execute = function() {
		node.foldChildren = false;
	};

	this.event = [ mindmaps.Event.NODE_OPENED, node ];

};
mindmaps.action.OpenNodeAction.prototype = new mindmaps.action.Action();

mindmaps.action.CloseNodeAction = function(node) {
	this.execute = function() {
		node.foldChildren = true;
	};

	this.event = [ mindmaps.Event.NODE_CLOSED, node ];

};
mindmaps.action.CloseNodeAction.prototype = new mindmaps.action.Action();

mindmaps.action.ChangeNodeCaptionAction = function(node, caption) {
	var oldCaption = node.getCaption();

	this.execute = function() {
		// dont update if nothing has changed
		if (oldCaption === caption) {
			return false;
		}
		node.setCaption(caption);
	};

	this.event = [ mindmaps.Event.NODE_TEXT_CAPTION_CHANGED, node ];
	this.undo = function() {
		return new mindmaps.action.ChangeNodeCaptionAction(node, oldCaption);
	};
};
mindmaps.action.ChangeNodeCaptionAction.prototype = new mindmaps.action.Action();

mindmaps.action.ChangeNodeFontSizeAction = function(node, step) {
	this.execute = function() {
		node.text.font.size += step;
	};

	this.event = [ mindmaps.Event.NODE_FONT_CHANGED, node ];
	this.undo = function() {
		return new mindmaps.action.ChangeNodeFontSizeAction(node, -step);
	};
};
mindmaps.action.ChangeNodeFontSizeAction.prototype = new mindmaps.action.Action();

mindmaps.action.DecreaseNodeFontSizeAction = function(node) {
	return new mindmaps.action.ChangeNodeFontSizeAction(node, -4);
};

mindmaps.action.IncreaseNodeFontSizeAction = function(node) {
	return new mindmaps.action.ChangeNodeFontSizeAction(node, 4);
};

mindmaps.action.SetFontWeightAction = function(node, bold) {
	this.execute = function() {
		var weight = bold ? "bold" : "normal";
		node.text.font.weight = weight;
	};

	this.event = [ mindmaps.Event.NODE_FONT_CHANGED, node ];
	this.undo = function() {
		return new mindmaps.action.SetFontWeightAction(node, !bold);
	};
};
mindmaps.action.SetFontWeightAction.prototype = new mindmaps.action.Action();

mindmaps.action.SetFontStyleAction = function(node, italic) {
	this.execute = function() {
		var style = italic ? "italic" : "normal";
		node.text.font.style = style;
	};

	this.event = [ mindmaps.Event.NODE_FONT_CHANGED, node ];
	this.undo = function() {
		return new mindmaps.action.SetFontStyleAction(node, !italic);
	};
};
mindmaps.action.SetFontStyleAction.prototype = new mindmaps.action.Action();

mindmaps.action.SetFontDecorationAction = function(node, underline) {
	this.execute = function() {
		var decoration = underline ? "underline" : "none";
		node.text.font.decoration = decoration;
	};

	this.event = [ mindmaps.Event.NODE_FONT_CHANGED, node ];
	this.undo = function() {
		return new mindmaps.action.SetFontDecorationAction(node, !underline);
	};
};
mindmaps.action.SetFontDecorationAction.prototype = new mindmaps.action.Action();

mindmaps.action.SetFontColorAction = function(node, fontColor) {
	var oldColor = node.text.font.color;
	this.execute = function() {
		node.text.font.color = fontColor;
	};

	this.event = [ mindmaps.Event.NODE_FONT_CHANGED, node ];
	this.undo = function() {
		return new mindmaps.action.SetFontColorAction(node, oldColor);
	};
};
mindmaps.action.SetFontColorAction.prototype = new mindmaps.action.Action();

mindmaps.action.SetBranchColorAction = function(node, branchColor) {
	var oldColor = node.branchColor;
	this.execute = function() {
		node.branchColor = branchColor;
	};

	this.event = [ mindmaps.Event.NODE_BRANCH_COLOR_CHANGED, node ];
	this.undo = function() {
		return new mindmaps.action.SetBranchColorAction(node, oldColor);
	};
};
mindmaps.action.SetBranchColorAction.prototype = new mindmaps.action.Action();