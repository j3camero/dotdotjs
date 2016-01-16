

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
    return x * Math.sqrt(1.0 - x * x) + Math.asin(x);
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
    var a = x * x + y * y >= 1 ? 0 : Math.PI / 4 + x * y - hcix - hciy;
    var b = Math.PI / 2 - hcix - a;
    var d = Math.PI / 2 - hciy - a;
    var c = Math.PI - a - b - d;
    return [a, b, c, d];
}

function AssertAlmostEquals(a, b, max_difference=0.0000001) {
    console.assert(Math.abs(a - b) < max_difference);
}

function TestQuadrantsOfUnitCircle() {
    q = CalculateAreasOfQuadrantsOfUnitCircle(0, 0);
    for (var i = 0; i < 4; ++i) {
	AssertAlmostEquals(q[i], Math.PI / 4);
    }
    AssertAlmostEquals(CalculateAreasOfQuadrantsOfUnitCircle(1, 1)[0], 0);
}

TestQuadrantsOfUnitCircle();
