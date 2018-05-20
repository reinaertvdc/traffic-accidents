const Tabs = {
  all: $('.content > *'),

  init: function () {
    for (let i = 0; i < Tabs.all.length; i++) {
      const tab = Tabs.all[i];
      
      $('.tabs').append('<div role="button" id="button-' + tab.getAttribute('id') + '" onclick="Tabs.set(\'' + tab.getAttribute('id') + '\')"><span>' + tab.getAttribute('name') + '</span></div>');
    }

    Tabs.set(Tabs.all[0].getAttribute('id'));
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
      const update = eval(charts[i].getAttribute('id')).update;

      DataController.addObserver(() => {
        update();
      });

      update();
    }
  }
}

Tabs.init();