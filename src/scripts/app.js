// app.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('map').setView([0.3, 37.5], 5);

    // Add the satellite layer as base map
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    // Add rivers layer (GeoJSON)
    const riverStyle = {
        color: '#40c4ff',
        weight: 2,
        opacity: 0.7
    };

    // Sample river data - replace with actual GeoJSON
    const riversData = {
        "type": "FeatureCollection",
        "features": []  // Add your river features here
    };

    L.geoJSON(riversData, {
        style: riverStyle
    }).addTo(map);

    // Sidebar section switching
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.section}-section`).classList.add('active');
        });
    });

    // Layer management
    const layers = {};

    function addLayer(layerId, layerData) {
        if (layers[layerId]) {
            map.removeLayer(layers[layerId]);
        }

        // Add new layer based on layer type
        switch(layerId) {
            case 'current-flood':
                layers[layerId] = L.tileLayer('flood-layer-url/{z}/{x}/{y}.png', {
                    opacity: 0.7
                }).addTo(map);
                break;
            case 'water-level':
                // Add water level stations as markers
                layers[layerId] = L.geoJSON(layerData, {
                    pointToLayer: (feature, latlng) => {
                        return L.circleMarker(latlng, {
                            radius: 8,
                            fillColor: '#1976d2',
                            color: '#fff',
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    }
                }).addTo(map);
                break;
            // Add more cases for different layer types
        }
    }

    // Layer toggle functionality
    document.querySelectorAll('.layer-item input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const layerId = e.target.id;
            if (e.target.checked) {
                addLayer(layerId);
            } else if (layers[layerId]) {
                map.removeLayer(layers[layerId]);
                delete layers[layerId];
            }
        });
    });

    // Info icon tooltips
    const tooltips = {
        'current-flood': 'Shows areas currently experiencing flooding based on satellite data',
        'water-level': 'Real-time water level measurements from monitoring stations',
        'rainfall-data': '24-hour accumulated rainfall from ground stations',
        'radar-data': 'Real-time radar rainfall estimates'
    };

    document.querySelectorAll('.info-icon').forEach(icon => {
        const layerId = icon.parentElement.querySelector('input').id;
        icon.title = tooltips[layerId] || 'Information about this layer';
    });

    // Add legend
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
            <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);">
                <h4 style="margin-bottom: 5px; color: #1976d2;">Legend</h4>
                <div style="display: flex; align-items: center; gap: 5px; margin: 3px 0;">
                    <div style="width: 20px; height: 20px; background: #ff4444; opacity: 0.7;"></div>
                    <span>High Flood Risk</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px; margin: 3px 0;">
                    <div style="width: 20px; height: 20px; background: #ffbb33; opacity: 0.7;"></div>
                    <span>Medium Flood Risk</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px; margin: 3px 0;">
                    <div style="width: 20px; height: 20px; background: #00C851; opacity: 0.7;"></div>
                    <span>Low Flood Risk</span>
                </div>
            </div>
        `;
        return div;
    };
    legend.addTo(map);
});