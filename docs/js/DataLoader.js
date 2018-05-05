function DataLoader() {

	var that = this;

	/**
	 * Load text file
	 */
	$("#speed_chart").text("Please wait... data are being loaded. This may take a while.");

	this.loadData = function () {

		var pts = [];
		var route_type = [];
		var built_up_buffer = [];
		var departure_hour = [];
		var route_short_name = [];


		var weekday = new Array(7);
		weekday[0] = "Sun";
		weekday[1] = "Mon";
		weekday[2] = "Tue";
		weekday[3] = "Wed";
		weekday[4] = "Thu";
		weekday[5] = "Fri";
		weekday[6] = "Sat";
		var weekarray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


		var j = 0;
		/**
		 * load data
		 */
		d3.csv('/data/municipalities.csv', function (error, data) {
			let municipalities = {};

			data.forEach(function (v) {
				municipalities[parseInt(v.code)] = {name: v.name, latitude: parseFloat(v.latitude), longitude: parseFloat(v.longitude)};
			});

			d3.csv('/data/sampleTrafficAccidents.csv', function (error, trafficAccidents) {
				trafficAccidents.forEach(function (val, i) {
					pts[j++] = municipalities[val.municipality].longitude * 0.71 + 128;
					pts[j++] = -municipalities[val.municipality].latitude * 1.12 + 142.83;

					departure_hour[i] = val.hour;
					route_type[i] = '3';//val.route_type;
					built_up_buffer[i] = '15.2';//val.built_up__buffer;
					if (val.route_type == "0") {
						route_short_name[i] = val.route_short_name;
					} else {
						route_short_name[i] = "99";
					}
				});

				visualize({
					pts: pts,
					departure_hour: departure_hour,
					route_type: route_type,
					built_up_buffer: built_up_buffer,
					num: trafficAccidents.length,
					route_short_name: route_short_name
				});
			});
		});
	}


	function getMinMax(val, minmax) {
		if (typeof (minmax) == 'undefined') {
			minmax = [];
			minmax.min = Number.MAX_VALUE;
			minmax.max = Number.MIN_VALUE;
		}
		if (val < minmax.min) {
			minmax.min = val
		};
		if (val > minmax.max) {
			minmax.max = val
		};
		return minmax;

	}

}