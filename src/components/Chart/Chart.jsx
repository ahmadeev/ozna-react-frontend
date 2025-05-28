import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const Chart = ({ data }) => {
    // { value, dt, formattedTime }
    const chartData = data.map(item => ({
        ...item,
        formattedTime: formatDate(item.dt)
    }));

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="dt"
                        tickFormatter={formatDate}
                        label={{ value: 'Время', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis
                        label={{ value: 'Значение', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        formatter={(value) => [value, 'Значение']}
                        labelFormatter={(dt) => `Время: ${formatDate(dt)}`}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="Значение"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;
