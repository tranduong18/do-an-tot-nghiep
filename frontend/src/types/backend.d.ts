export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        },
        company: {
            id: string;
            name: string;
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    id?: string;
    name?: string;
    address?: string;
    logo?: string;
    description?: string;
    country?: string;
    website?: string;
    industry?: string;
    size?: string;
    model?: string;
    workingTime?: string;
    overtimePolicy?: string;
    benefits?: string;
    tags?: string;


    openJobs?: number;
    rating?: number;
    reviewCount?: number;
    reviewPercent?: number;
    postCount?: number;

    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISkill {
    id?: string;
    name?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}



export interface IUser {
    id?: string;
    name: string;
    email: string;
    password?: string;
    age: number;
    gender: string;
    address: string;
    avatar: string;
    cvUrl: string;
    role?: {
        id: string;
        name: string;
    }

    company?: {
        id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    id?: string;
    name: string;
    skills: ISkill[];

    company?: {
        id: string;
        name: string;
        logo?: string;
        address?: string;
        size?: string;
        country?: string
        workingTime?: string;
        overtimePolicy?: string;
    }

    location: string;
    address: string
    salary: number;
    quantity: number;
    level: string;
    description: string;

    specialization?: string;
    fields?: string;
    workType?: string;

    startDate: Date;
    endDate: Date;
    active: boolean;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IFavoriteItem {
    jobId: string;
    name: string;
    location: string;
    salary: number;
    specialization?: string;
    workType?: string;

    favoritedAt: string;

    companyId?: string;
    companyName?: string;
    companyLogo?: string;

    skills?: string[];
}

export interface IResume {
    id?: string;
    email: string;
    userId: string;
    url: string;
    status: string;
    companyId: string | {
        id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

    interviewAt?: string | null;
    interviewLocation?: string | null;
    interviewNote?: string | null;
    rejectReason?: string | null;
}

export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IReview {
    id: string;
    rating: number;
    content?: string;
    recommended: boolean;
    createdAt: string;
    company: {
        id: number; name: string
    };
    user: {
        id: string; fullName: string; avatar: string
    };
}

export interface IBlog {
    id: number;
    title: string;
    slug: string;
    description?: string;
    content: string;
    thumbnail: string;
    published: boolean;

    createdAt: string;
    updatedAt?: string;
    createdBy: string;
    updatedBy?: string;

    company?: {
        id: number;
        name: string;
        logo?: string;
        address?: string;
        country?: string;
    } | null;
}

// Forget Password
export interface IForgotPasswordRequest {
    email: string;
}

export interface IVerifyOtpRequest {
    email: string;
    otp: string;
}

export interface IResetPasswordRequest {
    resetToken: string;
    newPassword: string;
}

export interface IMessageDTO {
    message: string;
}

export interface IResetTokenDTO {
    resetToken: string;
    expiresInMinutes: number;
}

// Notification
export interface INotification {
    id: number;
    title: string;
    content: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export interface IUnreadCount {
    count: number;
}