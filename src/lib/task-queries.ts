export function nextCursor(page: { nextCursor: string | null }) {
    return page.nextCursor ?? undefined;
}