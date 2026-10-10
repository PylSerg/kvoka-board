const VIEWPORT_MARGIN = 8;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Returns fixed-position styles for a popup anchored to a toolbar control.
 * The popup keeps its preferred side/orientation when there is room and
 * otherwise moves to the other side or is clamped inside the viewport.
 */
export function getViewportPopupStyle(anchorElement, popupElement, isVertical, gap = 12) {
    if (!anchorElement || !popupElement) return "";

    const anchor = anchorElement.getBoundingClientRect();
    const popup = popupElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = Math.min(
        popup.width,
        Math.max(0, viewportWidth - VIEWPORT_MARGIN * 2),
    );
    const popupHeight = Math.min(
        popup.height,
        Math.max(0, viewportHeight - VIEWPORT_MARGIN * 2),
    );

    let left;
    let top;

    if (isVertical) {
        const rightPosition = anchor.right + gap;
        const leftPosition = anchor.left - popupWidth - gap;

        if (rightPosition + popupWidth <= viewportWidth - VIEWPORT_MARGIN) {
            left = rightPosition;
        } else if (leftPosition >= VIEWPORT_MARGIN) {
            left = leftPosition;
        } else {
            left = (viewportWidth - popupWidth) / 2;
        }

        top = clamp(
            anchor.top,
            VIEWPORT_MARGIN,
            viewportHeight - VIEWPORT_MARGIN - popupHeight,
        );
    } else {
        const belowPosition = anchor.bottom + gap;
        const abovePosition = anchor.top - popupHeight - gap;

        if (belowPosition + popupHeight <= viewportHeight - VIEWPORT_MARGIN) {
            top = belowPosition;
        } else if (abovePosition >= VIEWPORT_MARGIN) {
            top = abovePosition;
        } else {
            top = (viewportHeight - popupHeight) / 2;
        }

        left = clamp(
            anchor.left + (anchor.width - popupWidth) / 2,
            VIEWPORT_MARGIN,
            viewportWidth - VIEWPORT_MARGIN - popupWidth,
        );
    }

    return `position: fixed; left: ${Math.round(left)}px; top: ${Math.round(top)}px;`;
}
