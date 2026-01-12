import { supabase } from "../lib/supabaseClient";

export async function fetchVoyages() {
    const { data, error } = await supabase
        .from("voyages")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching voyages:", error);
        return [];
    }

    // Mapper les noms de colonnes DB (snake_case) vers camelCase pour l'app
    return data.map(v => ({
        id: v.id,
        name: v.name,
        country: v.country,
        cityCode: v.city_code,
        lat: v.lat,
        lng: v.lng,
        shortDescription: v.short_description,
        imageUrl: v.image_url,
        // Champs dynamiques non stockés en base (calculés à la volée dans le composant)
        whatToSee: [],
        bestMonths: [],
        flightPrices: null
    }));
}

export async function addVoyage(place) {
    const { data, error } = await supabase
        .from("voyages")
        .insert([{
            name: place.name,
            country: place.country,
            city_code: place.cityCode,
            lat: place.lat,
            lng: place.lng,
            short_description: place.shortDescription,
            image_url: place.imageUrl
        }])
        .select()
        .single();

    if (error) {
        console.error("Error adding voyage:", error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        country: data.country,
        cityCode: data.city_code,
        lat: data.lat,
        lng: data.lng,
        shortDescription: data.short_description,
        imageUrl: data.image_url,
        whatToSee: [],
        bestMonths: [],
        flightPrices: null
    };
}

export async function deleteVoyage(id) {
    const { error } = await supabase
        .from("voyages")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting voyage:", error);
        return false;
    }
    return true;
}
