document.addEventListener('DOMContentLoaded', function () {
    class FloodWatchApp {
        constructor() {
            this.map = null;
            this.adminBoundaries = {};
            this.layers = {};
            this.layerGroups = {
                Admin0: null,
                Admin1: null
            };
            this.selectedAdmin0 = '';
            this.selectedAdmin1 = '';
        }

        init() {
            this.initMap();
            this.initLayerGroups();
            this.initEventListeners();
            this.loadGeoJSON();
        }

        initMap() {
            this.map = L.map('map', {
                center: [4.300899, 35.499288],
                zoom: 6,
                zoomControl: false
            });

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(this.map);
        }

        initLayerGroups() {
            // Layer groups for Admin0 and Admin1
            this.layerGroups.Admin0 = L.layerGroup().addTo(this.map);
            this.layerGroups.Admin1 = L.layerGroup().addTo(this.map);
        }

        initEventListeners() {
            // Sidebar tab switching
            document.querySelectorAll('.sidebar-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.switchSection(e));
            });

            // Admin0 filter change
            document.getElementById('admin0-filter').addEventListener('change', (e) => {
                this.selectedAdmin0 = e.target.value;
                this.updateAdmin0Layer();
                this.updateAdmin1Filter();
            });

            // Admin1 filter change
            document.getElementById('admin1-filter').addEventListener('change', (e) => {
                this.selectedAdmin1 = e.target.value;
                this.updateAdmin1Layer();
            });
        }

        switchSection(e) {
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

            const section = e.target.dataset.section;
            e.target.classList.add('active');
            document.getElementById(`${section}-section`).classList.add('active');

            // Ensure selected state is reflected across sections
            this.updateAdmin0Layer();
            this.updateAdmin1Layer();
        }

        loadGeoJSON() {
            const adminLevels = ['Admin0', 'Admin1'];
            const geojsonPromises = adminLevels.map(level =>
                fetch(`data/GHA_${level}.geojson`).then(res => res.json())
            );

            Promise.all(geojsonPromises)
                .then(data => {
                    this.adminBoundaries = {
                        Admin0: data[0],
                        Admin1: data[1]
                    };
                    this.initializeFilters();
                })
                .catch(error => console.error('Error loading GeoJSON files:', error));
        }

        initializeFilters() {
            const admin0Features = this.adminBoundaries.Admin0.features;
            const countries = [...new Set(admin0Features.map(f => f.properties.COUNTRY))].sort();

            const admin0Select = document.getElementById('admin0-filter');
            admin0Select.innerHTML = '<option value="">All Countries</option>';
            countries.forEach(country => {
                admin0Select.innerHTML += `<option value="${country}">${country}</option>`;
            });

            this.updateAdmin1Filter();
        }

        updateAdmin0Layer() {
            this.layerGroups.Admin0.clearLayers();

            const filteredAdmin0 = this.selectedAdmin0
                ? {
                    type: 'FeatureCollection',
                    features: this.adminBoundaries.Admin0.features.filter(f => f.properties.COUNTRY === this.selectedAdmin0)
                }
                : this.adminBoundaries.Admin0;

            L.geoJSON(filteredAdmin0, {
                style: this.getGeoJSONStyle('Admin0')
            }).addTo(this.layerGroups.Admin0);

            if (filteredAdmin0.features.length > 0) {
                this.map.fitBounds(L.geoJSON(filteredAdmin0).getBounds());
            }
        }

        updateAdmin1Filter() {
            const admin1Features = this.adminBoundaries.Admin1.features.filter(f =>
                !this.selectedAdmin0 || f.properties.COUNTRY === this.selectedAdmin0
            );

            const admin1Select = document.getElementById('admin1-filter');
            admin1Select.innerHTML = '<option value="">All Admin1</option>';
            admin1Features.forEach(admin1 => {
                admin1Select.innerHTML += `<option value="${admin1.properties.NAME_1}">${admin1.properties.NAME_1}</option>`;
            });

            this.updateAdmin1Layer();
        }

        updateAdmin1Layer() {
            this.layerGroups.Admin1.clearLayers();

            const filteredAdmin1 = this.selectedAdmin1
                ? {
                    type: 'FeatureCollection',
                    features: this.adminBoundaries.Admin1.features.filter(f => f.properties.NAME_1 === this.selectedAdmin1)
                }
                : this.adminBoundaries.Admin1;

            L.geoJSON(filteredAdmin1, {
                style: this.getGeoJSONStyle('Admin1')
            }).addTo(this.layerGroups.Admin1);
        }

        getGeoJSONStyle(level) {
            const colors = {
                Admin0: '#1976d2',
                Admin1: '#d32f2f'
            };
            return {
                fillColor: colors[level],
                weight: 2,
                opacity: 1,
                color: '#ffffff',
                fillOpacity: 0.3
            };
        }
    }

    const floodWatchApp = new FloodWatchApp();
    floodWatchApp.init();
});
