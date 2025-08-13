package vn.jobhunter.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.Role;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.request.ReqLoginDTO;
import vn.jobhunter.domain.response.ResCreateUserDTO;
import vn.jobhunter.domain.response.ResLoginDTO;
import vn.jobhunter.domain.request.ReqChangePassDTO;
import vn.jobhunter.service.CompanyService;
import vn.jobhunter.service.RoleService;
import vn.jobhunter.service.UserService;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.annotation.ApiMessage;
import vn.jobhunter.util.error.IdInvalidException;


@RestController
@RequestMapping("/api/v1")
public class AuthController {
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;
    private final CompanyService companyService;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtil securityUtil,
            UserService userService, PasswordEncoder passwordEncoder, RoleService roleService, CompanyService companyService) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
        this.companyService = companyService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody ReqLoginDTO loginDTO) {
        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(), loginDTO.getPassword());

        // xác thực người dùng => cần viết hàm loadUserByUsername
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // set thông tin người dùng đăng nhập vào context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResLoginDTO res = new ResLoginDTO();
        User currentUserDB = this.userService.handleGetUserByUsername(loginDTO.getUsername());
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAvatar(),
                    currentUserDB.getRole(),
                    currentUserDB.getCompany());
            res.setUser(userLogin);
        }

        // create access token
        String access_token = this.securityUtil.createAccessToken(authentication.getName(), res);
        res.setAccessToken(access_token);

        // create refresh token
        String refresh_token = this.securityUtil.createRefreshToken(loginDTO.getUsername(), res);

        // update user
        this.userService.updateUserToken(refresh_token, loginDTO.getUsername());

        // set cookies
        ResponseCookie resCookies = ResponseCookie.from("refresh_token", refresh_token)
                .httpOnly(true).secure(true).path("/").maxAge(refreshTokenExpiration).build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, resCookies.toString()).body(res);
    }

    @GetMapping("/auth/account")
    @ApiMessage("Fetch account")
    public ResponseEntity<ResLoginDTO.UserGetAccount> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUserDB = this.userService.handleGetUserByUsername(email);
        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin();
        ResLoginDTO.UserGetAccount userGetAccount = new ResLoginDTO.UserGetAccount();

        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setName(currentUserDB.getName());
            userLogin.setAvatar(currentUserDB.getAvatar());
            userLogin.setRole(currentUserDB.getRole());
            userLogin.setCompany(currentUserDB.getCompany());
            userGetAccount.setUser(userLogin);
        }

        return ResponseEntity.ok().body(userGetAccount);
    }

    @GetMapping("/auth/refresh")
    @ApiMessage("Get User by refresh token")
    public ResponseEntity<ResLoginDTO> getRefreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "abc") String refresh_token) throws IdInvalidException {
        if (refresh_token.equals("abc")) {
            throw new IdInvalidException("Bạn không có refresh token ở cookie");
        }

        // check valid
        Jwt decodedToken = this.securityUtil.checkValidRefreshToken(refresh_token);
        String email = decodedToken.getSubject();

        // check user by token + email
        User currentUser = this.userService.getUserByRefreshTokenAndEmail(refresh_token, email);
        if (currentUser == null) {
            throw new IdInvalidException("Refresh Token không hợp lệ");
        }

        // issue new token/set refresh token as cookies
        ResLoginDTO res = new ResLoginDTO();
        User currentUserDB = this.userService.handleGetUserByUsername(email);
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAvatar(),
                    currentUserDB.getRole(),
                    currentUserDB.getCompany());
            res.setUser(userLogin);
        }

        // create access token
        String access_token = this.securityUtil.createAccessToken(email, res);
        res.setAccessToken(access_token);

        // create refresh token
        String new_refresh_token = this.securityUtil.createRefreshToken(email, res);

        // update user
        this.userService.updateUserToken(new_refresh_token, email);

        // set cookies
        ResponseCookie resCookies = ResponseCookie.from("refresh_token", new_refresh_token)
                .httpOnly(true).secure(true).path("/").maxAge(refreshTokenExpiration).build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, resCookies.toString()).body(res);
    }

    @PostMapping("/auth/logout")
    @ApiMessage("Logout User")
    public ResponseEntity<Void> logOut() throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        if (email.isEmpty()) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }

        // update refresh token = null
        this.userService.updateUserToken(null, email);

        // remove refresh token cookie
        ResponseCookie deleteSpringCookie = ResponseCookie.from("refresh_token", null)
                .httpOnly(true).secure(true).path("/").maxAge(0).build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString()).body(null);
    }

    @PostMapping("/auth/register")
    @ApiMessage("Register a new user")
    public ResponseEntity<ResCreateUserDTO> register(@Valid @RequestBody User pUser) throws IdInvalidException {
        if (userService.isEmailExist(pUser.getEmail())) {
            throw new IdInvalidException("Email " + pUser.getEmail() + " đã tồn tại.");
        }

        String requestedRoleName = (pUser.getRole() != null && pUser.getRole().getName() != null)
                ? pUser.getRole().getName().trim()
                : "Candidate";

        String finalRoleName = requestedRoleName.equalsIgnoreCase("HR") ? "HR" : "Candidate";
        Role finalRole = roleService.fetchByName(finalRoleName);
        if (finalRole == null) {
            throw new IdInvalidException("Role " + finalRoleName + " không tồn tại trong hệ thống.");
        }

        User user = new User();
        user.setEmail(pUser.getEmail());
        user.setName(pUser.getName());
        user.setPassword(passwordEncoder.encode(pUser.getPassword()));
        user.setRole(finalRole);

        // Nếu là HR: chỉ cần name + address của company
        if ("HR".equals(finalRoleName) && pUser.getCompany() != null) {
            String comName = pUser.getCompany().getName();
            String comAddress = pUser.getCompany().getAddress();

            if (comName != null && !comName.trim().isEmpty()) {
                Company savedCompany = companyService.createCompanyForRegistration(comName, comAddress);
                user.setCompany(savedCompany);
            }
        }

        User saved = userService.handleCreateUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.convertToResCreateUserDTO(saved));
    }

    @PutMapping("/auth/change-password")
    @ApiMessage("Change password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ReqChangePassDTO request) {
        String email = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean success = userService.changePassword(
                email,
                request.getCurrentPassword(),
                request.getNewPassword()
        );

        if (!success) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        return ResponseEntity.ok().build();
    }


}
