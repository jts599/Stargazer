import type { IIlluminationDate } from "./interfaces";
import type { IMoonMath } from "./MoonMath";


interface IStargazerDataModel {
    year: number;
    location: ILocation;
    moonMath: IMoonMath;
    dates: IIlluminationDate[];
}

interface ILocation {
    latitude: number;
    longitude: number;
    timeZone?: number;
}
