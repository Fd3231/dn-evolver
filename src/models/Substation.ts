export class Substation {
    id: string;
    type: string;
    latitude: number;
    longitude: number;

    constructor(id: string, type:string, latitude:number=0, longitude:number=0 ) {
        this.id = id;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    static fromJSON(val: any): Substation {
        return new Substation(val.id, val.type, val.latitude, val.longitude);
    }

}