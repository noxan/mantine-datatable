import type { ReactNode } from 'react';
import type { DataTableSortStatus } from './DataTableSortStatus';

export type DataTableSortProps =
  | {
      sortStatus?: never;
      onSortStatusChange?: never;
      sortIcons?: never;
    }
  | {
      /**
       * Current sort status (sort column accessor & direction).
       */
      sortStatus: DataTableSortStatus;

      /**
       * Callback fired after change of sort status.
       * Receives the new sort status as argument.
       */
      onSortStatusChange?: (sortStatus: DataTableSortStatus) => void;

      /**
       * Custom sort icons.
       */
      sortIcons?: {
        /**
         * Icon to display when column is sorted ascending.
         * Will be rotated 180deg for descending sort
         */
        sorted: ReactNode;
        /**
         * Icon to display when column is not sorted.
         */
        unsorted: ReactNode;
      };
    };
