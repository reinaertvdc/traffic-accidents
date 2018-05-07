const Filter = {
  create(label, parent, name, min, max, formatter) {
    const checkboxId = 'checkbox-' + name;
    const spanId = 'slider-span-' + name;
    const sliderId = 'slider-' + name;

    const checkbox = $(checkboxId);
    const span = $(spanId);
    const slider = $(sliderId);

    parent.append('<input id="' + checkboxId + '" type="checkbox"><span>' + label + ':</span><span id="' + spanId + '"></span><div id="' + sliderId + '" ></div>')

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
  }
}

Filter.create('Year', $('#arrondissements-view'), 'year', 1995, 2016);