"use client"
import React, {useMemo} from 'react';
import {
    useTable,
    useGlobalFilter,
    useSortBy,
    usePagination,
} from "react-table";
import GlobalSearchFilter from "@/components/bids/bid/table/GlobalSearchFilter";
import SelectMenu from "@/components/bids/bid/table/SelectMenu";
import TableComponent from "@/components/bids/bid/table/TableComponent";
import PaginationNav from "@/components/bids/bid/table/PaginationNav";


function Table({data, getColumns}) {
    const columns = useMemo(getColumns, []);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        state,
        setGlobalFilter,
        page: rows,
        canPreviousPage,
        canNextPage,
        pageCount,
        gotoPage,
        setPageSize,
        state: {pageIndex, pageSize},
    } = useTable(
        {
            columns,
            data,
            initialState: {pageSize: 5},
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <div className="flex flex-col gap-4 p-2">
            <div className="flex flex-col sm:flex-row justify-between gap-2">
                <GlobalSearchFilter
                    className="sm:w-64"
                    globalFilter={state.globalFilter}
                    setGlobalFilter={setGlobalFilter}
                />
                <SelectMenu
                    className="sm:w-64"
                    value={pageSize}
                    setValue={setPageSize}
                    options={[
                        {id: 5, caption: "5 éléments par page"},
                        {id: 10, caption: "10 éléments par page"},
                        {id: 20, caption: "20 éléments par page"},
                    ]}
                />
            </div>
            <div className="flex justify-center ">
                <TableComponent
                    getTableProps={getTableProps}
                    headerGroups={headerGroups}
                    getTableBodyProps={getTableBodyProps}
                    rows={rows}
                    prepareRow={prepareRow}
                />
            </div>
            <div className="flex justify-center">
                <PaginationNav
                    gotoPage={gotoPage}
                    canPreviousPage={canPreviousPage}
                    canNextPage={canNextPage}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                />
            </div>
        </div>

    );
}

export default Table;