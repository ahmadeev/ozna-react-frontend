import {makeAutoObservable} from "mobx";

class DataStore {
    counter = 0;

    constructor() {
        makeAutoObservable(this); // обсервбл поля
    }

    // action-функция меняет состояние
    increment() {
        this.counter = this.counter + 1;
        console.log(this.counter);
    }

    // ------
    generationSettings = {};

    updateGenerationSettings(parameter, settings) {
        this.generationSettings[parameter] = settings;
    }

    // { "parameter": [ { "id": "rwhwrw", "value": 351, "dt": 153951}, {...}, ... ] }
    generatedData = {}
}

export default new DataStore();
