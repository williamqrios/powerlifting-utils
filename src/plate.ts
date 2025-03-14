export interface PlateForm {
    target: number;
    bar: number;
    collars: number;
    reds: number;
    blues: number;
    yellows: number;
    greens: number;
    fives: number;
    twohalves: number;
    frac: number; 
    fracHalves: number;
    fracQuarters: number;
}

export interface Plate {
    color: string; 
    weight: number; // kg 
    width: number; // cm 
    diameter: number; // cm 
}

const RED: Plate = { color: 'red', weight: 25, width: 2.7, diameter: 45 };
const BLUE: Plate = { color: 'blue', weight: 20, width: 2.25, diameter: 45 };
const YELLOW: Plate = { color: 'yellow', weight: 15, width: 2.1, diameter: 40 };
const GREEN: Plate = { color: 'green', weight: 10, width: 2.1, diameter: 32.5 };
const FIVE: Plate = { color: 'white', weight: 5, width: 2.15, diameter: 22.8 };
const TWO_HALF: Plate = { color: 'black', weight: 2.5, width: 1.6, diameter: 19 };
const FRAC: Plate = { color: 'gray', weight: 1.25, width: 1.2, diameter: 16 };
const FRAC_HALF: Plate = { color: 'gray', weight: 0.5, width: 0.8, diameter: 13.4 };
const FRAC_QUARTER: Plate = { color: 'gray', weight: 0.25, width: 0.6, diameter: 11.2 };
const plateDictionary: { [key: number]: Plate } = {
    25: RED,
    20: BLUE,
    15: YELLOW,
    10: GREEN,
    5: FIVE,
    2.5: TWO_HALF,
    1.25: FRAC,
    0.5: FRAC_HALF,
    0.25: FRAC_QUARTER
}; 

function plateCalculate(form: PlateForm): Array<number> {
    // 1. Subtracting from the target the barbell weight and collars weight, and dividing by 2 because we want to use the plates symmetrically in the barbell.  
    const targetWeight = (form.target - form.bar - form.collars) / 2;
    // 2. Making an array containing the weights of the plates (repetitions are taken into account by just having multiple plates of the same weight, and the number of plates is divided by two as well)
    const availablePlates = [
        ...Array.from({ length: form.reds / 2 }, () => 25),
        ...Array.from({ length: form.blues / 2 }, () => 20),
        ...Array.from({ length: form.yellows / 2 }, () => 15),
        ...Array.from({ length: form.greens / 2 }, () => 10),
        ...Array.from({ length: form.fives / 2 }, () => 5),
        ...Array.from({ length: form.twohalves / 2 }, () => 2.5),
        ...Array.from({ length: form.frac / 2 }, () => 1.25),
        ...Array.from({ length: form.fracHalves / 2 }, () => 0.5),
        ...Array.from({ length: form.fracQuarters / 2 }, () => 0.25)
    ];
    // 3. Applying a BFS algorithm to find the combination of plates that will result in the target weight
    type QueueElement = [number, number[]];
    let queue: Array<QueueElement> = [ [targetWeight, [] ] ];
    let visited: Set<string> = new Set();
    visited.add(`${targetWeight}${0}`);
    while (queue) {
        let currentState = queue.shift();
        if (!currentState) {
            break;
        }
        let [ currentWeight, currentPlates ] = currentState;
        if (currentWeight === 0) {
            // 4. Returning the result as an array of plates (which can later be formatted as an object), or an error message if no solution is found
            return currentPlates;
        }
        for (let i = 0; i < availablePlates.length; i++) {
            let newWeight = currentWeight - availablePlates[i];
            if (newWeight >= 0 && !visited.has(`${newWeight}${availablePlates.length}`)) {
                visited.add(`${newWeight}${availablePlates.length}`);
                queue.push([newWeight, [...currentPlates, availablePlates[i]]]);
            }
        }
    }
    return []; 
}

function plateResultFormat(result: Array<number>): string {
    type PlateCount = { [key: number]: number };
    let count: PlateCount = {}; 
    for (const plate of result) {
        if (count[plate]) {
            count[plate] += 1;
        } else {
            count[plate] = 1;
        }
    }
    return Object.entries(count)
        .map(([key, value]) => `${key} kg x ${value * 2}`)
        .join(', ');
}

function drawPlateDiagram(result: Array<number>) {
    const canvas = document.getElementById('plate-diagram') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; 

    // Drawing the bar and the sleeves 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = 400; 
    const barHeight = 10;
    const sleeveHeight = barHeight * 2; 
    const sleeveWidth = 80; 
    const sleeveConnectionHeight = sleeveHeight * 2; 
    const sleeveConnectionWidth = 10; 
    const barX = (canvas.width - barWidth) / 2;
    const barY = (canvas.height - barHeight) / 2;
    ctx.fillStyle = 'black';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillRect(barX, barY - sleeveHeight/4, sleeveWidth, sleeveHeight);
    ctx.fillRect(barX + barWidth - sleeveWidth, barY - sleeveHeight/4, sleeveWidth, sleeveHeight);
    ctx.fillRect(barX + sleeveWidth, barY - sleeveHeight/4 - sleeveConnectionHeight/4, sleeveConnectionWidth, sleeveConnectionHeight);
    ctx.fillRect(barX + barWidth - sleeveWidth - sleeveConnectionWidth, barY - sleeveHeight/4 - sleeveConnectionHeight/4, sleeveConnectionWidth, sleeveConnectionHeight);
    // Draw plates 
    let leftX = barX + sleeveWidth; 
    let rightX = barX + barWidth - sleeveWidth;
    if (!result) return; 
    result.forEach((weight) => {
        const plateData = plateDictionary[weight]; 
        const plateWidth = plateData.width * 5.5; 
        const plateHeight = plateData.diameter * 2.9;
        ctx.fillStyle = plateData.color;
        ctx.fillRect(leftX - plateWidth, barY + sleeveHeight/4 - plateHeight / 2, plateWidth, plateHeight);
        ctx.fillRect(rightX, barY + sleeveHeight/4 - plateHeight / 2, plateWidth, plateHeight);
        leftX -= plateWidth + 2;
        rightX += plateWidth + 2;
    });
}

export function plateInit(form: PlateForm) {
    const target = document.getElementById('target') as HTMLInputElement;
    const bar = document.getElementById('bar') as HTMLInputElement; 
    const collars = document.getElementById('collars') as HTMLInputElement;
    const reds = document.getElementById('reds') as HTMLInputElement;
    const blues = document.getElementById('blues') as HTMLInputElement;
    const yellows = document.getElementById('yellows') as HTMLInputElement;
    const greens = document.getElementById('greens') as HTMLInputElement;
    const fives = document.getElementById('fives') as HTMLInputElement;
    const twohalves = document.getElementById('twohalves') as HTMLInputElement;
    const frac = document.getElementById('frac') as HTMLInputElement;
    const fracHalves = document.getElementById('frac-half') as HTMLInputElement;
    const fracQuarters = document.getElementById('frac-quarter') as HTMLInputElement;
    const calculateButton = document.getElementById('plate-calculate') as HTMLButtonElement;
    const resultDiv = document.getElementById('plate-result') as HTMLDivElement;
    const resultContent = document.getElementById('plate-result-content') as HTMLParagraphElement;
    // Default values 
    form.target = 100; 
    form.collars = 0;
    form.bar = 20; 
    form.reds = 0; 
    form.blues = 6;
    form.yellows = 0; 
    form.greens = 2; 
    form.fives = 4; 
    form.twohalves = 4; 
    form.frac = 4; 
    form.fracHalves = 2; 
    form.fracQuarters = 2; 


    target.addEventListener('input', () => {
        form.target = parseFloat(target.value);
    }); 
    bar.addEventListener('input', () => {
        form.bar = parseInt(bar.value);
    });
    collars.addEventListener('input', () => {
        form.collars = parseFloat(collars.value);
    });
    reds.addEventListener('input', () => {
        form.reds = parseInt(reds.value);
    });
    blues.addEventListener('input', () => {
        form.blues = parseInt(blues.value);
    });
    yellows.addEventListener('input', () => {
        form.yellows = parseInt(yellows.value);
    });
    greens.addEventListener('input', () => {
        form.greens = parseInt(greens.value);
    });
    fives.addEventListener('input', () => {
        form.fives = parseInt(fives.value);
    });
    twohalves.addEventListener('input', () => {
        form.twohalves = parseInt(twohalves.value);
    });
    frac.addEventListener('input', () => {
        form.frac = parseInt(frac.value);
    });
    fracHalves.addEventListener('input', () => {
        form.fracHalves = parseInt(fracHalves.value);
    });
    fracQuarters.addEventListener('input', () => {
        form.fracQuarters = parseInt(fracQuarters.value);
    });
    drawPlateDiagram([]); 
    calculateButton.addEventListener('click', () => {
        const result = plateCalculate(form);
        console.log(result);
        if (result.length > 0) {
            resultContent.textContent = `Plates: ${plateResultFormat(result)}`;
            resultDiv.style.display = 'block';
            drawPlateDiagram(result); 
        } else {
            resultContent.textContent = 'No solution found';
            resultDiv.style.display = 'block';
        }
    });
}

