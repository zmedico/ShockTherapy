
this.RadioButtonDrawable = function(resources)
{
	this.resources = resources;
	this.model = null;
	this.bounds = {x:0, y:0, w: 0, h: 0};
	this.checkMarkWidthFactor = 1 / 9;
	this.boxBorderWidthFactor = 1 / 20;
}

RadioButtonDrawable.prototype.setBounds = function(bounds)
{
	this.bounds = bounds;
}

RadioButtonDrawable.prototype.getBounds = function()
{
	return this.bounds;
}

RadioButtonDrawable.prototype.draw = function(context)
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
    context.arc(square.x + square.w/2, square.y + square.h/2, square.w/2, 0, 2 * Math.PI, false);
    context.stroke();
	context.closePath();

	if (this.model.checked)
	{
		lineWidth = box.w * this.checkMarkWidthFactor;
		if (lineWidth < 1)
			lineWidth = 1;

		square = {
				x:square.x + square.w/8,
				y:square.y+square.h/8,
				w:square.w*3/4,
				h:square.h*3/4
			}

		context.lineWidth = lineWidth;
		context.fillStyle = this.resources.getString("Checkbox.Check.color");
		context.beginPath();
		context.arc(square.x + square.w/2, square.y + square.h/2, square.w/2, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	}
}
