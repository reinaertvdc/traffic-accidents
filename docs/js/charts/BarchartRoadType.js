const BarchartRoadType = {
  init: () => {

  },
  
  update: () => {
    DataController.getData((data) => {
      const elementId = '#BarchartRoadType';
      $(elementId).empty();

      function getTotalAccidentsPerYear(data) {
        let accidents = [];
        // Parse the date / time
        var parseDate = d3.time.format("%Y").parse;
        var i = 0;
        for (var y = 1995; y <= 2016; y++) {
          var value1 = data.trafficAccidents.filter(
            function (val) {
              return val.year === y && val.roadType == 1;
            }
          ).length;

          var value2 = data.trafficAccidents.filter(
            function (val) {
              return val.year === y && val.roadType == 2;
            }
          ).length;

          if (value1 > 0 && value2 > 0) {
            accidents[i] = {
              "year": y,
              "values": [{
                  "type": "Highway",
                  "value": value1
                },
                {
                  "type": "Regional, provincial or municipal road",
                  "value": value2
                }
              ]
            }
            i++;
          }
        }

        return accidents;
      };

      var counts = getTotalAccidentsPerYear(data);

      var margin = {
          top: 20,
          right: 20,
          bottom: 30,
          left: 40
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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

      var categoriesNames = counts.map(function (d) {
        return d.year;
      });
      var rateNames = counts[0].values.map(function (d) {
        return d.type;
      });

      x0.domain(categoriesNames);
      x1.domain(rateNames).rangeRoundBands([0, x0.rangeBand()]);
      y.domain([0, d3.max(counts, function (categorie) {
        return d3.max(categorie.values, function (d) {
          return d.value;
        });
      })]);

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

      svg.select('.y').transition().duration(500).delay(1300).style('opacity', '1');

      var slice = svg.selectAll(".slice")
        .data(counts)
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
        .transition()
        .delay(function (d) {
          return Math.random() * 1000;
        })
        .duration(1000)
        .attr("y", function (d) {
          return y(d.value);
        })
        .attr("height", function (d) {
          return height - y(d.value);
        });

      //Legend
      var legend = svg.selectAll(".legend")
        .data(counts[0].values.map(function (d) {
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

      legend.transition().duration(500).delay(function (d, i) {
        return 1300 + 100 * i;
      }).style("opacity", "1");
    });
  }
}