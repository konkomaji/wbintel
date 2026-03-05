/* ============================================================
   WBIntel v7.0 · map.js — WB District Map (D3.js)
   ============================================================ */
const WBMap = (() => {
  const GEOJSON_URL = 'https://raw.githubusercontent.com/datameet/maps/master/Districts/WB.geojson';
  let _svg, _projection, _pathGen, _centroids = {}, _districtEvents = {}, _activeFilter = null;

  const CAT_COLORS = {
    crime:'#ff3b5c',fire:'#ff7b1a',politics:'#ffaa00',business:'#4da6ff',
    finance:'#00e8b8',realestate:'#00d4f0',tech:'#b88aff',logistics:'#64b5f6',
    lifestyle:'#ff5a9e',sports:'#8aff7a',health:'#ff9f43',govt:'#4fc3f7',
    weather:'#80deea',hyperlocal:'#e0e0e0',
  };

  function getDistName(props) {
    return props.dtname || props.DISTRICT || props.district || props.NAME_2 || props.name || 'Unknown';
  }

  function abbreviate(name) {
    const m = {
      'North 24 Parganas':'N24P','South 24 Parganas':'S24P','Paschim Bardhaman':'P.Bardhaman',
      'Purba Bardhaman':'E.Bardhaman','Paschim Medinipur':'P.Medinipur','Purba Medinipur':'E.Medinipur',
      'Dakshin Dinajpur':'S.Dinajpur','Uttar Dinajpur':'N.Dinajpur','Cooch Behar':'CoochB',
    };
    return m[name] || name;
  }

  function render(geojson) {
    const container = document.getElementById('mapBody');
    const svgEl = document.getElementById('wbMapSvg');
    const loading = document.getElementById('mapLoading');
    if (!container || !svgEl) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width || 400, h = rect.height || 500;

    _svg = d3.select(svgEl).attr('width', w).attr('height', h).attr('viewBox', `0 0 ${w} ${h}`);
    _svg.selectAll('*').remove();

    // Grain filter
    const defs = _svg.append('defs');
    const filter = defs.append('filter').attr('id', 'grain');
    filter.append('feTurbulence').attr('type','fractalNoise').attr('baseFrequency','0.6').attr('numOctaves','3').attr('stitchTiles','stitch');
    filter.append('feColorMatrix').attr('type','saturate').attr('values','0');
    const transfer = filter.append('feComponentTransfer');
    transfer.append('feFuncA').attr('type','linear').attr('slope','0.06');
    filter.append('feBlend').attr('in','SourceGraphic').attr('mode','multiply');

    _svg.append('rect').attr('width', w).attr('height', h).attr('fill', '#070810');

    _projection = d3.geoMercator().fitExtent([[10,10],[w-10,h-10]], geojson);
    _pathGen = d3.geoPath().projection(_projection);

    const districts = _svg.append('g').attr('id', 'districts');
    districts.selectAll('path').data(geojson.features).enter().append('path')
      .attr('d', _pathGen)
      .attr('fill', d => getDistName(d.properties)==='Kolkata' ? 'rgba(255,170,0,0.12)' : 'rgba(255,170,0,0.06)')
      .attr('stroke', 'rgba(255,170,0,0.4)')
      .attr('stroke-width', 0.7)
      .attr('data-district', d => getDistName(d.properties))
      .attr('class', 'district-path')
      .style('cursor', 'pointer')
      .style('transition', 'fill 0.2s')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill', 'rgba(255,170,0,0.22)').attr('stroke', 'rgba(255,170,0,0.95)');
        showTooltip(event, d);
      })
      .on('mouseleave', function(event, d) {
        const n = getDistName(d.properties);
        d3.select(this).attr('fill', n==='Kolkata' ? 'rgba(255,170,0,0.12)' : 'rgba(255,170,0,0.06)').attr('stroke', 'rgba(255,170,0,0.4)');
        hideTooltip();
      })
      .on('click', (event, d) => filterByDistrict(getDistName(d.properties)));

    geojson.features.forEach(f => {
      const name = getDistName(f.properties);
      const c = _pathGen.centroid(f);
      _centroids[name] = c;
      _centroids[name.toLowerCase()] = c;
    });

    const labels = _svg.append('g').attr('id', 'labels');
    geojson.features.forEach(f => {
      const name = getDistName(f.properties);
      const c = _centroids[name];
      if (!c || isNaN(c[0])) return;
      labels.append('text').attr('x',c[0]).attr('y',c[1]).attr('text-anchor','middle')
        .attr('dominant-baseline','central').attr('fill','rgba(255,170,0,0.55)')
        .attr('font-family','JetBrains Mono, monospace').attr('font-size','5.5px')
        .attr('pointer-events','none').text(abbreviate(name));
    });

    _svg.append('g').attr('id', 'pings');
    _svg.append('rect').attr('width',w).attr('height',h).attr('fill','transparent')
      .attr('filter','url(#grain)').attr('pointer-events','none');

    loading.style.display = 'none';
  }

  function showTooltip(event, d) {
    const tt = document.getElementById('mapTooltip');
    const name = getDistName(d.properties);
    tt.innerHTML = `<div class="mt-name">${esc(name)}</div><div class="mt-info">Events: ${_districtEvents[name]||0}</div>`;
    tt.style.display = 'block';
    tt.style.left = (event.offsetX + 14) + 'px';
    tt.style.top = (event.offsetY - 10) + 'px';
  }
  function hideTooltip() { document.getElementById('mapTooltip').style.display = 'none'; }

  function pingDistrict(districtName, category) {
    if (!Settings.getToggle('mapPings', true)) return;
    const centroid = _centroids[districtName] || _centroids[(districtName||'').toLowerCase()];
    if (!centroid || isNaN(centroid[0]) || !_svg) return;
    _districtEvents[districtName] = (_districtEvents[districtName] || 0) + 1;
    Sound.mapPing();

    const colour = CAT_COLORS[category] || '#ffaa00';
    const pings = _svg.select('#pings');
    pings.append('circle').attr('cx',centroid[0]).attr('cy',centroid[1]).attr('r',3)
      .attr('fill','none').attr('stroke',colour).attr('stroke-width',2).attr('opacity',1)
      .transition().duration(900).ease(d3.easeQuadOut)
      .attr('r',24).attr('opacity',0).attr('stroke-width',0.5).remove();

    _svg.selectAll('.district-path')
      .filter(function(){ return d3.select(this).attr('data-district') === districtName; })
      .attr('fill','rgba(255,170,0,0.15)')
      .transition().delay(2500)
      .attr('fill', districtName==='Kolkata' ? 'rgba(255,170,0,0.12)' : 'rgba(255,170,0,0.06)');

    updateDistrictStrip();
  }

  function updateDistrictStrip() {
    const el = document.getElementById('districtStripBody');
    if (!el) return;
    const sorted = Object.entries(_districtEvents).sort((a,b)=>b[1]-a[1]).slice(0,8);
    if (sorted.length === 0) { el.innerHTML = '<span class="t3">Awaiting data…</span>'; return; }
    el.innerHTML = sorted.map(([name, count]) =>
      `<span class="ds-chip" onclick="WBIntel.Map.filterByDistrict('${esc(name)}')">${esc(name)}<span class="ds-count">${count}</span></span>`
    ).join('');
  }

  function filterByDistrict(name) {
    _activeFilter = name;
    document.getElementById('mapDistrictFilter').style.display = 'flex';
    document.getElementById('mapFilterName').textContent = name;
    if (window.WBIntel && WBIntel.Feeds) WBIntel.Feeds.filterByDistrict(name);
  }

  function clearFilter() {
    _activeFilter = null;
    document.getElementById('mapDistrictFilter').style.display = 'none';
    if (window.WBIntel && WBIntel.Feeds) WBIntel.Feeds.filterByDistrict(null);
  }

  async function init() {
    const data = await safeFetch(GEOJSON_URL, 'WB GeoJSON');
    if (!data || !data.features || data.features.length === 0) {
      document.getElementById('mapLoading').innerHTML = `
        <div class="fetch-error"><div class="fe-icon">⚠</div>
        <div class="fe-msg">Failed to load WB map data.<br>This requires internet access to fetch GeoJSON.</div>
        <button class="fe-retry" onclick="WBIntel.Map.init()">Retry</button></div>`;
      return;
    }
    render(data);
  }

  return { init, pingDistrict, filterByDistrict, clearFilter, getActiveFilter: () => _activeFilter };
})();
