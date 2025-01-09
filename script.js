class GlobalHMPVTracker {
  constructor() {
    this.map = null;
    this.markers = null;
    this.chart = null;
    this.countries = [
      { name: "China", lat: 35.8617, lng: 104.1954, highlight: true },
      { name: "India", lat: 20.5937, lng: 78.9629, highlight: true },
      { name: "USA", lat: 37.0902, lng: -95.7129 },
      { name: "UK", lat: 55.3781, lng: -3.436 },
      { name: "France", lat: 46.2276, lng: 2.2137 },
      { name: "Germany", lat: 51.1657, lng: 10.4515 },
      { name: "Italy", lat: 41.8719, lng: 12.5674 },
      { name: "Spain", lat: 40.4637, lng: -3.7492 },
      { name: "Canada", lat: 56.1304, lng: -106.3468 },
      { name: "Japan", lat: 36.2048, lng: 138.2529 },
      { name: "Australia", lat: -25.2744, lng: 133.7751 },
      { name: "Brazil", lat: -14.235, lng: -51.9253 },
      { name: "South Korea", lat: 35.9078, lng: 127.7669 },
      { name: "Russia", lat: 61.524, lng: 105.3188 },
      { name: "South Africa", lat: -30.5595, lng: 22.9375 },
    ];

    this.initializeMap();
    this.initializeChart();
    this.setupEventListeners();
    this.startSimulation();
  }

  generateRandomData() {
    const data = {
      global: {
        totalCases: 0,
        activeCases: 0,
        recovered: 0,
        deaths: 0,
      },
      countries: new Map(),
    };

    this.countries.forEach((country) => {
      // Generate higher numbers for China and India
      const maxCases = country.highlight ? 9 : 5;
      const cases =
        Math.floor(Math.random() * maxCases) + (country.highlight ? 5 : 0);
      const active = Math.floor(Math.random() * (cases + 1));
      const recovered = Math.floor(Math.random() * (cases - active + 1));
      const deaths = cases - active - recovered;

      data.countries.set(country.name, {
        ...country,
        totalCases: cases,
        activeCases: active,
        recovered: recovered,
        deaths: deaths,
        trend: Math.random() > 0.5 ? 1 : -1,
      });

      // Update global stats
      data.global.totalCases += cases;
      data.global.activeCases += active;
      data.global.recovered += recovered;
      data.global.deaths += deaths;
    });

    return data;
  }

  initializeMap() {
    // Initialize map with a specific view
    this.map = L.map("worldMap").setView([30, 0], 2);

    // Add the tile layer (map background)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);
  }

  updateMap(countries) {
    // Clear existing markers
    if (this.markers) {
      this.map.removeLayer(this.markers);
    }

    this.markers = L.layerGroup().addTo(this.map);

    countries.forEach((country) => {
      // Create circle marker with different sizes and colors based on cases
      const radius = country.highlight ? 20 : 10;
      const color = country.highlight ? "#e74c3c" : "#3498db";

      L.circleMarker([country.lat, country.lng], {
        radius: radius,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      })
        .bindPopup(this.createPopupContent(country))
        .addTo(this.markers);
    });
  }

  createPopupContent(country) {
    return `
      <div class="popup-content">
        <h3>${country.name}</h3>
        <p>Total Cases: ${country.totalCases}</p>
        <p>Active Cases: ${country.activeCases}</p>
        <p>Recovered: ${country.recovered}</p>
        <p>Deaths: ${country.deaths}</p>
      </div>
    `;
  }

  initializeChart() {
    const ctx = document.getElementById("trendChart").getContext("2d");
    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this.countries.map((c) => c.name),
        datasets: [
          {
            label: "Total Cases",
            data: Array(this.countries.length).fill(0),
            backgroundColor: this.countries.map((c) =>
              c.highlight ? "#e74c3c" : "#3498db"
            ),
            borderColor: this.countries.map((c) =>
              c.highlight ? "#c0392b" : "#2980b9"
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
          },
        },
      },
    });
  }

  updateStats(stats) {
    document.getElementById("totalCases").textContent = stats.totalCases;
    document.getElementById("activeCases").textContent = stats.activeCases;
    document.getElementById("recovered").textContent = stats.recovered;
    document.getElementById("deaths").textContent = stats.deaths;
    document.getElementById("lastUpdated").textContent =
      new Date().toLocaleString();
  }

  updateChart(countries) {
    const data = Array.from(countries.values()).map(
      (country) => country.totalCases
    );
    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }

  updateTable(countries) {
    const tbody = document.getElementById("countriesTableBody");
    tbody.innerHTML = "";

    Array.from(countries.values())
      .sort((a, b) => b.totalCases - a.totalCases)
      .forEach((country) => {
        const row = document.createElement("tr");
        if (country.highlight) {
          row.classList.add("highlighted-country");
        }
        row.innerHTML = `
          <td>${country.name}</td>
          <td>${country.totalCases}</td>
          <td>${country.activeCases}</td>
          <td>${country.recovered}</td>
          <td>${country.deaths}</td>
          <td><span class="trend ${
            country.trend > 0 ? "up" : "down"
          }"></span></td>
        `;
        tbody.appendChild(row);
      });
  }

  startSimulation() {
    // Initial update
    this.updateData();
    // Update every 5 seconds
    setInterval(() => this.updateData(), 5000);
  }

  updateData() {
    const data = this.generateRandomData();
    this.updateStats(data.global);
    this.updateMap(data.countries);
    this.updateChart(data.countries);
    this.updateTable(data.countries);
  }

  setupEventListeners() {
    document.getElementById("toggleClusters").addEventListener("click", () => {
      if (this.map.hasLayer(this.markers)) {
        this.map.removeLayer(this.markers);
      } else {
        this.map.addLayer(this.markers);
      }
    });

    document.getElementById("countrySearch").addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document
        .getElementById("countriesTableBody")
        .getElementsByTagName("tr");

      Array.from(rows).forEach((row) => {
        const countryName = row.cells[0].textContent.toLowerCase();
        row.style.display = countryName.includes(searchTerm) ? "" : "none";
      });
    });

    document.getElementById("sortBy").addEventListener("change", (e) => {
      const value = e.target.value;
      const tbody = document.getElementById("countriesTableBody");
      const rows = Array.from(tbody.getElementsByTagName("tr"));

      rows.sort((a, b) => {
        const aValue = parseInt(
          a.cells[
            value === "cases"
              ? 1
              : value === "active"
              ? 2
              : value === "recovered"
              ? 3
              : 4
          ].textContent
        );
        const bValue = parseInt(
          b.cells[
            value === "cases"
              ? 1
              : value === "active"
              ? 2
              : value === "recovered"
              ? 3
              : 4
          ].textContent
        );
        return bValue - aValue;
      });

      tbody.innerHTML = "";
      rows.forEach((row) => tbody.appendChild(row));
    });
  }
}

// Initialize the tracker when the page loads
window.addEventListener("load", () => {
  new GlobalHMPVTracker();
});
