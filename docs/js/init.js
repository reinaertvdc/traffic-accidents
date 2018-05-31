function init() {
	initMap();

	new DataLoader().loadData();
}

function visualize(data) {
	//initialize WGL with link to data, the relative path to the shader folder, and id of the map div
	WGL.init(data.num, '', 'map');

	// map is global variable from Open Layers, we set our onMove 
	// function to be called any time the map moves 
	map.events.register("move", map, onMove);

	// Adding heatmap, point map and polybrush interactions
	var heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap');

	//define radius function
	WGL.addColorFilter('heatmap', 'colorbrush');
	WGL.addPolyBrushFilter('heatmap', 'polybrush');

	heatmap.renderer.colors.set([
		1, 0, 1, 1,
		1, 0, 1, 1,
		0, 1, 1, 1,
		0, 0, 0, 1
	]);

	heatmap.radiusFunction = function (r, z) {
		var res = r / 20000 * Math.pow(2, z);
		var gpsize = map.getGeodesicPixelSize();
		var pixelsize = (gpsize.h + gpsize.w) / 2;
		return res;
	};
	heatmap.setRadius(40);

	WGL.addExtentFilter();

	// Configuring the histograms and charts
	var charts = [];
	var params = [];
	params.w = 640;
	params.h = 180;
	params.margin = {
		top: 20,
		right: 20,
		bottom: 50,
		left: 60
	};

	var d = [];

	const histogram = function (config) {
		const id = 'ch' + (d.length + 1);
		//const checkboxId = 'checkbox-' + id;
		Object.keys(data).forEach(function (property) {
			if (data[property] === config.data) {
				config.name = property;
			}
		});
		const name = config.name + 'F';
		const chart = new WGL.ChartDiv('right', id, config.label);
		if (config.domain) {
			config.type = 'ordinal';
			chart.setDim(WGL.addOrdinalHistDimension(config));
		} else {
			config.type = 'linear';
			config.max += 1;
			config.num_bins = config.max - config.min;
			WGL.addLinearHistDimension(config);
		}
		WGL.addLinearFilter(config, config.max, name);
		charts[config.name] = new WGL.ui.StackedBarChart(config, id, config.label, name);
		d.push(config);

		//$('#control').append('<label><input id="' + checkboxId + '" type="checkbox" checked="true"/>' + config.label + '</label>');
		//const checkbox = $('#' + checkboxId);

		// checkbox.click(() => {
		// 	if (checkbox.is(":checked")) {
				
		// 	} else {
		// 		console.log(config.name);
		// 		WGL.cleanAll();
		// 		WGL.cleanDimension(config.name);
		// 	}
		// });

		// $('#' + checkboxId).click(function () {
		// 	let l = WGL.getDimension(this.name);
		// 	l.setVisible(this.checked);
		// 	WGL.render();
		// });		
	}

	histogram({ label: 'Year', data: data.year, min: 1995, max: 2016 });
	histogram({ label: 'Month', data: data.month, domain: Ordinals.months });
	histogram({ label: 'Day of the week', data: data.weekDay, domain: Ordinals.weekDays });
	histogram({ label: 'Hour', data: data.hour, min: 0, max: 23 });

	histogram({ label: 'Total victims', data: data.numVictims, min: 0, max: 25 });
	//histogram({ label: 'Slightly injured', data: data.numSlightlyInjured, min: 0, max: 25 });
	//histogram({ label: 'Severely injured', data: data.numSeverelyInjured, min: 0, max: 5 });
	//histogram({ label: 'Mortally injured', data: data.numMortallyInjured, min: 0, max: 2 });
	//histogram({ label: 'Died within 24 hours', data: data.numDiedWithin24Hours, min: 0, max: 3 });
	//histogram({ label: 'Died within 30 days', data: data.numDiedWithin30Days, min: 0, max: 3 });

	histogram({ label: 'Age', data: data.age, min: -1, max: 114 });
	histogram({ label: 'Sex', data: data.sex, domain: Ordinals.sex });

	var pc = WGL.addParallelCoordinates('pc_chart', d);
	WGL.addMultiDim(d);

	//var legend = new WGL.ui.HeatMapLegend('heatlegend','colorbrush');
	/**
	 * Addin all charts
	 */
	WGL.addCharts(charts);
	var controlHM = new WGL.ChartDiv("right", "chm", "Heat map controls");
	addHeatMapControl(heatmap, 'chm');
	//WGL.addLegend(legend);

	/**
	 * Initilizing all the filters
	 */
	WGL.initFilters();

	/** Drawing the map fist time */
	WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
	WGL.render();


	//var radius = 12.;	


	$("#slider_radius").on("input", function () {
		heatmap.setRadius(this.value);
		//$('#radius_label').html(this.value+"m ");
		//heatmap.reRender();
		WGL.render();
	});

	$("#slider_pc").on("input", function () {
		//mapdim.render2(this.value);	
		pc.reRender(this.value);
	});

	$("#pc_header").click(function () {
		$(".pc_chart_div").slideToggle();
		var l = WGL.getDimension("pc_chart");

		var resize = function () {
			WGL.getManager().updateMapSize();
			WGL.mcontroller.resize();
			WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
			WGL.render();
		}
		if (l.visible) {
			l.setVisible(false);
			$('#map').animate({
				'margin-bottom': '1.5em'
			}, {
				done: resize
			})
			$('#pc').animate({
				'height': '1.5em'
			}, {
				done: resize
			})

			$('#butPC').removeClass("fa-chevron-down");
			$('#butPC').addClass("fa-chevron-up");
			setTimeout(function () {
				map.updateSize();
			}, 200);
		} else {
			l.setVisible(true);
			$('#map').animate({
				'margin-bottom': '18.5em'
			}, {
				done: resize
			})
			$('#pc').animate({
				'height': '18.5em'
			}, {
				done: resize
			})
			$('#butPC').removeClass("fa-chevron-up");
			$('#butPC').addClass("fa-chevron-down");
			setTimeout(function () {
				map.updateSize();
			}, 200);
		}
	});
}


/**
 * Function to calculate top left corner of the map in pixels for zoom 0
 * @returns {___anonymous_res}
 */
function getTopLeftTC() {

	var tlwgs = (new OpenLayers.LonLat(-180, 90)).transform(
		new OpenLayers.Projection("EPSG:4326"),
		new OpenLayers.Projection("EPSG:900913"));

	var s = Math.pow(2, map.getZoom());
	tlpixel = map.getViewPortPxFromLonLat(tlwgs);
	res = {
		x: -tlpixel.x / s,
		y: -tlpixel.y / s
	}
	//console.log(res);
	return res;
}

/**
 * Function to for moving the map event.
 */
function onMove() {
	WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC(), WGL.filterByExt);
}

function addHeatMapControl(hm, divid) {

	$("#" + divid).append(
		"<div id=" + divid + "left style='top:0em; left:0em; width:40%'></div>" +
		"<div id=" + divid + "right style='top:0em; right:0em; width:35%; height:7em;'></div>");


	var thediv = $("#" + divid + "right");
	thediv.append(
		"<div style='margin:1.2em 0.5em 0.5em 0.5em'>" +
		"<text>Radius: </text><text id='radius_label'></text>" +
		"<input style='width: 50%; right:1em; position:absolute' type ='range' max='2000' min='200'" +
		"step='100' name='points' id='slider_radius' value='1000'></input> " +
		"</div>");
	thediv.append(
		"<div style='margin:1.2em 0.5em 0.5em 0.5em'>" +
		"<text>Density of records<br>within the radius: </text><text id='radius_label'></text>" +
		"<div id='heatmap-legend' style='float: right'></div>" +
		"</div>"
	);

	hm.setRadius(1000);
	$('#radius_label').html('1000m');
	WGL.render();


	WGL.addColorFilter(hm.id, 'colorbrush');
	var legend = new WGL.ui.HeatMapLegend("heatmap-legend", 'colorbrush', true);
	hm.addLegend(legend);
	WGL.addLegend(legend);

	$("#slider_radius").on("input", function () {

		hm.setRadius(this.value);

		$('#radius_label').html(this.value + "m ");
		//heatmap.reRender();
		WGL.render();
	});

	$("#cross").off("click");
	$("#cross").click(function (e) {

			$("#right").toggle();
			$(this).toggleClass("active");
			$("#sipka").toggleClass("fa-chevron-right");
			$("#sipka").toggleClass("fa-chevron-left");
			$("#map").toggleClass("fullscrean");
			$("#pc").toggleClass("pc_chart_big");

			WGL.getManager().updateMapSize();
			WGL.mcontroller.resize();
			WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
			map.updateSize();

			$("#info").hide();

			WGL.getDimension("pc_chart").resize();

			WGL.render();
		}

	)
}