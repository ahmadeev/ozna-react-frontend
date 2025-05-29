import {makeAutoObservable} from "mobx";

class DataStore {
    constructor() {
        makeAutoObservable(this); // обсервбл поля
    }

    /* ----------
        note: в сторе

        * generationSettings
        {
            "parameter_1": {
                "min": 0,
                "max": 99,
                "frequency": 0
            }
        }
        * generatedData
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

    updateGeneratedData(parameter, data) {
        console.log("обновление вычисленных значений", parameter);
        console.log(this.generatedData[parameter]);

        if (!data || data.length === 0) return;

        this.generatedData[parameter] = [...data];
    }
}

export default new DataStore();
