const pixelsPerDay = 10;
function diffDays(fromMs, toMs) {
  return (toMs - fromMs) / 1000 / 60 / 60 / 24;
}

d3.csv("elections.csv", function(data) {
  const list = document.getElementsByTagName("ul")[0];
  const electionDate = document.getElementById("election-date");
  const counter = document.getElementById("counter");

  let dates = [];
  for(let i = 0; i < data.length; i++) {
    dates.push(new Date(data[i].date));
  }
  const days = diffDays(dates[0].getTime(), Date.now());

  for(let i = 0; i < data.length; i++) {
    let item = document.createElement("li");
    item.className = "step in-view";
    item.setAttribute("id", "trigger" + i)

    const height = (i < data.length-1)? (diffDays(dates[i], dates[i+1])*pixelsPerDay + "px") : "100vh";
    let htmlString = "<div style='height:" + height + ";'>";
    htmlString += "<div class='time'>" +
      dates[i].toLocaleDateString("th-u-ca-buddhist", {"year":"numeric","month":"short","day":"numeric"}) +
      "</div><div class='title'>" +
      data[i].event +
      "</div>";
    item.innerHTML = htmlString;

    list.insertAdjacentElement("beforeend", item);
  }

  const timeline = d3.select(".timeline");
  const hand = d3.select("#hand");
  const box = d3.select("#box");
  hand.style("top", "270px");
  box.style("top", "320px");

  const miniScale = d3.scaleLinear()
    .domain([0, 1])
    .range([30, (window.innerHeight || document.documentElement.clientHeight) - 100]);

  const controller = new ScrollMagic.Controller();
  const steps = document.querySelectorAll("li.step");
  let heightSum = 0;
  let height;
  for (let i = 0; i < steps.length; i++) {
    height = steps[i].getBoundingClientRect().height;
    heightSum += height;

  	new ScrollMagic.Scene({
  			triggerElement: steps[i],
        // triggerHook: "onEnter",
        duration: height
  		})
      // .setPin("#trigger1")
      // .setClassToggle("#animate1", "zap")
  		.on("enter", function(e) {
        timeline.classed("white-background", data[i].election_date_text !== "");
        timeline.classed("red-background", data[i].election_date_text === "" && ((i > 0)? data[i-1].election_date_text : undefined) !== "");
        timeline.classed("black-background", data[i].election_date_text === "" && ((i > 0)? data[i-1].election_date_text : undefined) === "");

        electionDate.style.color = (data[i].election_date_text === "")? "white" : "black";
        electionDate.getElementsByClassName("text")[0].innerHTML = data[i].election_date_text || "ไม่ปรากฏ";
      })
      // .on("leave", function(e) { handleStepLeave(i); })
  		.addIndicators() // debug (requires plugin)
  		.addTo(controller);
  }

  // display election date and counter
  new ScrollMagic.Scene({
      triggerElement: steps[0],
      duration: heightSum
    })
    .on("enter", function(e) {
      electionDate.classList.add("shown");
      counter.classList.add("shown");

      box.style("top", "unset");
      box.style("bottom", "30px");
    })
    .on("leave", function(e) {
      electionDate.classList.remove("shown");
      counter.classList.remove("shown");

      hand.style("top", "270px");
      box.style("top", "320px");
    })
    .on("progress", function(e) {
      counter.getElementsByClassName("text")[0].innerHTML = Math.round(days*e.progress);

      hand.style("top", miniScale(e.progress));
    })
    .addTo(controller);
});
