import styles from "./HomePage.module.css"
import {useEffect, useRef, useState} from "react";
import LocalTable from "../Table/LocalTable.jsx";

function HomePage() {

    const [values, setValues] = useState([]);
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
            // console.log(new Date(Date.parse(json.dt)).toString())
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
        }
    }, [])

    const [minValue, setMinValue] = useState(0);
    const [isMinValueValid, setIsMinValueValid] = useState(false);

    const [maxValue, setMaxValue] = useState(99);
    const [isMaxValueValid, setIsMaxValueValid] = useState(false);

    const [frequency, setFrequency] = useState(1000);
    const [isFrequencyValid, setIsFrequencyValid] = useState(false);

    useEffect(() => {
        if (minValue > maxValue) {
            setIsMinValueValid(false);
            setIsMaxValueValid(false);
        }
        if (!frequency.toString().match(/^[1-9]\d*$/)) {
            setIsFrequencyValid(false);
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
                                        type="number"
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
                                        type="number"
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
                                        id: "meow",
                                        max: maxValue,
                                        min: minValue,
                                        run: true,
                                        frequency: frequency
                                    }));
                                }}
                                disabled={isMinValueValid && isMaxValueValid && isFrequencyValid}
                            >start</button>
                            <button
                                onClick={() => {
                                    ws.current.send(JSON.stringify({
                                        id: "meow",
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

                           {/* <LocalTable
                                headers={["meow", "kiss"]}
                                data={[
                                    {"meow": 1, "kiss": 6},
                                    {"meow": 2, "kiss": 7},
                                    {"meow": 3, "kiss": 8},
                                    {"meow": 4, "kiss": 9},
                                    {"meow": 5, "kiss": 0},
                                    {"meow": 1, "kiss": 6},
                                    {"meow": 2, "kiss": 7},
                                    {"meow": 3, "kiss": 8},
                                    {"meow": 4, "kiss": 9},
                                    {"meow": 5, "kiss": 0},

                                    {"meow": 11, "kiss": 16},
                                    {"meow": 12, "kiss": 17},
                                    {"meow": 13, "kiss": 18},
                                    {"meow": 14, "kiss": 19},
                                    {"meow": 15, "kiss": 20},
                                    {"meow": 11, "kiss": 16},
                                    {"meow": 12, "kiss": 17},
                                    {"meow": 13, "kiss": 18},
                                    {"meow": 14, "kiss": 19},
                                    {"meow": 15, "kiss": 20},

                                    {"meow": 1, "kiss": 6},
                                    {"meow": 2, "kiss": 7},
                                    {"meow": 3, "kiss": 8},
                                    {"meow": 4, "kiss": 9},
                                    {"meow": 5, "kiss": 0},
                                    {"meow": 1, "kiss": 6},
                                    {"meow": 2, "kiss": 7},
                                    {"meow": 3, "kiss": 8},
                                    {"meow": 4, "kiss": 9},
                                    {"meow": 5, "kiss": 0},

                                    {"meow": 11, "kiss": 16},
                                    {"meow": 12, "kiss": 17},
                                    {"meow": 13, "kiss": 18},
                                    {"meow": 14, "kiss": 19},
                                    {"meow": 15, "kiss": 20},
                                    {"meow": 11, "kiss": 16},
                                    {"meow": 12, "kiss": 17},
                                    {"meow": 13, "kiss": 18},
                                    {"meow": 14, "kiss": 19},
                                    {"meow": 15, "kiss": 20},

                                    {"meow": 1, "kiss": 6},
                                    {"meow": 2, "kiss": 7},
                                    {"meow": 3, "kiss": 8},
                                    {"meow": 4, "kiss": 9},
                                    {"meow": 5, "kiss": 0},
                                ]}
                            />*/}

                        </div>
                    </div>
                </div>

                {/* Нижний блок */}
                <div className={styles.row}>
                    <div className={styles.column_plug}>
                        <p>etjwpgewjgpjwhpewojhpowejhew</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage;
