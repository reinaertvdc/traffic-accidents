const BarchartAreaTypeWithFilters = {
  maxRange : 0,

  update: () => {
    var daysSelectedInYear = DataController.getNumSelectedDaysPerYear();

    const elementId = '#BarchartAreaTypeWithFilters';
    $(elementId).empty();
    let gatherData = [];
    let accidents = [];
    var i = 0;

    DataController.filteredForEach((entry) => {
      var index = BarchartRoadTypeWithFilters.yearInArray(entry.year, gatherData);
      if (index != -1) {
        if(entry.areaType == 1 || entry.areaType == 2)
          gatherData[index][entry.areaType] += 1;
      } else {
        gatherData[i] = [];
        gatherData[i][0] = entry.year;
        gatherData[i][1] = 0;
        gatherData[i][2] = 0;
        gatherData[i][entry.areaType] += 1;
        i++;
      }
    }, () => {
      var i = 0;

      for (var y = 1995; y <= 2016; y++) {
        var index = BarchartRoadTypeWithFilters.yearInArray(y, gatherData);
        if (index != -1) {
          accidents[i] = {
            "year": y,
            "values": [{
              "type": "Within built-up area",
              "value": gatherData[index][1] / daysSelectedInYear
            },
            {
              "type": "Outside of built-up area",
              "value": gatherData[index][2] / daysSelectedInYear
            }
            ]
          }
          i++;
        }
      }

      var margin = {
        top: 100,
        right: 20,
        bottom: 150,
        left: 100
      },
        width = 960 ,
        height = 500 ;

      var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

      var x1 = d3.scale.ordinal();

      var y = d3.scale.linear()
        .range([height, 0]);

      var xAxis = d3.svg.axis()
        .scale(x0)
        .tickSize(0)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      var color = d3.scale.ordinal()
        .range(["#ca0020", "#f4a582", "#d5d5d5", "#92c5de", "#0571b0"]);

      var svg = d3.select(elementId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

         svg.append("text")
      .attr("x", width / 2 )
      .attr("y", 0)
      .style("font-size", "24px")
      .style("text-anchor", "middle")
      .text("Traffic victims per area type");

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

      var categoriesNames = accidents.map(function (d) {
        return d.year;
      });
      var rateNames = accidents[0].values.map(function (d) {
        return d.type;
      });

      x0.domain(categoriesNames);
      x1.domain(rateNames).rangeRoundBands([0, x0.rangeBand()]);

      var range = d3.max(accidents, function (categorie) {
        return d3.max(categorie.values, function (d) {
          return d.value;
        });
      })

      if(range > BarchartAreaTypeWithFilters.maxRange){
        BarchartAreaTypeWithFilters.maxRange = range;
      }

      // y.domain([0, BarchartAreaTypeWithFilters.maxRange]);
      y.domain([0, 2]);
      // y.domain([0, range]);

      // y.domain([0, d3.max(accidents, function (categorie) {
      //   return d3.max(categorie.values, function (d) {
      //     return d.value;
      //   });
      // })]);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .style('opacity', '0')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight', 'bold')
        .text("Value");

      svg.select('.y')
      // .transition()
      // .duration(500
      // ).delay(1300)
      .style('opacity', '1');


     


      var slice = svg.selectAll(".slice")
        .data(accidents)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function (d) {
          return "translate(" + x0(d.year) + ",0)";
        });

      slice.selectAll("rect")
        .data(function (d) {
          return d.values;
        })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function (d) {
          return x1(d.type);
        })
        .style("fill", function (d) {
          return color(d.type)
        })
        .attr("y", function (d) {
          return y(0);
        })
        .attr("height", function (d) {
          return height - y(0);
        })
        .on("mouseover", function (d) {
          d3.select(this).style("fill", d3.rgb(color(d.type)).darker(2));
        })
        .on("mouseout", function (d) {
          d3.select(this).style("fill", color(d.type));
        });

      slice.selectAll("rect")
      //   .transition()
      //   .delay(function (d) {
      //     return Math.random() * 1000;
      //   })
      //   .duration(1000)
        .attr("y", function (d) {
          return y(d.value);
        })
        .attr("height", function (d) {
          return height - y(d.value);
        });

      //Legend
      var legend = svg.selectAll(".legend")
        .data(accidents[0].values.map(function (d) {
          return d.type;
        }).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
          return "translate(0," + i * 20 + ")";
        })
        .style("opacity", "0");

      legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) {
          return color(d);
        });

      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
          return d;
        });

      legend
      // .transition()
      // .duration(500)
      // .delay(function (d, i) {
      //   return 1300 + 100 * i;
      // })
      .style("opacity", "1");





    });
  },

  yearInArray(year, gatherData) {
    for (var i = 0; i < gatherData.length; i++) {
      if (gatherData[i][0] == year)
        return i;
    }
    return -1;
  }
}

