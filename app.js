document.addEventListener('DOMContentLoaded', function () {
    class FloodWatchApp {
        constructor() {
            this.map = null;
            this.adminBoundaries = {};
            this.layerGroups = {
                Admin0: null,
                Admin1: null,
            };
            this.selectedAdmin0 = '';
            this.selectedAdmin1 = '';
        }

        // Initialize the entire application
        init() {
            this.initMap();
            this.initLayerGroups();
            this.initEventListeners();
            this.loadGeoJSON();
        }

        // Map Initialization Methods
        initMap() {
            this.map = L.map('map', {
                center: [4.3, 35.5],
                zoom: 4,
                zoomControl: true,
                layers: []
            });
        
            this.baseMaps = {
                "Satellite Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri',
                    maxZoom: 19,
                    name: 'Satellite'
                }),
                "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                    name: 'OSM'
                })
            };
        
            this.baseMaps["Satellite Imagery"].addTo(this.map);
        }
        
        initLayerGroups() {
            this.layerGroups = {
                Admin0: L.layerGroup(),
                Admin1: L.layerGroup()
            };
        
            this.layerGroups.Admin0.addTo(this.map);
            this.layerGroups.Admin1.addTo(this.map);
        
            this.overlayMaps = {
                "National Boundaries": this.layerGroups.Admin0,
                "Regional Boundaries": this.layerGroups.Admin1
            };
        
            this.layerControl = L.control.layers(this.baseMaps, this.overlayMaps, {
                position: 'topright',
                collapsed: true
            }).addTo(this.map);
        }

        // Event Listeners
        initEventListeners() {
            document.querySelectorAll('.sidebar-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => this.switchSection(e));
            });

            document.getElementById('admin0-filter').addEventListener('change', (e) => {
                this.selectedAdmin0 = e.target.value;
                this.updateAdmin0Layer();
                this.updateAdmin1Filter();
            });

            document.getElementById('admin1-filter').addEventListener('change', (e) => {
                this.selectedAdmin1 = e.target.value;
                this.updateAdmin1Layer();
            });
        }

        // Section Switching
        switchSection(e) {
            document.querySelectorAll('.sidebar-btn').forEach((b) => b.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach((s) => s.classList.remove('active'));

            const section = e.target.dataset.section;
            e.target.classList.add('active');
            document.getElementById(`${section}-section`).classList.add('active');
        }

        // Data Loading Methods ()
        loadGeoJSON() {
            const adminLevels = ['Admin0', 'Admin1'];
            const geojsonPromises = adminLevels.map((level) =>
                fetch(`data/GHA_${level}.geojson`).then((res) => res.json())
            );

            Promise.all(geojsonPromises)
                .then((data) => {
                    this.adminBoundaries = {
                        Admin0: data[0],
                        Admin1: data[1],
                    };
                    this.initializeFilters();
                })
                .catch((error) => console.error('Error loading GeoJSON files:', error));
        }

        // Filter Initialization Methods
        initializeFilters() {
            const admin0Features = this.adminBoundaries.Admin0.features;
            const admin0Dropdown = document.getElementById('admin0-filter');
            admin0Features.forEach((feature) => {
                const option = document.createElement('option');
                option.value = feature.properties.COUNTRY;
                option.textContent = feature.properties.COUNTRY;
                admin0Dropdown.appendChild(option);
            });

            this.updateAdmin0Layer();
        }

        // Layer Update Methods
        updateAdmin0Layer() {
            this.layerGroups.Admin0.clearLayers();

            const admin0Features = this.adminBoundaries.Admin0.features.filter((feature) =>
                this.selectedAdmin0 ? feature.properties.COUNTRY === this.selectedAdmin0 : true
            );

            const admin0Layer = L.geoJSON(admin0Features, {
                style: { color: '#1976d2', weight: 2 },
            });

            this.layerGroups.Admin0.addLayer(admin0Layer);
        }

        updateAdmin1Filter() {
            // Clear existing options
            const admin1Dropdown = document.getElementById('admin1-filter');
            admin1Dropdown.innerHTML = '<option value="">Select Admin Level 1</option>';

            // Filter Admin1 features based on selected Admin0
            const admin1Features = this.adminBoundaries.Admin1.features.filter((feature) => 
                !this.selectedAdmin0 || feature.properties.COUNTRY === this.selectedAdmin0
            );

            // Sort and add unique Admin1 regions to dropdown
            const uniqueAdmin1Regions = [...new Set(
                admin1Features.map(feature => feature.properties.NAME_1)
            )].sort();

            uniqueAdmin1Regions.forEach((regionName) => {
                const option = document.createElement('option');
                option.value = regionName;
                option.textContent = regionName;
                admin1Dropdown.appendChild(option);
            });
        }

        updateAdmin1Layer() {
            // Clear existing Admin1 layers
            this.layerGroups.Admin1.clearLayers();

            // Filter Admin1 features based on selected criteria
            const admin1Features = this.adminBoundaries.Admin1.features.filter((feature) => {
                const matchesAdmin0 = !this.selectedAdmin0 || feature.properties.COUNTRY === this.selectedAdmin0;
                const matchesAdmin1 = !this.selectedAdmin1 || feature.properties.NAME_1 === this.selectedAdmin1;
                return matchesAdmin0 && matchesAdmin1;
            });

            // Create and add GeoJSON layer
            if (admin1Features.length > 0) {
                const admin1Layer = L.geoJSON(admin1Features, {
                    style: { 
                        color: '#d32f2f', 
                        weight: 2,
                        fillColor: '#d32f2f',
                        fillOpacity: 0.2
                    },
                });

                this.layerGroups.Admin1.addLayer(admin1Layer);

                // Optionally, fit the map to the selected boundaries
                if (admin1Features.length > 0) {
                    const bounds = admin1Layer.getBounds();
                    this.map.fitBounds(bounds);
                }
            }
        }
    }

    const app = new FloodWatchApp();
    app.init();
});