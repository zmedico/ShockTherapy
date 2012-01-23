
function elementContentOffset(element)
{

	var x = 0, y = 0;

	while (element.offsetParent != null) {
		x += element.offsetLeft;
		y += element.offsetTop;
		element = element.offsetParent;
	}

	return {x: x, y: y};
}
