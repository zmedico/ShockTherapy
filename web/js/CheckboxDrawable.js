
this.CheckboxDrawable = function(resources)
{
	this.resources = resources;
	this.model = null;
	this.bounds = {x:0, y:0, w: 0, h: 0};
	this.checkMarkWidthFactor = 1 / 9;
	this.boxBorderWidthFactor = 1 / 20;
}

CheckboxDrawable.prototype.setBounds = function(bounds)
{
	this.bounds = bounds;
}

CheckboxDrawable.prototype.getBounds = function()
{
	return this.bounds;
}

CheckboxDrawable.prototype.draw = function(context)
{
	var box = this.bounds;
	var canvasStyle = window.getComputedStyle(context.canvas);
	context.globalCompositeOperation = "source-over"
	context.fillStyle = canvasStyle.getPropertyValue("background-color");
	context.fillRect(box.x, box.y, box.w, box.h);
	context.fill();

	var square = {
		x:box.x + box.w/5,
		y:box.y+box.h/5,
		w:box.w*3/5,
		h:box.h*3/5
	}

	var lineWidth = box.w * this.boxBorderWidthFactor;
	if (lineWidth < 1)
		lineWidth = 1;
	context.lineWidth = lineWidth;
	context.strokeStyle = this.resources.getString("Checkbox.Box.color");
	context.beginPath();
	context.strokeRect(square.x, square.y, square.w, square.h);
	context.stroke();
	context.closePath();

	if (this.model.checked)
	{
		lineWidth = box.w * this.checkMarkWidthFactor;
		if (lineWidth < 1)
			lineWidth = 1;
		context.lineWidth = lineWidth;
		context.strokeStyle = this.resources.getString("Checkbox.Check.color");
		context.beginPath();
		context.moveTo(square.x + square.w/4, square.y + square.h/3);
		context.lineTo(square.x + square.w*9/16, square.y + square.h*2/3);
		context.lineTo(square.x + square.w*6/5, square.y+square.h/16);
		context.stroke();
		context.closePath();
	}
}
