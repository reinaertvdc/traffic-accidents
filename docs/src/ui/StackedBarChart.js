WGL.ui.StackedBarChart = function(m, div_id, x_label, filterId, params) {

  var that = this;

  var type;
  var div_id;

  var w;
  var h;
  var margin;
  var rotate_x;

  if (typeof(params)=='undefined'){
    w = 500;
    h = 215;
    margin = {
      top : 20,
      right : 20,
      bottom : 65,
      left : 60
    };
    rotate_x = false;
  } else {
    w=(params.w ? params.w : 500);
    h=(params.h ? params.h : 215);
    margin=(params.margin ? params.margin : margin = {
      top : 20,
      right : 20,
      bottom : 65,
      left : 60
    });
    rotate_x=params.rotate_x;
  }

  var dataset;
  var xScale;
  var yScale;
  var colorScale;
  var xAxis;
  var yAxis;
  var bars;
  var svg;
  var chart;
  var active_group = 2;
  var of_click = [];
  var of_selection = [];
  var dragStart = -1;
  var dragEnd = -1;
  var lineHeight = 9; //minimum number of pixels in height that should be available to show a number label over a bar in the chart
  var labelsMaxColumns = 12; //maximum allowed number of columns in a chart to show number labels

  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

  var dataset = null;
  var svgbw = "";
  var bw = 0.0;

  var showNumberLabels = true;

  this.y_label = "detections";

  this.showBarLabel = function(b) {
    showNumberLabels = b;
  };

  this.setLinearXScale = function(){
    xScale = new d3.scale.linear();
    xScale = d3.scale.linear().domain([ m.min , m.max ]).range([ 0, width ]);
    bw = Math.floor(width / dataset.length );
    svgbw= "h"+bw+"V";
    type = 'linear';
    return this;
  };

  this.setOrdinalXScale = function(){
    xScale = d3.scale.ordinal().domain(m.domain).rangeBands([ 0, width ],0.03,0.015);
    bw =xScale.rangeBand();
    svgbw= "h"+bw+"V";
    type = 'ordinal';
    return this;
  };

  this.xformat = function(d){
    return d;
  };

  var yformat = d3.format("s");
  var yformatBars = d3.format(".3s");

  this.setYFormat = function (fuc) {
    yformat = fuc;
  };
  var arrowTan = 0.6;
  var arrowHeight = 0.0;
  /**
   * Set arrow height. If target height in px is higher then margin.top height is set to margin.top.
   * @param tan height in tan (45° is tan 1)
   */
  this.setArrowHeight = function (tan) {
    arrowTan = tan;
    arrowHeight = arrowTan * (bw/2);
    if (arrowHeight > margin.top){
      arrowHeight = margin.top;
    }
  };

  /*	this.setTicks = function(n){
          xAxis.ticks(n) ;
      }

      this.setTicksValues = function(v){
          xAxis.ticksValues(v);
      }*/
  this.init = function() {
    // xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    // xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);


    //this.setLinearXScale();
    if (typeof m.domain == 'undefined'){
      this.setLinearXScale();
    } else {
      this.setOrdinalXScale();
    }
    //set arrow height for first
    this.setArrowHeight(arrowTan);

    var cols = [ "#ff8c00", "#7b6888", "#98abc5" ];

    var classes = [ [ "0", "selected", cols[0] ],
      [ "1", "unselected", cols[1] ], [ "2", "out", cols[2] ] ];

    colorScale = d3.scale.ordinal().range(cols);

    yScale = d3.scale.linear().domain([ 0, dataset.max[2] ]).range(
      [ height, 0 ]);

    colorScale.domain([ "selected", "unselected", "out" ]);


    //to update label printing
    //new Date(d*1000).getYear()};

    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(this.xformat);


    //yAxis = d3.svg.axis().scale(yScale).orient("left");
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(yformat); //changes

    // xScale.domain(this.dataset.map(function(d) {
    // return d.max-(d.max-d.min)/2; }));

    svg = d3.select("#" + div_id).append("svg").attr("width",
      width + margin.left + margin.right).attr("height",
      height + margin.top + margin.bottom).append("g").attr(
      "transform",
      "translate(" + margin.left + "," + margin.top + ")");

    chart = svg.select('.chart');

    if(rotate_x) {
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -10)
        .attr("dy", ".35em")
        .attr("transform", "rotate(270)")
        .style("text-anchor", "end");
    } else {
      svg.append("g").attr("class", "x axis").attr("transform",
        "translate(0," + height + ")").call(xAxis).append("text")
        .attr("y", "3.5em").attr("x",
        width /2 ).style("text-anchor", "end").text(x_label);
    }

    svg.append("g").attr("class", "y axis").call(yAxis).append("text")
      .attr("transform", "rotate(270)").attr("y", "-4.5em").attr("x",
      "-2em").style("text-anchor", "end").text(this.y_label); //changes

    /*
     * bars = svg.selectAll(".bars").data(dataset).enter()
     * .append("g").attr("class", "g").attr("transform", function(d) {
     * return "translate(" + (xScale(d.min)+xScale(d.max))/2 + ",0)"; });
     */

    /* new bars */
    //svg.append("clipPath").attr("id", "clip-" + div_id).append("rect")
    //		.attr("width", width).attr("height", height);

    /*$("#" + div_id + " > :not(rect):not(.bar)").on("click", function(e) {
      e.stopPropagation();
      e.preventDefault();
      of = [];
      WGL.filterDim(m.name,filterId, of);
    });*/

    bars = svg.selectAll(".bar").data(["selected", "unselected", "out"])
      .enter().append("path").attr("class", function(d) {
        return d + " foreground bar ";
      }).datum(dataset);

    if(dataset.length <= labelsMaxColumns
      && showNumberLabels) {

      svg.selectAll(".text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "label selected")
        .attr("x", (function (d) {
          return xScale(d.val) + bw / 2;
        }))
        .attr("y", function (d) {
          return yScale(d.selected) + 1;
        })
        .attr("dy", "1em")
        .text(function (d) {
          if(d.selected != 0) {
            return yformatBars(d.selected);
          } else {
            return "";
          }
        });

      svg.selectAll(".text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "label unselected")
        .attr("x", (function (d) {
          return xScale(d.val) + bw / 2;
        }))
        .attr("y", function (d) {
          return yScale(d.unselected) + 1;
        })
        .attr("dy", "1em")
        .text(function (d) {
          if(d.unselected != 0) {
            return yformatBars(d.unselected);
          } else {
            return "";
          }
        });

      svg.selectAll(".text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "label out")
        .attr("x", (function (d) {
          return xScale(d.val) + bw / 2;
        }))
        .attr("y", function (d) {
          return yScale(d.out+d.selected+d.unselected) + 1;
        })
        .attr("dy", "1em")
        .text(function (d) {
          if(d.out!= 0) {
            return yformatBars(d.out);
          } else {
            return "";
          }
        });
    }

    svg.selectAll(".foreground.bar").attr("clip-path",
      "url(#clip-" + div_id + ")");

    // update(dataset);
    // svg.selectAll("selected bar").attr("d", barPathSelected);

    /* data */
    dataset.forEach(function(d) {
      var y0 = 0;
      d.levels = colorScale.domain().map(function(name) {
        return {
          name : name,
          y0 : y0,
          y1 : y0 += +d[name]
        };
      });
      d.total = 0;
    });


    /*
     * bars.selectAll("path").data(function(m) { return m.levels;
     * }).enter().append("rect").attr("y", function(d) { return
     * yScale(d.y1); }).attr("width", bw).attr("height", function(d) {
     * return yScale(d.y0) - yScale(d.y1); }).attr("fill", function(d) {
     * return colorScale(d.name); }).attr("class", function(d){return
     * div_id+d.name});
     */
    function brushLinear() {
      var f = brush1.extent();
      WGL.filterDim(m.name, filterId, f);
      //console.log(brush1.extent()[0][0]+' '+brush1.extent()[0][1]);
    }

    function mergeSelectionArrays() {

      var merged = of_selection.concat(of_click);

      if (of_selection.length > 0 &&
        of_click.length > 0) {
        for (var i = 0; i < merged.length; i++) {
          for (var j = i + 1; j < merged.length; j++) {
            if (merged[j][0] == merged[i][0] &&
              merged[j][1] == merged[i][1]) {
              merged.splice(j, 1);
            }
          }
        }
      }
      return merged;
    }

    function brushOrdinal() {

      var f = brush1.extent();
      var l = xScale.domain().length;

      of_selection = [];

      var current_selection;
      for (var i in f) {
        current_selection = f[i];

        var groupStart = Math.floor(current_selection[0] / (width / l));
        var groupEnd = Math.floor(current_selection[1] / (width / l));
        if (groupEnd == l) {
          groupEnd = l - 1;
        }

        for (var j in of_selection) {
          if (of_selection[j][0] >= groupStart && of_selection[j][0] <= groupEnd) {
            of_selection.splice(j, 1);
          }
        }

        for (var k = groupStart; k <= groupEnd; k++) {
          of_selection.push([k, k + 1]);
        }

        WGL.filterDim(m.name, filterId, mergeSelectionArrays());

      }

    }
    var brush;
    if (type == 'linear') {
      brush = brushLinear;
    } else if (type == 'ordinal') {
      brush = brushOrdinal;
    }

    var brush1 = d3.svg.multibrush().x(xScale).extentAdaption(resizeExtent)
      .on("brushstart", function() {
        dragStart = d3.mouse(this);
      })
      .on("brush", function() {
        dragEnd = d3.mouse(this);
        if (dragEnd[0] != dragStart[0] &&
          dragEnd[1] != dragStart[1]) {
          brush();
        }
      })
      .on("brushend", function() {

        dragEnd = d3.mouse(this);

        if (dragEnd[0] == dragStart[0] &&
          dragEnd[1] == dragStart[1]) {

          var group = Math.floor(dragEnd[0] / (width / dataset.length));

          var selected = dataset[group].selected;
          dataset[group].selected = dataset[group].unselected;
          dataset[group].unselected = selected;

          var found = false;

          for (var i = 0; i < of_click.length; i++) {
            if (of_click[i][0] == group) {
              of_click.splice(i, 1);
              found = true;
              break;
            }
          }

          for (i = 0; i < of_selection.length; i++) {
            if (of_selection[i][0] == group) {
              of_selection.splice(i, 1);
              found = true;
              break;
            }
          }

          if (found) {
            WGL.filterDim(m.name, filterId, mergeSelectionArrays());
            return;
          }

          of_click.push([group, group + 1]);
          WGL.filterDim(m.name, filterId, mergeSelectionArrays());

          return;

        } else {
          brush();
        }
      });
    this.brush = brush1;

    var brushNode = svg.append("g").attr("class", "brush").call(brush1)
      .selectAll("rect").attr("height", height);


    /**
     * legend and scaling
     */
    var legendRect = svg.append("g").attr("class", "l").selectAll('rect')
      .data(classes);

    //var legend_x = (rotate_x ? -50 : w - 150);

    var legend_x = w - 150;

    legendRect.enter().append("rect").attr("id", function(d) {
      return div_id+ d[0];
    }).attr("x", legend_x).attr("y", function(d) {
      return (h - 63 + d[0] * 15)
    }).attr("width", 12).attr("height", 12).attr("fill", function(d) {
      return d[2];
    }).classed('legend-scale',true)
      .on(
        "click",
        function(d) {
          var el = d3.select("#"+div_id + d[0]);
          d3.select(this.parentNode).selectAll("rect").classed('select-legend-scale', false);
          //el.attr("stroke-width", "3");
          //el.attr("stroke", d[2]);
          el.classed('select-legend-scale', true);

          active_group = d[0];
          for (var i = 0; i < classes.length; i++) {
            calcBar();
            updateLabels();
          }


        });

    legendRect.enter().append("text").text(function(d) {
      return d[1];
    }).attr("x", legend_x + 20).attr("y", function(d) {
      return (h - 63 + d[0] * 15 + 12)
    }).attr("width", 12).attr("height", 12).attr("stroke", "none");

    var help = d3.select("#"+div_id).append("div").classed('ii',true).append("i").classed('fa', true).classed('fa-info', true);
    var tooltip_content = "<div class='wgl-close-tooltip'><i class='fa fa-times' aria-hidden='true'></i></div><table>"+
      "<tr>"+
      '<td><div class="color-selected"><b>selected</b></div></td><td>selected data</td>'+
      "</tr>"+
      "<tr>"+
      '<td><div class="color-unselected"><b>unselected</b></div></td><td>unselected data in the current map view</td>'+
      "</tr>"+
      "<tr>"+
      '<td><div class="color-out"><b>out</b></div></td><td>data out of the current map view</td>'+
      "</tr>"+
      "</table><br/> Click on the coloured squares in the legend to adjust <br> the chart scale to the 'selected'/ 'unselected'/ 'out' data.";
    $(help).tooltipster({
      content: tooltip_content,
      contentAsHTML: true,
      theme: 'tooltipster-light',
      trigger: 'click',
      interactive: 'true',
      autoClose: 'false',
      functionReady: function() {
        $('.wgl-close-tooltip').click(function() {
          $(help).tooltipster('hide');
        });
      }

    });

    $("#" + div_id).on("click", function(e) {
      if (e.target.tagName != "g") {
        that.clearSelection();
      }
    });

    function resizeExtent(selection) {
      selection.attr("height", height);
    }



    function brushO() {

      var f = brush1.extent();
      var leftEdges = xScale.range();
      var width = xScale.rangeBand();
      var l;
      var r;
      var left = brush1.extent()[0][0];
      var right = brush1.extent()[0][1]
      for(l=0; left > (leftEdges[l] + width); l++) {}
      for(r=0; right > (leftEdges[r] + width); r++) {}
      //do nothing, just increment j until case fails
      console.log("Clicked on " + xScale.domain()[l]+ " "+xScale.domain()[r]);

      var f = [];
      f[0] = [ xScale.domain()[l],  xScale.domain()[r]];
      WGL.filterDim(id, filterId, f);
      //console.log(xScale.domain()[j]+' '+brush1.extent()[0][1]);

    }
  };

  this.clean = function (cleanChartDiv) {
    cleanChartDiv = cleanChartDiv || false;
    if (cleanChartDiv){
      d3.select("#chd-container-" + div_id).remove();
    }
    else {
      d3.select("#" + div_id).selectAll('*').remove();
    }
  };


  // Create bars

  this.update = function(data) {
    if (dataset == null) {dataset = Array.prototype.slice.call(data);
      dataset.max = data.max;
      this.init();
      d3.select("#"+div_id).selectAll("rect").style("cursor", "pointer")
    }
    dataset = Array.prototype.slice.call(data);

    /*
     * dataset.forEach(function(d) { var y0 = 0; d.levels =
     * colorScale.domain().map(function(name) { return { name : name, y0 :
     * y0, y1 : y0 += +d[name] }; }); d.total = 0; });
     */

    dataset.max = data.max;

    bars.datum(dataset);

    calcBar();

    updateLabels();

    /*
     * bars.selectAll("rect").data(function(m) { return m.levels;
     * }).transition().duration(10).attr("y", function(d) { return
     * yScale(d.y1); }).attr("height", function(d) { return yScale(d.y0) -
     * yScale(d.y1); });
     */

  };
  function updateLabels() {

    if(!showNumberLabels) {
      return;
    }

    var selected = $("#" + div_id + " .label.selected");
    var out = $("#" + div_id + " .label.out");
    var unselected = $("#" + div_id + " .label.unselected");

    for(var i=0; i<unselected.length; i++) {

      var textContentSelected = yformatBars(dataset[i].selected);
      var xSelected = xScale(dataset[i].val) + bw / 2;
      var ySelected = yScale(dataset[i].selected) + 1;

      if (textContentSelected != 0
        && (height - ySelected > lineHeight)) {
        $(selected[i])[0].outerHTML = '<text class="label selected" x="' + xSelected + '" y="' + ySelected + '" dy="1em">' + textContentSelected + '</text>'
      } else {
        $(selected[i])[0].outerHTML = '<text style="display: none" class="label selected" x="' + xSelected + '" y="' + ySelected + '" dy="1em">' + textContentSelected + '</text>'
      }

      var textContentUnselected = yformatBars(dataset[i].unselected + dataset[i].selected);
      var xUnselected = xScale(dataset[i].val) + bw / 2;
      var yUnselected = yScale(dataset[i].unselected + dataset[i].selected) + 1;

      if (dataset[i].unselected != 0
        && (height - yUnselected > lineHeight)
        && (ySelected - yUnselected > lineHeight)) {
        $(unselected[i])[0].outerHTML = '<text class="label unselected" x="' + xUnselected + '" y="' + yUnselected + '" dy="1em">' + textContentUnselected + '</text>'
      } else {
        $(unselected[i])[0].outerHTML = '<text style="display: none" class="label unselected" x="' + xUnselected + '" y="' + yUnselected + '" dy="1em">' + textContentUnselected + '</text>'

      }

      var textContentOut = yformatBars(dataset[i].out + dataset[i].selected + dataset[i].unselected);
      var xOut = xScale(dataset[i].val) + bw / 2;
      var yOut = yScale(dataset[i].out+dataset[i].selected+dataset[i].unselected) + 1;

      if (dataset[i].out != 0
        && (height - yOut > lineHeight)
        && (yUnselected - yOut > lineHeight)
        && (ySelected - yOut > lineHeight)) {
        $(out[i])[0].outerHTML = '<text class="label out" x="' + xOut + '" y="' + yOut + '" dy="1em">' + textContentOut + '</text>'
      } else {
        $(out[i])[0].outerHTML = '<text style="display: none" class="label out" x="' + xOut + '" y="' + yOut + '" dy="1em">' + textContentOut + '</text>'
      }

    }
  }
  function calcBar(){
    yScale = d3.scale.linear().domain(
      [ 0, dataset.max[active_group] ]).range(
      [ height, 0 ]);
    //console.log(this);
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(yformat); //changes format
    svg.selectAll('.y.axis').transition().duration(30)
      .call(yAxis);

    svg.selectAll(".selected.bar").attr("d", barPathSelected);
    svg.selectAll(".unselected.bar").attr("d", barPathUnselected);
    svg.selectAll(".out.bar").attr("d", barPathOut);


  }
  function barPathSelected(groups) {
    var path = [], i = -1, n = groups.length, d;
    while (++i < n) {
      var d = groups[i];
      path.push("M", xScale(d.val), ",", height, "V", yScale(d.selected),
        svgbw, height);
    }
    return path.join("");
  }

  function barPathUnselected(groups) {
    var path = [], i = -1, n = groups.length, d;
    while (++i < n) {
      var d = groups[i];
      if (yScale(d.selected) + yScale(d.unselected) - height < 0){ //&& yScale(d.selected) > 0.1
        path.push("M", xScale(d.val), ",", yScale(d.selected),
          "V",0,
          "L",xScale(d.val) + bw/2, ",",-arrowHeight,
          "L",xScale(d.val) + bw,",",0,
          "V",yScale(d.selected)
        );
      }
      else{
        path.push("M", xScale(d.val), ",", yScale(d.selected), "V",
          yScale(d.selected) + yScale(d.unselected) - height, svgbw,
          yScale(d.selected));
      }
    }
    //console.log(path.join(""));
    return path.join("");
  }

  function barPathOut(groups) {
    var path = [],
      i = -1,
      n = groups.length,
      d;
    while (++i < n) {
      var d = groups[i];
      var start = yScale(d.selected) + yScale(d.unselected) - height;
      if (start + yScale(d.out) - height < 0 && start > -0.1) {
        path.push("M", xScale(d.val), ",", start,
          "V", 0,
          "L", xScale(d.val) + bw / 2, ",", -arrowHeight,
          "L", xScale(d.val) + bw, ",", 0,
          "V", start
        );
        //console.log(aa);
      } else if (start <= -0.1) {
        path.push("");
      } else {
        path.push("M", xScale(d.val), ",", start, "V", start +
          yScale(d.out) - height, svgbw, start);
      }

    }
    return path.join("");
  }

  this.clearSelection = function() {
    of_selection = [];
    of_click = [];
    this.brush.clear();
    WGL.filterDim(m.name, filterId, []);
  }

};