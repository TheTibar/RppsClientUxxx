<?php
$result = json_decode('{"type": "FeatureCollection", "features": [{"geometry": {"type": "Point", "coordinates": [10.846302136575284, 59.8214648309797]}, "type": "Feature", "properties": {"5065": "4", "5055": "2013-01-02", "5074": "4"}}, {"geometry": {"type": "Point", "coordinates": [10.844189879731648, 59.82613401648146]}, "type": "Feature", "properties": {"5065": "4", "5055": "2013-01-13", "5074": "4"}}, {"geometry": {"type": "Point", "coordinates": [10.839634575699918, 59.8398347310527]}, "type": "Feature", "properties": {"5065": "4", "5055": "2013-12-13", "5074": "4"}}], "properties": {"fields": {"5065": {"lookup": {"1": "Pedestrian", "3": "Motorcycle", "2": "Bicycle", "4": "Car"}, "name": "Accident type"}, "5055": {"name": "Date"}, "5074": {"lookup": {"1": "Fatal", "3": "Serious injuries", "2": "Very serious injuries", "5": "No injuries", "4": "Minor injuries", "6": "Not recorded"}, "name": "Injuries"}}, "attribution": "Traffic accidents: <a href=\"http://data.norge.no/data/nasjonal-vegdatabank-api\" target=\"blank\">NVDB</a>", "description": "Traffic accidents in 2013 in Oslo, Norway"}}');

var_dump($result);

?>