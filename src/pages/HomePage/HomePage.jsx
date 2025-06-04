import styles from "./HomePage.module.css"
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import LocalTable from "../../components/Table/LocalTable.jsx";
import Chart from "../../components/Chart/Chart.jsx";
import dataStore from "../../stores/DataStore.js";
import webSocketStore from "../../stores/WebSocketStore.js";
import {observer} from "mobx-react-lite";
import {toJS} from "mobx";


const GRAPH_NUMBER_OF_ELEMENTS = 50;
const TABLE_AND_GRAPH_ELEMENT_LIVE_TIME = 1_000 * 60 * 10; // 1_000 * 60 * 10 ms == 10 min
const TABLE_AND_GRAPH_CHECK_UP_TIME = TABLE_AND_GRAPH_ELEMENT_LIVE_TIME;

const MIN_INTEGER_VALUE = -2_147_483_648;
const MAX_INTEGER_VALUE = 2_147_483_647;

const parameters = ["parameter_1", "parameter_2"];

const wsUrl = "ws://localhost:25000/java-backend-1.0-SNAPSHOT/ws/random-numbers"; // dev
// const wsUrl = "ws/random-numbers"; // prod

const HomePage = observer(() => {
    const [parameter, setParameter] = useState(parameters[0]);
    // в dt спаршенное в int из UTC-string, пришедшей с бэка (хоть и есть приведения типов)
    const values = dataStore.generatedData.get(parameter) || []; // todo: так ли нужны эти геттеры?

    const ws = useRef(null);

    // const cleaningTimerId = useRef(null);

    useEffect(() => {
        console.log("РЕНДЕР")

        ws.current = webSocketStore.getWebSocket(parameter);
        if (!ws.current) {
            ws.current = webSocketStore.openWebSocket(parameter, wsUrl);

            const handleMessage = (message) => {
                // wa: грубо
                if (Object.keys(message).length === 3 && message.id && message.dt && message.value) {
                    message.dt = Date.parse(message.dt);
                    dataStore.pushGeneratedData(parameter, message)
                }
            };

            webSocketStore.registerMessageHandler(parameter, handleMessage);
        }

        /* обработчики сохраняют (замораживают) состояние ? */

        let cleaningTimerId = null;
        const startCleaning = () => {
            const cleanOnce = () => {
                parameters.forEach((parameter) => {
                    dataStore.cleanupGeneratedData(parameter, TABLE_AND_GRAPH_ELEMENT_LIVE_TIME);
                })
            }
            cleanOnce();
            cleaningTimerId = setInterval(cleanOnce, TABLE_AND_GRAPH_CHECK_UP_TIME);
        }
        startCleaning();

        return () => {
            if (cleaningTimerId) clearInterval(cleaningTimerId);
        }
    }, [parameter])

    // ------------
    const [minValue, setMinValue] = useState("0");
    const [maxValue, setMaxValue] = useState("99");
    const [frequency, setFrequency] = useState("1000");

    // повторная инициализация функции только при изменении зависимостей
    const isValidInteger = useCallback((number) => {
        return number >= MIN_INTEGER_VALUE && number <= MAX_INTEGER_VALUE;
    }, [])

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

    // ------------
    // храним
    const settingsRef = useRef({ minValue, maxValue, frequency });

    // и меняем без ререндера
    useEffect(() => {
        settingsRef.current = { minValue, maxValue, frequency };
    }, [minValue, maxValue, frequency]);

    useEffect(() => {
        // при первой загрузке:
        // не нашли settings -- ? --> апдейт в сторе -> вынужденный mobx ререндер компонента
        // при второй загрузке:
        // нашли settings -> установили локально

        // значения из стора
        const settings = dataStore.generationSettings[parameter];
        if (settings) {
            setMinValue(settings.minValue || "0");
            setMaxValue(settings.maxValue || "99");
            setFrequency(settings.frequency || "1000");
        } else {
            setMinValue("0");
            setMaxValue("99");
            setFrequency("1000");
        }

        return () => {
            dataStore.updateGenerationSettings(parameter, settingsRef.current);
        };
    }, [parameter]);

    // ------------ note: new feature #1
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // timestamp -> JS Date --...--> result
    const getDateString = (startDate, endDate) => {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        return `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, "0")}${String(startDate.getDate()).padStart(2, "0")}-${String(startDate.getHours()).padStart(2, "0")}${String(startDate.getMinutes()).padStart(2, "0")}` + "_" +
            `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}-${String(endDate.getHours()).padStart(2, "0")}${String(endDate.getMinutes()).padStart(2, "0")}`;
    }

    const downloadJsonData = (data, filename) => {
        let blob = null;
        let url = null;
        let link = null;
        try {
            blob = new Blob([JSON.stringify(data)], {type: "application/json"});
            url = URL.createObjectURL(blob);

            link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.json`;
            link.click();
        } catch (e) {
            console.error(e);
        } finally {
            // link?.remove(); // необходимо, если добавляли в DOM
            URL.revokeObjectURL(url);
        }
    }
    // ------------

    return (
        <>
            <div className={styles.container}>
                {/* --- note */}
                <div className={styles.row} style={{ padding: "0", gap: "0" }}>
                    <div
                        className={styles.column_plug + " " + styles.tab + " " + styles.first_tab}
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
                        className={styles.column_plug + " " + styles.tab + " " + styles.last_tab}
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
                        <div className={styles.row}>
                            <h3>Текущее значение: {<input type="text" disabled value={values[values.length - 1]?.value || "<отсутствует>"}/>}</h3>
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
                        {/* ------------ note: new feature #1 */}
                        <div className={styles.row_plug}>
                            <div className={styles.column_grid}>
                                <label>
                                    <span>start: </span>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            console.log(Date.parse(e.target.value));
                                        }}
                                    />
                                </label>
                                <label>
                                    <span>end: </span>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            console.log(Date.parse(e.target.value));
                                        }}
                                    />
                                </label>
                            </div>

                            <div className={styles.row} style={{borderRadius: "0 0 1rem 1rem"}}>
                                <button style={{width: "100%"}} onClick={() => {
                                    if (startDate > endDate) {
                                        console.log("незагрузка: невалидный ввод даты");
                                        return;
                                    }

                                    if (!values || values.length <= 0) {
                                        console.log("незагрузка: невалидный или пустой список значений (общий)");
                                        return;
                                    }

                                    const sDate = Date.parse(startDate);
                                    const eDate = Date.parse(endDate);

                                    const data = toJS(values).filter((item) => item.dt >= sDate && item.dt <= eDate);

                                    if (!data || data.length <= 0) {
                                        console.log("незагрузка: невалидный или пустой список значений (после выборки)");
                                        return;
                                    }

                                    const filename = getDateString(startDate, endDate);

                                    downloadJsonData(data, filename);
                                }}>download
                                </button>
                            </div>
                        </div>
                        {/* ------------ */}

                        <div className={styles.row_plug}>

                            <LocalTable
                                headers={["dt", "value"]}
                                renderHeaders={(headers) => {
                                    return (
                                        <tr>
                                            <th>date</th>
                                            <th>value</th>
                                        </tr>
                                    );
                                }}
                                data={values}
                                renderData={(item, rowIndex) => {
                                    return (
                                        <tr key={rowIndex}>
                                            <td>{new Date(parseInt(item.dt)).toLocaleString()}</td>
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
                        <Chart data={values.slice(-GRAPH_NUMBER_OF_ELEMENTS)}/>
                    </div>
                </div>
            </div>
        </>
    )
})

export default HomePage;
