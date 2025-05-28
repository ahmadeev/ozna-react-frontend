import styles from "./Table.module.css"
import {useEffect, useState} from "react";

function LocalTable({ headers, data, renderHeaders=null, renderData=null }) {
    // headers -- ["...", "...", ...]
    // data -- [{...}, {...}, ...]

    const getMaxPage = (data, pageSize) => {
        return Math.max(0, Math.ceil(data.length / pageSize) - 1);
    }

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(getMaxPage(data, pageSize));

    useEffect(() => {
        setCurrentPage(getMaxPage(data, pageSize));
    }, [data, pageSize]);

    return (
        <>
            <table className={styles.table}>
                <thead>
                {
                    renderHeaders ? renderHeaders(headers) : (
                        <tr>
                            {
                                headers.map((header, index) => (
                                    <th key={index}>
                                        {header}
                                    </th>
                                ))
                            }
                        </tr>
                    )
                }
                </thead>
                <tbody>
                {
                    data.slice(pageSize * currentPage, pageSize * (currentPage + 1)).map((item, rowIndex) => (
                        renderData ? renderData(item, rowIndex) : (
                            <tr key={rowIndex}>
                                {
                                    headers.map((header, colIndex) => (
                                        <td key={colIndex}>{item[header]}</td>
                                    ))
                                }
                            </tr>
                        )
                    ))
                }
                {
                    Array(
                        Math.max(0, pageSize - data.slice(pageSize * currentPage, pageSize * (currentPage + 1)).length)
                    )
                        .fill(null)
                        .map((_, index) => (
                            <tr key={index}>
                                <td colSpan={headers.length}>&nbsp;</td>
                            </tr>
                        ))
                }
                </tbody>
            </table>

            <div>
                <button
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage <= 0}
                >
                    &lt;&lt;
                </button>
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 0}
                >
                    &lt;
                </button>
                {currentPage + 1}
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={data.length <= (currentPage + 1) * pageSize}
                >
                    &gt;
                </button>
                <button
                    onClick={() => setCurrentPage(getMaxPage(data, pageSize))}
                    disabled={data.length <= pageSize || data.length <= (currentPage + 1) * pageSize}
                >
                    &gt;&gt;
                </button>
            </div>

            <div>
                <button
                    onClick={() => {
                        const newSize = 10;
                        setPageSize(newSize);
                        setCurrentPage(Math.floor(currentPage * pageSize / newSize));
                    }}
                >
                    10
                </button>
                <button
                    onClick={() => {
                        const newSize = 50;
                        setPageSize(newSize);
                        setCurrentPage(Math.floor(currentPage * pageSize / newSize));
                    }}
                >
                    50
                </button>
                <button
                    onClick={() => {
                        const newSize = 100;
                        setPageSize(newSize);
                        setCurrentPage(Math.floor(currentPage * pageSize / newSize));
                    }}
                >
                    100
                </button>
            </div>
        </>
    )
}

export default LocalTable;
