import React from 'react';
import {usePagination, useTable} from 'react-table';
const Table = ({columns, data, size=5}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        pageCount,
        gotoPage,
        state: {pageIndex},
    } = useTable(
        {
            columns,
            data,
            initialState: {pageIndex: 0, pageSize: size},
        },
        usePagination
    );

    return (
        <div className="overflow-x-auto">

            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                <thead>
                {headerGroups.map((headerGroup) => {
                    const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                        <tr key={key} {...restHeaderGroupProps}>
                            {headerGroup.headers.map((column) => {
                                const { key, ...restColumnProps } = column.getHeaderProps();
                                return (
                                    <th
                                        key={key}
                                        {...restColumnProps}
                                        className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                                    >
                                        {column.render('Header')}
                                    </th>
                                );
                            })}
                        </tr>
                    );
                })}
                </thead>
                <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
                {page.map((row) => {
                    prepareRow(row);
                    const { key, ...restRowProps } = row.getRowProps();
                    return (
                        <tr key={key} {...restRowProps} className="hover:bg-gray-100">
                            {row.cells.map((cell) => {
                                const { key, ...restCellProps } = cell.getCellProps();
                                return (
                                    <td
                                        key={key}
                                        {...restCellProps}
                                        className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800"
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Move the pagination inside the same container */}
            <nav aria-label="Page navigation example" className="flex justify-center mt-2 mb-2 min-w-full">
                <div className="w-full">
                    <ul className="flex items-center flex-nowrap md:justify-center -space-x-px h-10 text-base">
                        {/* Previous Button */}
                        <li>
                            <button
                                onClick={() => gotoPage(pageIndex - 1)}
                                disabled={pageIndex === 0}
                                className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
                                </svg>
                            </button>
                        </li>

                        {/* First Page */}
                        <li>
                            <button
                                onClick={() => gotoPage(0)}
                                className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 ${
                                    pageIndex === 0 ? 'text-white bg-blue-600' : 'hover:bg-gray-100 bg-white hover:text-gray-700'
                                }`}
                            >
                                1
                            </button>
                        </li>

                        {/* Dots if there's a gap */}
                        {pageIndex > 4 && (
                            <li className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 bg-white">...</li>
                        )}

                        {/* Pages around the current page */}
                        {Array.from({ length: 5 }, (_, i) => pageIndex - 2 + i)
                            .filter(i => i > 0 && i < pageCount - 1) // Exclude first & last pages
                            .map(i => (
                                <li key={i}>
                                    <button
                                        onClick={() => gotoPage(i)}
                                        className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 ${
                                            pageIndex === i ? 'text-white bg-blue-600' : 'hover:bg-gray-100 bg-white hover:text-gray-700'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}

                        {/* Dots if there's a gap */}
                        {pageIndex < pageCount - 5 && (
                            <li className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 bg-white">...</li>
                        )}

                        {/* Last Page */}
                        {pageCount > 1 && (
                            <li>
                                <button
                                    onClick={() => gotoPage(pageCount - 1)}
                                    className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 ${
                                        pageIndex === pageCount - 1 ? 'text-white bg-blue-600' : 'hover:bg-gray-100 bg-white hover:text-gray-700'
                                    }`}
                                >
                                    {pageCount}
                                </button>
                            </li>
                        )}

                        {/* Next Button */}
                        <li>
                            <button
                                onClick={() => gotoPage(pageIndex + 1)}
                                disabled={pageIndex === pageCount - 1}
                                className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                            >
                                <span className="sr-only">Next</span>
                                <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                </svg>
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>

    );
};

export default Table;
