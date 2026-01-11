import type { ApiResponse } from '../types/artwork';

const API_BASE_URL = 'https://api.artic.edu/api/v1/artworks';

export const fetchArtworks = async (page: number = 1): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}?page=${page}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};
