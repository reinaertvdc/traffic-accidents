const Filter = {
  create(label, parent, name, filterId, checkboxId, spanId, callback) {
    parent.append('<div id="' + filterId + '" class="filter"><input id="' + checkboxId + '" type="checkbox"><span>' + label + ':</span><span id="' + spanId + '"></span></div>');

    const span = $('#' + spanId);
    const checkbox = $('#' + checkboxId);

    checkbox.change(() => {
      const enabled = checkbox.is(':checked');

      const filters = DataController.getFilters();
      filters[name].enabled = enabled;
      DataController.setFilters(filters);

      callback();
    });
  },

  createSlider(label, parent, name, min, max, formatter) {
    const filterId = 'filter-' + name;
    const checkboxId = 'checkbox-' + name;
    const spanId = 'span-' + name;
    const sliderId = 'slider-' + name;

    let updateSpan = () => {};

    Filter.create(label, parent, name, filterId, checkboxId, spanId, () => {
      updateSpan();
    });

    const filter = $('#' + filterId);
    const checkbox = $('#' + checkboxId);
    const span = $('#' + spanId);

    filter.append('<div id="' + sliderId + '" ></div>');

    const slider = $('#' + sliderId);

    if (!formatter) {
      formatter = (v) => {
        return v;
      };
    }

    const formatted = (min, max) => {
      return formatter(min) + ' - ' + formatter(max);
    }

    slider.rangeSlider({
      enabled: false,
      arrows: false,
      valueLabels: 'hide',
      wheelMode: 'scroll',
      wheelSpeed: -1,
      bounds: {
        min: min,
        max: max
      },
      defaultValues: {
        min: min,
        max: max
      },
      step: 1,
    });

    slider.bind('valuesChanging', (e, data) => {
      const filters = DataController.getFilters();
      filters[name].min = data.values.min;
      filters[name].max = data.values.max;
      DataController.setFilters(filters);
      updateSpan();
    });

    updateSpan = () => {
      const enabled = checkbox.is(':checked');

      slider.rangeSlider(enabled ? 'enable' : 'disable');

      if (enabled) {
        const filters = DataController.getFilters();
        span.text(formatted(filters[name].min, filters[name].max));
      } else {
        span.text('Any');
      }
    };

    updateSpan();
  },

  createDropdown(label, parent, name, values) {
    values.unshift('Unknown');

    const filterId = 'filter-' + name;
    const checkboxId = 'checkbox-' + name;
    const spanId = 'span-' + name;
    const dropdownId = 'dropdown-' + name;

    let updateSpan = () => {};

    Filter.create(label, parent, name, filterId, checkboxId, spanId, () => {
      updateSpan();
    });

    const filter = $('#' + filterId);
    const checkbox = $('#' + checkboxId);
    const span = $('#' + spanId);

    filter.append('<div id="' + dropdownId + '" class="dropdown"></div>');

    const dropdown = $('#' + dropdownId);

    const filters = DataController.getFilters();

    const checkboxes = [];

    values.forEach((v, i) => {
      const valueCheckboxId = filterId + '-' + i;

      dropdown.append('<span><input id="' + valueCheckboxId + '" type="checkbox"><span>' + v + '</span></span>');

      const valueCheckbox = $('#' + valueCheckboxId);

      checkboxes.push(valueCheckbox);

      valueCheckbox.prop('checked', filters[name].values[i]);

      valueCheckbox.click(() => {
        const filters = DataController.getFilters();
        filters[name].values[i] = valueCheckbox.is(':checked');
        DataController.setFilters(filters);
        updateSpan();
      });
    });

    updateSpan = () => {
      const enabled = checkbox.is(':checked');

      span.text(enabled ? 'Some' : 'Any');

      checkboxes.forEach(element => {
        element.prop('disabled', !enabled);
      })
    };

    updateSpan();
  }
}

Filter.createSlider('Years', $('.sidebar-datetime'), 'years', 1995, 2016);
Filter.createSlider('Months', $('.sidebar-datetime'), 'months', 1, 12, (v) => {
  return [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][v];
});
Filter.createSlider('Weekdays', $('.sidebar-datetime'), 'weekDays', 1, 7, (v) => {
  return ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][v];
});
Filter.createSlider('Hours', $('.sidebar-datetime'), 'hours', 0, 23);

Filter.createSlider('Age', $('.sidebar-demographics'), 'age', 0, 120);
Filter.createDropdown('Sex', $('.sidebar-demographics'), 'sex', ['Male', 'Female']);

Filter.createSlider('Total', $('.sidebar-victims'), 'numVictims', 0, 3);
Filter.createSlider('Slightly injured', $('.sidebar-victims'), 'numSlightlyInjured', 0, 3);
Filter.createSlider('Severely injured', $('.sidebar-victims'), 'numSeverelyInjured', 0, 3);
Filter.createSlider('Mortally injured', $('.sidebar-victims'), 'numMortallyInjured', 0, 3);
Filter.createSlider('Died within 24 hours', $('.sidebar-victims'), 'numDiedWithin24Hours', 0, 3);
Filter.createSlider('Died within 30 days', $('.sidebar-victims'), 'numDiedWithin30Days', 0, 3);