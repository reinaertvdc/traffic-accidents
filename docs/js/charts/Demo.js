const Demo = {
  init: () => {},

  update: () => {
    DataController.getData((data) => {
      const element = $('#Demo');
      element.empty();

      let table = '<table><tr><th>Arrondissement</th><th>Number of accidents</th></tr>';
      const counts = {};

      DataController.filteredForEach((entry) => {
        const arrondissement = Math.floor(entry.municipality / 1000);

        if (arrondissement in counts) {
          counts[arrondissement] += 1;
        } else {
          counts[arrondissement] = 1;
        }
      }, () => {
        for (const arrondissement in counts) {
          data.arrondissements.forEach((entry) => {
            if (arrondissement == entry.code) {
              table += '<tr><td>' + entry.name + '</td><td>' + counts[arrondissement] + '</td></tr>';
            }
          });
        }

        table += '</table>';

        element.append(table);
      });
    });
  }
}