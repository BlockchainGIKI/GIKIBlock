import React, { useEffect, useState } from "react";
import TransactionHistory from "../Performance-Metric/PerformanceMetricData";
import './DynamicTable.styles.css';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { selectAccount } from "../../accountSlice";
import { selectChange } from "../../changeSlice";
import { setChange } from "../../changeSlice";

const DynamicTable = () => {
    // get table column
    var column;
    var actualValue = {};
    var tableData = [];
    // Get table headers in array
    const [col, setColumn] = useState([]);
    const account = useSelector(selectAccount);
    const change = useSelector(selectChange);
    const dispatch = useDispatch();
    // Fetch table headers on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = { account: account };
                const response = await axios.get('http://10.1.33.124:8000/get-latency-data', { params });
                // console.log("Crank Gameplayes: ", response.data);
                // Assuming your response.data is an array of column names
                setColumn(response.data);
                console.log('Chnage: ', change);
                dispatch(setChange(false));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [account, change]);
    column = Object.keys(TransactionHistory[0]);
    // Object.assign(actualValue, TransactionHistory);
    if (col.length > 0) {
        column = Object.keys(col[0]);
        Object.assign(actualValue, col);
        tableData = Object.values(actualValue);
    }
    else {
        tableData = [];
    }
    // console.log("Table data", tableData);
    // get table heading data
    const ThData = () => {
        return column.map((data) => {
            return <th key={data}>{data}</th>
        })
    }

    // get table row data
    const tdData = () => {
        return tableData.map((data) => {
            return (
                <tr>
                    {
                        column.map((v) => {
                            return <td>{data[v]}</td>
                        })
                    }
                </tr>
            )
        })
    }

    async function downloadFile() {
        try {
            const params = { account: account };
            const response = await axios.get('http://10.1.33.124:8000/send-user-metric-csv', {
                params,
                responseType: 'blob',
            });
            // Create a Blob from the response data
            const blob = new Blob([response.data], { type: 'text/csv' });
            // Create a link element and set its attributes
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'downloaded-file.csv';
            // Append the link to the document and trigger the click event
            document.body.appendChild(link);
            link.click();
            // Remove the link from the document
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <div className="card-Dynamic">
            <h4> Performance metric table </h4>
            <table>
                <thead>
                    <tr>{ThData()}</tr>
                </thead>
                <tbody>
                    {tdData()}
                </tbody>
            </table>
            <button className="download-button" onClick={downloadFile}> Download Data </button>
        </div>
    )
}

export default DynamicTable;
