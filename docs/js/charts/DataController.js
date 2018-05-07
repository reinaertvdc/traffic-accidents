const DataController = {
  addObserver: (callback) => {
    self.observers.add(callback);

    if (self.dataIsLoaded) {
      callback();
    }
  },

  passesFilter: (v) => {
    const f = self.filters;
    return (
      (!f.years.enabled || (v.year >= f.years.min && v.year <= f.years.max)) &&
      (!f.months.enabled || (v.month >= f.months.min && v.month <= f.months.max)) &&
      (!f.weekdays.enabled || (v.week_day >= f.weekdays.min && v.week_day <= f.weekdays.max)) &&
      (!f.hours.enabled || ((v.hour % 24) >= f.hours.min && (v.hour % 24) <= f.hours.max))
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

  getNumSelectedHours: () => {
    const f = self.filters;
    const totalHours = 21 * 365 * 24;
    const hoursFraction = f.hours.enabled ? ((f.hours.max % 24) - (f.hours.min % 24) + 1) / 24 : 1;
    const daysFraction = f.weekdays.enabled ? (f.weekdays.max - f.weekdays.min + 1) / 7 : 1;
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
      weekdays: {
        enabled: false,
        min: 1,
        max: 7,
      },
      hours: {
        enabled: false,
        min: 0,
        max: 23,
      }
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