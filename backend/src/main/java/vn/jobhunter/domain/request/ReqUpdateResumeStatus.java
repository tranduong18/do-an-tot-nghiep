package vn.jobhunter.domain.request;

import lombok.Getter;
import lombok.Setter;
import vn.jobhunter.util.constant.ResumeStateEnum;

@Getter
@Setter
public class ReqUpdateResumeStatus {
    private long id;
    private ResumeStateEnum status;

    private String interviewAt;
    private String interviewLocation;
    private String interviewNote;

    private String rejectReason;
}
