

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
