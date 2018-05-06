function DataLoader() {
	this.loadData = function () {
		const arrays = {
			pts: [],
			year: [],
			month: [],
			monthDay: [],
			weekDay: [],
			hour: [],
			age: [],
			sex: []
		}

		let j = 0;

		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const sex = ['Male', 'Female'];

		d3.csv('data/municipalities.csv', function (error, data) {
			let municipalities = {};

			data.forEach(function (v) {
				municipalities[parseInt(v.code)] = {name: v.name, latitude: parseFloat(v.latitude), longitude: parseFloat(v.longitude)};
			});

			d3.csv('data/trafficAccidents100.csv', function (error, trafficAccidents) {
				trafficAccidents.forEach(function (val, i) {
					arrays.pts[j++] = municipalities[val.municipality].longitude * 0.71 + 128;
					arrays.pts[j++] = -municipalities[val.municipality].latitude * 1.12 + 142.83;

					arrays.year[i] = val.year;
					arrays.month[i] = months[parseInt(val.month) - 1];
					arrays.monthDay[i] = val.monthDay;
					arrays.weekDay[i] = weekDays[parseInt(val.weekDay) - 1];
					arrays.hour[i] = val.hour;
					arrays.age[i] = val.age;
					arrays.sex[i] = sex[parseInt(val.sex) - 1];
				});

				arrays.num = trafficAccidents.length;

				visualize(arrays);
			});
		});
	}
}