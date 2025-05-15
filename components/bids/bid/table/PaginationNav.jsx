import React, {useCallback} from 'react';
import ButtonTable from "@/components/bids/bid/table/ButtonTable";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";

function PaginationNav({
                           gotoPage,
                           canPreviousPage,
                           canNextPage,
                           pageCount,
                           pageIndex,
                       }) {
    const renderPageLinks = useCallback(() => {
        if (pageCount === 0) return null;
        const visiblePageButtonCount = 3;
        let numberOfButtons =
            pageCount < visiblePageButtonCount ? pageCount : visiblePageButtonCount;
        const pageIndices = [pageIndex];
        numberOfButtons--;
        [...Array(numberOfButtons)].forEach((_item, itemIndex) => {
            const pageNumberBefore = pageIndices[0] - 1;
            const pageNumberAfter = pageIndices[pageIndices.length - 1] + 1;
            if (
                pageNumberBefore >= 0 &&
                (itemIndex < numberOfButtons / 2 || pageNumberAfter > pageCount - 1)
            ) {
                pageIndices.unshift(pageNumberBefore);
            } else {
                pageIndices.push(pageNumberAfter);
            }
        });
        return pageIndices.map((pageIndexToMap) => (
            <li key={pageIndexToMap}>
                <ButtonTable
                    content={pageIndexToMap + 1}
                    onClick={() => gotoPage(pageIndexToMap)}
                    active={pageIndex === pageIndexToMap}
                />
            </li>
        ));
    }, [pageCount, pageIndex]);

    return (
        <ul className="flex gap-2">
            <li>
                <ButtonTable
                    content={
                        <div className="flex ml-1">
                            <FaChevronLeft size="0.6rem"/>
                            <FaChevronLeft size="0.6rem" className="-translate-x-1/2"/>
                        </div>
                    }
                    onClick={() => gotoPage(0)}
                    disabled={!canPreviousPage}
                />
            </li>
            {renderPageLinks()}
            <li>
                <ButtonTable
                    content={
                        <div className="flex ml-1">
                            <FaChevronRight size="0.6rem"/>
                            <FaChevronRight size="0.6rem" className="-translate-x-1/2"/>
                        </div>
                    }
                    onClick={() => gotoPage(pageCount - 1)}
                    disabled={!canNextPage}
                />
            </li>
        </ul>
    );
}

export default PaginationNav;