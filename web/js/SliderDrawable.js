
this.SliderDrawable = function(resources)
{
	this.resources = resources;
	this.model = null;
	this.bounds = {x:0, y:0, w: 0, h: 0};
	this.edgePadding = 5;
	this.adjusting = false;
	this.trackWidthFactor = 1/10;
}

SliderDrawable.prototype.setBounds = function(bounds)
{
	this.bounds = bounds;
}

SliderDrawable.prototype.getBounds = function()
{
	return this.bounds;
}

SliderDrawable.prototype.draw = function(context)
{
	var box = this.bounds;
	var canvasStyle = window.getComputedStyle(context.canvas);
	context.globalCompositeOperation = "source-over"
	context.beginPath();
	context.fillStyle = canvasStyle.getPropertyValue("background-color");
	context.fillRect(box.x, box.y, box.w, box.h);
	context.fill();
	context.closePath();

	var knobWidth = this.calcKnobWidth();
	var radius = Math.round(knobWidth / 2);
	var xMin = radius + this.edgePadding, xMax = box.w - radius - this.edgePadding;
	var lineWidth = box.h * this.trackWidthFactor;
	if (lineWidth < 1)
		lineWidth = 1;
	context.lineWidth = lineWidth;
	context.lineCap = "round";
	context.strokeStyle = this.resources.getString("Slider.Track.background-color");
	context.beginPath();
	context.moveTo(xMin, box.h/2);
	context.lineTo(xMax, box.h/2);
	context.stroke();
	context.closePath();

	var ratio = this.model.value / (this.model.max - this.model.min);
	var x = Math.floor(xMin + ratio * (xMax - xMin));

	context.strokeStyle = this.resources.getString("Slider.Track.color");
	context.beginPath();
	context.moveTo(xMin, box.h/2);
	context.lineTo(x, box.h/2);
	context.stroke();
	context.closePath();

    context.beginPath();
    context.arc(x, box.h/2, radius, 0, 2 * Math.PI, false);
    context.fillStyle = this.resources.getString("Slider.Knob.color");
    context.fill();
	context.closePath();
}

SliderDrawable.prototype.calcKnobWidth = function()
{
	return this.bounds.h * 8/9;
}

SliderDrawable.prototype.mapValueFromPointer = function(p)
{
	var x = p.x;
	var box = this.bounds;
	var knobWidth = this.calcKnobWidth();
	var	xMin = Math.round(knobWidth / 2) + this.edgePadding,
		xMax = box.w - Math.round(knobWidth / 2) - this.edgePadding;
	if (x < xMin)
		x = xMin;
	else if (x > xMax)
		x = xMax;
	var ratio = (x - xMin) / (xMax - xMin);
	return this.model.min + Math.floor(ratio * (this.model.max - this.model.min));
}
