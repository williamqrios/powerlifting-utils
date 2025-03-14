import { lowRepBias, moderateRepBias, highRepBias } from "./rpeTables";
enum RepBias {
    Low, 
    Moderate,
    High
}; 

enum InvalidData {
    RPE = -1,
    Reps = -2,
}

function range(start: number, end: number, step: number = 1): Array<number> {
    let result = [];
    for (let i = start; i <= end; i += step) {
        result.push(i);
    }
    return result;
} 

function calculateE1RM(weight: number, reps: number, rpe: number, bias: RepBias): number {
    const validRPE = range(0, 10, 0.5).reverse();  
    if (!validRPE.includes(rpe)) return InvalidData.RPE; 
    const validReps = range(1, 30);
    if (!validReps.includes(reps)) return InvalidData.Reps;
    const row = validRPE.indexOf(rpe); 
    const column = validReps.indexOf(reps);
    let percentage = 100; 
    switch (bias) {
        case RepBias.Low: 
            percentage = lowRepBias[row][column];
            break;
        case RepBias.Moderate:
            percentage = moderateRepBias[row][column];
            break;
        case RepBias.High:
            percentage = highRepBias[row][column];
            break;
    }
    return weight / (percentage / 100);    
}

export function e1RMInit() {
    const weightInput = document.getElementById('weight') as HTMLInputElement;
    const repsInput = document.getElementById('reps') as HTMLInputElement;
    const rpeInput = document.getElementById('rpe') as HTMLInputElement;
    const biasSelect = document.getElementById('bias-select') as HTMLSelectElement;
    const calculateButton = document.getElementById('e1rm-calculate') as HTMLButtonElement;
    const resultDiv = document.getElementById('e1rm-result') as HTMLDivElement;
    const resultContent = document.getElementById('e1rm-result-content') as HTMLParagraphElement;
    // Defaults
    let weight = 100; 
    let reps = 5; 
    let rpe = 9; 
    let bias = RepBias.Low;
    // Event listeners
    weightInput.addEventListener('input', () => {
        weight = parseFloat(weightInput.value);
    });
    repsInput.addEventListener('input', () => {
        reps = parseInt(repsInput.value);
    });
    rpeInput.addEventListener('input', () => {
        rpe = parseInt(rpeInput.value);
    });
    biasSelect.addEventListener('change', () => {
        bias = parseInt(biasSelect.value);
    });
    calculateButton.addEventListener('click', () => {
        let result = calculateE1RM(weight, reps, rpe, bias);
        if (result > 0) {
            resultContent.textContent = `${result}`;
            resultDiv.style.display = 'block';
        } else {
            resultContent.textContent = `Invalid ${InvalidData[result]}`;
            resultDiv.style.display = 'block';
        }
    });
    
}