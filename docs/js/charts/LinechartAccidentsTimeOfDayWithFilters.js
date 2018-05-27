const LinechartAccidentsTimeOfDayWithFilters = {
   maxRange : 0,
  update: () => {
    const elementId = '#LinechartAccidentsTimeOfDayWithFilters';
    $(elementId).empty();
    let weekendCounts = [];
    let weekdaysCounts = [];
    let dayhourCount = [];
    let gatherData = [];
    var i = 0;


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
            
                return val.weekDay <= 5 && val.hour === h;

                
            }
          ).length
        }
        i++;

 

        weekendCounts[j] = {
          "hour": h,
          "value": gatherData.filter(
            function (val) {
              return val.weekDay > 5 && val.hour === h;
            }
          ).length
        }
        j++;

       
      } 

   

      var types = ["weekdays", "weekend"];
      counts = [];
      counts[0] = weekdaysCounts;
      counts[1] = weekendCounts;


      var margin = {
          top: 30,
          right: 20,
          bottom: 30,
          left: 50
        },
        width = 900 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;



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


      // Scale the range of the data
      x.domain(d3.extent(weekdaysCounts, function (d) {
        return d.hour;
      }));


      var range = d3.max(weekdaysCounts, function (d) {
          return d.value;
      });

      if(range > LinechartAccidentsTimeOfDayWithFilters.maxRange){
        LinechartAccidentsTimeOfDayWithFilters.maxRange = range;
      }

      y.domain([0, LinechartAccidentsTimeOfDayWithFilters.maxRange]);


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
        .text("weekedays");
    });
  }
}