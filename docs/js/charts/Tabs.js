const Tabs = {
  all: $('.content > *'),

  init: function () {
    for (let i = 0; i < Tabs.all.length; i++) {
      const tab = Tabs.all[i];

      $('.tabs').append('<div role="button" id="button-' + tab.getAttribute('id') + '" onclick="Tabs.set(\'' + tab.getAttribute('id') + '\')"><span>' + tab.getAttribute('name') + '</span></div>');

      const children = $(tab).children();

      for (let j = 0; j < children.length; j++) {
        const chartId = children[j].getAttribute('id');

        try {
          eval(chartId).init();
        } catch (error) {}
      }
    }

    setTimeout(() => {
      Tabs.set(Tabs.all[0].getAttribute('id'));
    }, 100);
  },

  set: function (id) {
    for (let i = 0; i < Tabs.all.length; i++) {
      $('#button-' + Tabs.all[i].getAttribute('id')).attr('selected', false);
      $('#' + Tabs.all[i].getAttribute('id')).attr('selected', false);
    }

    $('#button-' + id).attr('selected', true);
    $('#' + id).attr('selected', true);

    const charts = $('#' + id + '>*');

    DataController.clearObservers();

    for (let i = 0; i < charts.length; i++) {
      const chartId = charts[i].getAttribute('id');
      const chart = eval(chartId);

      DataController.addObserver(() => {
        chart.update();
      });
    }
  }
}

Tabs.init();