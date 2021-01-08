//import { NULL } from 'node-sass';
// import { qs, qsa, $on, $delegate } from './utils';

import '../stylesheets/style.scss';
import Natal from './natal'
import Storage from './storage'
import {epsilonTable} from './utilityData'

console.log("Hello, za world!")


let inputName = document.getElementById("nameInput")
let inputDate = document.getElementById("dataInput")
let inputTime = document.getElementById("timeInput")
let inputLong = document.getElementById("longInput")
let inputLat = document.getElementById("latInput")
let inputEpsilon = document.getElementById("epsilonInput")

let btnGo = document.getElementById("btnDraw")
let btnResetEps = document.getElementById("btnResetEpsilon")
let btnResetHighlights = document.getElementById("btnResetBondsHighlight")
let btnSave = document.getElementById("btnSave")

let outputName = document.getElementById("natalName")
let outputBonds = document.getElementById("bondsOutput")
let outputCelBody = document.getElementById("celBodyAnglesOutput")
let outputAscendant = document.getElementById("ascendantOutput")
let outputStorageList = document.getElementById("storageList")

let canvas = document.getElementById('canvas');

let natal = new Natal(canvas)
let storage = new Storage()
natal.setStorage(storage)
let currentChosenHighlights = []

natal.addOutputAuxDataCallback((payload) => {
	outputBonds.innerHTML = payload.bondsString
	outputCelBody.innerHTML = payload.celBodyString
	outputAscendant.innerHTML = payload.ascendantString
})

function draw(){
	currentChosenHighlights = []
	let name = inputName.value
	let dateRaw = dataInput.value
	let timeRaw = inputTime.value
	let lat = parseFloat(inputLat.value)
	let long = parseFloat(inputLong.value)
	//TO DO make sure date understands that this is UTC
	let date = new Date(dateRaw + " " + timeRaw)
	console.log(date)
	outputName.innerHTML = inputName.value == '' ? "Natal" : inputName.value
	natal.draw(name, date, long, lat)
}

function dateToView(date){
	let payload = {}
	payload.time = date.toLocaleTimeString()
	payload.date = date.toISOString().slice(0,10)
	return payload		
}

function fillControls(obj){
	let dt = dateToView(obj.date)
	outputName.innerHTML = obj.name
	inputName.value = obj.name
	inputTime.value = dt.time
	inputDate.value = dt.date
	inputLat.value = obj.lat
	inputLong.value = obj.long
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
				obj.date = new Date(obj.date)
				fillControls(obj)
				// let dt = dateToView(Date(obj.date))
				// inputName.value = obj.name
				// inputTime.value = dt.time//dt.getHours() + ":" + dt.getFullMinutes()
				// inputDate.value = dt.date //dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate()
				// inputLat.value = obj.lat
				// inputLong.value = obj.long
			})
		})
	}
}


inputEpsilon.oninput = (event) => {
	let inputNodes = event.currentTarget.getElementsByTagName('INPUT');
	let tmp = Array.from(inputNodes, (el) => {
		return el.value
	})
	let uniformValue = parseFloat(tmp.pop())
	if(uniformValue > 0){
		natal.setEpsilonTable(Array(tmp.length).fill(uniformValue))
	} else {
		natal.setEpsilonTable(tmp.map((e) => {
			return parseFloat(e)
		}))
	}
}

btnResetEps.onclick = (event) => {
	natal.setEpsilonTableToDefault()
	let inputNodes = inputEpsilon.getElementsByTagName('INPUT');
	for (let el of inputNodes) {
		let bondName = el.id.slice(7)
		if(epsilonTable[bondName]){
			el.value = Number.parseFloat(epsilonTable[bondName]).toFixed(1)
		} else {
			el.value = Number.parseFloat(0).toFixed(1)
		}
	}
}

outputBonds.onmouseover = (event) => {
	event.target.style.color = "orange";
	natal.setHighlightedBonds(currentChosenHighlights.concat([event.target.dataset.id]))
}

outputBonds.onmouseout = (event) => {
	event.target.style.color = "";
	natal.clearHighlights()
	natal.setHighlightedBonds(currentChosenHighlights)
}

outputBonds.onclick = (event) => {
	console.log("CLICK ON")
	console.log(event.target)
	console.log(event.target.highlightOn)
	if(event.target.dataset.highlight == "false"){
		currentChosenHighlights.push(event.target.dataset.id)
		natal.setHighlightedBonds(currentChosenHighlights)
		event.target.style.fontWeight = "bold"
		event.target.dataset.highlight = "true"
	}else{
		let ind = currentChosenHighlights.indexOf(event.target.dataset.id)
		if(ind > -1){
			currentChosenHighlights.splice(ind, 1);
		}
		natal.setHighlightedBonds(currentChosenHighlights)
		event.target.style.fontWeight = "normal"
		event.target.dataset.highlight = "false"
	}
}

btnResetHighlights.onclick = (event) => {
	natal.clearHighlights()
	currentChosenHighlights = []
	outputBonds.childNodes.forEach((el) => {
		if(el.className == "bondLine"){
			el.style.fontWeight = "normal"
			el.dataset.highlight = false
		}
	})
	
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
	let currentDate = new Date();
	console.log(currentDate)
	fillControls({
		name: "",
		date: currentDate,
		lat: "0.0",
		long: "0.0"
	})
	draw()
	displayStorageList()
}

//TODO add https://leafletjs.com/ map for picking coords