export var signsSymbols = [
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

export var celestialBodySymbols = [
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

export var bondTypesToAngles = {
	"Opposition" : 180,
	"Conjunction" : 0,
	"Trine" : 120,
	"Square" : 90,
	"Sextile" : 60,
	"Quincunx" : 150,
	"Semisquare" : 45,
	"Semisextile" : 30
}

export var bondTypesToColors = {
	"Opposition" : "black",
	"Conjunction" : "black",
	"Trine" : "red",
	"Square" : "black",
	"Sextile" : "blue",
	"Quincunx" : "cyan",
	"Semisquare" : "black",
	"Semisextile" : "blue"
}

export var bondTypesToLineStyle = {
	"Opposition" : [],
	"Conjunction" : [],
	"Trine" : [],
	"Square" : [],
	"Sextile" : [],
	"Quincunx" : [5, 5],
	"Semisquare" : [5, 5],
	"Semisextile" : [5, 5]
}