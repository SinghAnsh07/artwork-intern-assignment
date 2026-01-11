export interface Artwork {
    id: number;
    title: string;
    place_of_origin: string | null;
    artist_display: string | null;
    inscriptions: string | null;
    date_start: number | null;
    date_end: number | null;
}

export interface ApiResponse {
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
    };
    data: Artwork[];
}

// using sets for O(1) lookup when checking selection state
export interface SelectionState {
    selectedIds: Set<number>;
    deselectedIds: Set<number>;
}
