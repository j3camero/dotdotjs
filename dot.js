
// Calculate the 2D circle integral using an extremely slow but simple and
// reliable approach. For testing and verification.
function NumericalUnitCirclePartition(x, y, resolution) {
    total_area = 0;
    quadrant_counters = [0, 0, 0, 0];
    for (var i = -resolution / 2 - 1; i < resolution / 2 + 1; ++i) {
	for (var j = -resolution / 2 - 1; j < resolution / 2 + 1; ++j) {
	    if (i * i + j * j > resolution * resolution / 4) {
		continue;
	    }
	    ++total_area;
	    if (i < x * resolution / 2) {
		if (j < y * resolution / 2) {
		    ++quadrant_counters[0];
		} else {
		    ++quadrant_counters[3];
		}
	    } else {
		if (j < y * resolution / 2) {
		    ++quadrant_counters[1];
		} else {
		    ++quadrant_counters[2];
		}
	    }
	}
    }
    if (total_area == 0) {
	return quadrant_counters;
    }
    for (var i = 0; i < 4; ++i) {
	quadrant_counters[i] /= total_area;
    }
    return quadrant_counters;
}

// Integral of sqrt(1-x^2), domain is x=[-1,1]
// Useful for calculating the area of two components of a circle separated by
// a chord.
function HalfCircleIntegral(x) {
    return 0.5 * (x * Math.sqrt(1.0 - x * x) + Math.asin(x));
}

// The unit circle is divided into four quadrants by a point (x,y). Returns
// their areas.
function CalculateAreasOfQuadrantsOfUnitCircle(x, y) {
    if (x < 0) {
	q = CalculateAreasOfQuadrantsOfUnitCircle(-x, y);
	return [q[3], q[2], q[1], q[0]];
    }
    if (y < 0) {
	q = CalculateAreasOfQuadrantsOfUnitCircle(x, -y);
	return [q[1], q[0], q[3], q[2]];
    }
    var hcix = HalfCircleIntegral(x);
    var hciy = HalfCircleIntegral(y);
    var a = 0;
    if (x * x + y * y < 1) {
	a = Math.PI / 4 + x * y - hcix - hciy;
    }
    var b = Math.PI / 2 - 2 * hcix - a;
    var d = Math.PI / 2 - 2 * hciy - a;
    var c = Math.PI - a - b - d;
    return [a, b, c, d];
}

function AssertAlmostEquals(a, b, message="", max_difference=0.0000001) {
    if (message.length > 0) {
	message += " ";
    }
    message += "(" + a + " != " + b + ")";
    console.assert(Math.abs(a - b) < max_difference, message);
}

function TestQuadrantsOfUnitCircle() {
    // Chop the circle at its center, into four equal quarters.
    q = CalculateAreasOfQuadrantsOfUnitCircle(0, 0);
    for (var i = 0; i < 4; ++i) {
	AssertAlmostEquals(q[i], Math.PI / 4);
    }
    // Corners and edges.
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(1, 1)[0], 0);
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(1, 0)[0], 0);
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(1, -1)[0], 0);
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(0, -1)[0],
		       Math.PI / 2);
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(-1, -1)[0],
		       Math.PI);
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(-1, 0)[0],
		       Math.PI / 2);
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(-1, 1)[0], 0);
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(0, 1)[0], 0);
    // Some points along the edge of the circle in the positive quadrant.
    for (var i = 0; i <= 9; ++i) {
	var radians = i * Math.PI / 18;
	AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(
	    Math.cos(radians), Math.sin(radians))[0], 0, "fail: i=" + i);
    }
}

function DrawDot(context, x, y, radius) {
    if (radius > 0.5) {
	return;
    }
    var cx = Math.floor(x);
    var cy = Math.floor(y);
    // Find the pixel corner nearest the center of the dot.
    if (x - cx > 0.5) ++cx;
    if (y - cy > 0.5) ++cy;
    q = CalculateAreasOfQuadrantsOfUnitCircle((cx - x) / radius,
					      (cy - y) / radius);
    var b = Math.floor(q[0] * radius * radius * 255);
    context.fillStyle = "rgb(" + b + "," + b + "," + b + ")";
    context.fillRect(cx, cy, 1, 1);
    b = Math.floor(q[1] * radius * radius * 255);
    context.fillStyle = "rgb(" + b + "," + b + "," + b + ")";
    context.fillRect(cx, cy - 1, 1, 1);
    b = Math.floor(q[2] * radius * radius * 255);
    context.fillStyle = "rgb(" + b + "," + b + "," + b + ")";
    context.fillRect(cx - 1, cy - 1, 1, 1);
    b = Math.floor(q[3] * radius * radius * 255);
    context.fillStyle = "rgb(" + b + "," + b + "," + b + ")";
    context.fillRect(cx - 1, cy, 1, 1);
}

function InterpolateColor(mix, r1, g1, b1, r2, g2, b2) {
    var r = Math.floor(mix * r2 + (1 - mix) * r1);
    var g = Math.floor(mix * g2 + (1 - mix) * g1);
    var b = Math.floor(mix * b2 + (1 - mix) * b1);
    return "rgb(" + r + "," + g + "," + b + ")";
}

function RenderCircleQuadrantHeatmap(canvas) {
    var context = canvas.getContext("2d");
    var diameter = Math.min(canvas.width, canvas.height);
    for (var i = 0; i < diameter; ++i) {
	for (var j = 0; j < diameter; ++j) {
	    var x = 2 * i / diameter - 1;
	    var y = 2 * j / diameter - 1;
	    var val = CalculateAreasOfQuadrantsOfUnitCircle(x, y)[0] / Math.PI;
	    if (val < 0.25) {
		context.fillStyle = InterpolateColor(4 * val, 0, 255, 255,
						     0, 255, 0);
	    } else if (val < 0.5) {
		context.fillStyle = InterpolateColor(4 * val - 1, 0, 255, 0,
						     255, 255, 0);
	    } else if (val < 0.75) {
		context.fillStyle = InterpolateColor(4 * val - 2, 255, 255, 0,
						     255, 128, 0);
	    } else {
		context.fillStyle = InterpolateColor(4 * val - 3, 255, 128, 0,
						     255, 0, 0);
	    }
	    context.fillRect(i, j, 1, 1);
	}
    }
}

function CopyAndResizePixelated(input_canvas, output_canvas) {
    var ctx = output_canvas.getContext("2d");
    var p = input_canvas
	.getContext("2d")
	.getImageData(0, 0, input_canvas.width, input_canvas.height)
	.data;
    var i = 0;
    for (var y = 0; y < input_canvas.height; ++y) {
	for (var x = 0; x < input_canvas.width; ++x) {
	    ctx.fillStyle = "rgb(" + p[i] + "," + p[i+1] + "," + p[i+2] + ")";
	    ctx.fillRect(x * output_canvas.width / input_canvas.width,
			 y * output_canvas.height / input_canvas.height,
			 output_canvas.width / input_canvas.width,
			 output_canvas.height / input_canvas.height);
	    i += 4;
	}
    }
}

var mouse_fraction_x = 0.5;
var mouse_fraction_y = 0.5;

function DrawMouseTrackingCircles() {
    var small_single_pixel = document.getElementById('small_single_pixel');
    var ctx = small_single_pixel.getContext("2d");
    var x = Math.floor(mouse_fraction_x * small_single_pixel.width);
    var y = Math.floor(mouse_fraction_y * small_single_pixel.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, small_single_pixel.width, small_single_pixel.height);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(x, y, 1, 1);
    var big_single_pixel = document.getElementById('big_single_pixel');
    CopyAndResizePixelated(small_single_pixel, big_single_pixel);
    var small_arc = document.getElementById('small_arc');
    ctx = small_arc.getContext("2d");
    x = mouse_fraction_x * small_arc.width;
    y = mouse_fraction_y * small_arc.height;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, small_arc.width, small_arc.height);
    ctx.beginPath();
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
    ctx.fill();
    var big_arc = document.getElementById('big_arc');
    CopyAndResizePixelated(small_arc, big_arc);
    var big_hires_circle = document.getElementById('big_hires_circle');
    ctx = big_hires_circle.getContext("2d");
    x = mouse_fraction_x * big_hires_circle.width;
    y = mouse_fraction_y * big_hires_circle.height;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, big_hires_circle.width, big_hires_circle.height);
    ctx.strokeStyle = "rgb(96,96,96)";
    ctx.lineWidth = 1;
    for (var i = 1; i < small_arc.width; ++i) {
	var d = i * big_hires_circle.width / small_arc.width;
	ctx.beginPath();
	ctx.moveTo(d, 0);
	ctx.lineTo(d, big_hires_circle.height);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, d);
	ctx.lineTo(big_hires_circle.width, d);
	ctx.stroke();
    }
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.beginPath();
    ctx.arc(x, y, 0.5 * big_hires_circle.width / small_arc.width,
	    0, 2 * Math.PI);
    ctx.fill();
    var small_dotdot = document.getElementById('small_dotdot');
    ctx = small_dotdot.getContext("2d");
    x = mouse_fraction_x * small_dotdot.width;
    y = mouse_fraction_y * small_dotdot.height;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, small_dotdot.width, small_dotdot.height);
    DrawDot(ctx, x, y, 0.5);
    var big_dotdot = document.getElementById('big_dotdot');
    CopyAndResizePixelated(small_dotdot, big_dotdot);
}

function MakeMouseMoveHandlers() {
    var canvii = document.getElementsByClassName("canvii");
    for (var i = 0; i < canvii.length; ++i) {
	canvii[i].addEventListener("mousemove", function(e) {
	    var rect = this.getBoundingClientRect();
	    var mouseX = e.clientX - rect.left;
	    var mouseY = e.clientY - rect.top;
	    mouse_fraction_x = mouseX / rect.width;
	    mouse_fraction_y = mouseY / rect.height;
	    DrawMouseTrackingCircles();
	    console.log("" + mouse_fraction_x + " " + mouse_fraction_y);
	});
    }
}

function OnLoad() {
    TestQuadrantsOfUnitCircle();
    MakeMouseMoveHandlers();
    DrawMouseTrackingCircles();
}
