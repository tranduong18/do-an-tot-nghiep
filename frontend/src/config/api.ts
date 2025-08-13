import { IBackendRes, ICompany, IAccount, IUser, IModelPaginate, IGetAccount, IJob, IResume, IPermission, IRole, ISkill, ISubscribers, IFavoriteItem, IReview, IBlog, IMessageDTO, IResetTokenDTO, IUnreadCount, INotification } from '@/types/backend';
import axios from 'config/axios-customize';

// View Dashboard
export const fetchDashboardSummary = (params?: { months?: number; top?: number; daysForPeak?: number }) =>
    axios.get('/api/v1/dashboard/summary', { params });

/**
 * 
Module Auth
 */
export const callRegister = (
    name: string, email: string, password: string,
    age: number, gender: string, address: string,
    roleName: 'Candidate' | 'HR', companyName?: string, companyAddress?: string
) =>
    axios.post<IBackendRes<IUser>>('/api/v1/auth/register', {
        name, email, password, age, gender, address,
        role: { name: roleName },
        ...(roleName === 'HR' && companyName && companyAddress
            ? { company: { name: companyName, address: companyAddress } }
            : {})
    });

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}

export const callChangePassword = (currentPassword: string, newPassword: string) => {
    return axios.put<IBackendRes<string>>(
        "/api/v1/auth/change-password",
        { currentPassword, newPassword }
    );
};

/**
 * Upload single file
 */
export const callUploadSingleFile = (
    file: any,
    folderType: string,
    fileType: "image" | "file" = "image" // mặc định là "image"
) => {
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    bodyFormData.append("folder", folderType);
    bodyFormData.append("type", fileType); // truyền động

    return axios<IBackendRes<{ fileName: string }>>({
        method: "post",
        url: "/api/v1/files",
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};



/**
 * 
Module Company
 */
export const callCreateCompany = (data: Partial<ICompany>) => {
    return axios.post<IBackendRes<ICompany>>("/api/v1/companies", data);
};

export const callUpdateCompany = (id: string, data: Partial<ICompany>) => {
    return axios.put<IBackendRes<ICompany>>(`/api/v1/companies`, { id, ...data });
};

export const callDeleteCompany = (id: string) => {
    return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

export const callFetchCompany = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies?${query}`);
}

export const callFetchCompanyById = (id: string) => {
    return axios.get<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}
export const callFetchJobsByCompanyId = (companyId: string) => {
    return axios.get<IBackendRes<IJob[]>>(`/api/v1/companies/${companyId}/jobs`);
};

export const callFetchJobSpecializations = async () => {
    return axios.get(`/api/v1/jobs/specializations`);
};

/**
 * 
Module Skill
 */
export const callCreateSkill = (name: string) => {
    return axios.post<IBackendRes<ISkill>>('/api/v1/skills', { name })
}

export const callUpdateSkill = (id: string, name: string) => {
    return axios.put<IBackendRes<ISkill>>(`/api/v1/skills`, { id, name })
}

export const callDeleteSkill = (id: string) => {
    return axios.delete<IBackendRes<ISkill>>(`/api/v1/skills/${id}`);
}

export const callFetchAllSkill = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISkill>>>(`/api/v1/skills?${query}`);
}



/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}

export const callUpdateUser = (user: IUser) => {
    return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user })
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

export const callGetUserById = (id: string | number) => {
    return axios.get<IBackendRes<IUser>>(`/api/v1/users/${id}`);
};

/**
 * 
Module Job
 */
export const callCreateJob = (job: IJob) => {
    return axios.post<IBackendRes<IJob>>('/api/v1/jobs', { ...job })
}

export const callUpdateJob = (job: IJob, id: string) => {
    return axios.put<IBackendRes<IJob>>(`/api/v1/jobs`, { id, ...job })
}

export const callDeleteJob = (id: string) => {
    return axios.delete<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

export const callFetchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
}

export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

export const callFetchSimilarJobs = (id: string) => {
    return axios.get<IBackendRes<IJob[]>>(`/api/v1/jobs/${id}/similar`);
};


// API search job (filter keyword, skills, location)
export const callSearchJobs = (params: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/search?${params}`);
};

// API gợi ý keyword (autocomplete)
export const callFetchSuggestions = (q: string) => {
    return axios.get(`/api/v1/jobs/suggestions?q=${encodeURIComponent(q)}`);
};
/**
 * 
Module Resume
 */
export const callCreateResume = (url: string, jobId: any, email: string, userId: string | number) => {
    return axios.post<IBackendRes<IResume>>('/api/v1/resumes', {
        email, url,
        status: "PENDING",
        user: {
            "id": userId
        },
        job: {
            "id": jobId
        }
    })
}

export const callUpdateResumeStatus = (id: any, status: string) => {
    return axios.put<IBackendRes<IResume>>(`/api/v1/resumes`, { id, status })
}

export const callDeleteResume = (id: string) => {
    return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResume = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
}

export const callFetchResumeById = (id: string) => {
    return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResumeByUser = () => {
    return axios.post<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes/by-user`);
}

export const callUpdateResumeStatusV2 = (payload: {
    id: number | string;
    status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
    interviewAt?: string;
    interviewLocation?: string;
    interviewNote?: string;
    rejectReason?: string;
}) => {
    return axios.put<IBackendRes<any>>('/api/v1/resumes/status', payload);
};

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}

export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, { id, ...permission })
}

export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}

export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}

export const callUpdateRole = (role: IRole, id: string) => {
    return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role })
}

export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

/**
 * 
Module Subscribers
 */
export const callCreateSubscriber = (subs: ISubscribers) => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers', { ...subs })
}

export const callGetSubscriberSkills = () => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers/skills')
}

export const callUpdateSubscriber = (subs: ISubscribers) => {
    return axios.put<IBackendRes<ISubscribers>>(`/api/v1/subscribers`, { ...subs })
}

export const callDeleteSubscriber = (id: string) => {
    return axios.delete<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

export const callFetchSubscriber = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubscribers>>>(`/api/v1/subscribers?${query}`);
}

export const callFetchSubscriberById = (id: string) => {
    return axios.get<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

/**
 * 
Module Favorite Job
 */

export const callFavoriteToggle = (jobId: number | string) =>
    axios.post<IBackendRes<boolean>>(`/api/v1/favorites/${jobId}/toggle`);

export const callFavoriteIsFavorited = (jobId: number | string) =>
    axios.get<IBackendRes<boolean>>(`/api/v1/favorites/is-favorited`, { params: { jobId } });

export const callFavoriteMyList = (query: string) =>
    axios.get<IBackendRes<IModelPaginate<IFavoriteItem>>>(`/api/v1/favorites?${query}`);

export const callFavoriteDelete = (jobId: number | string) =>
    axios.delete<IBackendRes<void>>(`/api/v1/favorites/${jobId}`);

/**
 * Module Company Review
 * Backend: recommended tự tính theo rating >= 4
 */

export const callFetchCompanyReviews = (
    companyId: number | string,
    page = 0,
    size = 10
) =>
    axios.get<IBackendRes<IModelPaginate<IReview>>>(
        `/api/v1/companies/${companyId}/reviews`,
        { params: { page, size, sort: "createdAt,DESC" } }
    );

export const callCreateCompanyReview = (
    companyId: number | string,
    payload: { rating: number; content?: string }
) =>
    axios.post<IBackendRes<IReview>>(
        `/api/v1/companies/${companyId}/reviews`,
        payload
    );

export const callUpdateCompanyReview = (
    companyId: number | string,
    reviewId: number | string,
    payload: { rating: number; content?: string }
) =>
    axios.put<IBackendRes<IReview>>(
        `/api/v1/companies/${companyId}/reviews/${reviewId}`,
        payload
    );

export const callDeleteCompanyReview = (
    companyId: number | string,
    reviewId: number | string
) =>
    axios.delete<IBackendRes<void>>(
        `/api/v1/companies/${companyId}/reviews/${reviewId}`
    );

/**
 * Module Blog
 */
export const callBlogList = (query: string, adminView?: boolean) =>
    axios.get<IBackendRes<IModelPaginate<IBlog>>>(`/api/v1/blogs?${query}`, {
        headers: adminView ? { "X-Admin-View": "true" } : undefined,
    });

export const callBlogGetById = (id: string) =>
    axios.get<IBackendRes<IBlog>>(`/api/v1/blogs/${id}`);

export const callBlogGetBySlug = (slug: string) =>
    axios.get<IBackendRes<IBlog>>(`/api/v1/blogs/slug/${slug}`);

export const callBlogCreate = (payload: {
    title: string;
    description?: string;
    content: string;
    thumbnail: string;
    published?: boolean;
    companyId: number;
}) =>
    axios.post<IBackendRes<IBlog>>(`/api/v1/blogs`, payload);

export const callBlogUpdate = (payload: {
    id: number;
    title: string;
    description?: string;
    content: string;
    thumbnail: string;
    published?: boolean;
    companyId: number;
}) =>
    axios.put<IBackendRes<IBlog>>(`/api/v1/blogs`, payload);

export const callBlogDelete = (id: number) =>
    axios.delete<IBackendRes<void>>(`/api/v1/blogs/${id}`);
export const callFetchRelatedBlogs = (id: string | number, size = 6) =>
    axios.get<IBackendRes<IBlog[]>>(`/api/v1/blogs/${id}/related?size=${size}`);

export const callFetchBlogsByCompanyId = (companyId: string | number, query?: string,) =>
    axios.get<IBackendRes<IModelPaginate<IBlog>>>(`/api/v1/blogs/${companyId}/blogs?${query}`);

/**
 * Module Forgot Password (OTP) 
 */
export const callPasswordOtpRequest = (email: string) => {
    return axios.post<IBackendRes<IMessageDTO>>(`/api/v1/auth/password/otp/request`, { email });
};

export const callPasswordOtpResend = (email: string) => {
    return axios.post<IBackendRes<IMessageDTO>>(`/api/v1/auth/password/otp/resend`, { email });
};

export const callPasswordOtpVerify = (email: string, otp: string) => {
    return axios.post<IBackendRes<IResetTokenDTO>>(`/api/v1/auth/password/otp/verify`, { email, otp });
};

export const callPasswordReset = (resetToken: string, newPassword: string) => {
    return axios.post<IBackendRes<IMessageDTO>>(`/api/v1/auth/password/reset`, { resetToken, newPassword });
};

// Notification
export const callUnreadCount = () => {
    return axios.get<IBackendRes<IUnreadCount>>('/api/v1/notifications/unread-count');
};

export const callNotifications = (page = 1, size = 10) => {
    return axios.get<IBackendRes<IModelPaginate<INotification>>>('/api/v1/notifications', {
        params: { page, size },
    });
};

export const callMarkRead = (id: number) => {
    return axios.post<IBackendRes<string>>(`/api/v1/notifications/${id}/read`);
};

export const callReadAll = () => {
    return axios.post<IBackendRes<string>>('/api/v1/notifications/read-all');
};

export const callDeleteNotification = (id: number) => {
    return axios.delete<IBackendRes<string>>(`/api/v1/notifications/${id}`);
};

export const callDeleteAllNotifications = () => {
    return axios.delete<IBackendRes<string>>('/api/v1/notifications');
};