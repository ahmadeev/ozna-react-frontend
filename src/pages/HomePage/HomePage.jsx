import styles from "./HomePage.module.css"
import {useEffect, useRef, useState} from "react";
import LocalTable from "../../components/Table/LocalTable.jsx";
import Chart from "../../components/Chart/Chart.jsx";

function HomePage() {

    const parameters = ["parameter_1", "parameter_2"];
    const [parameter, setParameter] = useState(parameters[0]);

/*
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
            {"dt": 1395039, "value": 76}
        ]
    }
*/

    const [values, setValues] = useState([]); // note: получать из стора

    // последний полученный ответ (нужен только для одной строки)
    const [data, setData] = useState({});

    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:25000/java-backend-1.0-SNAPSHOT/ws/random-numbers");

        /* обработчики сохраняют (замораживают) состояние ? */

        const handleOpen = (e) => {}

        const handleMessage = (e) => {
            const json = JSON.parse(e.data);
            json.dt = Date.parse(json.dt);
            setData(json);
            setValues(prev => {
                return [ ...prev, json ];
            });
        };

        const handleError = (e) => {}
        const handleClose = (e) => {}

        ws.current.onopen = handleOpen;
        ws.current.onmessage = handleMessage;
        ws.current.onerror = handleError;
        ws.current.onclose = handleClose;

        return () => {
            ws.current.close();
            // note: сохранять в стор
        }
    }, [])

    const [minValue, setMinValue] = useState(0);
    const [isMinValueValid, setIsMinValueValid] = useState(true);

    const [maxValue, setMaxValue] = useState(99);
    const [isMaxValueValid, setIsMaxValueValid] = useState(true);

    const [frequency, setFrequency] = useState(1000);
    const [isFrequencyValid, setIsFrequencyValid] = useState(true);

    useEffect(() => {
        if (minValue > maxValue) {
            setIsMinValueValid(false);
            setIsMaxValueValid(false);
        } else {
            setIsMinValueValid(true);
            setIsMaxValueValid(true);
        }
        if (!frequency.toString().match(/^[1-9]\d*$/)) {
            setIsFrequencyValid(false);
        } else {
            setIsFrequencyValid(true);
        }
    }, [minValue, maxValue, frequency]);

    return (
        <>
            <div className={styles.container}>
                {/* Верхний блок */}
                <div className={styles.row}>
                    {/* Левый блок */}
                    <div className={styles.column}>
                        <div className={styles.row_plug}>
                            <h3>Текущее значение: {data.value || "<отсутствует>"}</h3>
                        </div>

                        <div className={styles.row_plug}>
                            <div className={styles.column}>
                                <label>
                                    min:
                                    <input
                                        type="text"
                                        value={minValue}
                                        placeholder={"min number"}
                                        onChange={(e) => {
                                            setMinValue(parseInt(e.target.value));
                                        }}
                                    />
                                </label>
                                <label>
                                    max:
                                    <input
                                        type="text"
                                        value={maxValue}
                                        placeholder={"max number"}
                                        onChange={(e) => {
                                            setMaxValue(parseInt(e.target.value));
                                        }}
                                    />
                                </label>
                                <label>
                                    frequency:
                                    <input
                                        type="text"
                                        value={frequency}
                                        placeholder={"frequency"}
                                        onChange={(e) => {
                                            setFrequency(parseInt(e.target.value));
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
                                disabled={!(isMinValueValid && isMaxValueValid && isFrequencyValid)}
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
                        <Chart data={values.slice(-50)} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage;
