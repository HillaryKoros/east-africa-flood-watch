# East Africa Flood Watch 🌊🗺️

## Project Overview
A comprehensive web application for real-time flood monitoring and forecasting in East African regions. It provides tools for analyzing flood risks, visualizing geospatial data, and generating detailed reports.

## 🌟 Key Features
- **Real-time flood status tracking**
- **Interactive geospatial visualization**
- **Water level and precipitation monitoring**
- **Multi-basin analysis**
- **Dynamic report generation** for flood analysis, drought impact, and population exposure
- **Comprehensive analysis** of flood, precipitation, soil moisture, vegetation, and temperature conditions
- **Forecasting tools** for precipitation and temperature
- **Boundaries & Thematic layers** for geospatial analysis

## 🛠 Technologies
- Leaflet.js
- HTML5
- CSS3
- JavaScript
- GitHub Actions

## 📦 Installation

### Local Development
1. Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/east-africa-flood-watch.git
cd east-africa-flood-watch
```
## 🧭 Navbar
- **Home**: Displays the main interface with a map and a sidebar for layer management.
- **Map Viewer**: Contains the map and all layers. Uses FontAwesome for icons to show available layers. Linked to the Leaflet map.
- **Reports**: Generates flood analysis reports with options to choose time and analysis area. Includes timeseries graphs, drought impact statistics, and population exposure graphs.
- **Analysis**: Provides drought analysis reports similar to the Reports section but focuses on drought metrics.
- **Flood Indicators**: Displays various flood indicators such as flood conditions, soil moisture, vegetation anomaly, and more.
- **About**: Information about the project.
- **Partners**: Lists project partners.
- **Contact**: Contact information.
- **Search Icon**: For searching within the application.

## 📊 Sidebar
- **Filter by Country**: Allows users to filter data by country.
- **Filter by Cluster**: Allows users to filter data by cluster.
- **Monitoring**: Displays current flood conditions, precipitation, soil moisture, vegetation anomalies, temperature, and other thematic layers.
  - **Combined Flood Indicators**:
    - Current flood conditions (10-day CFI)
    - Monthly combined CFI
    - Seasonal combined CFI
  - **Precipitation**:
    - Standardized precipitation index (CHIRPS)
    - Monthly precipitation
  - **Soil Moisture**:
    - 10-day soil moisture
    - Monthly soil moisture
    - Seasonal soil moisture
  - **Vegetation Anomaly**:
    - 10-day vegetation anomaly
    - Monthly vegetation anomaly
    - Seasonal vegetation anomaly
  - **Temperature Condition**:
    - Maximum temperature
    - Minimum temperature
  - **Geographic Background**:
    - Koppen climate classification
    - Soil type
    - Land use type
    - Thermal regions
  - **Thematic Layers**:
    - Acute food insecurity
    - Cropland area mask
    - Population distribution projection
  - **Disaster Displacement**:
    - Flood disaster displacement
    - Mixed disaster displacement
  - **Boundary Layers**:
    - GHA boundaries (admin 0, admin 1, admin 2)
    - Protected areas

- **Forecasting**: Provides precipitation and temperature forecasts.
  - **Precipitation Forecast**:
    - Monthly precipitation forecast
    - Seasonal precipitation forecast
  - **Temperature Forecast**:
    - Monthly temperature forecast
    - Seasonal temperature forecast
  - **Boundary Layers**:
    - GHA boundaries (admin 0, admin 1, admin 2)
    - Protected areas

## 🎨 Map Viewer Features
- **Legend**: Displays the legend for the selected dataset, auto-updating based on the data chosen.
- **Analysis**: Users can draw areas on the map to perform analysis on the loaded dataset.
- **Zoom Controls**: Located at the bottom of the map viewer.
- **Validation Feedback**: Provides real-time validation feedback for user input.

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
MIT License

## 👥 Partners
- ICPAC
- IGAD
- Regional Hydrological Agencies

