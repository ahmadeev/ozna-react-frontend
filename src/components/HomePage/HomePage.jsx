import styles from "./HomePage.module.css"
import {useEffect, useRef, useState} from "react";

function HomePage() {

    const [data, setData] = useState({});

    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:25000/java-backend-1.0-SNAPSHOT/ws/random-numbers");
    }, [])


    useEffect(() => {
        ws.current.onopen = (e) => {}
        ws.current.onmessage = (e) => {
            setData(JSON.parse(e.data));
        }
        ws.current.onerror = (e) => {}
        ws.current.onclose = (e) => {}
    },[])

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
                            <h3>Текущее значение: {data.value}</h3>
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
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Значение</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>
                                        {data.dt}
                                    </td>
                                    <td>
                                        {data.value}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
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
