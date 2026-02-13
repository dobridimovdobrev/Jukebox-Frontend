import { useState, useRef, useCallback } from "react";

/**
 * Reusable infinite scroll hook using IntersectionObserver.
 *
 * @param {Object} options
 * @param {number} options.itemsPerPage - Items to load per batch (default 20)
 * @param {number} options.totalItems - Total filtered items available
 * @param {number} options.delay - Loading delay in ms (default 300)
 * @returns {Object}
 *   - displayCount: number of items to show (use with .slice(0, displayCount))
 *   - loadingMore: boolean, true while loading next batch
 *   - hasMore: boolean, true if more items exist
 *   - loadMoreRef: callback ref to attach to the last visible row
 *   - resetDisplayCount: call when filters change to reset pagination
 */

const useInfiniteScroll = ({ itemsPerPage = 30, totalItems, delay = 300 }) => {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef();

  const hasMore = displayCount < totalItems;

  const loadMoreRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && displayCount < totalItems) {
          setLoadingMore(true);
          setTimeout(() => {
            setDisplayCount((prev) => prev + itemsPerPage);
            setLoadingMore(false);
          }, delay);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, displayCount, totalItems, itemsPerPage, delay]
  );

  const resetDisplayCount = useCallback(() => {
    setDisplayCount(itemsPerPage);
  }, [itemsPerPage]);

  return { displayCount, loadingMore, hasMore, loadMoreRef, resetDisplayCount };
};

export default useInfiniteScroll;
