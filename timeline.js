'use strict';
var list = document.getElementsByTagName("ul")[0];
for(var i = 0; i < data.length; i++) {
  var item = document.createElement("li");
  if (data[i].type.indexOf("coup") >= 0) {
    item.className = "last";
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

var items = document.querySelectorAll(".timeline li");

// check if an element is in viewport
// http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  // Check only top and bottom and consider the case that the post's height is longer than the window height
  return (rect.bottom - 100 > 0 && rect.top + 100 < (window.innerHeight || document.documentElement.clientHeight));
}

function callbackFunction() {
  for (var i = 0; i < items.length; i++) {
    if (isElementInViewport(items[i])) {
      items[i].classList.add("in-view");
    }
  }
}

window.addEventListener("load", callbackFunction);
window.addEventListener("resize", callbackFunction);
window.addEventListener("scroll", callbackFunction);
