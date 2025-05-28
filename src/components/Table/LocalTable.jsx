import styles from "./Table.module.css"
import {useEffect, useMemo, useState} from "react";

function LocalTable({ headers, data, renderHeaders=null, renderData=null, renderEmpty=false }) {
    // headers -- ["...", "...", ...]
    // data -- [{...}, {...}, ...]

    const rowsOnPage = [10, 25, 50]

    const [pageSize, setPageSize] = useState(10);

    // исправления ошибок ререндеров с useMemo()
    const lastPage = useMemo(() => {
        return Math.max(0, Math.ceil(data.length / pageSize) - 1);
    }, [data.length, pageSize]);

    const [currentPage, setCurrentPage] = useState(lastPage);

    useEffect(() => {
        setCurrentPage(lastPage);
    }, [lastPage]);

    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    return (
        <>
            <div className={styles.table_wrapper}>
                <div>
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
                            paginatedData.length > 0 ? paginatedData.map((item, rowIndex) => (
                                renderData ? renderData(item, rowIndex) : (
                                    <tr key={rowIndex}>
                                        {
                                            headers.map((header, colIndex) => (
                                                <td key={colIndex}>{item[header]}</td>
                                            ))
                                        }
                                    </tr>
                                )
                            )) : (
                                <tr>
                                    <td colSpan={2}>Данные отсутствуют</td>
                                </tr>
                            )
                        }
                        {
                            renderEmpty && Array(
                                Math.max(0, pageSize - paginatedData.length)
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
                </div>

                <div className={styles.row}>
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
                        disabled={currentPage === lastPage}
                    >
                        &gt;
                    </button>
                    <button
                        onClick={() => setCurrentPage(lastPage)}
                        disabled={currentPage === lastPage}
                    >
                        &gt;&gt;
                    </button>
                </div>

                <div className={styles.row}>
                    <button
                        onClick={() => {
                            const newSize = rowsOnPage[0];
                            setPageSize(newSize);
                            setCurrentPage(Math.floor(currentPage * pageSize / newSize));
                        }}
                    >
                        {rowsOnPage[0]}
                    </button>
                    <button
                        onClick={() => {
                            const newSize = rowsOnPage[1];
                            setPageSize(newSize);
                            setCurrentPage(Math.floor(currentPage * pageSize / newSize));
                        }}
                    >
                        {rowsOnPage[1]}
                    </button>
                    <button
                        onClick={() => {
                            const newSize = rowsOnPage[2];
                            setPageSize(newSize);
                            setCurrentPage(Math.floor(currentPage * pageSize / newSize));
                        }}
                    >
                        {rowsOnPage[2]}
                    </button>
                </div>
            </div>
        </>
    )
}

export default LocalTable;
