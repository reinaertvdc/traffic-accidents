const DataController = {
  addObserver: (callback) => {
    self.observers.add(callback);

    if (self.dataIsLoaded) {
      callback();
    }
  },

  clearObservers: () => {
    self.observers.clear();
  },

  passesFilter: (v) => {
    const f = self.filters;

    return (
      (!f.years.enabled || (v.year >= f.years.min && v.year <= f.years.max)) &&
      (!f.months.enabled || (v.month >= f.months.min && v.month <= f.months.max)) &&
      (!f.weekDays.enabled || (v.weekDay >= f.weekDays.min && v.weekDay <= f.weekDays.max)) &&
      (!f.hours.enabled || (v.hour >= f.hours.min && v.hour <= f.hours.max)) &&

      (!f.victimType.enabled || f.victimType.values[(typeof v.victimType === 'undefined' ? 0 : v.victimType)]) &&
      (!f.roadUserType.enabled || f.roadUserType.values[(typeof v.roadUserType === 'undefined' ? 0 : v.roadUserType)]) &&
      (!f.roadType.enabled || f.roadType.values[(typeof v.roadType === 'undefined' ? 0 : v.roadType)]) &&
      (!f.lightConditions.enabled || f.lightConditions.values[(typeof v.lightConditions === 'undefined' ? 0 : v.lightConditions)]) &&
      (!f.collisionType.enabled || f.collisionType.values[(typeof v.collisionType === 'undefined' ? 0 : v.collisionType)]) &&
      (!f.areaType.enabled || f.areaType.values[(typeof v.areaType === 'undefined' ? 0 : v.areaType)]) &&

      (!f.age.enabled || (v.age >= f.age.min && v.age <= f.age.max)) &&
      (!f.sex.enabled || f.sex.values[(typeof v.sex === 'undefined' ? 0 : v.sex)]) &&

      (!f.numVictims.enabled || (v.numVictims >= f.numVictims.min && v.numVictims <= f.numVictims.max)) &&
      (!f.numSlightlyInjured.enabled || (v.numSlightlyInjured >= f.numSlightlyInjured.min && v.numSlightlyInjured <= f.numSlightlyInjured.max)) &&
      (!f.numSeverelyInjured.enabled || (v.numSeverelyInjured >= f.numSeverelyInjured.min && v.numSeverelyInjured <= f.numSeverelyInjured.max)) &&
      (!f.numMortallyInjured.enabled || (v.numMortallyInjured >= f.numMortallyInjured.min && v.numMortallyInjured <= f.numMortallyInjured.max)) &&
      (!f.numDiedWithin24Hours.enabled || (v.numDiedWithin24Hours >= f.numDiedWithin24Hours.min && v.numDiedWithin24Hours <= f.numDiedWithin24Hours.max)) &&
      (!f.numDiedWithin30Days.enabled || (v.numDiedWithin30Days >= f.numDiedWithin30Days.min && v.numDiedWithin30Days <= f.numDiedWithin30Days.max))
    );
  },

  filteredForEach: (callback, onFinished) => {
    onFinished = onFinished ? onFinished : () => {};

    DataController.getData((data) => {
      data.trafficAccidents.forEach((entry) => {
        if (DataController.passesFilter(entry)) {
          callback(entry);
        }
      });

      onFinished();
    });
  },

  getData: (callback) => {
    if (self.dataIsLoaded) {
      callback(self.data);
    } else {
      self.requesters.add(callback);
    }
  },

  getFilters: () => {
    return DataController._deepCopy(self.filters);
  },

  setFilters: (v) => {
    self.filters = DataController._deepCopy(v);
    DataController._notifyObservers();
  },

  getNumSelectedYears: () => {
    const f = self.filters;
    
    if(f.years.max == f.years.min)
      return 1;

    numYears = f.years.max - f.years.min

    var emptyYears = [1996, 2000, 2002, 2003, 2004];
    emptyYears.forEach((year) => {
      if (year >= f.years.min && year <= f.years.max) {
        numYears--;
      }
    });

    return numYears;
  },

  getNumSelectedDaysPerYear: () => {
    const f = self.filters;
    const hoursFraction = f.hours.enabled ? ((f.hours.max % 24) - (f.hours.min % 24) + 1) / 24 : 1;
    const daysFraction = f.weekDays.enabled ? (f.weekDays.max - f.weekDays.min + 1) / 7 : 1;
    const monthsFraction = f.months.enabled ? (f.months.max - f.months.min + 1) / 12 : 1;
      
    const totalHours = 365 * 24; 

    selectedHours = hoursFraction * daysFraction * monthsFraction * totalHours;

    return selectedHours / (24);
  },

  getNumSelectedHours: () => {
    const f = self.filters;
    const totalHours = 21 * 365 * 24;
    const hoursFraction = f.hours.enabled ? ((f.hours.max % 24) - (f.hours.min % 24) + 1) / 24 : 1;
    const daysFraction = f.weekDays.enabled ? (f.weekDays.max - f.weekDays.min + 1) / 7 : 1;
    const monthsFraction = f.months.enabled ? (f.months.max - f.months.min + 1) / 12 : 1;

    let numYears = f.years.max - f.years.min + 1;
    [1996, 2000, 2002, 2003, 2004].forEach((year) => {
      if (year >= f.years.min && year <= f.years.max) {
        numYears--;
      }
    });

    const yearsFraction = f.years.enabled ? (numYears / 16) : 1;

    return hoursFraction * daysFraction * monthsFraction * yearsFraction * totalHours;
  },

  _loadDataset: (name, callback) => {
    d3.csv('data/' + name + '.csv', (error, data) => {
      callback(data);
    })
  },

  _loadDatasets: (names, callback) => {
    let datasets = {};
    let todo = new Set(names);

    names.forEach((name) => {
      DataController._loadDataset(name, (data) => {
        datasets[name] = data;

        todo.delete(name);

        if (todo.size == 0) {
          callback(datasets);
        }
      });
    });
  },

  _deepCopy: (object) => {
    return JSON.parse(JSON.stringify(object));
  },

  _notifyObservers: () => {
    self.observers.forEach((callback) => {
      callback();
    });
  },
}

let self = window._DataController;

if (self == null) {
  self = {
    observers: new Set(),
    requesters: new Set(),
    dataIsLoaded: false,
    data: {},
    filters: {
      years: {
        enabled: false,
        min: 1995,
        max: 2016,
      },
      months: {
        enabled: false,
        min: 1,
        max: 12,
      },
      weekDays: {
        enabled: false,
        min: 1,
        max: 7,
      },
      hours: {
        enabled: false,
        min: 0,
        max: 23,
      },
      victimType: {
        enabled: false,
        values: [true, true, true, true],
      },
      roadUserType: {
        enabled: false,
        values: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      },
      roadType: {
        enabled: false,
        values: [true, true, true],
      },
      lightConditions: {
        enabled: false,
        values: [true, true, true, true, true],
      },
      collisionType: {
        enabled: false,
        values: [true, true, true, true, true, true, true, true, true],
      },
      areaType: {
        enabled: false,
        values: [true, true, true],
      },
      age: {
        enabled: false,
        min: 0,
        max: 120,
      },
      sex: {
        enabled: false,
        values: [true, true, true],
      },
      numVictims: {
        enabled: false,
        min: 0,
        max: 3,
      },
      numSlightlyInjured: {
        enabled: false,
        min: 0,
        max: 3,
      },
      numSeverelyInjured: {
        enabled: false,
        min: 0,
        max: 3,
      },
      numMortallyInjured: {
        enabled: false,
        min: 0,
        max: 3,
      },
      numDiedWithin24Hours: {
        enabled: false,
        min: 0,
        max: 3,
      },
      numDiedWithin30Days: {
        enabled: false,
        min: 0,
        max: 3,
      },
    }
  };

  window._DataController = self;

  const datasetNames = ['arrondissements', 'municipalities', 'trafficAccidents100'];

  DataController._loadDatasets(datasetNames, (datasets) => {
    datasetNames.forEach((datasetName) => {
      if (datasetName.startsWith('trafficAccidents')) {
        datasets['trafficAccidents'] = datasets[datasetName];
        datasets[datasetName] = undefined;
        datasetName = 'trafficAccidents';
      }

      datasets[datasetName].forEach((entry) => {
        for (const property in entry) {
          if (entry.hasOwnProperty(property)) {
            let v = entry[property];

            if (v === '') {
              entry[property] = undefined;
            } else {
              v = parseFloat(entry[property]);

              if (!isNaN(v)) {
                entry[property] = v;
              }
            }
          }
        }
      });
    });

    self.data = datasets;
    self.dataIsLoaded = true;

    self.requesters.forEach((callback) => {
      callback(self.data);
    })
    self.requesters = new Set();
  });
}