/**
 * Created by Jean on 2019-10-09.
 */

var Routes = {

  drawLines: function() {
	var points = [];
	var connections = [];
	$.each(markers, function(_index, marker) {
		if (marker.isVisible && (Inventory.isEnabled ? !marker.isCollected && (marker.amount < Inventory.stackSize) : !marker.isCollected) && enabledCategories.includes(marker.category)
		&& uniqueSearchMarkers.includes(marker) && !categoriesDisabledByDefault.includes(marker.subdata)
		&& marker.tool <= parseInt(toolType)) {
		  points.push(new SalesmanPoint(marker.lat, marker.lng));
		}
	});

	var solution = solveSalesman(points);
	var orderedPoints = solution.map(i => points[i]);
	$.each(orderedPoints, function(_index, point) {
		connections.push([point.x, point.y]);
	});
	
	
    if (polylines instanceof L.Polyline) {
      MapBase.map.removeLayer(polylines);
    }

    polylines = L.polyline(connections, {
      'color': '#9a3033'
    });
    MapBase.map.addLayer(polylines);
  },

  loadCustomRoute: function(input) {
    try {
      var connections = [];

      input = input.replace(/\r?\n|\r/g, '').replace(/\s/g, '').split(',');

      $.each(input, function(key, value) {
        var _marker = markers.filter(marker => marker.text == value && marker.day == Cycles.data.cycles[currentCycle][marker.category])[0];
        if (_marker == null) {
          console.log(`Item not found on map: '${value}'`);
        } else {
          connections.push([_marker.lat, _marker.lng]);
        }
      });

      if (polylines instanceof L.Polyline) {
        MapBase.map.removeLayer(polylines);
      }

      polylines = L.polyline(connections, {
        'color': '#9a3033'
      });
      MapBase.map.addLayer(polylines);
    } catch (e) {
      alert(Language.get('routes.invalid'));
      console.log(e);
    }
  },
  addMarkerOnCustomRoute: function(value) {
    if (customRouteEnabled) {
      if (customRouteConnections.includes(value)) {
        customRouteConnections = customRouteConnections.filter(function(item) {
          return item !== value
        })
      } else {
        customRouteConnections.push(value);
      }

      var connections = [];

      $.each(customRouteConnections, function(key, item) {
        var _marker = markers.filter(marker => marker.text == item && marker.day == Cycles.data.cycles[currentCycle][marker.category])[0];
        connections.push([_marker.lat, _marker.lng]);
      });

      if (polylines instanceof L.Polyline) {
        MapBase.map.removeLayer(polylines);
      }

      polylines = L.polyline(connections, {
        'color': '#9a3033'
      });
      MapBase.map.addLayer(polylines);
    }
  }
};

Routes.loadRoutesData = function() {

  $.getJSON('data/routes/day_1.json', {}, function(data) {
    routesData[1] = data;
  });
  $.getJSON('data/routes/day_2.json', {}, function(data) {
    routesData[2] = data;
  });
  $.getJSON('data/routes/day_3.json', {}, function(data) {
    routesData[3] = data;
  });
};

Routes.exportCustomRoute = function() {
  const el = document.createElement('textarea');
  el.value = customRouteConnections.join(',');
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el)

  alert(Language.get('routes.exported'));
};

Routes.importCustomRoute = function() {
  var input = prompt(Language.get('routes.import_prompt'), "");

  if (input == null || input == "") {
    alert(Language.get('routes.empty'));
  } else {
    Routes.loadCustomRoute(input);
  }
};
