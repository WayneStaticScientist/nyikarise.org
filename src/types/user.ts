export interface Experience {
    name: string;
    rating: number;
    category: string;
}
export interface Proffesion {
    title: string;
    description: string;
}
export interface Device {
    accessToken: string;
    refreshToken: string;
    deviceId: string;
    ipAddress: string;
    deviceName: string;
    os: string;
    browser: string;
    lastActive: string;
    location?: string;
}
export interface Avatar {
    media: string;
    cache: string;
    cloud: string;
}
export interface IUser {
    dob: string;
    identityStatus: "pending" | "verified" | "rejected" | "not-submitted";
    devices: Device[];
    email: string;
    admin: number;
    avatar: Avatar;
    fullName: string;
    idNumber: string;
    chatToken: string;
    phoneNumber: string;
    permissions: number;
    experiences: Experience[];
    twoFactorEnabled: boolean;
    identityVerified: boolean;
    currentProffesion: Proffesion;
    bio?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    coverImage?: Avatar;
    birthName?: string;
    birthId?: string;
    version: "v1" | "v2";
    residentAddress?: string;
    stringPermissions: string[];
    userIdDocumentAvatar?: Avatar;
    userProofOfResidenceAvatar?: Avatar;
}

export interface LocalUser extends IUser {
    password: string;
}
