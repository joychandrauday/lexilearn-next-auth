// src/services/wordService.ts
import axios from "axios";
import { IWord } from "../lib/models/Word";
import { useQuery } from "@tanstack/react-query";


// ---- Pure API call ----
export const getAllWords = async (): Promise<IWord[]> => {
    const response = await axios.get("/api/words");
    return response.data;
};

// ---- TanStack Query Hook ----
export const useWordsQuery = () => {
    return useQuery<IWord[]>({
        queryKey: ["words"],
        queryFn: getAllWords,
    });
};
export async function getWords(): Promise<IWord[] | null> {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/words`, {
            // Ensure SSR-compatible fetch
            headers: { 'Cache-Control': 'no-store' },
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching words:', error);
        return null;
    }
}