const pixelsPerDay = 10;
function diffDays(fromMs, toMs) {
  return (toMs - fromMs) / 1000 / 60 / 60 / 24;
}

d3.csv("elections.csv", function(data) {
  const list = document.getElementsByTagName("ul")[0];
  const electionDateText = document.getElementById("election-date");
  const counter = document.getElementById("counter");

  // prepare date data
  let dates = [];
  let diffDates = [];
  let electionDates = [];
  let boxPos = []; // election box positions (culmulative days)
  for(let i = 0; i < data.length; i++) {
    dates.push(new Date(data[i].date));
    diffDates.push(diffDays(dates[0].getTime(), dates[i].getTime()));
    electionDates.push(data[i].election_date? new Date(data[i].election_date) : null);
    boxPos.push(electionDates[i]? diffDays(dates[0].getTime(), electionDates[i].getTime()) : -1);
  }
  const now = Date.now();
  const days = diffDays(dates[0].getTime(), now);

  // find the latest election date
  let expectedDays = -1;
  for(let i = data.length-1; i >= 0; i--) {
    if (electionDates[i]) {
       expectedDays = diffDays(dates[0].getTime(), electionDates[i].getTime());
       break;
    }
  }
  diffDates.push(expectedDays);

  // add <li> based on data
  let heights = [];
  for(let i = 0; i < data.length; i++) {
    let item = document.createElement("li");
    item.className = "step in-view";
    item.setAttribute("id", "trigger" + i);

    heights.push(diffDays(dates[i].getTime(), (i < data.length-1)? dates[i+1].getTime() : now)*pixelsPerDay);
    let htmlString = "<div style='height:" + heights[i] + "px;'>";
    htmlString += "<div class='time'>" +
      dates[i].toLocaleDateString("th-u-ca-buddhist", {"year":"numeric","month":"short","day":"numeric"}) +
      "</div><div class='title'>" +
      data[i].event +
      "</div>";
    item.innerHTML = htmlString;

    list.insertAdjacentElement("beforeend", item);
  }

  let heightSums = [];
  heights.reduce(function(a, b, i) { return heightSums[i] = a + b; }, 0);

  const timeline = d3.select(".timeline");
  const hand = d3.select("#hand");
  const box = d3.select("#box");
  hand.style("top", "270px");
  box.style("top", "320px");

  const miniScaleMargins = { top: 20, bottom: 60 };
  const miniScale = d3.scaleLinear()
    .domain([0, expectedDays])
    .range([miniScaleMargins.top, (window.innerHeight || document.documentElement.clientHeight) - miniScaleMargins.bottom]);

  // d3 timeline
  let diffDatePairs = [];
  for(let j = 0; j < diffDates.length-1; j++) {
    diffDatePairs.push([diffDates[j], diffDates[j+1]]);
  }
  const svg = d3.select("svg")
    .attr("height", miniScale(expectedDays))
    .style("top", 0);
  const line = svg.append("g")
      .selectAll("timeline-line")
      .data(diffDatePairs)
    .enter().append("path")
      .attr("class", "timeline-line")
      .attr("d", d3.line()
        .x(function() { return 0; })
        .y(function(d) { return miniScale(d); })
      );

  const controller = new ScrollMagic.Controller();
  const steps = document.querySelectorAll("li.step");
  // let heightSum = 0;
  // let height;

  let progress = function(e) {
    counter.getElementsByClassName("text")[0].innerHTML = Math.round(days*e.progress);

    hand.style("top", miniScale(days*e.progress));

    for(let j = 0; j < heightSums.length; j++) {
      if (e.progress < heightSums[j]/heightSums[heightSums.length-1]) {
        if (boxPos[j] < 0) {
          box.style("filter", "blur(5px)");
          box.style("opacity", 0);
        } else {
          box.style("top", miniScale(boxPos[j]));
          box.style("filter", "unset");
          box.style("opacity", 1);
        }
        break;
      }
    }
  };
  // let throttledProgress = _.throttle(progress, 100);
  // let debouncedProgress = _.debounce(progress, 100, { leading: true });

  // add scrolling events
  for (let i = 0; i < steps.length; i++) {
    // height = steps[i].getBoundingClientRect().height;
    // heightSum += height;

  	new ScrollMagic.Scene({
  			triggerElement: steps[i],
        triggerHook: 0.75,
        duration: heights[i] //height
  		})
      // .setPin("#trigger1")
      // .setClassToggle("#animate1", "zap")
  		.on("enter", function(e) {
        timeline.classed("white-background", data[i].election_date_text);
        timeline.classed("red-background", !data[i].election_date_text && ((i > 0)? data[i-1].election_date_text : undefined) !== "");
        timeline.classed("black-background", !data[i].election_date_text && ((i > 0)? data[i-1].election_date_text : undefined) === "");

        line.classed("gray-line", data[i].election_date_text);
        line.classed("white-line", !data[i].election_date_text);

        electionDateText.style.color = (data[i].election_date_text === "")? "white" : "black";
        electionDateText.getElementsByClassName("text")[0].innerHTML = data[i].election_date_text || "ไม่ปรากฏ";
      })
      // .on("leave", function(e) { handleStepLeave(i); })
  		.addIndicators() // debug (requires plugin)
  		.addTo(controller);
  }

  // display election date and counter
  new ScrollMagic.Scene({
      triggerElement: steps[0],
      triggerHook: 0.75,
      duration: heightSums[steps.length-1] //heightSum
    })
    .on("enter", function(e) {
      electionDateText.classList.add("shown");
      counter.classList.add("shown");
      svg.classed("shown", true);
    })
    .on("leave", function(e) {
      electionDateText.classList.remove("shown");
      counter.classList.remove("shown");
      svg.classed("shown", false);

      hand.style("top", "270px");
      box.style("filter", "unset");
      box.style("opacity", 1);
      box.style("top", "320px");
    })
    .on("progress", progress)
    .addTo(controller);

});
