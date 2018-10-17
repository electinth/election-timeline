const pixelsPerDay = 80;
function diffDays(fromMs, toMs) {
  return (toMs - fromMs) / 1000 / 60 / 60 / 24;
}
function diffPairs(values) {
  let pairs = [];
  for(let i = 0; i < values.length-1; i++) {
    pairs.push([values[i], values[i+1]]);
  }
  return pairs;
}

d3.csv("elections.csv", function(data) {
  const list = document.getElementsByTagName("ul")[0];
  const counter = d3.select("#counter");

  // prepare date data
  let dates = [];
  let diffDates = [];
  let electionDates = [];
  let boxPos = []; // election box positions (culmulative days)
  for(let i = 0; i < data.length; i++) {
    dates.push(new Date(data[i].date));
    if (!data[i].animation) {
      diffDates.push(diffDays(dates[0].getTime(), dates[i].getTime()));
      electionDates.push(data[i].election_date? new Date(data[i].election_date) : null);
    }
    boxPos.push(data[i].election_date? diffDays(dates[0].getTime(), electionDates[electionDates.length-1].getTime()) : -1);
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
    if (data[i].animation) {
      htmlString += `<div class='wait' id='animation${data[i].animation}'></div>`;
    } else {
      htmlString += "<div class='time'>" +
        dates[i].toLocaleDateString("th-u-ca-buddhist", {"year":"numeric","month":"short","day":"numeric"}) +
        "</div>" +
        (data[i].image? `<div class='image' style='background-image: url("images/illustrations/${data[i].image}.png");'></div>` : '') +
        `<div class='title'>${data[i].event}</div>` +
        `<div class='read-more'><a href='${data[i].read_more}' target='_blank'>อ่านเพิ่ม</a></div>`;
    }
    item.innerHTML = htmlString + '</div>';

    list.insertAdjacentElement("beforeend", item);
  }

  let heightSums = [];
  heights.reduce(function(a, b, i) { return heightSums[i] = a + b; }, 0);

  const timeline = d3.select(".timeline");
  const hand = d3.select("#hand");
  const box = d3.select("#box");
  hand.style("top", "270px");
  box.style("top", "320px");
  const electionDateText = d3.select("#election-date"); //document.getElementById("election-date");

  const miniScaleMargins = { top: 50, bottom: 50 };
  const miniScale = d3.scaleLinear()
    .domain([0, expectedDays])
    .range([miniScaleMargins.top, (window.innerHeight || document.documentElement.clientHeight) - miniScaleMargins.bottom]);

  let electionDates_unique = electionDates.filter((d) => d !== null);
  electionDates_unique = electionDates_unique.filter((d, i, a) => (i < a.length-1)? (a[i+1].getFullYear() !== d.getFullYear()) : true);
  electionDates_unique.unshift(dates[0]);
  let electionDates_diff = electionDates_unique
    .map((d) => diffDays(dates[0].getTime(), d))
    .filter((value, index, self) => ((value !== null) && (self.indexOf(value) === index)));

  // d3 timeline
  const svg = d3.select("svg")
    .attr("height", miniScale(expectedDays))
    .style("top", 0);
  const line = svg.append("g")
      .selectAll("timeline-line")
      .data(diffPairs(electionDates_diff))
    .enter().append("path")
      .attr("class", "timeline-line")
      .attr("d", d3.line()
        .x(5)
        .y((d) => miniScale(d))
      );
  const mark = svg.append("g")
      .selectAll("timeline-mark")
      .data(diffDates.slice(1, -1))
    .enter().append('path')
      .style("visibility", "hidden")
      .attr("class", "timeline-mark")
      .attr("d", (d) => `M2,${miniScale(d)-3} L8,${miniScale(d)+3} M2,${miniScale(d)+3} L8,${miniScale(d)-3}`);
  // const mark = svg.append("g")
  //     .selectAll("timeline-mark")
  //     .data(diffDates.slice(1, -1))
  //   .enter().append('path')
  //     .style("visibility", "hidden")
  //     .attr("class", "timeline-mark")
  //     .attr("d", (d) => `M2,${miniScale(d)-3} L8,${miniScale(d)+3} M2,${miniScale(d)+3} L8,${miniScale(d)-3}`);

  const controller = new ScrollMagic.Controller();
  const steps = document.querySelectorAll("li.step");
  // let heightSum = 0;
  // let height;

  let progress = function(e) {
    counter.select(".text").text(Math.round(days*e.progress));

    hand.style("top", miniScale(days*e.progress) - 30);

    for(let j = 0; j < heightSums.length; j++) {
      if (e.progress < heightSums[j]/heightSums[heightSums.length-1]) {
        if (boxPos[j] < 0) {
          box.style("filter", "blur(5px)");
          box.style("opacity", 0);
        } else {
          box.style("top", miniScale(boxPos[j]) - 5);
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
  const wait = d3.selectAll(".wait");
  for (let i = 0; i < steps.length; i++) {
    let wait_cond = steps[i].getElementsByClassName("wait").length !== 0;

  	let scene = new ScrollMagic.Scene({
  			triggerElement: steps[i],
        triggerHook: 0.75,
        duration: heights[i]
  		})
      // .setClassToggle("#animate1", "zap")
  		.on("enter", function(e) {
        timeline.classed('red-background',  false);
        timeline.classed('white-background',  false);
        timeline.classed('black-background',  false);
        timeline.classed(`${data[i].background}-background`,  true);

        line.classed("gray-line", data[i].background === "white");
        line.classed("white-line", data[i].background !== "white");

        electionDateText.classed("black", data[i].background !== "black");
        animateText(electionDateText.select(".text"), data[i].election_date_text || "ไม่ปรากฏ");

        counter.classed("shown", wait_cond);
        wait.classed("hidden", !wait_cond);
      })
      .on("leave", function(e) {
        counter.classed("shown", false);
      });
  		// .addIndicators() // debug (requires plugin)
  		// .addTo(controller);
    if (wait_cond) {
      scene.setPin(steps[i], {pushFollowers: false});
      scene.triggerHook(0);
      scene.offset(-200);
    }
    scene.addTo(controller);

    // // add events only for red background
    // if (!whiteCond && !blackCond) {
    //   new ScrollMagic.Scene({
    // 			triggerElement: steps[i],
    //       triggerHook: 0.75,
    //       duration: "50%"
    // 		})
    // 		.on("enter", function(e) {
    //       timeline.select(".scrolling").classed("red-background", true);
    //     })
    //     .on("leave", function(e) {
    //       timeline.select(".scrolling").classed("red-background", false);
    //     })
    // 		.addIndicators({name: "red background", colorEnd: "#FFFFFF"}) // debug (requires plugin)
    // 		.addTo(controller);
    // }
  }

  // fade intro
  const intro = d3.select("#intro"); //document.getElementsByClassName("intro")[0];
  new ScrollMagic.Scene({
      triggerElement: steps[0],
      triggerHook: 0.75
    })
    .on("enter", function(e) {
      intro.style("filter", "blur(5px)");
      intro.style("opacity", 0);
      intro.style("z-index", -1);
    })
    .on("leave", function(e) {
      intro.style("filter", "unset");
      intro.style("opacity", 1);
      intro.style("z-index", 0);
    })
    // .addIndicators()
    .addTo(controller);

  // conclusion
  const conclusion = d3.select("#conclusion");
  let backgrounds_before = [false, true, false];
  new ScrollMagic.Scene({
      triggerElement: document.getElementById("conclusion"),
      triggerHook: 0.75
    })
    .on("enter", function(e) {
      backgrounds_before = [
        timeline.classed('red-background'),
        timeline.classed('white-background'),
        timeline.classed('black-background')
      ];
      conclusion.classed('red-background',  false);
      conclusion.classed('white-background',  false);
      conclusion.classed('black-background',  true);

      svg.classed("shown", true);
      hand.style("top", miniScale(days) - 30);
      hand.style("margin-left", "90px");
      box.style("top", miniScale(boxPos[boxPos.length-1]) - 5);
      box.style("margin-left", "90px");
      line
        .classed("red-line", true)
        .classed("gray-line", false)
        .classed("white-line", false)
        .style("stroke-width", 5)
        .attr("transform", (d, i, nodes) => `translate(${i / nodes.length * 300},0)`);
    })
    .on("leave", function(e) {
      conclusion.classed('red-background',  backgrounds_before[0]);
      conclusion.classed('white-background',  backgrounds_before[1]);
      conclusion.classed('black-background',  backgrounds_before[2]);

      hand.style("margin-left", "-135px");
      box.style("margin-left", "-135px");
      line
        .classed("red-line", false)
        .classed("gray-line", backgrounds_before[1])
        .classed("white-line", !backgrounds_before[1])
        .style("stroke-width", 1)
        .attr("transform", "translate(0,0)");
    })
    // .addIndicators()
    .addTo(controller);
  //conclusion stat numbers
  conclusion.selectAll(".num")
    .text((d, i) => {
      switch(i) {
        case 0: return formatNumber(days);
        case 1: return formatNumber(electionDates_diff.length - 2);
        case 2: default: return formatNumber(expectedDays - days);
      }
    })

  // display election date and counter
  new ScrollMagic.Scene({
      triggerElement: steps[0],
      triggerHook: 0.75,
      duration: heightSums[steps.length-1] //heightSum
    })
    .on("enter", function(e) {
      electionDateText.classed("shown", true);
      svg.classed("shown", true);
    })
    .on("leave", function(e) {
      electionDateText.classed("shown", false);
      svg.classed("shown", false);

      hand.style("top", "270px");
      box.style("filter", "unset");
      box.style("opacity", 1);
      box.style("top", "320px");
    })
    .on("progress", progress)
    .addTo(controller);

});

function formatNumber(num) {
  return num.toLocaleString().split('.')[0];
}

function animateText(node, data) {
  let t = d3.transition()
    .duration(1000);

  // JOIN new data with old elements.
  let text = node.selectAll("span")
    .data([data], (d) => d);

  // EXIT old elements not present in new data.
  text.exit()
      .style("top", "-1rem")
      .style("opacity", 1)
    .transition(t)
      .style("top", "2rem")
      .style("opacity", 0)
      .remove();

  // ENTER new elements present in new data.
  text.enter().append("span")
      .style("position", "absolute")
      .style("top", "-4rem")
      .style("opacity", 0)
      .text((d) => d)
    .transition(t)
      .style("top", "-1rem")
      .style("opacity", 1);
}
