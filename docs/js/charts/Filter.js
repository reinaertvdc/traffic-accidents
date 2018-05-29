const Filter = {
  createSlider(label, parent, name, min, max, formatter) {
    const checkboxId = 'checkbox-' + name;
    const spanId = 'slider-span-' + name;
    const sliderId = 'slider-' + name;

    parent.append('<div class="filter"><input id="' + checkboxId + '" type="checkbox"><span>' + label + ':</span><span id="' + spanId + '"></span><div id="' + sliderId + '" ></div></div>');

    const checkbox = $('#' + checkboxId);
    const span = $('#' + spanId);
    const slider = $('#' + sliderId);

    if (!formatter) {
      formatter = (v) => {
        return v;
      };
    }

    const formatted = (min, max) => {
      return formatter(min) + ' - ' + formatter(max);
    }

    const updateSpan = () => {
      if (checkbox.is(':checked')) {
        const filters = DataController.getFilters();
        span.text(formatted(filters[name].min, filters[name].max));
      } else {
        span.text('Any');
      }
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

    checkbox.change(() => {
      const enabled = checkbox.is(':checked');

      const filters = DataController.getFilters();
      filters[name].enabled = enabled;
      DataController.setFilters(filters);

      slider.rangeSlider(enabled ? 'enable' : 'disable');
      updateSpan();
    });

    updateSpan();
  },

  createCheckbox(label, parent, name) {
    const checkboxId = 'checkbox-' + name;

    parent.append('<div class="filter"><input id="' + checkboxId + '" type="checkbox"><span>' + label + ':</span></div>');

    const checkbox = $('#' + checkboxId);

    checkbox.change(() => {
      const enabled = checkbox.is(':checked');

      const filters = DataController.getFilters();
      filters[name].enabled = enabled;
      DataController.setFilters(filters);

    });


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

Filter.createSlider('Age', $('.sidebar-age'), 'age', 0, 120);
Filter.createCheckbox('Male', $('.sidebar-age'), 'sex');

Filter.createSlider('Total', $('.sidebar-victims'), 'numVictims', 0, 3);
Filter.createSlider('Slightly injured', $('.sidebar-victims'), 'numSlightlyInjured', 0, 3);
Filter.createSlider('Severely injured', $('.sidebar-victims'), 'numSeverelyInjured', 0, 3);
Filter.createSlider('Mortally injured', $('.sidebar-victims'), 'numMortallyInjured', 0, 3);
Filter.createSlider('Died within 24 hours', $('.sidebar-victims'), 'numDiedWithin24Hours', 0, 3);
Filter.createSlider('Died within 30 days', $('.sidebar-victims'), 'numDiedWithin30Days', 0, 3);