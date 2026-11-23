export const sortViewSortsByCreation = <
  TViewSort extends { id: string; createdAt: Date | string },
>(
  viewSorts: TViewSort[],
): TViewSort[] =>
  [...viewSorts].sort(
    (firstViewSort, secondViewSort) =>
      new Date(firstViewSort.createdAt).getTime() -
        new Date(secondViewSort.createdAt).getTime() ||
      firstViewSort.id.localeCompare(secondViewSort.id),
  );
