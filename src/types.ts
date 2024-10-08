
export interface Teacher {
    id: string;
    gender: string;
    title: string;
    full_name: string;
    city: string;
    state: string | null;
    country: string;
    postcode: number | null;
    coordinates: {
        latitude: string ;
        longitude: string ;
    } | null;
    timezone:{
        offset: string;
        description: string;
    } | null;
    email: string;
    b_date: string;
    age: number | null;
    phone: string;
    picture_large: string | null;
    picture_thumbnail: string | null;
    favorite: boolean;
    course: string;
    bg_color: string;
    note: string | null;  
}

export interface Validation {
    valid: boolean;
    errors: string[];
}