document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('map').setView([0.3, 37.5], 6);

    // Add the satellite layer as base map
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Layer groups for different categories
    const layerGroups = {
        floodIndicators: L.layerGroup(),
        precipitation: L.layerGroup(),
        soilMoisture: L.layerGroup(),
        vegetation: L.layerGroup(),
        temperature: L.layerGroup(),
        geographic: L.layerGroup(),
        thematic: L.layerGroup(),
        displacement: L.layerGroup(),
        boundaries: L.layerGroup(),
        forecast: L.layerGroup()
    };

    Object.values(layerGroups).forEach(group => group.addTo(map));

    // Track active layers
    const layers = {};
    let currentGeoJSONLayer = null;

    function getGeoJSONStyle(feature) {
        return {
            fillColor: '#1976d2',
            weight: 2,
            opacity: 1,
            color: '#ffffff',
            fillOpacity: 0.3
        };
    }

    function filterByCountry(countryName) {
        if (currentGeoJSONLayer) {
            map.removeLayer(currentGeoJSONLayer);
        }

        const filteredGeoJSON = countryName ? {
            type: "FeatureCollection",
            features: ghaCountries.features.filter(feature => 
                feature.properties.COUNTRY === countryName
            )
        } : ghaCountries;

        currentGeoJSONLayer = L.geoJSON(filteredGeoJSON, {
            style: getGeoJSONStyle
        }).addTo(map);

        if (filteredGeoJSON.features.length > 0) {
            map.fitBounds(currentGeoJSONLayer.getBounds());
        }
    }

    // Create placeholder layer
    function createPlaceholderLayer(name, category) {
        return L.tileLayer(`https://placeholder.tiles/${category}/${name}/{z}/{x}/{y}.png`, {
            opacity: 0.7
        });
    }

    // Handle layer toggle
    function handleLayerToggle(e) {
        const layerId = e.target.id;
        const category = e.target.dataset.category;
        
        if (e.target.checked) {
            if (layers[layerId]) {
                map.removeLayer(layers[layerId]);
            }
            layers[layerId] = createPlaceholderLayer(layerId, category);
            layers[layerId].addTo(layerGroups[category]);
        } else if (layers[layerId]) {
            map.removeLayer(layers[layerId]);
            delete layers[layerId];
        }
        updateLegend();
    }

    // Initialize filters and layers
    function initializeInterface() {
        const countryFilter = document.createElement('select');
        countryFilter.className = 'filter-select';
        countryFilter.innerHTML = '<option value="">All Countries</option>';

        // Add countries from GeoJSON
        const countries = [...new Set(ghaCountries.features.map(f => f.properties.COUNTRY))].sort();
        countries.forEach(country => {
            countryFilter.innerHTML += `<option value="${country}">${country}</option>`;
        });

        // Add country filter to both monitoring and forecast sections
        ['monitoring', 'forecast'].forEach(section => {
            const filterDiv = document.querySelector(`#${section}-section .filters`);
            const filterClone = countryFilter.cloneNode(true);
            filterClone.addEventListener('change', (e) => filterByCountry(e.target.value));
            filterDiv.appendChild(filterClone);
        });

        // Initialize layer checkboxes
        setupLayerGroups();
    }

    function setupLayerGroups() {
        // Monitoring section layers
        const monitoringLayers = {
            'Combined Flood Indicators': [
                'Current flood conditions (10-day CFI)',
                'Monthly combined CFI',
                'Seasonal combined CFI'
            ],
            'Precipitation': [
                'Standardized precipitation index (CHIRPS)',
                'Monthly precipitation (CHIRPS)'
            ],
            'Soil Moisture': [
                '10-day soil moisture',
                'Monthly soil moisture',
                'Seasonal soil moisture'
            ],
            'Vegetation Anomaly': [
                '10-day vegetation anomaly',
                'Monthly vegetation anomaly',
                'Seasonal vegetation anomaly'
            ],
            'Vegetation Condition': [
                '10-day condition',
                'Monthly condition',
                'Seasonal condition'
            ],
            'Temperature Condition': [
                'Maximum temperature',
                'Minimum temperature'
            ],
            'Geographic Background': [
                'Koppen climate classification',
                'Soil type',
                'Land use type',
                'Thermal regions'
            ],
            'Thematic Layers': [
                'Acute food insecurity',
                'Cropland area mask',
                'Rangeland area mask',
                'Population distribution projection'
            ],
            'Disaster Displacement': [
                'Flood disaster displacement',
                'Mixed disaster displacement'
            ]
        };

        // Forecast section layers
        const forecastLayers = {
            'Models': [
                'FLOODPROOFS',
                'MIC',
                'HYDRO',
                'GEOFSM'
            ],
            'Precipitation Forecast': [
                'Monthly precipitation forecast',
                'Seasonal precipitation forecast'
            ],
            'Temperature Forecast': [
                'Monthly temperature forecast',
                'Seasonal temperature forecast'
            ]
        };

        // Create monitoring layers
        const monitoringContainer = document.querySelector('#monitoring-section .layers-container');
        createLayerGroups(monitoringLayers, monitoringContainer, 'monitoring');

        // Create forecast layers
        const forecastContainer = document.querySelector('#forecast-section .layers-container');
        createLayerGroups(forecastLayers, forecastContainer, 'forecast');
    }

    function createLayerGroups(groups, container, section) {
        Object.entries(groups).forEach(([groupName, layers]) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'layer-group';
            groupDiv.innerHTML = `
                <div class="layer-group-title">${groupName}</div>
                ${layers.map(layer => `
                    <div class="layer-item">
                        <input type="checkbox" id="${layer.toLowerCase().replace(/\s+/g, '-')}" 
                               data-category="${section}">
                        <label for="${layer.toLowerCase().replace(/\s+/g, '-')}">${layer}</label>
                    </div>
                `).join('')}
            `;
            container.appendChild(groupDiv);
        });

        // Add event listeners to new checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', handleLayerToggle);
        });
    }

    // Legend control
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        updateLegend(div);
        return div;
    };
    legend.addTo(map);

    function updateLegend(div = document.querySelector('.legend')) {
        if (!div) return;
        
        let content = '<h4>Active Layers</h4>';
        Object.keys(layers).forEach(layerId => {
            content += `<div class="legend-item">
                <span class="legend-color" style="background: #1976d2"></span>
                ${layerId.replace(/-/g, ' ')}
            </div>`;
        });
        div.innerHTML = content;
    }

    // Sidebar section switching
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.section}-section`).classList.add('active');
        });
    });

    // Analysis controls
    const drawControl = new L.Control.Draw({
        draw: {
            polygon: true,
            rectangle: true,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false
        }
    });
    map.addControl(drawControl);

    // Load GeoJSON and initialize interface
    fetch('/data/output.geojson')
        .then(response => response.json())
        .then(data => {
            window.ghaCountries = data;
            initializeInterface();
            filterByCountry('');
        });
});