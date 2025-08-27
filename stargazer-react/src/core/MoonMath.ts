// npm i sorted-btree
import BTree from 'sorted-btree';
import type { IMoonFunctionDefinition } from './interfaces';
import { getValueAtTime } from './ScoreCalculation';


interface IMoonMath {
    //Date is the MoonRise time
    height: BTree<Date, IMoonFunctionDefinition>;

    //Date will be midnight on day of interest
    illumination: BTree<Date, number>;
}

export function getMoonHeightAtTime(moonMath: IMoonMath, date: Date): number {
    // Implement the logic to calculate the moon's height at the given time
    let functionDefs = moonMath.height.getPairOrNextLower(date);
    if (functionDefs === undefined) {
        functionDefs = moonMath.height.getPairOrNextHigher(date);
    }

    if (functionDefs === undefined) {
        return 0;
    }

    const mathConstants = functionDefs[1];
    return getValueAtTime(date, mathConstants);
}


export function getMoonIlluminationAtTime(moonMath: IMoonMath, date: Date): number {
    // Implement the logic to calculate the moon's illumination at the given time
    let illumination = moonMath.illumination.getPairOrNextLower(date);
    if (illumination === undefined) {
        illumination = moonMath.illumination.getPairOrNextHigher(date);
    }

    if (illumination === undefined) {
        return 0;
    }

    return illumination[1];
}


