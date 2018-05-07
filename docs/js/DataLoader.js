const Ordinals = {
	months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
	sex: ['?', 'M', 'F']
}

function DataLoader() {
	this.loadData = function () {
		const arrays = {
			pts: [],
			year: [],
			month: [],
			monthDay: [],
			weekDay: [],
			hour: [],
			numVictims: [],
			numSlightlyInjured: [],
			numSeverelyInjured: [],
			numMortallyInjured: [],
			numDiedWithin24Hours: [],
			numDiedWithin30Days: [],
			age: [],
			sex: []
		}

		let j = 0;

		d3.csv('data/municipalities.csv', function (error, data) {
			let municipalities = {};

			data.forEach(function (v) {
				municipalities[parseInt(v.code)] = {
					name: v.name,
					latitude: parseFloat(v.latitude),
					longitude: parseFloat(v.longitude)
				};
			});

			d3.csv('data/trafficAccidents100.csv', function (error, trafficAccidents) {
				trafficAccidents.forEach(function (val, i) {
					arrays.pts[j++] = municipalities[val.municipality].longitude * 0.71 + 128;
					arrays.pts[j++] = -municipalities[val.municipality].latitude * 1.12 + 142.83;

					arrays.year[i] = val.year;
					arrays.month[i] = Ordinals.months[parseInt(val.month) - 1];
					arrays.monthDay[i] = val.monthDay;
					arrays.weekDay[i] = Ordinals.weekDays[parseInt(val.weekDay) - 1];
					arrays.hour[i] = val.hour;
					arrays.numVictims[i] = val.numVictims;
					arrays.numSlightlyInjured[i] = val.numSlightlyInjured;
					arrays.numSeverelyInjured[i] = val.numSeverelyInjured;
					arrays.numMortallyInjured[i] = val.numMortallyInjured;
					arrays.numDiedWithin24Hours[i] = val.numDiedWithin24Hours;
					arrays.numDiedWithin30Days[i] = val.numDiedWithin30Days;
					arrays.age[i] = val.age.length ? val.age : '-1';
					arrays.sex[i] = parseInt(val.sex) in Ordinals.sex ? Ordinals.sex[parseInt(val.sex)] : Ordinals.sex[0];
				});

				arrays.num = trafficAccidents.length;

				visualize(arrays);
			});
		});
	}
}