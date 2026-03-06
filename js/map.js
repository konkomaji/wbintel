/* ============================================================
   WBIntel · map.js — District map, reads CONFIG.mapSources
   ============================================================ */
const WBMap = (() => {
  let _svg,_projection,_pathGen,_centroids={},_districtEvents={},_activeFilter=null;
  const CAT_COLORS={crime:'#ff3b5c',fire:'#ff7b1a',politics:'#ffaa00',business:'#4da6ff',finance:'#00e8b8',realestate:'#00d4f0',tech:'#b88aff',logistics:'#64b5f6',lifestyle:'#ff5a9e',sports:'#8aff7a',health:'#ff9f43',govt:'#4fc3f7',weather:'#80deea',hyperlocal:'#e0e0e0'};

  function getDistName(props) {
    if(!props)return 'Unknown';
    const c=[props.dtname,props.DTNAME,props.Dtname,props.district,props.DISTRICT,props.District,props.NAME_2,props.name_2,props.name,props.NAME,props.Name,props.DIST_NAME,props.Dist_Name,props.dist_name,props.shapeName,props.DISTNAME,props.distname,props.dt_name,props.DT_NAME,props.Dist_na_3];
    for(const v of c){if(v&&typeof v==='string'&&v.trim().length>1)return v.trim();}
    for(const[k,v]of Object.entries(props)){if(typeof v==='string'&&v.length>2&&v.length<40&&!k.toLowerCase().includes('st_')&&k.toLowerCase()!=='st_nm'&&k.toLowerCase()!=='state_name'&&k.toLowerCase()!=='statename')return v.trim();}
    return 'Unknown';
  }
  function isStateLevelFeature(p){const n=getDistName(p).toLowerCase();return n==='west bengal'||n==='bengal'||n==='wb';}
  function filterToWB(features){return features.filter(f=>{const p=f.properties||{};const fields=[p.ST_NM,p.st_nm,p.STATE,p.state,p.State,p.statename,p.STATE_NAME,p.NAME_1,p.name_1,p.state_name,p.StateName];for(const s of fields){if(s&&typeof s==='string'&&s.toLowerCase().includes('bengal'))return true;}return false;});}

  async function loadGeoJSON() {
    for(const src of CONFIG.mapSources){
      console.log(`[Map] Trying: ${src.label}`);
      const data=await safeFetch(src.url,`Map:${src.label}`);if(!data||!data.features)continue;
      let features=data.features;
      if(!src.isStateOnly)features=filterToWB(features);
      features=features.filter(f=>!isStateLevelFeature(f.properties||{}));
      if(features.length>=10){
        console.log(`[Map] ✓ ${features.length} districts from ${src.label}. Props:`,Object.keys(features[0].properties||{}));
        return {type:'FeatureCollection',features};
      }
      console.warn(`[Map] ✗ ${src.label}: ${features.length} features, skipping`);
    }
    return null;
  }

  function abbreviate(n){const m={'North 24 Parganas':'N24P','North Twenty Four Parganas':'N24P','South 24 Parganas':'S24P','South Twenty Four Parganas':'S24P','Paschim Bardhaman':'P.Bardhaman','Purba Bardhaman':'E.Bardhaman','Paschim Medinipur':'P.Medinipur','Purba Medinipur':'E.Medinipur','Dakshin Dinajpur':'S.Dinajpur','Uttar Dinajpur':'N.Dinajpur','Cooch Behar':'CoochB','Koch Bihar':'CoochB','Murshidabad':'M.bad','Haora':'Howrah','Hugli':'Hooghly','Maldah':'Malda'};return m[n]||(n.length>12?n.substring(0,10)+'…':n);}

  function render(geo) {
    const container=document.getElementById('mapBody'),svgEl=document.getElementById('wbMapSvg'),loading=document.getElementById('mapLoading');
    if(!container||!svgEl)return;
    const rect=container.getBoundingClientRect(),w=rect.width||400,h=rect.height||500;
    _svg=d3.select(svgEl).attr('width',w).attr('height',h).attr('viewBox',`0 0 ${w} ${h}`);
    _svg.selectAll('*').remove();
    const defs=_svg.append('defs'),filter=defs.append('filter').attr('id','grain');
    filter.append('feTurbulence').attr('type','fractalNoise').attr('baseFrequency','0.6').attr('numOctaves','3').attr('stitchTiles','stitch');
    filter.append('feColorMatrix').attr('type','saturate').attr('values','0');
    filter.append('feComponentTransfer').append('feFuncA').attr('type','linear').attr('slope','0.06');
    filter.append('feBlend').attr('in','SourceGraphic').attr('mode','multiply');
    _svg.append('rect').attr('width',w).attr('height',h).attr('fill','#070810');
    _projection=d3.geoMercator().fitExtent([[10,10],[w-10,h-10]],geo);
    _pathGen=d3.geoPath().projection(_projection);
    _svg.append('g').attr('id','districts').selectAll('path').data(geo.features).enter().append('path')
      .attr('d',_pathGen)
      .attr('fill',d=>getDistName(d.properties).toLowerCase().includes('kolkata')?'rgba(255,170,0,0.14)':'rgba(255,170,0,0.06)')
      .attr('stroke','rgba(255,170,0,0.4)').attr('stroke-width',0.7)
      .attr('data-district',d=>getDistName(d.properties))
      .attr('class','district-path').style('cursor','pointer').style('transition','fill 0.2s')
      .on('mouseenter',function(ev,d){d3.select(this).attr('fill','rgba(255,170,0,0.22)').attr('stroke','rgba(255,170,0,0.95)').attr('stroke-width',1.2);showTip(ev,d);})
      .on('mouseleave',function(ev,d){const n=getDistName(d.properties).toLowerCase();d3.select(this).attr('fill',n.includes('kolkata')?'rgba(255,170,0,0.14)':'rgba(255,170,0,0.06)').attr('stroke','rgba(255,170,0,0.4)').attr('stroke-width',0.7);hideTip();})
      .on('click',(ev,d)=>filterByDistrict(getDistName(d.properties)));
    geo.features.forEach(f=>{const n=getDistName(f.properties),c=_pathGen.centroid(f);if(c&&!isNaN(c[0])){_centroids[n]=c;_centroids[n.toLowerCase()]=c;}});
    const labels=_svg.append('g').attr('id','labels');
    geo.features.forEach(f=>{const n=getDistName(f.properties),c=_centroids[n];if(!c||isNaN(c[0]))return;labels.append('text').attr('x',c[0]).attr('y',c[1]).attr('text-anchor','middle').attr('dominant-baseline','central').attr('fill','rgba(255,170,0,0.6)').attr('font-family','JetBrains Mono,monospace').attr('font-size','5.5px').attr('font-weight','500').attr('pointer-events','none').text(abbreviate(n));});
    _svg.append('g').attr('id','pings');
    _svg.append('rect').attr('width',w).attr('height',h).attr('fill','transparent').attr('filter','url(#grain)').attr('pointer-events','none');
    loading.style.display='none';
  }
  function showTip(ev,d){const tt=document.getElementById('mapTooltip'),n=getDistName(d.properties);tt.innerHTML=`<div class="mt-name">${esc(n)}</div><div class="mt-info">Events: ${_districtEvents[n]||0}</div>`;tt.style.display='block';tt.style.left=(ev.offsetX+14)+'px';tt.style.top=(ev.offsetY-10)+'px';}
  function hideTip(){document.getElementById('mapTooltip').style.display='none';}
  function pingDistrict(name,cat){
    if(!Settings.getToggle('mapPings',true))return;
    const c=_centroids[name]||_centroids[(name||'').toLowerCase()];if(!c||isNaN(c[0])||!_svg)return;
    _districtEvents[name]=(_districtEvents[name]||0)+1;Sound.mapPing();
    _svg.select('#pings').append('circle').attr('cx',c[0]).attr('cy',c[1]).attr('r',3).attr('fill','none').attr('stroke',CAT_COLORS[cat]||'#ffaa00').attr('stroke-width',2).attr('opacity',1).transition().duration(900).ease(d3.easeQuadOut).attr('r',24).attr('opacity',0).attr('stroke-width',0.5).remove();
    _svg.selectAll('.district-path').filter(function(){return d3.select(this).attr('data-district')===name;}).attr('fill','rgba(255,170,0,0.18)').transition().delay(2500).attr('fill',name.toLowerCase().includes('kolkata')?'rgba(255,170,0,0.14)':'rgba(255,170,0,0.06)');
    updateStrip();
  }
  function updateStrip(){const el=document.getElementById('districtStripBody');if(!el)return;const s=Object.entries(_districtEvents).sort((a,b)=>b[1]-a[1]).slice(0,8);if(!s.length){el.innerHTML='<span class="t3">Awaiting…</span>';return;}el.innerHTML=s.map(([n,c])=>`<span class="ds-chip" onclick="WBIntel.Map.filterByDistrict('${esc(n)}')">${esc(abbreviate(n))}<span class="ds-count">${c}</span></span>`).join('');}
  function filterByDistrict(n){_activeFilter=n;document.getElementById('mapDistrictFilter').style.display='flex';document.getElementById('mapFilterName').textContent=n;if(window.WBIntel&&WBIntel.Feeds)WBIntel.Feeds.filterByDistrict(n);}
  function clearFilter(){_activeFilter=null;document.getElementById('mapDistrictFilter').style.display='none';if(window.WBIntel&&WBIntel.Feeds)WBIntel.Feeds.filterByDistrict(null);}
  async function init(){const g=await loadGeoJSON();if(!g){document.getElementById('mapLoading').innerHTML='<div class="fetch-error"><div class="fe-icon">⚠</div><div class="fe-msg">Map load failed. Check connection.</div><button class="fe-retry" onclick="WBIntel.Map.init()">Retry</button></div>';return;}render(g);}
  return {init,pingDistrict,filterByDistrict,clearFilter,getActiveFilter:()=>_activeFilter};
})();
