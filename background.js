function checkAvailableDates(month, delay, play)
{
  var selector = document.querySelector("#datums")
  var ch = document.querySelector("#setdatums")

  if (!(selector) && !(ch))
  {
    logInfo("Exit. Nothing to do")
    return
  }

  if (!(selector) && ch)
  {
    logInfo("Back to dates in 5 seconds. Refreshing...")
    setTimeout(function(){ ch.click() }, 5000);
    return
  }

  var options = selector.getElementsByTagName('option')
  var nonEmpty = []
  var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;

  month = month + 1

  var thD = "01." +month+".2021"
  var thresholdDate = new Date(thD.replace(pattern,'$3-$2-$1'))
  var logStr = ""
  for (var i = 0; i < options.length; i++) {
    if (options[i].innerText.indexOf("Brīvās vietas: 0") != -1 ||
        options[i].innerText.indexOf("saraksta") != -1) continue

    var splited = options[i].innerText.split(" Brīvās vietas: ")
    var date = new Date(splited[0].replace(pattern,'$3-$2-$1'));
    if (date < thresholdDate)
      nonEmpty.push({id:i, date:date, freePlaces:parseInt(splited[1])})
    logStr += options[i].innerText + ", "
  }
  logInfo("Available dates:" + logStr)

  if (nonEmpty.length != 0)
  {
    logInfo("Found earlier date. Notify. (play music)")
    if (play)
    {
      var typeWriter = new Audio("https://www.freesound.org/data/previews/256/256458_4772965-lq.mp3");
      typeWriter.loop = false
      typeWriter.play().then(function()
      {
        logInfo("Waiting "+(delay/1000)+" for action and refreshing")
        refresh(delay)
      })
    }
  }
  else
  {
    refresh(delay)
  }

  function refresh(delay)
  {
    setTimeout(function(){ 
      selector.getElementsByTagName('option')[1].selected = 'selected'
      document.querySelector("#datums_txt").value = selector.getElementsByTagName('option')[1].innerText
      document.querySelector("#uniforma").submit()
    }, delay);
  }

  function getMomentLog(currentDate)
  {
    var currentDate = currentDate || new Date();
    return getCurrentTime(currentDate)
  }

  function getCurrentTime(currentDate)
  {
    var currentDate = currentDate || new Date();
    return (currentDate.getHours()<10?'0':'')+currentDate.getHours()+':'+(currentDate.getMinutes()<10?'0':'')+currentDate.getMinutes()+':'+(currentDate.getSeconds()<10?'0':'')+currentDate.getSeconds();
  }

  function logInfo(message)
  {
    console.log(getMomentLog() + " " + message)
  }
}

chrome.runtime.onInstalled.addListener(async () => {console.log("start ex")});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  var payload = request.payload
  //chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { //onActivated
  chrome.webNavigation.onCompleted.addListener(function (details){
    //chrome.tabs.get(details.tabId, function(tab) { console.log(tab.url); });
      chrome.scripting.executeScript({
        target: {tabId: details.tabId},
        func: checkAvailableDates,
        //files: ["./foregroud.js"]
        args: [payload.targetMonth, payload.delay, payload.playMusic]
      });
    },{ url: [
      {
        //urlMatches : 'https://e.csdd.lv/examp/'
        urlMatches : 'https://e.csdd.lv/*'
      }
    ]});

  sendResponse({message:"success"});
});