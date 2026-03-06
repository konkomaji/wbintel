/* WBIntel · alerts.js — Breaking news alerts using CONFIG */
const Alerts = (() => {
  let _timer=null;
  function show(item) {
    if(!Settings.getToggle('breakingAlerts',true))return;
    const bar=document.getElementById('breakingAlert'),text=document.getElementById('breakingAlertText');
    if(!bar||!text)return;
    text.innerHTML=`<strong>${esc(item.source)}</strong>: ${esc(truncate(item.title,120))}`;
    bar.style.display='flex'; Sound.alert();
    if(_timer)clearTimeout(_timer);
    _timer=setTimeout(dismiss, CONFIG.timers.alertDismiss);
  }
  function dismiss(){const b=document.getElementById('breakingAlert');if(b)b.style.display='none';if(_timer){clearTimeout(_timer);_timer=null;}}
  return {show,dismiss};
})();
