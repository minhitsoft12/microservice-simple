export interface registerDto {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface loginDto {
    email: string;
    password: string;
}

export interface resetPasswordDto {
    password: string;
    verificationCode: string;
}
