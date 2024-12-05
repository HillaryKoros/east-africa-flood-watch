document.addEventListener('DOMContentLoaded', function() {
    class FloodWatchApp {
        constructor() {
            this.map = null;
            this.layers = {};
            this.layerGroups = {};
            this.currentGeoJSONLayer = null;
            this.ghaCountries = {
                type: "FeatureCollection",
                features: []
            };
        }

        init() {
            this.initMap();
            this.initLayerGroups();
            this.setupLayerGroups();
            this.initEventListeners();
            this.loadGeoJSON();
        }

        initMap() {
            this.map = L.map('map', {
                center: [7.9465, -1.0232],
                zoom: 7,
                zoomControl: false
            });

            // Satellite base layer
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(this.map);

            // Custom zoom controls
            L.control.zoom({
                position: 'bottomright'
            }).addTo(this.map);

            // Drawing control
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
            this.map.addControl(drawControl);

            // Legend control
            const legend = L.control({position: 'bottomright'});
            legend.onAdd = () => {
                const div = L.DomUtil.create('div', 'legend');
                this.updateLegend(div);
                return div;
            };
            legend.addTo(this.map);
        }

        initLayerGroups() {
            const categories = [
                'floodIndicators', 'precipitation', 'soilMoisture', 
                'vegetation', 'temperature', 'geographic', 
                'thematic', 'displacement', 'boundaries', 'forecast'
            ];

            this.layerGroups = categories.reduce((groups, category) => {
                groups[category] = L.layerGroup().addTo(this.map);
                return groups;
            }, {});
        }

        setupLayerGroups() {
            const monitoringLayers = {
                'Precipitation': [
                    'Standardized precipitation index (CHIRPS)',
                    'Monthly precipitation (CHIRPS)'
                ],
                'Soil Moisture': [
                    'Monthly soil moisture',
                    'Seasonal soil moisture'
                ],
                'Vegetation Condition': [
                    'Monthly condition',
                    'Seasonal condition'
                ],
                'Temperature Condition': [
                    'Maximum temperature',
                    'Minimum temperature'
                 ]
            };

            const forecastLayers = {
                'Models': [
                    'FLOODPROOFS',
                    'MIC-HYDRO',
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

            this.createLayerGroups(monitoringLayers, 'monitoring');
            this.createLayerGroups(forecastLayers, 'forecast');
        }

        createLayerGroups(groups, section) {
            const container = document.querySelector(`#${section}-section .layers-container`);
            
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
                checkbox.addEventListener('change', this.handleLayerToggle.bind(this));
            });
        }

        handleLayerToggle(e) {
            const layerId = e.target.id;
            const category = e.target.dataset.category;
            
            if (e.target.checked) {
                if (this.layers[layerId]) {
                    this.map.removeLayer(this.layers[layerId]);
                }
                this.layers[layerId] = this.createPlaceholderLayer(layerId, category);
                this.layers[layerId].addTo(this.layerGroups[category]);
            } else if (this.layers[layerId]) {
                this.map.removeLayer(this.layers[layerId]);
                delete this.layers[layerId];
            }
            this.updateLegend();
        }

        createPlaceholderLayer(name, category) {
            return L.tileLayer(`https://example.com/tiles/${category}/${name}.png`, {
                opacity: 0.7
            });
        }

        initEventListeners() {
            // Sidebar section switching
            document.querySelectorAll('.sidebar-btn').forEach(btn => {
                btn.addEventListener('click', () => this.switchSection(btn));
            });

            // Map controls
            document.getElementById('zoom-in')?.addEventListener('click', () => this.map.zoomIn());
            document.getElementById('zoom-out')?.addEventListener('click', () => this.map.zoomOut());
            document.getElementById('reset-view')?.addEventListener('click', () => this.resetMapView());
        }

        switchSection(btn) {
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.section}-section`).classList.add('active');
        }

        resetMapView() {
            this.map.setView([7.9465, -1.0232], 7);
        }

        loadGeoJSON() {
            fetch('data/GHA_Admin1.geojson')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    this.ghaCountries = data;
                    this.initializeCountryFilter();
                    this.filterByCountry('');
                })
                .catch(error => {
                    console.error('Error loading GeoJSON:', error);
                });
        }

        initializeCountryFilter() {
            const countries = [...new Set(this.ghaCountries.features.map(f => f.properties.COUNTRY))].sort();
            
            ['monitoring', 'forecast'].forEach(section => {
                const filterDiv = document.querySelector(`#${section}-section .filters`);
                const countryFilter = this.createCountryFilter(countries);
                filterDiv.appendChild(countryFilter);
            });
        }

        createCountryFilter(countries) {
            const select = document.createElement('select');
            select.className = 'filter-select';
            select.innerHTML = '<option value="">All Countries</option>';
            
            countries.forEach(country => {
                select.innerHTML += `<option value="${country}">${country}</option>`;
            });
            
            select.addEventListener('change', (e) => this.filterByCountry(e.target.value));
            return select;
        }

        filterByCountry(countryName) {
            if (this.currentGeoJSONLayer) {
                this.map.removeLayer(this.currentGeoJSONLayer);
            }

            const filteredGeoJSON = countryName 
                ? {
                    type: "FeatureCollection",
                    features: this.ghaCountries.features.filter(feature => 
                        feature.properties.COUNTRY === countryName
                    )
                } 
                : this.ghaCountries;

            this.currentGeoJSONLayer = L.geoJSON(filteredGeoJSON, {
                style: this.getGeoJSONStyle
            }).addTo(this.map);

            if (filteredGeoJSON.features.length > 0) {
                this.map.fitBounds(this.currentGeoJSONLayer.getBounds());
            }
        }

        getGeoJSONStyle() {
            return {
                fillColor: '#1976d2',
                weight: 2,
                opacity: 1,
                color: '#ffffff',
                fillOpacity: 0.3
            };
        }

        updateLegend(div = document.querySelector('.legend')) {
            if (!div) return;
            
            let content = '<h4>Active Layers</h4>';
            Object.keys(this.layers).forEach(layerId => {
                content += `<div class="legend-item">
                    <span class="legend-color" style="background: #1976d2"></span>
                    ${layerId.replace(/-/g, ' ')}
                </div>`;
            });
            div.innerHTML = content || '<p>No layers active</p>';
        }
    }

    // Initialize the application
    const floodWatchApp = new FloodWatchApp();
    floodWatchApp.init();
});