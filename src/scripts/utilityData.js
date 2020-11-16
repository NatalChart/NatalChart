export const signsSymbols = [
	"♈︎", // aries        // овен
	"♉︎", // taurus       // телец
	"♊︎", // gemini       // близнецы
	"♋︎", // cancer       // рак
	"♌︎", // leo          // лев
	"♍︎", // virgo        // дева 
	"♎︎", // libra        // весы
	"♏︎", // scorpio      // скорпион
	"♐︎", // sagittarius  // стрелец
	"♑︎", // capricorn    // козерог
	"♒︎", // aquarius     // водолей
	"♓︎"   // pisces       // рыбы
]

export const signsNames = [
	"Aries",
	"Taurus",
	"Gemini",
	"Cancer",
	"Leo",
	"Virgo",
	"Libra",
	"Scorpio",
	"Sagittariu",
	"Capricorn",
	"Aquarius",
	"Pisces "
]

export var celestialBodyNames = [
	'sun',
	'moon',
	'mercury',
	'venus',
	'mars',
	'jupiter',
	'saturn',
	'uranus',
	'neptune',
	'pluto'
]

export const celestialBodySymbols = [
	"☉", //sun
	"☽", //moon
	"☿", //mercury
	"♀︎", //venus
	"♂︎", //mars
	"♃", //jupiter
	"♄", //saturn
	"⛢", //uranus
	"♆", //neptune
	"♇", //pluto
	"☊" //lunar node (ascending)
]

export const bondTypesToAngles = {
	"Opposition" : 180,
	"Conjunction" : 0,
	"Trine" : 120,
	"Square" : 90,
	"Sextile" : 60,
	"Quincunx" : 150,
	"Semisquare" : 45,
	"Semisextile" : 30
}

//TODO adjust epsilon values
export var epsilonTable = {
	"Opposition" : 10.0,
	"Conjunction" : 3.0,
	"Trine" : 10.0,
	"Square" : 10.0,
	"Sextile" : 8.0,
	"Quincunx" : 4.0,
	"Semisquare" : 2.0,
	"Semisextile" : 4.0
}

export const bondTypesToColors = {
	"Opposition" : "black",
	"Conjunction" : "black",
	"Trine" : "red",
	"Square" : "black",
	"Sextile" : "blue",
	"Quincunx" : "cyan",
	"Semisquare" : "black",
	"Semisextile" : "blue"
}

export const bondTypesToLineStyle = {
	"Opposition" : [],
	"Conjunction" : [],
	"Trine" : [],
	"Square" : [],
	"Sextile" : [],
	"Quincunx" : [5, 5],
	"Semisquare" : [5, 5],
	"Semisextile" : [5, 5]
}