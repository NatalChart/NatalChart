//import { NULL } from 'node-sass';
// import { qs, qsa, $on, $delegate } from './utils';

import '../stylesheets/style.scss';
import Natal from './natal'

console.log("Hello, za world!")

let datePicker = document.getElementById("dataPicker")
let timePicker = document.getElementById("timePicker")
let longPicker = document.getElementById("longPicker")
let latPicker = document.getElementById("latPicker")
let btnGo = document.getElementById("btnDraw")
let bondsOutput = document.getElementById("bondsOutput")
let celBodyOutput = document.getElementById("celBodyAnglesOutput")
let ascendantOutput = document.getElementById("ascendantOutput")
let canvas = document.getElementById('canvas');


let natal = new Natal(canvas)


function draw(){
	let dateRaw = dataPicker.value
	let timeRaw = timePicker.value
	let lat = parseInt(latPicker.value)
	let long = parseInt(longPicker.value)
	let date = new Date(dateRaw + " " + timeRaw)
	console.log(date)
	natal.addOutputAuxDataCallback((payload) => {
		bondsOutput.innerHTML = payload.bondsString
		celBodyOutput.innerHTML = payload.celBodyString
		ascendantOutput.innerHTML = payload.ascendantString
	})
	natal.draw(date, long, lat)
	
}

btnGo.onclick = () => {
	draw()
}
draw()

//for debug
// let slider = document.getElementById("myRange");
// let sliderOutput = document.getElementById("myRangeOutput");
// sliderOutput.innerHTML = slider.value; // Display the default slider value

// //Update the current slider value (each time you drag the slider handle)
// slider.oninput = function(){
// 	sliderOutput.innerHTML = this.value;
// 	natal.forceSetAscendantAngle(this.value)
// }

let epsilonPicker = document.getElementById("epsilonPicker")

epsilonPicker.oninput = function(){
	natal.setEpsilon(parseInt(this.value))
}

bondsOutput.onmouseover = function(event){
	//console.log(event.target)
	event.target.style.color = "orange";
	natal.setHighlightedBonds([event.target.dataset.id])
	// setTimeout(function() {
	// 	event.target.style.color = "";
	//   }, 500);
	// setTimeout(function() {
	// 	natal.clearHighlights()
	// }, 2000);
}

bondsOutput.onmouseout = function(event){
	event.target.style.color = "";
	natal.clearHighlights()
}

//TODO add https://leafletjs.com/ map for picking coords