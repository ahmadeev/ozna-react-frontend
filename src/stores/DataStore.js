import {action, makeAutoObservable, makeObservable, observable} from "mobx";

class DataStore {

    // автообсервбл поля
    generationSettings = observable.map();
    generatedData = observable.map(); // observable.map.shallow()

    constructor() {
        // makeAutoObservable(this); // обсервбл поля

        makeObservable(this, {
            generatedData: observable,
            generationSettings: observable,
            pushGeneratedData: action,
            cleanupGeneratedData: action,
            updateGenerationSettings: action
        });
    }

    /* ----------
        * generationSettings
        { "parameter_1": { "min": 0, "max": 99, "frequency": 0 }, ... }
        * generatedData
        { "parameter_1": [ { "id": "hreyh", "dt": 1395039, "value": 76 }, ... ], ... }
    ---------- */

    // ------ settings

/*    getSettings(parameter) {
        return this.generationSettings.get(parameter) || null;
    }*/

    // action-функция меняет состояние
    updateGenerationSettings(parameter, settings) {
        // console.log("обновление настроек", parameter);
        // console.log(this.generationSettings[parameter]);

        this.generationSettings.set(parameter, settings);
    }

    // ------ data

/*    getData(parameter) {
        return this.generatedData.get(parameter) || [];
    }*/

    updateGeneratedData(parameter, data) {
        // console.log("обновление вычисленных значений 1", parameter);
        // console.log(this.generatedData[parameter]);

        if (!data || data.length === 0) return;
        if (!this.generatedData.has(parameter) || this.generatedData.get(parameter) === undefined) {
            this.generatedData.set(parameter, [data]);
            return;
        }

        this.generatedData.set(parameter, [...data]);
    }

    pushGeneratedData(parameter, data) {
        // console.log("обновление вычисленных значений 2", parameter);
        // console.log(this.generatedData[parameter]);

        if (!data || data.length === 0) return;
        if (!this.generatedData.has(parameter) || this.generatedData.get(parameter) === undefined) {
            this.generatedData.set(parameter, observable([data]));
            return;
        }

        this.generatedData.set(parameter, [...this.generatedData.get(parameter), data]);
    }

    cleanupGeneratedData(parameter, interval) {
        const now = Date.now();
        this.generatedData.set(parameter, this.generatedData.get(parameter)?.filter(item => now - item.dt <= interval) || observable([]));
    }
}

export default new DataStore();
