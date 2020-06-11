<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Laravel</title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">

    <!-- Styles -->
    <style>
        html, body {
            background-color: #fff;
            color: #636b6f;
            font-family: 'Nunito', sans-serif;
            font-weight: 200;
            height: 100vh;
            margin: 0;
        }

        .content {
            width: 100%;
            height: 100%;
            position: relative;
        }

        #map {
            height: 100% !important;
        }

        #overlay {
            height: 50%;
            width: 20%;
            position: absolute;
            top: 20%;
            left: 0;
            color: white;
            z-index: 314159;
            pointer-events: none;
        }

        .content #overlay .btn, tr, #tablediv {
            pointer-events: initial;
        }

        #route_file {
            opacity: 0;
            position: absolute;
            z-index: -1;
        }

        table{
            background-color: white;
            color: black;
        }

        .row {
            max-height: 400px;
        }

        #tablediv {
            overflow: auto;
            max-height: 400px;
        }
    </style>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
          integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
          crossorigin=""/>

    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
            integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
            crossorigin=""></script>
    <script src='https://unpkg.com/@turf/turf/turf.min.js'></script>
</head>
<body>
    <div class="content">
        <div id="map">

        </div>
        <div id="overlay">
            <div class="row">
                <div class="col">
                    <button><label class="btn" for="route_file">Upload route file</label></button>
                    <input class="btn" type="file" name="route_file" id="route_file" accept=".gpx">
                </div>
            </div>
            <div class="row">
                <div id="tablediv" class="col-12">
                    <table>
                        <thead>
                            <tr>
                                <th>Intersections (sorted on diff in time)</th>
                            </tr>
                        </thead>
                        <tbody id="intersections_container">

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script src="/js/mapcontrol.js"></script>
    <script>
        mapControl = new MapControl('{{ csrf_token() }}', '{{ asset('img/intersection.png') }}', '{{ route('route.parse') }}', 'intersections_container');
    </script>
</body>
</html>
