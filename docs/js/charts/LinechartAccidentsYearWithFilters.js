const LinechartAccidentsYearWithFilters = {
  maxRange : 0,
  update: () => {
    const elementId = '#LinechartAccidentsYearWithFilters';
    $(elementId).empty();
    let gatherData = [];
    let accidents = [];
    var i = 0;


    
    DataController.filteredForEach((entry) => {
      gatherData[i] = entry;
      i++;
    },() => { 
      var parseDate = d3.time.format("%Y").parse;
        var i = 0;
        for (var y = 1995; y <= 2016; y++) {
          var value = gatherData.filter(
            function (val) {
              return val.year === y;
            }
          ).length;

          if (value > 0) {
            accidents[i] = {
              "year": parseDate(y + ""),
              "value": +value
            }
            i++;
          }
      }


      

      var margin = {
          top: 30,
          right: 20,
          bottom: 30,
          left: 50
        },
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      // Set the ranges
      var x = d3.time.scale().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);

      // Define the axes
      var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(accidents.length);

      var yAxis = d3.svg.axis().scale(y)
        .orient("left");

      // Define the line
      var valueline = d3.svg.line()
        .x(function (d) {
          return x(d.year);
        })
        .y(function (d) {
          return y(d.value);
        });

      // Adds the svg canvas
      var svg = d3.select(elementId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


      // Scale the range of the data
      x.domain(d3.extent(accidents, function (d) {
        return d.year;
      }));
      

      var range = d3.max(accidents, function (d) {
          return d.value;
      });

      if(range > LinechartAccidentsYearWithFilters.maxRange){
        LinechartAccidentsYearWithFilters.maxRange = range;
      }

      y.domain([0, LinechartAccidentsYearWithFilters.maxRange]);

      // Add the valueline path.
      svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(accidents));

      svg.selectAll("dot")
        .data(accidents)
        .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", function (d) {
          return x(d.year);
        })
        .attr("cy", function (d) {
          return y(d.value);
        });

      // Add the X Axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // Add the Y Axis
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    });
  }
}