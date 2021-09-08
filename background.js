function checkAvailableDates(month, delays, notify) {
  var datesSelector = document.querySelector("#datums");
  var setDateButton = document.querySelector("#setdatums");

  if (!(datesSelector) && !(setDateButton)) {
    logInfo("open csdd date selector page");
    return;
  }

  delays.delayFromDatesToTimes = delays.delayFromDatesToTimes || 10000;
  delays.delayFromTimesToDates = delays.delayFromTimesToDates || 5000;

  var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
  var lastDateISOString = "01." +month+".2021";
  var lastDate = new Date(lastDateISOString.replace(pattern,'$3-$2-$1'));

  if (!(datesSelector) && setDateButton) {
    logInfo("wait "+(delays.delayFromTimesToDates/1000)+" seconds and update");
    setTimeout(() => { 
      setDateButton.click();
    }, delays.delayFromTimesToDates);
    return;
  }

  var earliestDates = [], allDates = [];
  var options = datesSelector.getElementsByTagName('option');

  for (var i = 0; i < options.length; i++) {
    var currentOption = options[i].innerText;
    if (currentOption.indexOf("Brīvās vietas: 0") != -1 || 
        currentOption.indexOf("saraksta") != -1) continue;

    var splitted = currentOption.split(" Brīvās vietas: ")
    var date = new Date(splitted[0].replace(pattern,'$3-$2-$1'));
    if (date < lastDate) {
      earliestDates.push({
        dateIso:splitted[0],
        freePlaces:parseInt(splitted[1])
      });
    } else {
      allDates.push({
        dateIso:splitted[0],
        freePlaces:parseInt(splitted[1])
      });
    }
  }

  logAvailableDates(earliestDates, allDates)

  if (earliestDates.length != 0) {
    logInfo("notify (play music) and wait "+(delays.delayFromDatesToTimes/1000)+" seconds for action");
    if (notify) {
      var typeWriter = new Audio("https://www.freesound.org/data/previews/256/256458_4772965-lq.mp3");
      typeWriter.play().then(() => {
        refresh(delays);
      });
    }
  } else {
     refresh(delays);
  }

  function logAvailableDates(earliestDates, allDates) {
    var logMessage = "";
    if (earliestDates && earliestDates.length > 0) {
      logMessage += 'found earliest dates: ' + datesToLog(earliestDates, ', ');
    } else if (allDates && allDates.length > 0) {
      logMessage += 'no earliest dates: ' + datesToLog(allDates, ', ');
    }
    logInfo(logMessage);
  }

  function datesToLog(dates, separator) {
      var log = '';
      var lastIndex = dates.length-1;
      for (var i=0; i<=lastIndex; i++) {
        log += dates[i].dateIso + '(' + dates[i].freePlaces + ')';
        if (i<lastIndex) log += separator;
      }
      return log;
  }

  function refresh(delays) {
    setTimeout(() => { 
      var datesSelector = document.querySelector("#datums");
      datesSelector.getElementsByTagName('option')[1].selected = 'selected';
      document.querySelector("#datums_txt").value = datesSelector.getElementsByTagName('option')[1].innerText;
      document.querySelector("#uniforma").submit();
    }, delays.delayFromDatesToTimes);
  }

  function getMomentLog(currentDate) {
    var currentDate = currentDate || new Date();
    return getCurrentTime(currentDate)
  }

  function getCurrentTime(currentDate) {
    var currentDate = currentDate || new Date();
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var seconds = currentDate.getSeconds();

    return (hours<10?'0':'')+hours+':'+(minutes<10?'0':'')+minutes+':'+(seconds<10?'0':'')+seconds;
  }

  function logInfo(message) {
    console.log("(" + getMomentLog() + ") " + message);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("csdd extension is installed");
});

chrome.webNavigation.onCompleted.addListener((details) => {

  chrome.scripting.executeScript({
    target: { 
      tabId: details.tabId
    },
    func: checkAvailableDates,
    args: [
      10,
      {
        delayFromDatesToTimes: 15000,
        delayFromTimesToDates: 5000
      },
      true]
  });
}, 
{
  url: [{urlMatches : 'https://e.csdd.lv/examp/'}]
});

console.log("listener is added for 'https://e.csdd.lv/examp/'");