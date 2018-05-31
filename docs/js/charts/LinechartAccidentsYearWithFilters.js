const LinechartAccidentsYearWithFilters = {
  maxRange : 0,
  update: () => {
    const elementId = '#LinechartAccidentsYearWithFilters';
    $(elementId).empty();
    let gatherData = [];
    let accidents = [];
    var i = 0;

    var amYearsSelected = DataController.getNumSelectedYears();
    var daysSelectedInYear = DataController.getNumSelectedDaysPerYear();
    
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
              "value": + value / daysSelectedInYear
              // "value": +value
            }
            i++;
          }
      }
            // console.log(accidents);


      

      var margin = {
        top: 100,
        right: 20,
        bottom: 150,
        left: 100
        },
        width = 1000 ,
        height = 500 ;

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

      // y.domain([0, LinechartAccidentsYearWithFilters.maxRange]);
      // y.domain([0, range]);
      y.domain([0, 4]);

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

      svg.append("text")
      .attr("x", width / 2 )
      .attr("y", 0)
      .style("font-size", "24px")
      .style("text-anchor", "middle")
      .text("Total traffic victims per year");

      svg.append("text")
      .attr("x", width / 2 )
      .attr("y",  height + 40)
      .style("text-anchor", "middle")
      .text("Year");

        svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left/2)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of victims per day");  
    });
  }
}