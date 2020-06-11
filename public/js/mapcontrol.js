
class MapControl {

    constructor(csrf, intersectionIcon, requestRoute, idIntersectionsContainer){
        this.mymap = L.map('map').setView([51.505, -0.09], 7);
        this.colors = ['red', 'blue', 'greenyellow', 'cyan', 'darkorange', 'fuchsia', 'salmon', 'teal'];
        this.colorIndex = 0;
        this.routes = [];
        this.intersectionsList = [];
        var self = this;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.mymap);

        document.getElementById('route_file').addEventListener('change', function(e){
            var success = self.checkRouteFile(e.target.files);
            if(success){
                self.executeRequest(e.target.files[0], csrf, intersectionIcon, requestRoute, idIntersectionsContainer);
            }
        });
    }

    addRoute(color, points, name){
        if(points.length <= 0) return;

        L.marker([points[0][0], points[0][1]]).addTo(this.mymap).bindPopup("Starting point from " + name);
        L.marker([points[points.length-1][0], points[points.length-1][1]]).addTo(this.mymap).bindPopup("Ending point from " + name);

        var coords = this.latLngsToCoords(points);
        var data = {
            "type": "LineString",
            "coordinates": coords,
            "properties": {
                "name": name
            }
        };

        var myStyle = {
            "color": color,
            "weight": 5,
            "opacity": 1
        };

        var line = L.geoJSON(data, {
            style: myStyle
        }).addTo(this.mymap);

        this.mymap.fitBounds(line.getBounds());
        return {"feature": data, "points": points};
    }

    checkIntersections(intersectionIcon){
        var self = this;
        var intersections = [];
        if(this.routes.length >= 2){
            var myIcon = L.icon({
                iconUrl: intersectionIcon,
                iconSize: [38, 38],
                iconAnchor: [19, 38],
                popupAnchor: [0, -38],
            });

            for(var i = 0; i < this.routes.length; i++){
                var feature1 = this.routes[i].feature;
                var points1 = this.routes[i].points;
                for(var j = i+1; j < this.routes.length; j++){
                    var feature2 = this.routes[j].feature;
                    var points2 = this.routes[j].points;

                    var intersects = turf.lineIntersect(feature1, feature2);
                    intersects.features.forEach(function(feature){

                        var nearest1 = turf.nearestPointOnLine(feature1, feature);
                        var nearest2 = turf.nearestPointOnLine(feature2, feature);

                        var point = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {icon: myIcon}).addTo(self.mymap).bindPopup("Connection between " + feature1.properties.name + " and " + feature2.properties.name + "<br>" +
                            "on coordinate: [long=" + feature.geometry.coordinates[1] + ", lat=" + feature.geometry.coordinates[0] + "].<br>" +
                            "Nearest point for " + feature1.properties.name + " is [long=" + nearest1.geometry.coordinates[0] + ", lat=" + nearest1.geometry.coordinates[1] + ", time=" + points1[nearest1.properties['index']][2] + "].<br>" +
                            "Nearest point for " + feature2.properties.name + " is [long=" + nearest2.geometry.coordinates[0] + ", lat=" + nearest2.geometry.coordinates[1] + ", time=" + points2[nearest2.properties['index']][2] + "]");

                        var date1 = new Date(points1[nearest1.properties['index']][2]);
                        var date2 = new Date(points2[nearest2.properties['index']][2]);
                        const diffTime = Math.ceil(Math.abs(date2 - date1) / 1000);
                        var intersection = { "route1": i, "route2": j, "point": point, "diffTime": diffTime };

                        for(var k = 0; k < intersections.length; k++){
                            if(diffTime < intersections[k].diffTime){
                                intersections.splice(k, 0, intersection);
                                break;
                            }
                        }

                        if(intersections.length <= 0){
                            intersections[0] = intersection;
                        }
                    });
                }
            }
        }
        return intersections;
    }

    latLngsToCoords(latlngs){
        var coords = [];
        latlngs.forEach(function(point){
            coords.push([point[1], point[0]]);
        });
        return coords;
    }

    clickOpenButton(intersectionIndex){
        console.log("intersectionIndex " + intersectionIndex);
        this.intersectionsList[intersectionIndex].point.openPopup();
    }

    requestEventListener(request, intersectionIcon, idIntersectionsContainer, name){
        if (request.readyState === 4) {
            if (request.status === 200) {
                var points = JSON.parse(request.response);
                if(this.colorIndex >= this.colors.length - 1) this.colorIndex = 0;
                var route = this.addRoute(this.colors[this.colorIndex++], points, name);
                this.routes.push(route);
                var intersections = this.checkIntersections(intersectionIcon);

                if(intersections.length > 0){
                    var text = "";
                    for(var i = 0; i < intersections.length; i++){
                        text += "<tr><td>" + this.routes[intersections[i].route1].feature.properties.name + "/" + this.routes[intersections[i].route2].feature.properties.name + "</td><td>" + intersections[i].diffTime + "s</td><td><button id='open" + i + "'>Open</button></td></tr>";
                    }
                    document.getElementById(idIntersectionsContainer).innerHTML = text;

                    var buttons = document.querySelectorAll('button');
                    buttons.forEach((button) => {
                        if(button.id.startsWith('open')){
                            var number = parseInt(button.id.substr(4));
                            if(!isNaN(number)){
                                button.addEventListener('click', () => {
                                    this.clickOpenButton(number);
                                });
                            }
                        }
                    });

                    this.intersectionsList = intersections;
                }
            } else {
                alert(request.statusText);
            }
        }
    }

    executeRequest(file, csrf, intersectionIcon, requestRoute, idIntersectionsContainer){
        var data = new FormData();
        data.append('route', file);
        data.append( "_token", csrf);
        var request = new XMLHttpRequest();
        request.responseType = 'json';
        request.open('POST', requestRoute);
        request.addEventListener('load', () => this.requestEventListener(request, intersectionIcon, idIntersectionsContainer, file.name));
        request.send(data);
    }

    checkRouteFile(files){
        if(files.length <= 0) {
            alert('Error : No file selected');
            return false;
        }

        var file = files[0];

        if(file.type !== "application/gpx+xml"){
            alert('Error : Incorrect file type (only gpx is supported)');
            return false;
        }

        if(file.size > 2*1024*1024) {
            alert('Error : File exceeded size of 2MB');
            return false;
        }
        return true;
    }
}
