var currentDate = new Date();
var monthSelector = document.getElementById("months");
monthSelector.getElementsByTagName('option')[currentDate.getMonth()].selected = 'selected'

monthSelector.addEventListener('change', function() {
  console.log('You selected: ', this.value);
});

var startButton = document.getElementById("start");
startButton.addEventListener('click', function() {
  chrome.runtime.sendMessage({
    message:"start",
    payload: {
      targetMonth: document.getElementById("months").value,
      delay: document.getElementById("delay").value,
      playMusic: true
    }
  }, response => 
  {
    if (response.message === "success")
    {
      document.getElementById("status").innerText = "started"
    }
  })
});
