import React from 'react';
import {FaSortDown, FaSortUp} from "react-icons/fa";

function TableComponent({
                            getTableProps, headerGroups, getTableBodyProps, rows, prepareRow,
                        }) {

    return (<div className=" rounded-xl border border-amber-500 overflow-auto">
        <table {...getTableProps()}
               className="w-full text-center  ">
            <thead className="">
            {headerGroups.map((headerGroup) => (<tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (<th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-1 pt-4 pb-4 text-[16px] text-nowrap font-bold  cursor-pointer"
                    style={{width: column.width}}
                >
                    <div className="flex items-center justify-center">
                        <div className="text-gray-600 pr-1">
                            {column.render("Header")}
                        </div>
                        <div className="flex gap-1 flex-col">
                            <FaSortUp
                                className={`text-sm translate-y-1/2 ${column.isSorted && !column.isSortedDesc ? "text-red-400" : "text-gray-300"}`}
                            />
                            <FaSortDown
                                className={`text-sm -translate-y-1/2 ${column.isSortedDesc ? "text-red-400" : "text-gray-300"}`}
                            />

                        </div>
                    </div>
                </th>))}
            </tr>))}
            </thead>
            <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
                prepareRow(row);
                return (<tr {...row.getRowProps()}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-amber-50"}  hover:bg-gray-100`}>
                    {row.cells.map((cell) => {
                        return (<td
                            {...cell.getCellProps()}
                            className="p-3 text-sm font-normal text-gray-700 "
                        >
                            {cell.render("Cell")}
                        </td>);
                    })}
                </tr>);
            })}
            </tbody>
        </table>
    </div>);
}

export default TableComponent;