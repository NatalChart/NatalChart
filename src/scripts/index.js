//import { NULL } from 'node-sass';
// import { qs, qsa, $on, $delegate } from './utils';

import '../stylesheets/style.scss';
import Natal from './natal'
import Storage from './storage'

console.log("Hello, za world!")

let inputName = document.getElementById("nameInput")
let inputDate = document.getElementById("dataInput")
let inputTime = document.getElementById("timeInput")
let inputLong = document.getElementById("longInput")
let inputLat = document.getElementById("latInput")
let inputEpsilon = document.getElementById("epsilonInput")

let btnGo = document.getElementById("btnDraw")
let btnSave = document.getElementById("btnSave")

let outputBonds = document.getElementById("bondsOutput")
let outputCelBody = document.getElementById("celBodyAnglesOutput")
let outputAscendant = document.getElementById("ascendantOutput")
let outputStorageList = document.getElementById("storageList")


let canvas = document.getElementById('canvas');


let natal = new Natal(canvas)
let storage = new Storage()
natal.setStorage(storage)

function draw(){
	let name = inputName.value
	let dateRaw = dataInput.value
	let timeRaw = inputTime.value
	let lat = parseFloat(inputLat.value)
	let long = parseFloat(inputLong.value)
	//TO DO make sure date understands that this is UTC
	let date = new Date(dateRaw + " " + timeRaw)
	console.log(date)
	natal.addOutputAuxDataCallback((payload) => {
		outputBonds.innerHTML = payload.bondsString
		outputCelBody.innerHTML = payload.celBodyString
		outputAscendant.innerHTML = payload.ascendantString
	})
	natal.draw(name, date, long, lat)
	
}

function displayStorageList(){
	storage.getItemsList((list) => {
		let tmp = []
		list.forEach(element => {
			tmp.push(`<div data-name="${element}">${element} <button class="btnLoad">load</button><button class="btnDelete">delete</button></div>`)
		});
		outputStorageList.innerHTML = tmp.join("")
	})
}	

btnGo.onclick = () => {
	draw()
}

btnSave.onclick = () => {
	draw()
	natal.saveToStorage(() => {
		displayStorageList()
	})
}

outputStorageList.onclick = (event) =>{
	let name = event.target.parentElement.dataset.name
	let action = event.target.className
	if(action == "btnDelete"){
		storage.delete(name,()=>{
			displayStorageList()
		})
	}
	if(action == "btnLoad"){
		natal.loadFromStorage(name, () => {
			//fill text fields and stuff
			natal.getStorageObj((obj) => {
				let dt = new Date(obj.date)
				console.log(dt.toISOString().slice(0,10))
				console.log(dt.toLocaleTimeString())
				inputName.value = obj.name
				inputTime.value = dt.toLocaleTimeString()//dt.getHours() + ":" + dt.getFullMinutes()
				inputDate.value = dt.toISOString().slice(0,10) //dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate()
				inputLat.value = obj.lat
				inputLong.value = obj.long
			})
		})
	}
}


inputEpsilon.oninput = function(){
	natal.setEpsilon(parseInt(this.value))
}

outputBonds.onmouseover = function(event){
	event.target.style.color = "orange";
	natal.setHighlightedBonds([event.target.dataset.id])
}

outputBonds.onmouseout = function(event){
	event.target.style.color = "";
	natal.clearHighlights()
}



//for debug
// let slider = document.getElementById("myRange");
// let sliderOutput = document.getElementById("myRangeOutput");
// sliderOutput.innerHTML = slider.value; // Display the default slider value

// //Update the current slider value (each time you drag the slider handle)
// slider.oninput = function(){
// 	sliderOutput.innerHTML = this.value;
// 	natal.forceSetAscendantAngle(this.value)
// }

window.onload = () => {
	console.log("page loaded")
	draw()
	displayStorageList()
}



//TODO add https://leafletjs.com/ map for picking coords