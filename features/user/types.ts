export interface User {
    aud?: string;
    created_at: string;
    email: string;
    email_change_confirm_status: number;
    id: string;
    last_sign_in_at: string;
    phone: string;
    role: string;
    updated_at: string;
    app_metadata?: any;
    user_metadata?: any;
}
