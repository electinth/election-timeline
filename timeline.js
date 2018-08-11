d3.csv("elections.csv", function(data) {
  const list = document.getElementsByTagName("ul")[0];
  for(let i = 0; i < data.length; i++) {
    let item = document.createElement("li");
    item.className = "step in-view";
    item.setAttribute("id", "trigger" + i)
    // if (data[i].type.indexOf("coup") >= 0) {
    //   item.className += " last";
    // }

    let htmlString = "<div>";
    let dateObject = new Date(data[i].date);
    dateObject.setFullYear(dateObject.getFullYear() - 543);
    htmlString += "<div class='time'>" +
      dateObject.toLocaleDateString("th-u-ca-buddhist", {"weekday":"long","year":"numeric","month":"short","day":"numeric"}) +
      "</div><div class='title'>" +
      data[i].event +
      "</div>";
    // if (data[i].link) {
    //   htmlString += "<a href='" + data[i].link + "'>" + data[i].name + "</a>";
    // } else {
    //   htmlString += data[i].name;
    // }
    // htmlString += "</div>";
    // if (data[i].type.indexOf("coup") >= 0) {
    //   for (let j = 0; j < coup.length; j++) {
    //     if (coup[j].id === data[i].coup_id) {
    //       htmlString += "<div class='text'>โดย " + coup[j].by + "<br />สมัย " + coup[j].to + "</div>";
    //       break;
    //     }
    //   }
    // }
    // htmlString += "</div>";
    item.innerHTML = htmlString;

    list.insertAdjacentElement("beforeend", item);
  }

  const timeline = d3.select(".timeline");
  const fixedPart = timeline.select(".fixed");

  fixedPart.style("bottom", (window.innerHeight || document.documentElement.clientHeight) / 2);

  function handleStepEnter(index) {
    // if (data[index].name.substring(0, 9) === "รัฐประหาร") {
    //   fixedPart
    //     .transition()
    //       .duration(2000)
    //       .ease(d3.easeQuadIn)
    //       .style("bottom", "50px")
    //     .transition()
    //       .duration(500)
    //       .ease(d3.easeQuadOut)
    //       .style("bottom", (window.innerHeight || document.documentElement.clientHeight) / 2);
    // }

    // console.log("step " + index + " enter");
    // console.log(data[index].date);
  }
  function handleStepLeave(index) {
    // console.log("step " + index + " exit");
  }

  const controller = new ScrollMagic.Controller();
  const steps = document.querySelectorAll("li.step");
  for (let i = 0; i < steps.length; i++) {
  	new ScrollMagic.Scene({
  			triggerElement: steps[i],
        duration: steps[i].getBoundingClientRect().height
  		})
      // .setPin("#trigger1")
      // .setClassToggle("#animate1", "zap")
  		.on("enter", function(e) { handleStepEnter(i); })
      .on("leave", function(e) { handleStepLeave(i); })
  		.addIndicators() // debug (requires plugin)
  		.addTo(controller);
  }
});
