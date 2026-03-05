/* ============================================================
   WBIntel · map.js — WB District Map via D3.js + GeoJSON
   ============================================================ */

const WBMap = (() => {
  const GEOJSON_URL = 'https://raw.githubusercontent.com/datameet/maps/master/Districts/WB.geojson';
  const GEOJSON_FALLBACK = 'https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson';

  let _svg = null;
  let _projection = null;
  let _pathGen = null;
  let _centroids = {};
  let _districtEvents = {};
  let _activeFilter = null;

  // Category → ping colour
  const CAT_PING_COLOUR = {
    crime: '#ff2d55', fire: '#ff6b00', politics: '#ffaa00',
    business: '#3d9eff', finance: '#00d4aa', realestate: '#00c8e0',
    tech: '#a97fff', logistics: '#64b5f6', lifestyle: '#ff4d8f',
    sports: '#7dff6b', health: '#ff9f43', govt: '#4fc3f7',
    weather: '#80deea', hyperlocal: '#e0e0e0',
  };

  async function loadGeoJSON() {
    let data = await safeFetch(GEOJSON_URL, 'WB GeoJSON');
    if (data && data.features) {
      // datameet WB.geojson is already WB only
      return data;
    }
    // Fallback: full India, filter to WB
    data = await safeFetch(GEOJSON_FALLBACK, 'WB GeoJSON Fallback');
    if (data && data.features) {
      data.features = data.features.filter(f => {
        const sn = (f.properties.ST_NM || f.properties.NAME_1 || '').toLowerCase();
        return sn.includes('west bengal');
      });
      return data;
    }
    return null;
  }

  function getDistrictName(props) {
    return props.dtname || props.DISTRICT || props.district || props.NAME_2 || props.name || 'Unknown';
  }

  function render(geojson) {
    const container = document.getElementById('mapBody');
    const svgEl = document.getElementById('wbMapSvg');
    const loading = document.getElementById('mapLoading');
    if (!container || !svgEl) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 500;

    _svg = d3.select(svgEl)
      .attr('width', w)
      .attr('height', h)
      .attr('viewBox', `0 0 ${w} ${h}`);

    _svg.selectAll('*').remove();

    // Defs for grain texture
    const defs = _svg.append('defs');
    const filter = defs.append('filter').attr('id', 'grain');
    filter.append('feTurbulence')
      .attr('type', 'fractalNoise')
      .attr('baseFrequency', '0.65')
      .attr('numOctaves', '3')
      .attr('stitchTiles', 'stitch');
    filter.append('feColorMatrix').attr('type', 'saturate').attr('values', '0');
    filter.append('feComponentTransfer')
      .append('feFuncA').attr('type', 'linear').attr('slope', '0.08');
    filter.append('feBlend').attr('in', 'SourceGraphic').attr('mode', 'multiply');

    // Background
    _svg.append('rect').attr('width', w).attr('height', h).attr('fill', '#070810');

    // Projection
    _projection = d3.geoMercator().fitSize([w - 20, h - 20], geojson).translate([w / 2, h / 2]);
    // Re-fit
    _projection = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], geojson);
    _pathGen = d3.geoPath().projection(_projection);

    // District paths
    const districts = _svg.append('g').attr('id', 'districts');
    districts.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', _pathGen)
      .attr('fill', (d) => {
        const name = getDistrictName(d.properties);
        return name === 'Kolkata' ? 'rgba(255,170,0,0.10)' : 'rgba(255,170,0,0.05)';
      })
      .attr('stroke', 'rgba(255,170,0,0.35)')
      .attr('stroke-width', 0.6)
      .attr('data-district', d => getDistrictName(d.properties))
      .attr('class', 'district-path')
      .style('cursor', 'pointer')
      .style('transition', 'fill 0.2s, stroke 0.2s')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .attr('fill', 'rgba(255,170,0,0.18)')
          .attr('stroke', 'rgba(255,170,0,0.9)');
        showTooltip(event, d);
      })
      .on('mouseleave', function (event, d) {
        const name = getDistrictName(d.properties);
        d3.select(this)
          .attr('fill', name === 'Kolkata' ? 'rgba(255,170,0,0.10)' : 'rgba(255,170,0,0.05)')
          .attr('stroke', 'rgba(255,170,0,0.35)');
        hideTooltip();
      })
      .on('click', function (event, d) {
        const name = getDistrictName(d.properties);
        filterByDistrict(name);
      });

    // Calculate and store centroids
    geojson.features.forEach(f => {
      const name = getDistrictName(f.properties);
      const centroid = _pathGen.centroid(f);
      _centroids[name] = centroid;
      // Also map lowercase
      _centroids[name.toLowerCase()] = centroid;
    });

    // District labels
    const labels = _svg.append('g').attr('id', 'labels');
    geojson.features.forEach(f => {
      const name = getDistrictName(f.properties);
      const c = _centroids[name];
      if (!c || isNaN(c[0])) return;
      // Abbreviate long names
      const abbr = abbreviate(name);
      labels.append('text')
        .attr('x', c[0])
        .attr('y', c[1])
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'rgba(255,170,0,0.5)')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '5.5px')
        .attr('pointer-events', 'none')
        .text(abbr);
    });

    // Ping layer
    _svg.append('g').attr('id', 'pings');

    // Grain overlay
    _svg.append('rect')
      .attr('width', w)
      .attr('height', h)
      .attr('fill', 'transparent')
      .attr('filter', 'url(#grain)')
      .attr('pointer-events', 'none');

    loading.style.display = 'none';
  }

  function abbreviate(name) {
    const map = {
      'North 24 Parganas': 'N24P',
      'South 24 Parganas': 'S24P',
      'Paschim Bardhaman': 'PBardhaman',
      'Purba Bardhaman': 'EBardhaman',
      'Paschim Medinipur': 'PMedinipur',
      'Purba Medinipur': 'EMedinipur',
      'Dakshin Dinajpur': 'SDinajpur',
      'Uttar Dinajpur': 'NDinajpur',
      'Cooch Behar': 'CoochB',
    };
    return map[name] || name;
  }

  function showTooltip(event, d) {
    const tooltip = document.getElementById('mapTooltip');
    const name = getDistrictName(d.properties);
    const count = _districtEvents[name] || 0;
    tooltip.innerHTML = `
      <div class="mt-name">${esc(name)}</div>
      <div class="mt-info">Events: ${count}</div>
    `;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.offsetX + 12) + 'px';
    tooltip.style.top = (event.offsetY - 10) + 'px';
  }

  function hideTooltip() {
    document.getElementById('mapTooltip').style.display = 'none';
  }

  // --- PING ANIMATION ---
  function pingDistrict(districtName, category) {
    if (!Config.get().settings.mapDistrictPing) return;
    const centroid = _centroids[districtName] || _centroids[districtName.toLowerCase()];
    if (!centroid || isNaN(centroid[0])) return;

    const colour = CAT_PING_COLOUR[category] || '#ffaa00';
    const pings = _svg ? _svg.select('#pings') : null;
    if (!pings) return;

    // Track district events
    _districtEvents[districtName] = (_districtEvents[districtName] || 0) + 1;

    // Brighten district fill temporarily
    _svg.selectAll('.district-path')
      .filter(function() { return d3.select(this).attr('data-district') === districtName; })
      .attr('fill', 'rgba(255,170,0,0.12)')
      .transition().delay(3000).attr('fill', districtName === 'Kolkata' ? 'rgba(255,170,0,0.10)' : 'rgba(255,170,0,0.05)');

    // Create ping circle
    const circle = pings.append('circle')
      .attr('cx', centroid[0])
      .attr('cy', centroid[1])
      .attr('r', 3)
      .attr('fill', 'none')
      .attr('stroke', colour)
      .attr('stroke-width', 2)
      .attr('opacity', 1);

    circle.transition()
      .duration(900)
      .ease(d3.easeQuadOut)
      .attr('r', 22)
      .attr('opacity', 0)
      .attr('stroke-width', 0.5)
      .remove();
  }

  // --- FILTER ---
  function filterByDistrict(name) {
    _activeFilter = name;
    document.getElementById('mapDistrictFilter').style.display = 'flex';
    document.getElementById('mapFilterName').textContent = name;
    // Notify feeds module to filter
    if (window.WBIntel && WBIntel.Feeds) {
      WBIntel.Feeds.filterByDistrict(name);
    }
  }

  function clearFilter() {
    _activeFilter = null;
    document.getElementById('mapDistrictFilter').style.display = 'none';
    if (window.WBIntel && WBIntel.Feeds) {
      WBIntel.Feeds.filterByDistrict(null);
    }
  }

  function getActiveFilter() { return _activeFilter; }

  // --- INIT ---
  async function init() {
    const geojson = await loadGeoJSON();
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      const loading = document.getElementById('mapLoading');
      loading.innerHTML = `
        <div class="fetch-error">
          <div class="fe-icon">⚠</div>
          <div class="fe-msg">Failed to load WB GeoJSON map data</div>
          <button class="fe-retry" onclick="WBIntel.Map.init()">Retry</button>
        </div>`;
      return;
    }
    render(geojson);
  }

  // Handle resize
  function handleResize() {
    // Re-render on window resize — simplified: just re-init
    // (a more sophisticated approach would debounce and re-project)
  }

  return {
    init,
    pingDistrict,
    filterByDistrict,
    clearFilter,
    getActiveFilter,
    handleResize,
  };
})();
