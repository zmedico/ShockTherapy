
function elementContentOffset(element)
{

	var x = element.offsetLeft, y = element.offsetTop;
	while (element.offsetParent != null) {
		element = element.offsetParent;
		x += element.offsetLeft;
		y += element.offsetTop;
	}

	return {x: x, y: y};
}
