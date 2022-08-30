import { Box, createStyles, Table } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { differenceBy, get, lowerCase, throttle, uniqBy, upperFirst } from 'lodash';
import { Key, useEffect, useState } from 'react';
import { DataTableProps } from './DataTable.props';
import DataTableEmpty from './DataTableEmpty';
import DataTableFooter from './DataTableFooter';
import DataTableHeader from './DataTableHeader';
import DataTableLoader from './DataTableLoader';
import DataTableRow from './DataTableRow';
import DataTableRowMenu from './DataTableRowMenu';
import DataTableRowMenuItem from './DataTableRowMenuItem';
import DataTableScrollArea from './DataTableScrollArea';

const useStyles = createStyles((theme) => {
  const border = `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`;
  return {
    root: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      tr: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      },
    },
    browserSelectionDisabled: {
      userSelect: 'none',
    },
    tableWithBorder: {
      border,
    },
    tableWithColumnBorders: {
      'th, td': {
        ':not(:first-of-type)': {
          borderLeft: border,
        },
      },
    },
    verticalAlignmentTop: {
      td: {
        verticalAlign: 'top',
      },
    },
    verticalAlignmentBottom: {
      td: {
        verticalAlign: 'bottom',
      },
    },
  };
});

export default function DataTable<T extends Record<string, unknown>>({
  withBorder,
  borderRadius,
  withColumnBorders,
  height = '100%',
  minHeight,
  verticalAlignment = 'center',
  fetching,
  columns,
  idAccessor = 'id',
  records,
  selectedRecords,
  onSelectedRecordsChange,
  sortStatus,
  onSortStatusChange,
  horizontalSpacing,
  page,
  onPageChange,
  totalRecords,
  recordsPerPage,
  paginationSize = 'sm',
  loaderSize,
  loaderVariant,
  loaderBackgroundBlur,
  noRecordsText = 'No records',
  striped,
  onRowClick,
  rowContextMenu,
  ...otherProps
}: DataTableProps<T>) {
  const {
    ref: scrollViewportRef,
    width: scrollViewportWidth,
    height: scrollViewportHeight,
  } = useElementSize<HTMLDivElement>();
  const { ref: headerRef, height: headerHeight } = useElementSize<HTMLTableSectionElement>();
  const { ref: tableRef, width: tableWidth, height: tableHeight } = useElementSize<HTMLTableElement>();
  const { ref: footerRef, height: footerHeight } = useElementSize<HTMLDivElement>();

  const [scrolledToTop, setScrolledToTop] = useState(true);
  const [scrolledToBottom, setScrolledToBottom] = useState(true);
  const [scrolledToLeft, setScrolledToLeft] = useState(true);
  const [scrolledToRight, setScrolledToRight] = useState(true);

  const [contextMenuInfo, setContextMenuInfo] = useState<{ top: number; left: number; record: T } | null>(null);
  useEffect(() => {
    if (fetching) setContextMenuInfo(null);
  }, [fetching]);

  const onScrollPositionChange = () => {
    if (!fetching) setContextMenuInfo(null);

    if (fetching || tableHeight <= scrollViewportHeight) {
      setScrolledToTop(true);
      setScrolledToBottom(true);
    } else {
      const scrollTop = scrollViewportRef.current.scrollTop;
      setScrolledToTop(scrollTop === 0);
      setScrolledToBottom(Math.round(tableHeight - scrollTop) === Math.round(scrollViewportHeight));
    }

    if (fetching || tableWidth === scrollViewportWidth) {
      setScrolledToLeft(true);
      setScrolledToRight(true);
    } else {
      const scrollLeft = scrollViewportRef.current.scrollLeft;
      setScrolledToLeft(scrollLeft === 0);
      setScrolledToRight(Math.round(tableWidth - scrollLeft) === Math.round(scrollViewportWidth));
    }
  };

  useEffect(onScrollPositionChange, [
    fetching,
    scrollViewportHeight,
    scrollViewportRef,
    scrollViewportWidth,
    tableHeight,
    tableWidth,
  ]);

  const onScrollPositionChangeThrottled = throttle(onScrollPositionChange, 200, { leading: true, trailing: true });

  const handlePageChange = (page: number) => {
    scrollViewportRef.current.scrollTo({ top: 0, left: 0 });
    onPageChange!(page);
  };

  const recordsLength = records?.length;
  const recordIds = records?.map((record) => get(record, idAccessor));
  const selectedRecordIds = selectedRecords?.map((record) => get(record, idAccessor));
  const hasRecordsAndSelectedRecords =
    recordIds !== undefined && selectedRecordIds !== undefined && selectedRecordIds.length > 0;
  const allRecordsSelected = hasRecordsAndSelectedRecords && recordIds.every((id) => selectedRecordIds.includes(id));
  const someRecordsSelected = hasRecordsAndSelectedRecords && recordIds.some((id) => selectedRecordIds.includes(id));

  const [lastSelectionChangeIndex, setLastSelectionChangeIndex] = useState<number | null>(null);

  const recordIdsString = recordIds?.join(':') || '';
  useEffect(() => {
    setLastSelectionChangeIndex(null);
  }, [recordIdsString]);

  const selectionVisibleAndNotScrolledToLeft = !!selectedRecords && !scrolledToLeft;

  const { cx, classes } = useStyles();

  return (
    <Box
      className={cx(classes.root, { [classes.tableWithBorder]: withBorder })}
      sx={(theme) => ({
        borderRadius: borderRadius
          ? typeof borderRadius === 'string'
            ? theme.radius[borderRadius]
            : borderRadius
          : undefined,
        height,
        minHeight,
      })}
    >
      <DataTableScrollArea
        ref={scrollViewportRef}
        leftShadowVisible={!(selectedRecords || scrolledToLeft)}
        rightShadowVisible={!scrolledToRight}
        bottomShadowVisible={!scrolledToBottom}
        headerHeight={headerHeight}
        onScrollPositionChange={onScrollPositionChangeThrottled}
      >
        <Table
          ref={tableRef}
          horizontalSpacing={horizontalSpacing}
          className={cx({
            [classes.browserSelectionDisabled]: onRowClick || selectedRecords,
            [classes.tableWithColumnBorders]: withColumnBorders,
            [classes.verticalAlignmentTop]: verticalAlignment === 'top',
            [classes.verticalAlignmentBottom]: verticalAlignment === 'bottom',
          })}
          striped={recordsLength ? striped : false}
          {...otherProps}
        >
          <DataTableHeader<T>
            ref={headerRef}
            columns={columns}
            sortStatus={sortStatus}
            onSortStatusChange={onSortStatusChange}
            selectionVisible={!!selectedRecords}
            selectionChecked={allRecordsSelected}
            selectionIndeterminate={someRecordsSelected && !allRecordsSelected}
            onSelectionChange={
              onSelectedRecordsChange
                ? () => {
                    onSelectedRecordsChange(
                      allRecordsSelected
                        ? selectedRecords.filter((record) => !recordIds.includes(get(record, idAccessor)))
                        : uniqBy([...selectedRecords, ...records!], (record) => get(record, idAccessor))
                    );
                  }
                : undefined
            }
            leftShadowVisible={selectionVisibleAndNotScrolledToLeft}
            bottomShadowVisible={!scrolledToTop}
          />
          <tbody>
            {recordsLength ? (
              records.map((record, recordIndex) => {
                const recordId = get(record, idAccessor);
                const selected = selectedRecordIds?.includes(recordId) || false;
                return (
                  <DataTableRow<T>
                    key={recordId as Key}
                    record={record}
                    columns={columns}
                    selectionVisible={!!selectedRecords}
                    selectionChecked={selected}
                    onSelectionChange={
                      onSelectedRecordsChange
                        ? (e) => {
                            if ((e.nativeEvent as PointerEvent).shiftKey && lastSelectionChangeIndex !== null) {
                              const recordsInterval = records.filter(
                                recordIndex > lastSelectionChangeIndex
                                  ? (_, index) => index >= lastSelectionChangeIndex && index <= recordIndex
                                  : (_, index) => index >= recordIndex && index <= lastSelectionChangeIndex
                              );
                              onSelectedRecordsChange(
                                selected
                                  ? differenceBy(selectedRecords, recordsInterval, (r) => get(r, idAccessor))
                                  : uniqBy([...selectedRecords, ...recordsInterval], (r) => get(r, idAccessor))
                              );
                            } else {
                              onSelectedRecordsChange(
                                selected
                                  ? selectedRecords.filter((record) => get(record, idAccessor) !== recordId)
                                  : uniqBy([...selectedRecords, record], (record) => get(record, idAccessor))
                              );
                            }
                            setLastSelectionChangeIndex(recordIndex);
                          }
                        : undefined
                    }
                    onClick={onRowClick}
                    onContextMenu={
                      rowContextMenu &&
                      !(typeof rowContextMenu.disabled === 'function'
                        ? rowContextMenu.disabled(record)
                        : rowContextMenu.disabled)
                        ? setContextMenuInfo
                        : undefined
                    }
                    contextMenuVisible={contextMenuInfo ? get(contextMenuInfo.record, idAccessor) === recordId : false}
                    leftShadowVisible={selectionVisibleAndNotScrolledToLeft}
                  />
                );
              })
            ) : (
              <tr>
                <td></td>
              </tr>
            )}
          </tbody>
        </Table>
      </DataTableScrollArea>
      {page && (
        <DataTableFooter
          ref={footerRef}
          horizontalSpacing={horizontalSpacing}
          fetching={fetching}
          page={page}
          onPageChange={handlePageChange}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
          paginationSize={paginationSize}
          recordsLength={recordsLength}
        />
      )}
      <DataTableLoader
        pt={headerHeight}
        pb={footerHeight}
        fetching={fetching}
        loaderBackgroundBlur={loaderBackgroundBlur}
        loaderSize={loaderSize}
        loaderVariant={loaderVariant}
      />
      <DataTableEmpty pt={headerHeight} pb={footerHeight} text={noRecordsText} active={!fetching && !recordsLength} />
      {rowContextMenu && contextMenuInfo && (
        <DataTableRowMenu
          top={contextMenuInfo.top}
          left={contextMenuInfo.left}
          onDestroy={() => setContextMenuInfo(null)}
        >
          {rowContextMenu.items.map(({ key, title, icon, color, hidden, disabled, onClick }) => {
            const { record } = contextMenuInfo;
            if (typeof hidden === 'function' ? hidden(record) : hidden) return null;
            const titleValue = title
              ? typeof title === 'function'
                ? title(record)
                : title
              : upperFirst(lowerCase(key));
            return (
              <DataTableRowMenuItem
                key={key}
                title={titleValue}
                icon={typeof icon === 'function' ? icon(record) : icon}
                color={typeof color === 'function' ? color(record) : color}
                disabled={typeof disabled === 'function' ? disabled(record) : disabled}
                onClick={() => {
                  setContextMenuInfo(null);
                  onClick(record);
                }}
              />
            );
          })}
        </DataTableRowMenu>
      )}
    </Box>
  );
}
