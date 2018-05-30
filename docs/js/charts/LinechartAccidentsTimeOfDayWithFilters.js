const LinechartAccidentsTimeOfDayWithFilters = {
   maxRange : 0,
  update: () => {
    var daysSelectedInYear = DataController.getNumSelectedDaysPerYear();
    var amYearsSelected = DataController.getNumSelectedYears();

    const elementId = '#LinechartAccidentsTimeOfDayWithFilters';
    $(elementId).empty();
    let weekendCounts = [];
    let weekdaysCounts = [];
    let dayhourCount = [];
    let gatherData = [];
    var i = 0;

    console.log(daysSelectedInYear);
    console.log(amYearsSelected);

    DataController.filteredForEach((entry) => {
      gatherData[i] = entry;
      i++;
    }, () => {
      var i = 0;
      var j = 0;
      for (var h = 0; h <= 23; h++) {

        weekdaysCounts[i] = {
          "hour": h,
          "value": gatherData.filter(
            function (val) {
            
                return (val.weekDay <= 5 && val.hour === h) ;

                
            }
          ).length / (daysSelectedInYear * amYearsSelected)
        }
        i++;

 

        weekendCounts[j] = {
          "hour": h,
          "value": gatherData.filter(
            function (val) {
              return (val.weekDay > 5 && val.hour === h);
            }
          ).length / (daysSelectedInYear * amYearsSelected)
        }
        j++;

       
      } 

   

      var types = ["weekdays", "weekend"];
      counts = [];
      counts[0] = weekdaysCounts;
      counts[1] = weekendCounts;


      var margin = {
        top: 100,
        right: 20,
        bottom: 150,
        left: 100
        },
        width = 1000 ,
        height = 500;



      // Set the ranges
      var x = d3.scale.linear().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);

      // Define the axes
      var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(24);

      var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(12);

      // Define the line
      var valueline = d3.svg.line()
        .x(function (d) {
          return x(d.hour);
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

svg.append("text")
    .attr("x", width / 2 )
    .attr("y", 0)
    .style("font-size", "24px")
    .style("text-anchor", "middle")
    .text("Traffic victims per time of day");

svg.append("text")
    .attr("x", width / 2 )
    .attr("y",  height + 40)
    .style("text-anchor", "middle")
    .text("Time of day (hour)");

        svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left/2)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of victims per day");  

      // Scale the range of the data
      x.domain(d3.extent(weekdaysCounts, function (d) {
        return d.hour;
      }));

      var rangeWeekDays = 0;
      var rangeWeekendDays = 0;

      var rangeWeekDays = d3.max(weekdaysCounts, function (d) {
          return d.value;
      });
      var rangeWeekendDays = d3.max(weekendCounts, function (d) {
        return d.value;
      });

      var range = Math.max(rangeWeekDays, rangeWeekendDays);

      if(range > LinechartAccidentsTimeOfDayWithFilters.maxRange){
        LinechartAccidentsTimeOfDayWithFilters.maxRange = range;
      }

      // y.domain([0, LinechartAccidentsTimeOfDayWithFilters.maxRange]);
      y.domain([0, range]);


      // Add the valueline path.
      svg.append("path")
        .attr("class", "line")
        .style("stroke", "#ca0020")
        .attr("d", valueline(weekdaysCounts));


      svg.append("path")
        .attr("class", "line")
        .style("stroke", "steelblue")
        .attr("d", valueline(weekendCounts));


      // Add the X Axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // Add the Y Axis
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      var legend = svg.append("g")
        .attr("class", "legend")
        .style("opacity", "1");

      legend.append("rect")
        .attr("transform", "translate(0,0)")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "steelblue");

      legend.append("text")
        .attr("transform", "translate(0,0)")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("weekend");

      legend.append("rect")
        .attr("transform", "translate(0,20)")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "#ca0020");

      legend.append("text")
        .attr("transform", "translate(0,20)")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("weekdays");
    });
  }
}