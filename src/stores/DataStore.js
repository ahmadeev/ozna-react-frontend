import {makeAutoObservable} from "mobx";

class DataStore {
    constructor() {
        makeAutoObservable(this); // обсервбл поля
    }

    /* ----------
        note: в сторе
        {
            "parameter_1": {
                "min": 0,
                "max": 99,
                "frequency": 0
            }
        }
        {
            "parameter_1": [
                {"id": "hreyh", "dt": 1395039, "value": 76}
            ]
        }
    ---------- */

    // автообсервбл поле
    generationSettings = {};

    // action-функция меняет состояние
    updateGenerationSettings(parameter, settings) {
        this.generationSettings[parameter] = settings;
        console.log("обновление настроек", parameter);
        console.log(this.generationSettings[parameter]);
    }

    generatedData = {};

    updateGenerationData(parameter, data) {
        this.generatedData[parameter] = [...this.generatedData[parameter], data];
        console.log("обновление вычисленных значений", parameter);
        console.log(this.generatedData[parameter]);
    }
}

export default new DataStore();
