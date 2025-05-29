import styles from "./HomePage.module.css"
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import LocalTable from "../../components/Table/LocalTable.jsx";
import Chart from "../../components/Chart/Chart.jsx";
import dataStore from "../../stores/DataStore.js";
import {observer} from "mobx-react-lite";

const HomePage = observer(() => {

    const GRAPH_NUMBER_OF_ELEMENTS = 50;

    const minIntegerValue = -2_147_483_648;
    const maxIntegerValue = 2_147_483_647;

    const parameters = ["parameter_1", "parameter_2"];
    const [parameter, setParameter] = useState(parameters[0]);

    const [values, setValues] = useState([]); // note: получать из стора

    // последний полученный ответ (нужен только для одной строки)
    const [data, setData] = useState({});

    const ws = useRef(null);
    const timer = useRef(null);
    const pingInterval = 75_000;

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:25000/java-backend-1.0-SNAPSHOT/ws/random-numbers");
        console.log("открыт вебсокет")

        /* обработчики сохраняют (замораживают) состояние ? */

        const startPinging = () => {
            if (timer.current) clearInterval(timer.current);

            const sendPing = () => {
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({ type: 'ping' }));
                }
            };

            sendPing();

            timer.current = setInterval(sendPing, pingInterval);
        };

        const handleOpen = (e) => {
            startPinging();
        }

        const handleMessage = (e) => {
            const json = JSON.parse(e.data);

            if (json.type && json.type === "pong") return;

            // wa: грубо
            if (Object.keys(json).length === 3 && json.id && json.dt && json.value) {
                json.dt = Date.parse(json.dt);
                setData(json);
                setValues(prev => {
                    return [ ...prev, json ];
                });
            }
        };

        const handleError = (e) => {}
        const handleClose = (e) => {}

        ws.current.onopen = handleOpen;
        ws.current.onmessage = handleMessage;
        ws.current.onerror = handleError;
        ws.current.onclose = handleClose;

        return () => {
            if (timer.current) clearInterval(timer.current);
            if (ws.current) ws.current.close();
            // note: сохранять в стор
        }
    }, [])

    const [minValue, setMinValue] = useState("0");
    const [maxValue, setMaxValue] = useState("99");
    const [frequency, setFrequency] = useState("1000");

    const isValidInteger = useCallback((number) => {
        return number >= minIntegerValue && number <= maxIntegerValue;
    }, [minIntegerValue, maxIntegerValue])

/*    useEffect(() => {
        /!* note: плохо (каждый раз попытка обновления стора на изменение параметров) *!/
        const settings = dataStore.generationSettings[parameter];

        // при первой загрузке:
        // не нашли settings -> апдейт в сторе -> вынужденный mobx ререндер компонента
        // при второй загрузке:
        // нашли settings -> установили локально

        if (settings) {
            console.log("установка settings локально ", parameter)
            console.log(dataStore.generationSettings[parameter]);
            setMinValue(settings.minValue);
            setMaxValue(settings.maxValue);
            setFrequency(settings.frequency);
        } else {
            const settings = {minValue, maxValue, frequency};
            dataStore.updateGenerationSettings(parameter, settings);
        }
    }, [parameter]);*/

    // храним
    const settingsRef = useRef({ minValue, maxValue, frequency });

    // и меняем без ререндера
    useEffect(() => {
        settingsRef.current = { minValue, maxValue, frequency };
    }, [minValue, maxValue, frequency]);

    useEffect(() => {
        // значения из стора
        const settings = dataStore.generationSettings[parameter];
        if (settings) {
            setMinValue(settings.minValue);
            setMaxValue(settings.maxValue);
            setFrequency(settings.frequency);
        }

        return () => {
            // значения в стор
            dataStore.updateGenerationSettings(parameter, settingsRef.current);
        };
    }, [parameter]);

    const isMinValueValid = useMemo(() => {
        return minValue.match(/^-?\d+$/) && parseInt(minValue) <= parseInt(maxValue) && isValidInteger(minValue) && isValidInteger(maxValue);
    }, [minValue, maxValue, isValidInteger]);
    const isMaxValueValid = useMemo(() => {
        return maxValue.match(/^-?\d+$/) && parseInt(minValue) <= parseInt(maxValue) && isValidInteger(minValue) && isValidInteger(maxValue);
    }, [minValue, maxValue, isValidInteger]);
    const isMinMaxValuesValid = useMemo(() => {
        return isMinValueValid && isMaxValueValid;
    }, [isMinValueValid, isMaxValueValid]);
    const isFrequencyValid = useMemo(() => {
        return frequency.match(/^[1-9]\d*$/) && parseInt(frequency) > 0 && isValidInteger(frequency);
    }, [frequency, isValidInteger]);

    return (
        <>
            <div className={styles.container}>
                {/* --- note */}
                <div className={styles.row} style={{ padding: "0", gap: "0" }}>
                    <div
                        className={styles.column_plug}
                        style={{
                            height: "3rem",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative"
                        }}
                    >
                        <a style={{textDecoration: parameter === parameters[0] ? "underline" : "none"}}>Parameter 1</a>
                        <a
                            onClick={() => {
                                setParameter(parameters[0]);
                            }}
                            style={{ textDecoration: parameter === parameters[1] ? "underline" : "none", width: "100%", height: "100%", position: "absolute", top: "0", left: "0" }}
                        />
                    </div>
                    <div
                        className={styles.column_plug}
                        style={{
                            height: "3rem",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative"
                        }}
                    >
                        <a style={{ textDecoration: parameter === parameters[1] ? "underline" : "none" }}>Parameter 2</a>
                        <a
                            onClick={() => {
                                setParameter(parameters[1]);
                            }}
                           style={{ textDecoration: parameter === parameters[1] ? "underline" : "none", width: "100%", height: "100%", position: "absolute", top: "0", left: "0" }}
                        />
                    </div>
                </div>
                {/* --- */}
                {/* Верхний блок */}
                <div className={styles.row}>
                    {/* Левый блок */}
                    <div className={styles.column}>
                        <div className={styles.row_plug}>
                            <h3>Текущее значение: {<input type="text" disabled value={data.value || "<отсутствует>"} />}</h3>
                        </div>

                        <div className={styles.row_plug}>
                            <div className={styles.column_grid}>
                                <label>
                                    <span>min:</span>
                                    <input
                                        type="text"
                                        value={minValue}
                                        placeholder="min number"
                                        onChange={(e) => {
                                            setMinValue(e.target.value);
                                        }}
                                    />
                                </label>
                                <label>
                                    <span>max:</span>
                                    <input
                                        type="text"
                                        value={maxValue}
                                        placeholder={"max number"}
                                        onChange={(e) => {
                                            setMaxValue(e.target.value);
                                        }}
                                    />
                                </label>
                                <label>
                                    <span>frequency:</span>
                                    <input
                                        type="text"
                                        value={frequency}
                                        placeholder={"frequency"}
                                        onChange={(e) => {
                                            setFrequency(e.target.value);
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <button
                                onClick={() => {
                                    ws.current.send(JSON.stringify({
                                        id: parameter,
                                        max: maxValue,
                                        min: minValue,
                                        run: true,
                                        frequency: frequency
                                    }));
                                }}
                                disabled={!(isMinMaxValuesValid && isFrequencyValid)}
                                className={styles.button}
                            >start</button>
                            <button
                                onClick={() => {
                                    ws.current.send(JSON.stringify({
                                        id: parameter,
                                        max: maxValue,
                                        min: minValue,
                                        run: false,
                                        frequency: frequency
                                    }));
                                }}
                                className={styles.button}
                            >stop</button>
                        </div>
                    </div>

                    {/* Правый блок */}
                    <div className={styles.column}>
                        <div className={styles.row_plug}>

                            <LocalTable
                                headers={["dt", "value"]}
                                data={values}
                                renderData={(item, rowIndex) => {
                                    return (
                                        <tr key={rowIndex}>
                                            <td>{new Date(parseInt(item.dt)).toUTCString()}</td>
                                            <td>{item.value}</td>
                                        </tr>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Нижний блок */}
                <div className={styles.row}>
                    <div className={styles.column_plug}>
                        <Chart data={values.slice(-GRAPH_NUMBER_OF_ELEMENTS)} />
                    </div>
                </div>
            </div>
        </>
    )
})

export default HomePage;
