
function withinEpsilon(x, y, epsilon){
	return x < y + epsilon && x > y - epsilon
}

function checkBond(bonds, i, j, diff, epsilon){
	let found_bond_type = null
	//console.log(bondTypesToAngles)
	for(let bond in bondTypesToAngles){
		//console.log(`${bond} ${bondTypesToAngles[bond]}`)
		if (withinEpsilon(diff, bondTypesToAngles[bond], epsilon)){
			found_bond_type = bond
		}
	}
	if (found_bond_type){
		bonds.push({
			from: i,
			to: j,
			type: found_bond_type,
			angle_diff: diff
		})
	}
}



function draw(celestial_body_angles, ascendant_angle, epsilon = 4, zero_shift_angle = 90) {
	var canvas = document.getElementById('canvas');
	if(ascendant_angle != NaN){
		ascendant_angle = (ascendant_angle)
	}
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.font = '40px serif';
		//ctx.webkitImageSmoothingEnabled=true;
		ctx.resetTransform();

		// Use the identity matrix while clearing the canvas
		//ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Restore the transform
		//ctx.restore();

		//change zero coordinates to the center of the canvas
		ctx.translate(centerX, centerY)
		ctx.moveTo(0,0)
		ctx.beginPath();
		ctx.strokeStyle ="#000"

		// for(let i = 0; i < 12; i+= 1){
		// 	//ctx.moveTo(circle_house_outer_radius, 0);
		// 	//moveToCircleAngle(ctx, circle_house_inner_radius, 30 * (i + 1) * grad)
		// 	let angle = -(30 * i * grad) + Math.PI / 2
		// 	ctx.moveTo(circle_house_inner_radius * Math.sin(angle), circle_house_inner_radius * Math.cos(angle))
		// 	//console.log(`${angle}, ${circle_house_inner_radius * Math.sin(angle)} , ${circle_house_inner_radius * Math.cos(angle)}`)
		// 	//console.log(Math.PI / 2)
		// 	//console.log(Math.sin(0))
		// 	ctx.arc(0, 0, circle_house_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
		// 	ctx.arc(0, 0, circle_house_outer_radius, 30 * (i + 1) * grad, 30 * (i + 2) * grad, false);
		// 	//ctx.arc(0, 0, circle_house_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
		// 	let house_numb = ((i+2)%12)+1
		// 	let left_shift = null
		// 	if (house_numb > 9){
		// 		left_shift = 20
		// 	}else{
		// 		left_shift = 10
		// 	}

		// 	ctx.fillText(`${house_numb}`, circle_house_inner_radius * 1.1 * Math.sin(((30 * i) - 15) * grad) - left_shift, circle_house_inner_radius * 1.1 * Math.cos(((30 * i) - 15) * grad) + 15)
		// 	ctx.moveTo(circle_house_outer_radius, 0);
		// }

		//houses first
		ctx.font = '20px serif';
		for(let i = 0; i < 12; i++){
			let angle = -(30 * i * grad) + Math.PI / 2
			ctx.moveTo(circle_house_inner_radius * Math.sin(angle), circle_house_inner_radius * Math.cos(angle))
			//console.log(`${angle}, ${circle_house_inner_radius * Math.sin(angle)} , ${circle_house_inner_radius * Math.cos(angle)}`)
			//console.log(Math.PI / 2)
			//console.log(Math.sin(0))
			ctx.arc(0, 0, circle_house_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
			//ctx.arc(0, 0, circle_house_outer_radius, 30 * (i + 1) * grad, 30 * (i + 2) * grad, false);
			ctx.lineTo(circle_house_outer_radius * Math.sin(angle - 30 * grad), circle_house_outer_radius * Math.cos(angle - 30 * grad))
			//ctx.arc(0, 0, circle_house_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
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

		let radius_for_cel_bodies = (circle_sign_inner_radius - circle_planets_radius) / 2 + circle_planets_radius

		let cel_bod_coords = []
		for (let i = 0; i < 11; i++){
			let angle = (celestial_body_angles[i] - zero_shift_angle - ascendant_angle) * grad
			let x = circle_planets_radius * Math.sin(angle)
			let y = circle_planets_radius * Math.cos(angle)
			cel_bod_coords.push({
				x: x,
				y: y
			})
			ctx.moveTo(x, y)
			ctx.arc(x,y,2,0, Math.PI * 2, true)

			ctx.fillText(celestial_body_symbols[i], 
				radius_for_cel_bodies * Math.sin((celestial_body_angles[i] - zero_shift_angle - ascendant_angle) * grad) - 10,
				radius_for_cel_bodies * Math.cos((celestial_body_angles[i] - zero_shift_angle - ascendant_angle) * grad) + 10)
		}
		
		let bonds = []
		for (let i = 0; i < 10; i++) {
			for (let j = i + 1; j < 11; j++){
				let diff = Math.abs(celestial_body_angles[i] - celestial_body_angles[j])
				//console.log(`${i} ${j} : ${celestial_body_angles[i]} ${celestial_body_angles[j]} ${diff}`)
				//TODO watch out for async stuff
				checkBond(bonds, i, j, diff, epsilon)
			}
		}
		ctx.stroke()
		ctx.closePath()
		
		//console.log(bonds)
		bonds.forEach(function(bond){
			ctx.beginPath()
			console.log(bond)
			console.log(`bond: ${celestial_body_symbols[bond.from]} and ${celestial_body_symbols[bond.to]}`)
			ctx.strokeStyle = bondTypesToColors[bond.type]
			ctx.setLineDash(bondTypesToLineStyle[bond.type])
			ctx.moveTo(cel_bod_coords[bond.from].x, cel_bod_coords[bond.from].y)
			ctx.lineTo(cel_bod_coords[bond.to].x, cel_bod_coords[bond.to].y)
			ctx.stroke()
			ctx.closePath()
			
		})
		ctx.beginPath()
		ctx.strokeStyle ="#000"; ctx.setLineDash([]); //ctx.lineWidth=1; 

		//zodiac signs (probly should draw it last)
		let signs_angle_shift = ascendant_angle
		ctx.font = '20px serif';
		// for(let i = 1; i <= 3; i+= 1){
		// 	//let sign_numb = ((i+2)%12)
		// 	ctx.fillText(signs_symbols[i - 1], circle_sign_inner_radius * 1.05 * Math.sin(((30 * i) - signs_angle_shift + 15) * grad) - 10, circle_sign_inner_radius * 1.05 * Math.cos(((30 * i) - signs_angle_shift + 15) * grad) + 7)
		// }

		for(let i = 0; i < 12; i += 1){
			//let sign_numb = ((i+2)%12)
			ctx.fillText(signs_symbols[i],
			circle_sign_inner_radius * 1.05 * Math.sin(((30 * (i - 3)) - signs_angle_shift + 15) * grad) - 10,
			circle_sign_inner_radius * 1.05 * Math.cos(((30 * (i - 3)) - signs_angle_shift + 15) * grad) + 7)
		}

		ctx.save();
		ctx.rotate(signs_angle_shift * grad);
		// for(let i = 1; i <= 12; i+= 1){
		// 	ctx.moveTo(circle_sign_inner_radius, 0);
		// 	ctx.arc(0, 0, circle_sign_outer_radius, 0, 30 * i * grad, false);
		// 	ctx.arc(0, 0, circle_sign_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
		// }
		let tick_lenght = 5
		for(let i = 0; i < 12; i++){
			let angle = -(30 * i * grad) + Math.PI / 2
			ctx.moveTo(circle_sign_inner_radius * Math.sin(angle), circle_sign_inner_radius * Math.cos(angle))
			//ctx.arc(0, 0, circle_sign_outer_radius, 0, 30 * i * grad, false);
			//ctx.arc(0, 0, circle_sign_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
			ctx.arc(0, 0, circle_sign_inner_radius, 30 * i * grad, 30 * (i + 1) * grad, false);
			ctx.lineTo(circle_sign_outer_radius * Math.sin(angle - 30 * grad), circle_sign_outer_radius * Math.cos(angle - 30 * grad))
			for(let j = 0; j < 6; j++){
				let newAngle = angle - (5 * (j+1) * grad)
				ctx.moveTo(circle_sign_inner_radius * Math.sin(newAngle), 
					circle_sign_inner_radius * Math.cos(newAngle))
				ctx.lineTo((circle_sign_inner_radius - tick_lenght) * Math.sin(newAngle),
					(circle_sign_inner_radius - tick_lenght)  * Math.cos(newAngle))
			}
			//ctx.arc(0, 0, circle_sign_outer_radius, 30 * (i + 1) * grad, 30 * (i + 2) * grad, false);
		}
		ctx.restore();

		// ctx.arc(0, 0, 300, 0, Math.PI * 2, true); // Outer circle
		// ctx.moveTo(250, 0);
		// ctx.arc(0, 0, 250, 0, Math.PI * 2, true);


		// ctx.rotate(10 * grad);
		// ctx.moveTo(200, 0);
		// ctx.arc(0, 0, 200, 0, 30 * grad, false);
		// ctx.moveTo(200, 0);
		// ctx.arc(0, 0, 200, 0, Math.PI * 2, true); // Inner circle
		
		ctx.stroke();
	}
}