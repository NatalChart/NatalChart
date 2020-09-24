// import { qs, qsa, $on, $delegate } from './utils';

import '../stylesheets/style.scss';

// console.log('Hello!');

import Ephemeris from './ephemeris/Ephemeris'
import {signs_symbols, 
	celestial_body_names, 
	celestial_body_symbols,
	bondTypesToAngles,
	bondTypesToColors,
	bondTypesToLineStyle} 
	from './util_data'

console.log("Hello, za world!")


// function moveToCircleAngle(ctx, radius, angle){
// 	let angle_fix = angle + Math.PI / 2 
// 	ctx.moveTo(radius * Math.sin(angle_fix), radius * Math.cos(angle_fix))
// }

const centerX = 305
const centerY = 305
const circle_house_outer_radius = 300
const circle_house_inner_radius = 275
const circle_sign_outer_radius = 275
const circle_sign_inner_radius = 250
const circle_planets_radius = 215

const axialTilt = 23.4392911
const grad = Math.PI / 180
const julianDaysTo1970 = 2440587.5
const millisecondsInDay = 86400000



class Natal{
	constructor(canvas){
		this.canvas = canvas
		this.epsilon = 3.0 //default degree
		
		this.zero_shift_angle = 90

		
		this.celestial_body_angles = []
		this.ascendant = 0
		this.MC = 0 // Medium Coeli
		this.LST = 0 // Local Sidereal Time
		this.observer_longitude = 0
		this.observer_latitude = 0
		this.long = 0
		this.lat = 0
		this.bonds = []
		//DEBUG
		this.highlighted_bonds = []
	}

	setEpsilon(val){
		let tmp = Number.isSafeInteger(val) && val >= 0 && val <= 15
		console.assert(tmp)
		if(tmp){
			this.epsilon = val
			console.log("Epsilon set to " + val)
		} else {
			this.epsilon = 3
		}
		this.makeBonds()
		this.render()
	}

	//input - array of bond ids
	// setHighlightedBonds(bond_ids){
	// 	this.highlighted_bonds = new Set()
	// 	bond_ids.forEach((bond_id) => {
	// 		this.highlighted_bonds.add(bond_id)
	// 	})
	// 	this.bonds.forEach(() => {

	// 	})
	// }

	//override ascendant_angle
	forseSetAscendantAngle(val){
		this.ascendant = val
		this.render()
	}

	withinEpsilon(x, y){
		return x < y + this.epsilon && x > y - this.epsilon
	}

	makeBonds(){
		this.bonds = []
		let lenght = this.celestial_body_angles.length
		let bond_id = 0
		for (let i = 0; i < lenght - 1; i++) {
			for (let j = i + 1; j < lenght; j++){
				let diff = Math.abs(this.celestial_body_angles[i] - this.celestial_body_angles[j])
				bond_id += this.checkBond(this.bonds, i, j, diff, bond_id)
			}
		}
		console.log("Bonds: ")
		console.log(this.bonds)
		console.log("Total bonds found: " + this.bonds.length)
	}

	checkBond(bonds, i, j, diff, bond_id){
		let found_bond_type = null 
		for(let bond in bondTypesToAngles){
			if (this.withinEpsilon(diff, bondTypesToAngles[bond])){
				found_bond_type = bond
			}
		}
		if (found_bond_type){
			console.log(`bond: from ${celestial_body_symbols[i]} to ${celestial_body_symbols[j]}`)
			console.log('bond type: ' + found_bond_type + " angle diff: " + diff)
			bonds.push({
				id: bond_id,
				from: i,
				to: j,
				type: found_bond_type,
				angle_diff: diff
			})
			return 1
		}
		return 0
	}

	draw(date, long, lat, epsilon = NaN){
		//debug:
		// date = new Date("2016-11-02 21:17:30")
		// long = 6.9
		// lat = 52.21
		this.long = long
		this.lat = lat
		this.calculateEphemerisData(date, long, lat)
		this.LST = this.calculateLST(date, this.observer_longitude)
		//this.LST = 17.87
		this.MC = this.calculateMediumCoeli(this.LST)
		this.ascendant = this.calculateAsc(this.LST, this.MC, this.observer_latitude)
		this.makeBonds()
		if (epsilon){
			this.setEpsilon(epsilon)
		}else{
			this.render()
		}
	}

	calculateEphemerisData(date, long, lat){
		const ephemeris = new Ephemeris({
			year: date.getFullYear(), 
			month: date.getMonth(), 
			day: date.getDate(), 
			hours: date.getHours(), 
			minutes: date.getMinutes(), 
			latitude: lat, 
			longitude: long, 
			calculateShadows: false
		})
		console.log(ephemeris.Earth)
		console.log(ephemeris.Observer)
		console.log(ephemeris.Results)
		this.celestial_body_angles = []
		celestial_body_names.forEach((item)=>{
			//console.log(ephemeris[item])
			//console.log(ephemeris[item].position.apparentLongitude)
			this.celestial_body_angles.push(ephemeris[item].position.apparentLongitude)
		})
		this.observer_latitude = ephemeris.Observer.latitude
		this.observer_longitude = ephemeris.Observer.longitude
	}

	//LST = local sidereal time
	calculateLST(utc, long){
		console.log(utc)
		//https://radixpro.com/a4a-start/sidereal-time/#:~:text=Sidereal%20time%20is%20defined%20by,(360%20divided%20by%2024).
		let days = Math.floor(utc.getTime() / millisecondsInDay)
		let julianDays = julianDaysTo1970 + days
		//console.log(days)
		//console.log("julian days: " + julianDays)
		let T = (julianDays - 2451545) / 36525 // factor T
		//console.log(T)
		let ST0 = 100.46061837 + 36000.770053608 * T + 0.000387933 * Math.pow(T, 2) - Math.pow(T, 3)/38710000
		//console.log(ST0)
		ST0 = ST0 % 360
		//console.log(ST0)
		if (ST0 < 0){
			ST0 = ST0 + 360
		}
		//console.log(ST0)
		ST0 = ST0 / 15
		//console.log(ST0)

		let tmp = utc.getHours() + utc.getMinutes() / 60 + utc.getSeconds() /3600 
		//console.log(tmp)
		tmp = tmp * 1.00273790935 //const
		let ST = (ST0 + tmp) % 24
		//console.log(ST)
		return ST + (long / 15)
	}

	calculateMediumCoeli(SiderealTime){
		let ARMC = SiderealTime * 15
		return Math.atan(Math.sin(ARMC * grad) / Math.cos(ARMC * grad) * Math.cos(axialTilt * grad)) / grad
	}

	calculateAsc(LST, MC, lat){
		//https://radixpro.com/a4a-start/the-ascendant/
		
		console.log("local sidereal time: " + LST)
		// // console.log(lat)
		// // console.log(axialTilt)
		// let y = - Math.cos(localSiderealTime * grad)
		// let x = Math.sin(localSiderealTime * grad) * Math.cos(axialTilt * grad) + Math.tan(lat * grad) * Math.sin(axialTilt * grad)
		
		let RAMC = LST * 15
		console.log("RAMC = " + RAMC)
		let y = Math.cos(RAMC * grad)
		let x = -(Math.sin(axialTilt * grad) * Math.tan(lat * grad) + Math.cos(axialTilt * grad) * Math.sin(RAMC * grad))
		console.log(x)
		console.log(y)
		console.log(y/x)
		let ascendant = Math.atan(y/x)
		ascendant = ascendant / grad
		console.log("Asc: " + ascendant)
		console.log("MC: " + MC)
		//this is needed if atan is used instead of atan2
		
		while (ascendant < 0){
			ascendant = ascendant + 180
		}
		if(ascendant < MC){
			ascendant = ascendant + 180
		}
		// if (ascendant > 360){
		// 	ascendant = ascendant % 360
		// }
	
		console.log("Asc final: " + ascendant)
		return ascendant
	}

	render() {
		if (this.canvas.getContext) {
			let highlight_mode = this.highlighted_bonds.length > 0
			let signs_angle_shift = this.ascendant
			let ctx = this.canvas.getContext('2d');
			ctx.font = '40px serif';
			//ctx.webkitImageSmoothingEnabled=true;
			ctx.resetTransform();
	
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	
			//change zero coordinates to the center of the canvas
			ctx.translate(centerX, centerY)
			ctx.moveTo(0,0)
			ctx.beginPath();
			ctx.strokeStyle ="#000"
	
			//houses first
			ctx.font = '20px serif';
			for(let i = 0; i < 12; i++){
				let angle = -(30 * i * grad) + Math.PI / 2
				ctx.moveTo(circle_house_inner_radius * Math.sin(angle), circle_house_inner_radius * Math.cos(angle))
				ctx.arc(0, 0, circle_house_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
				ctx.lineTo(circle_house_outer_radius * Math.sin(angle - 30 * grad), circle_house_outer_radius * Math.cos(angle - 30 * grad))
				let house_numb = ((i+2)%12)+1
				let left_shift = null
				if (house_numb > 9){
					left_shift = 15
				}else{
					left_shift = 7
				}
	
				ctx.fillText(`${house_numb}`, 
				circle_house_inner_radius * 1.05 * Math.sin(((30 * i) - 15) * grad) - left_shift, 
				circle_house_inner_radius * 1.05 * Math.cos(((30 * i) - 15) * grad) + 5)
				ctx.moveTo(circle_house_outer_radius, 0);
			}
	
			//planets and stuff
			ctx.font = '25px serif';
			ctx.moveTo(circle_planets_radius, 0);
			ctx.arc(0, 0, circle_planets_radius, 360 * grad, 0, false);
	
			//probably should move this to consts
			const radius_for_cel_bodies = (circle_sign_inner_radius - circle_planets_radius) / 2 + circle_planets_radius
			
			//figure out which planets need to be highlighted
			//TODO move this to setHighlighedBonds
			//OR add setHightLightedPlanets and make a method to create one from the other
			let highlighted_planets = []
			// if(highlight_mode){

			// }

			let cel_bod_coords = []
			for (let i = 0; i < 11; i++){
				let angle = (this.celestial_body_angles[i] - this.zero_shift_angle - signs_angle_shift) * grad
				let x = circle_planets_radius * Math.sin(angle)
				let y = circle_planets_radius * Math.cos(angle)
				cel_bod_coords.push({
					x: x,
					y: y
				})
				ctx.moveTo(x, y)
				ctx.arc(x,y,2,0, Math.PI * 2, true)
	
				ctx.fillText(celestial_body_symbols[i], 
					radius_for_cel_bodies * Math.sin((this.celestial_body_angles[i] - this.zero_shift_angle - signs_angle_shift) * grad) - 10,
					radius_for_cel_bodies * Math.cos((this.celestial_body_angles[i] - this.zero_shift_angle - signs_angle_shift) * grad) + 10)
			}
			ctx.stroke()
			ctx.closePath()
			
			
			//bonds between celestial bodies
			this.bonds.forEach((bond) => {
				// if (highlight_mode){
				// 	if(this.highlighted_bonds.includes(bond.id)){
				// 		ctx.globalAlpha = 1
				// 	}else{
				// 		ctx.globalAlpha = 0.1
				// 	}
				// }
				ctx.beginPath()
				ctx.strokeStyle = bondTypesToColors[bond.type]
				ctx.setLineDash(bondTypesToLineStyle[bond.type])
				ctx.moveTo(cel_bod_coords[bond.from].x, cel_bod_coords[bond.from].y)
				ctx.lineTo(cel_bod_coords[bond.to].x, cel_bod_coords[bond.to].y)
				ctx.stroke()
				ctx.closePath()
			})
			if(highlight_mode){
				ctx.globalAlpha = 1
			}
			ctx.beginPath()
			ctx.strokeStyle ="#000"; ctx.setLineDash([]); //ctx.lineWidth=1; 
	
			//zodiac signs (probly should draw it last)
			ctx.font = '20px serif';
	
			for(let i = 0; i < 12; i += 1){
				ctx.fillText(signs_symbols[i],
				circle_sign_inner_radius * 1.05 * Math.sin(((30 * (i - 3)) - signs_angle_shift + 15) * grad) - 10,
				circle_sign_inner_radius * 1.05 * Math.cos(((30 * (i - 3)) - signs_angle_shift + 15) * grad) + 7)
			}
			ctx.save();
			ctx.rotate(signs_angle_shift * grad);
			let tick_lenght = 5
			for(let i = 0; i < 12; i++){
				let angle = -(30 * i * grad) + Math.PI / 2
				ctx.moveTo(circle_sign_inner_radius * Math.sin(angle), circle_sign_inner_radius * Math.cos(angle))
				ctx.arc(0, 0, circle_sign_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
				ctx.lineTo(circle_sign_outer_radius * Math.sin(angle - 30 * grad), circle_sign_outer_radius * Math.cos(angle - 30 * grad))
				for(let j = 0; j < 6; j++){
					let newAngle = angle - (5 * (j+1) * grad)
					ctx.moveTo(circle_sign_inner_radius * Math.sin(newAngle), 
						circle_sign_inner_radius * Math.cos(newAngle))
					ctx.lineTo((circle_sign_inner_radius - tick_lenght) * Math.sin(newAngle),
						(circle_sign_inner_radius - tick_lenght)  * Math.cos(newAngle))
				}
			}
			ctx.restore();			
			ctx.stroke();
			console.log("Render done.")
		}
	}
}

let datePicker = document.getElementById("dataPicker")
let timePicker = document.getElementById("timePicker")
let longPicker = document.getElementById("longPicker")
let latPicker = document.getElementById("latPicker")
let btnGo = document.getElementById("btnDraw")
let canvas = document.getElementById('canvas');

let natal = new Natal(canvas)

// function startDrawing(){
// 	let date_raw = dataPicker.value
// 	let time_raw = timePicker.value
// 	let lat = parseInt(latPicker.value)
// 	let long = parseInt(longPicker.value)
// 	console.log(date_raw)
// 	console.log(time_raw)
// 	console.log(date_raw + " " + time_raw)
// 	let date = new Date(date_raw + " " + time_raw)
// 	console.log(date)
// 	const ephemeris = new Ephemeris({
// 		year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), hours: date.getHours(), minutes: date.getMinutes(), latitude: lat, longitude: long, calculateShadows: false
// 	})
// 	console.log(ephemeris.Earth)
// 	console.log(ephemeris.Observer)
// 	console.log(ephemeris.Results)
// 	let body_angles = []
// 	celestial_body_names.forEach((item)=>{
// 		//console.log(ephemeris[item])
// 		//console.log(ephemeris[item].position.apparentLongitude)
// 		body_angles.push(ephemeris[item].position.apparentLongitude)
// 	})
// 	let ascendant = calculateAsc(date, ephemeris.Observer.latitude, ephemeris.Observer.longitude)
// 	natal.draw(body_angles, ascendant)
// }
// //ephemeris.Results 

function draw(){
	let date_raw = dataPicker.value
	let time_raw = timePicker.value
	let lat = parseInt(latPicker.value)
	let long = parseInt(longPicker.value)
	console.log(date_raw)
	console.log(time_raw)
	console.log(date_raw + " " + time_raw)
	let date = new Date(date_raw + " " + time_raw)
	console.log(date)
	natal.draw(date, long, lat)
}

btnGo.onclick = () => {

	draw()
	// let date_raw = dataPicker.value
	// console.log(date_raw)
	// let date = new Date(date_raw)
	// console.log(date)
	// console.log(date.getFullYear())
	// console.log(date.getMonth())
	// console.log(date.getDate())
	// 
}
draw()

//for debug
let slider = document.getElementById("myRange");
let slider_output = document.getElementById("myRange_output");
slider_output.innerHTML = slider.value; // Display the default slider value

//Update the current slider value (each time you drag the slider handle)
slider.oninput = function(){
	slider_output.innerHTML = this.value;
	natal.forseSetAscendantAngle(this.value)
}

let epsilonPicker = document.getElementById("epsilonPicker")

epsilonPicker.oninput = function(){
	natal.setEpsilon(parseInt(this.value))
}

//TODO add https://leafletjs.com/ map for picking coords