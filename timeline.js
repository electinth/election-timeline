'use strict';
var list = document.getElementsByTagName("ul")[0];
for(var i = 0; i < data.length; i++) {
  var item = document.createElement("li");
  item.className = "step in-view";
  if (data[i].type.indexOf("coup") >= 0) {
    item.className += " last";
  }

  var htmlString = "<div>";
  var dateObject = new Date(data[i].date);
  dateObject.setFullYear(dateObject.getFullYear() - 543);
  htmlString += "<div class='time'>" +
    dateObject.toLocaleDateString("th-u-ca-buddhist", {"weekday":"long","year":"numeric","month":"short","day":"numeric"}) +
    "</div><div class='title'>";
  if (data[i].link) {
    htmlString += "<a href='" + data[i].link + "'>" + data[i].name + "</a>";
  } else {
    htmlString += data[i].name;
  }
  htmlString += "</div>";
  if (data[i].type.indexOf("coup") >= 0) {
    for (var j = 0; j < coup.length; j++) {
      if (coup[j].id === data[i].coup_id) {
        htmlString += "<div class='text'>โดย " + coup[j].by + "<br />สมัย " + coup[j].to + "</div>";
        break;
      }
    }
  }
  htmlString += "</div>";
  item.innerHTML = htmlString;

  list.insertAdjacentElement("beforeend", item);
}

// // check if an element is in viewport
// // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
// function isElementInViewport(el) {
//   var rect = el.getBoundingClientRect();
//   // Check only top and bottom and consider the case that the post's height is longer than the window height
//   return (rect.bottom - 100 > 0 && rect.top + 100 < (window.innerHeight || document.documentElement.clientHeight));
// }
//
// var items = document.querySelectorAll(".timeline li");
// function callbackFunction() {
//   for (var i = 0; i < items.length; i++) {
//     if (isElementInViewport(items[i])) {
//       items[i].classList.add("in-view");
//     }
//   }
// }
//
// window.addEventListener("load", callbackFunction);
// window.addEventListener("resize", callbackFunction);
// window.addEventListener("scroll", callbackFunction);

// scrollama
const timeline = d3.select(".timeline");
const fixedPart = timeline.select(".fixed");
// const steps = timeline.select(".scrolling").selectAll('.step');

fixedPart.style("bottom", (window.innerHeight || document.documentElement.clientHeight) / 2);

function handleStepEnter(response) {
  if (data[response.index].name.substring(0, 9) === "รัฐประหาร") {
    fixedPart
      .transition()
        .duration(2000)
        .ease(d3.easeQuadIn)
        .style("bottom", "50px")
      .transition()
        .duration(500)
        .ease(d3.easeQuadOut)
        .style("bottom", (window.innerHeight || document.documentElement.clientHeight) / 2);

    // fixedPart.style("bottom", "20px");
    // fixedPart.addEventListener("transitionend", function(event) {
    //   console.log(event);
    //   // fixedPart.style("bottom", (window.innerHeight || document.documentElement.clientHeight) / 2);
    // });
  }

  console.log("step " + response.index + " enter");
  console.log(data[response.index].name);
}
function handleStepExit(response) {
  console.log("step " + response.index + " exit");
}
function handleContainerEnter() {
  // sticky the graphic
	// fixedPart.classed('is-fixed', true);
	// fixedPart.classed('is-bottom', false);

  console.log("container enter");
}
function handleContainerExit(response) {
  // un-sticky the graphic, and pin to top/bottom of container
	// fixedPart.classed('is-fixed', false);
	// fixedPart.classed('is-bottom', response.direction === 'down');

  console.log("container exit");
}

const scroller = scrollama();
scroller
  .setup({
    container: ".timeline",
    text: ".scrolling",
    step: ".scrolling .step",
    graphic: ".fixed",
    // debug: true
  })
  .onStepEnter(handleStepEnter)
  .onStepExit(handleStepExit)
  .onContainerEnter(handleContainerEnter)
  .onContainerExit(handleContainerExit);
