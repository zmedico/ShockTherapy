
require([
	"HslColor",
	"ShockTherapyDefaults"
], function() {

this.ElectricArcColor = (function() {

	var constructor = function()
	{
		this.color = new HslColor()
		this.hueVariance = ShockTherapyDefaults.HueVariance;
		this.brightnessVariance = ShockTherapyDefaults.BrightnessVariance;
	}

	constructor.prototype.generate = function()
	{
		var currentColor = this.color.copy();
		currentColor.l += (1 - currentColor.l) * this.brightnessVariance / 100.0 * Math.random();
		currentColor.h += this.hueVariance / 100.0 * (Math.random() - 0.5);
		if (currentColor.h > 1.0)
			currentColor.h -= 1.0;
		else if (currentColor.h < 0.0)
			currentColor.h += 1.0;
		return currentColor;
	}

	return constructor;

}());

this.ElectricArc = (function() {

	var constructor = function(target, frameCounter, color)
	{
		this.target = target;
		this.frameCounter = frameCounter;
		this.color = color;
		this.bounds = {x:0, y:0, w: 0, h: 0};
		this.density = ShockTherapyDefaults.Density;
		this.defaultFilamentsPerFrame = 5;
		this.filamentsPerSecond = 300;
		this.maxFilamentsPerFrame = 8;
		this.minFilamentsPerFrame = 1;
		this.minJumpRatio = 0.1;
		this.jumpVarianceFactor = 0.3;
		this.thickness = ShockTherapyDefaults.Thickness;
		this.minWidth = 6;
		this.maxThicknessFactor = 1/5;
		this.lineCap = "round";
		this.lineJoin = "round";
	}

	constructor.prototype.setBounds = function(bounds)
	{
		this.bounds = bounds;
	}

	constructor.prototype.getBounds = function()
	{
		return this.bounds;
	}

	constructor.prototype.draw = function(ctx)
	{
		var filamentCount = this.defaultFilamentsPerFrame;
		if (this.frameCounter.frames > 10)
		{
			var fps = this.frameCounter.frames /
				((new Date().getTime() - this.frameCounter.startTime) / 1000);
			filamentCount = Math.floor(this.filamentsPerSecond / fps);
			if (filamentCount > this.maxFilamentsPerFrame)
			{
				filamentCount = this.maxFilamentsPerFrame;
			}
			else if (filamentCount < this.minFilamentsPerFrame)
				filamentCount = this.minFilamentsPerFrame;
			else
				filamentCount = this.minFilamentsPerFrame +
					Math.floor((filamentCount - this.minFilamentsPerFrame)
					* this.density / ShockTherapyDefaults.Density);
		}
		for (var i = 0; i < filamentCount; i++)
		{
			this.drawFilament(ctx);
		}
	}

	constructor.prototype.drawFilament = function(ctx)
	{
		var bounds = this.getBounds();
		var start = this.randomEdgePoint(bounds);
		var target = this.target;
		var minJumpRatio = this.minJumpRatio;
		var jumpVarianceFactor = this.jumpVarianceFactor;
		var color = null;
		var totalX = target.x - start.x;
		var totalY = target.y - start.y;
		var totalDistance = Math.sqrt(totalX * totalX + totalY * totalY);
		if (totalDistance >= 1)
		{
			var currentPoint = start;
			var nextPoint = null;
			var dx, dy, jumpRatio, jumpSquare, prevJumpSquare = null;
			var screenDiag = Math.sqrt(bounds.h * bounds.w);
			var maxWidth = screenDiag * this.maxThicknessFactor;
			if (maxWidth < this.minWidth)
				var lineWidth = this.minWidth;
			else
				var lineWidth = this.minWidth + (maxWidth - this.minWidth) *
					this.thickness / 100;
			ctx.globalCompositeOperation = "source-over"
			ctx.lineCap = this.lineCap;
			ctx.lineJoin = this.lineJoin;
			ctx.lineWidth = lineWidth;
			ctx.beginPath();
			ctx.moveTo(currentPoint.x, currentPoint.y);
			while (true)
			{
				dx = target.x - currentPoint.x;
				dy = target.y - currentPoint.y;
				prevJumpSquare = jumpSquare;
				jumpSquare = dx * dx + dy * dy;
				if (jumpSquare <= 1 ||
					(prevJumpSquare != null && jumpSquare >= prevJumpSquare))
					break
				jumpRatio = Math.sqrt(jumpSquare) / totalDistance;
				if (jumpRatio < minJumpRatio)
					break;
				nextPoint = this.randomPointBetween(currentPoint, target);
				nextPoint.x += Math.floor((Math.random() - 0.5) *
					jumpVarianceFactor * dx);
				nextPoint.y += Math.floor((Math.random() - 0.5) *
					jumpVarianceFactor * dy);

				if (nextPoint.x < 0)
					nextPoint.x = 0;
				else if (nextPoint.x > bounds.w - 1)
					nextPoint.x = bounds.w - 1;
				if (nextPoint.y < 0)
					nextPoint.y = 0;
				else if (nextPoint.y > bounds.h - 1)
					nextPoint.y = bounds.h - 1;

				/*	Convert colors to rgb, since hsl colors to not yield
					correct colors with Microsoft Internet Explorer 9.0. */
				color = this.color.generate().toRgbStyle();
				ctx.strokeStyle = this.gradient(ctx, color, currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y, lineWidth);
				ctx.lineTo(nextPoint.x, nextPoint.y);
				ctx.stroke();
				ctx.beginPath();
				currentPoint = nextPoint;
				ctx.moveTo(currentPoint.x, currentPoint.y);
			}

			color = this.color.generate().toRgbStyle();
			ctx.strokeStyle = this.gradient(ctx, color, currentPoint.x, currentPoint.y, target.x, target.y, lineWidth);
			ctx.lineTo(target.x, target.y)
			ctx.stroke();
		}
	}

	constructor.prototype.gradient = function(ctx, color, x1, y1, x2, y2, width)
	{
		var gradinput = this.gradientBounds(x1, y1, x2, y2, width);
		var lingrad = ctx.createLinearGradient(gradinput.x1, gradinput.y1, gradinput.x2, gradinput.y2);
		lingrad.addColorStop(0, "black");
		lingrad.addColorStop(0.3, color);
		lingrad.addColorStop(0.5, "white");
		lingrad.addColorStop(0.7, color);
		lingrad.addColorStop(1, "black");
		return lingrad;
	}

	constructor.prototype.gradientBounds = function(x1, y1, x2, y2, width)
	{
		if (x1 == x2)
			return {x1: x1 - (width / 2), y1: (y1 + y2) / 2, x2: x1 + (width / 2), y2: (y1 + y2) / 2};
		else if (y1 == y2)
			return {x1: (x1 + x2) / 2, y1: y1 - (width / 2), x2: (x1 + x2) / 2, y2: y1 + (width / 2)};
		else
		{
			// orthogonal line has negative reciprocal slope
			var slope = -1 / ((y2 - y1) / (x2 - x1));
			// System of equations:
			//   slope = dy / dx
			//   dx^2 + dy^2 = (width / 2)^2 (pythagorean theorum)
			// Subsitute dy = slope * dx and solve for dx:
			var dx = width / 2 * Math.sqrt(1 / (1 + slope * slope));
			//var dx = width / 2 * Math.cos(Math.atan(slope));
			var dy = slope * dx;
			var x = (x1 + x2) / 2;
			var y = (y1 + y2) / 2;
			return {x1: x - dx, y1: y - dy, x2: x + dx, y2: y + dy};
		}
	}

	constructor.prototype.randomPointBetween = function(point1, point2)
	{
		var scale = Math.random();
		return {
			x: Math.floor(point1.x + scale * (point2.x - point1.x)),
			y: Math.floor(point1.y + scale * (point2.y - point1.y))
		};
	}

	constructor.prototype.randomEdgePoint = function(bounds)
	{
		var x;
		var y;
		var width = bounds.w;
		var height = bounds.h;
		var perimeter = 2 * width + 2 * height;
		var offset = Math.floor(Math.random() * perimeter);
		if (offset < width)
		{
			y = 0;
			x = offset;
		}
		else
		{
			offset -= width;
			if (offset < height)
			{
				x = width - 1;
				y = offset;
			}
			else
			{
				offset -= height;
				if (offset < width)
				{
					x = offset;
					y = height - 1;
				}
				else
				{
					x = 0;
					y = offset - width;
				}
			}
		}
		return {x: x, y: y};
	}

	return constructor;

}());

});
