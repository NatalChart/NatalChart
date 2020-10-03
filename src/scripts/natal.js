import Ephemeris from './ephemeris/Ephemeris'
import {signsSymbols,
	signsNames,
	celestialBodyNames, 
	celestialBodySymbols,
	bondTypesToAngles,
	bondTypesToColors,
	bondTypesToLineStyle,
	epsilonTable} 
	from './utilityData'

const centerX = 305
const centerY = 305
const circleHouseOuterRadius = 300
const circleHouseInnerRadius = 275
const circleSignOuterRadius = 275
const circleSignInnerRadius = 250
const circlePlanetsRadius = 215

const axialTilt = 23.4392911
const grad = Math.PI / 180
const julianDaysTo1970 = 2440587.5
const millisecondsInDay = 86400000

export default class Natal{
	constructor(canvas){
		this.canvas = canvas
        this.zeroShiftAngle = 90
        this.epsilonTable = epsilonTable
		
		this.celestialBodyAngles = []
		this.ascendant = 0
		this.MC = 0 // Medium Coeli
		this.LST = 0 // Local Sidereal Time
		this.ephemeris = null
		this.observerLongitude = 0
        this.observerLatitude = 0
        this.name = ""
        this.date = new Date()
		this.long = 0
		this.lat = 0
		this.bonds = []
		this.highlightedBonds = []
		this.highlightedPlanets = []
		this.outputAuxDataCallback = null
    }
    
    setStorage(storage){
        this.storage = storage
    }

	//input - array of bond ids
	setHighlightedBonds(bondIds){
		// console.log("DEBUG")
		// console.log(bondIds)
		this.highlightedBonds = new Set()
		bondIds.forEach((bondId) => {
			this.highlightedBonds.add(parseInt(bondId))
		})
		this.highlightedPlanets = new Set()
		this.highlightedBonds.forEach((bondId) => {
			this.highlightedPlanets.add(this.bonds[bondId].from)
			this.highlightedPlanets.add(this.bonds[bondId].to)
		})
		// console.log(this.highlightedBonds)
		// console.log(this.highlightedPlanets)
		this.render()
    }

    setEpsilonTableToDefault(){
        this.epsilonTable = epsilonTable
        this.makeBonds()
		this.render()
		this.outputAuxDataCallback()
    }
    
    setEpsilonTable(newEpsilonTable){
        //console.log("OLD:")
        //console.log(this.epsilonTable)
        //console.log(Object.keys(this.epsilonTable))

        //ES6 magic!
        let newTableAsObj = Object.keys(this.epsilonTable).reduce((obj, key, index) => ({ ...obj, [key]: newEpsilonTable[index] }), {});
        //console.log (newTableAsObj)
        this.epsilonTable = newTableAsObj
        //console.log("NEW:")
        //console.log(this.epsilonTable)
        this.makeBonds()
		this.render()
		this.outputAuxDataCallback()
    }

	clearHighlights(){
		this.highlightedBonds = []
		this.highlightedPlanets = []
		this.render()
	}

	//TODO
	// setHighlightedPlanets(){
	// }

	//override ascendantAngle
	forceSetAscendantAngle(val){
		this.ascendant = val
		this.render()
	}

	withinEpsilon(x, y, e){
		return x < y + e && x > y - e
	}

	makeBonds(){
		this.bonds = []
		let lenght = this.celestialBodyAngles.length
		let bondId = 0
		for (let i = 0; i < lenght - 1; i++) {
			for (let j = i + 1; j < lenght; j++){
				let diffLeft = Math.abs(this.celestialBodyAngles[i] - this.celestialBodyAngles[j])
				let diffRight = 360 - diffLeft
				let diff = Math.min(diffLeft, diffRight)
				bondId += this.checkBond(this.bonds, i, j, diff, bondId)
				// console.log("drrr")
				// console.log(diffLeft)
				// console.log(diffRight)
				// console.log(diff)
				// console.log(this.celestialBodyAngles[i])
				// console.log(this.celestialBodyAngles[j])
				// console.log(tmp)
			}
		}
		// console.log("Bonds: ")
		// console.log(this.bonds)
		// console.log("Total bonds found: " + this.bonds.length)
	}

	checkBond(bonds, i, j, diff, bondId){
		let foundBondType = null 
		for(let bond in bondTypesToAngles){
			if (this.withinEpsilon(diff, bondTypesToAngles[bond], this.epsilonTable[bond])){
				foundBondType = bond
			}
		}
		if (foundBondType){
			// console.log(`bond: from ${celestialBodySymbols[i]} to ${celestialBodySymbols[j]}`)
			// console.log('bond type: ' + foundBondType + " angle diff: " + diff)
			bonds.push({
				id: bondId,
				from: i,
				to: j,
				type: foundBondType,
				angleDiff: diff
			})
			return 1
		}
		return 0
	}

	getBondsString(){
        //probably can optimize this
		let tmp = []
		this.bonds.forEach((bond) => {
			tmp.push(`<div data-id="${bond.id}">${bond.type} ${celestialBodySymbols[bond.from]} to ${celestialBodySymbols[bond.to]} ${Number.parseFloat(bond.angleDiff).toFixed(3)}°</div>`)
		})
		if(tmp.length == 0){
			tmp.push("<div>NONE FOUND</div>")
        }
        const regex = /<div[^>]+>(.*?)<\/div>/
        tmp.sort((a,b) => {
            a = a.match(regex)
            b = b.match(regex)
            return a[1].localeCompare(b[1])
        })
		return tmp.join("")
	}

	getCelBodyCoordString(){
		let tmp = []
		this.ephemeris.Results.forEach((celBody, i) => {
			tmp.push(`<div>${celBody.key} ${celestialBodySymbols[i]}: ${celBody.position.apparentLongitude30String}</div>`)
		})
		return tmp.join("")
	}

	getAscendantString(){
		let signN = Math.floor(this.ascendant / 30)
		let angle = this.ascendant % 30
		// console.log("ASC")
		// console.log(tmp)
		// console.log(signN)
		// console.log(angle)
        return `<div>${signsNames[signN]} ${Number.parseFloat(angle).toFixed(3)}° </div><br>`
        // <div>LST: ${this.LST}</div><br>
        // <div>MC: ${this.MC}</div`
	}

	draw(name, date, long, lat){
		//debug:
		// date = new Date("2016-11-02 21:17:30")
		// long = 6.9
        // lat = 52.21
        this.name = name
        this.date = date
		this.long = long
        this.lat = lat
        console.log("DEBUG")
        console.log(long)
        console.log(lat)
		this.calculateEphemerisData(date, long, lat)
		this.LST = this.calculateLST(date, this.observerLongitude)
		//this.LST = 17.87
		this.MC = this.calculateMediumCoeli(this.LST)
		this.ascendant = this.calculateAsc(this.LST, this.MC, this.observerLatitude)
		this.makeBonds()
		this.render()
		this.outputAuxDataCallback()
	}

	calculateEphemerisData(date, long, lat){
		this.ephemeris = new Ephemeris({
			year: date.getFullYear(), 
			month: date.getMonth(), 
			day: date.getDate(), 
			hours: date.getHours(), 
			minutes: date.getMinutes(), 
			latitude: lat, 
			longitude: long, 
			calculateShadows: false,
			key: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
		})
		console.log(this.ephemeris.Earth)
		console.log(this.ephemeris.Observer)
		console.log(this.ephemeris.Results)
		this.celestialBodyAngles = []
		celestialBodyNames.forEach((item)=>{
			//console.log(ephemeris[item])
			//console.log(ephemeris[item].position.apparentLongitude)
			this.celestialBodyAngles.push(this.ephemeris[item].position.apparentLongitude)
		})
		this.observerLatitude = this.ephemeris.Observer.latitude
		this.observerLongitude = this.ephemeris.Observer.longitude
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
		while (ST0 < 0){
			ST0 += 360
        }
        ST0 %= 360
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
        let mc = Math.atan(Math.sin(ARMC * grad) / Math.cos(ARMC * grad) * Math.cos(axialTilt * grad)) / grad
        //console.log("MC initial: " + mc)
		// while (mc < 0){
		// 	mc += 360
		// }
		// mc %= 360
		// if(SiderealTime < 180){
		// 	if(mc > 180){
        //         mc -= 180
        //         console.log("moving mc to the left of LST")
		// 	}
		// } else {
		// 	if (mc < 180){
        //         mc += 180
        //         console.log("moving mc to the right of LST")
		// 	}
		// }
		return mc
	}

	calculateAsc(LST, MC, lat){
		//https://radixpro.com/a4a-start/the-ascendant/
		
		console.log("local sidereal time: " + LST)
		// // console.log(lat)
		// // console.log(axialTilt)
		// let y = - Math.cos(localSiderealTime * grad)
		// let x = Math.sin(localSiderealTime * grad) * Math.cos(axialTilt * grad) + Math.tan(lat * grad) * Math.sin(axialTilt * grad)
		
		let RAMC = LST * 15
		// console.log("RAMC = " + RAMC)
		let y = Math.cos(RAMC * grad)
		let x = -(Math.sin(axialTilt * grad) * Math.tan(lat * grad) + Math.cos(axialTilt * grad) * Math.sin(RAMC * grad))
		// console.log(x)
		// console.log(y)
		// console.log(y/x)
		let ascendant = Math.atan(y/x)
		ascendant = ascendant / grad
		console.log("Asc: " + ascendant)
		console.log("MC: " + MC)
		//this is needed if atan is used instead of atan2
        
        if (x < 0){
            ascendant += 180
        } else {
            ascendant += 360
        }
        console.log("asc first fix: " + ascendant)

		while (ascendant < 0){
			ascendant += 360
			console.log("Asc was less than 0. fixin it")
			console.log("Asc: " + ascendant)
		}
		if (ascendant > 360){
			ascendant = ascendant % 360
			console.log("Asc was more than 360. fixin it")
			console.log("Asc: " + ascendant)
        }
        
        // if (MC < 0){
        //     ascendant += 180
        // }

		// if(ascendant < MC){
		// 	ascendant += 180
		// 	console.log('ASC less THAN MC')
		// 	console.log("Asc: " + ascendant)
		// }
		// if(ascendant > MC + 180){
		// 	ascendant -= 180
		// 	console.log('ASC > MC + 180')
		// 	console.log("Asc: " + ascendant)
		// }
	
		console.log("Asc final: " + ascendant)
		return ascendant
	}

	render() {
		if (this.canvas.getContext) {
			let highlightMode = this.highlightedBonds.size > 0
			// console.log("highlight mode:")
			// console.log(highlightMode)
			let signsAngleShift = this.ascendant
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
				ctx.moveTo(circleHouseInnerRadius * Math.sin(angle), circleHouseInnerRadius * Math.cos(angle))
				ctx.arc(0, 0, circleHouseInnerRadius, 30 * i * grad, 30 * (i + 1) * grad, false);
				ctx.lineTo(circleHouseOuterRadius * Math.sin(angle - 30 * grad), circleHouseOuterRadius * Math.cos(angle - 30 * grad))
				let houseNumb = ((i+2)%12)+1
				let leftShift = null
				if (houseNumb > 9){
					leftShift = 15
				}else{
					leftShift = 7
				}
	
				ctx.fillText(`${houseNumb}`, 
				circleHouseInnerRadius * 1.05 * Math.sin(((30 * i) - 15) * grad) - leftShift, 
				circleHouseInnerRadius * 1.05 * Math.cos(((30 * i) - 15) * grad) + 5)
				ctx.moveTo(circleHouseOuterRadius, 0);
			}
	
			//planets and stuff
			ctx.font = '25px serif';
			ctx.moveTo(circlePlanetsRadius, 0);
			ctx.arc(0, 0, circlePlanetsRadius, 360 * grad, 0, false);
	
			//probably should move this to consts
			const radiusForCelBodies = (circleSignInnerRadius - circlePlanetsRadius) / 2 + circlePlanetsRadius

			let celBodyCoords = []
			for (let i = 0; i < 11; i++){

				let angle = (this.celestialBodyAngles[i] - this.zeroShiftAngle - signsAngleShift) * grad
				let x = circlePlanetsRadius * Math.sin(angle)
				let y = circlePlanetsRadius * Math.cos(angle)
				celBodyCoords.push({
					x: x,
					y: y
				})
				ctx.moveTo(x, y)
				ctx.arc(x,y,2,0, Math.PI * 2, true)
	
				if (highlightMode){
					if(this.highlightedPlanets.has(i)){
						ctx.globalAlpha = 1
						ctx.arc(x,y,5,0, Math.PI * 2, true)
					}else{
						ctx.globalAlpha = 0.05
					}
				}
				ctx.fillText(celestialBodySymbols[i], 
					radiusForCelBodies * Math.sin((this.celestialBodyAngles[i] - this.zeroShiftAngle - signsAngleShift) * grad) - 10,
					radiusForCelBodies * Math.cos((this.celestialBodyAngles[i] - this.zeroShiftAngle - signsAngleShift) * grad) + 10)
				if (highlightMode){
					ctx.globalAlpha = 1
				}
			}
			ctx.stroke()
			ctx.closePath()
			
			
            //bonds between celestial bodies
            
			// if(highlightMode){
			// 	console.log("HIGHTLIGHED MODE ON")
			// 	console.log(this.highlightedBonds)
			// }
			
			this.bonds.forEach((bond) => {
				if (highlightMode){
					if(this.highlightedBonds.has(bond.id)){
						ctx.globalAlpha = 1
					}else{
						ctx.globalAlpha = 0.05
					}
				}
				ctx.beginPath()
				ctx.strokeStyle = bondTypesToColors[bond.type]
				ctx.setLineDash(bondTypesToLineStyle[bond.type])
				ctx.moveTo(celBodyCoords[bond.from].x, celBodyCoords[bond.from].y)
				ctx.lineTo(celBodyCoords[bond.to].x, celBodyCoords[bond.to].y)
				ctx.stroke()
				ctx.closePath()
			})
			if(highlightMode){
				ctx.globalAlpha = 1
			}
			ctx.beginPath()
			ctx.strokeStyle ="#000"; ctx.setLineDash([]); //ctx.lineWidth=1; 
	
			//zodiac signs (probly should draw it last)
			ctx.font = '20px serif';
	
			for(let i = 0; i < 12; i += 1){
				ctx.fillText(signsSymbols[i],
				circleSignInnerRadius * 1.05 * Math.sin(((30 * (i - 3)) - signsAngleShift + 15) * grad) - 10,
				circleSignInnerRadius * 1.05 * Math.cos(((30 * (i - 3)) - signsAngleShift + 15) * grad) + 7)
			}
			ctx.save();
			ctx.rotate(signsAngleShift * grad);
			let tickLenght = 5
			for(let i = 0; i < 12; i++){
				let angle = -(30 * i * grad) + Math.PI / 2
				ctx.moveTo(circleSignInnerRadius * Math.sin(angle), circleSignInnerRadius * Math.cos(angle))
				ctx.arc(0, 0, circleSignInnerRadius, 30 * i * grad, 30 * (i + 1) * grad, false);
				ctx.lineTo(circleSignOuterRadius * Math.sin(angle - 30 * grad), circleSignOuterRadius * Math.cos(angle - 30 * grad))
				for(let j = 0; j < 6; j++){
					let newAngle = angle - (5 * (j+1) * grad)
					ctx.moveTo(circleSignInnerRadius * Math.sin(newAngle), 
						circleSignInnerRadius * Math.cos(newAngle))
					ctx.lineTo((circleSignInnerRadius - tickLenght) * Math.sin(newAngle),
						(circleSignInnerRadius - tickLenght)  * Math.cos(newAngle))
				}
			}
			ctx.restore();			
			ctx.stroke();
			//console.log("Render done.")
		}
	}

	//callback to output auxiliary data to whatever interface elements you want
	addOutputAuxDataCallback(callback){
		this.outputAuxDataCallback = () => {
			let payload = {}
			payload.bondsString = this.getBondsString()
			payload.celBodyString = this.getCelBodyCoordString()
			payload.ascendantString = this.getAscendantString()
			callback(payload)
		}
	}

	forceOutputAuxData(){
		if(this.outputAuxDataCallback){
			this.outputAuxDataCallback()
		}
    }

    getStorageObj(callback){
        let obj = {
            name: this.name,
            date: this.date,
            long: this.long,
            lat: this.lat
        }
        callback(obj)
    }

    loadStorageObj(obj, callback){
        console.log("LOAD")
        console.log(obj)
        let date = new Date(obj.date)
        this.draw(obj.name, date, obj.long, obj.lat)
        if(callback){callback()}
    }

    saveToStorage(callback){
        if(this.storage){
            this.getStorageObj((obj) => {
                this.storage.set(obj.name, obj, callback)
            })
        } else {
            console.error("No storage added to Natal")
        }
    }

    loadFromStorage(name, callback){
        if(this.storage){
            this.storage.get(name, (obj) => {
                this.loadStorageObj(obj, callback)
            })
        } else {
            console.error("No storage added to Natal")
        }
    }
    
    //moveToCircleAngle(ctx, radius, angle){
    // 	let angleFix = angle + Math.PI / 2 
    // 	ctx.moveTo(radius * Math.sin(angleFix), radius * Math.cos(angleFix))
    // }
}