import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgZone, Directive } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { LogininfoService } from '../../../shared/services/logininfo.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { PushNotificationService } from 'src/app/shared/services/pushnotif.service';
import { HeaderService } from '../../../shared/services/header.service';
import { environment } from 'src/environments/environment';
import { Logininfo } from '../../../shared/models/logininfo';
import { HttpHeaders } from '@angular/common/http';

// --- Stub pour la directive Google Sign-In ---
@Directive({
  selector: '[google-signin-button]'
})
class GoogleSigninButtonStubDirective {}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthenticationService>;
  let socialAuthService: SocialAuthService;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let logininfoService: jasmine.SpyObj<LogininfoService>;
  let pushNotifService: jasmine.SpyObj<PushNotificationService>;
  let headerService: jasmine.SpyObj<HeaderService>;
  let httpTestingController: HttpTestingController;

  const mockLoginInfo: Logininfo = {
    bouticid: 123,
    alias: 'Test Customer',
    identifiant: 'test@example.com',
    motdepasse: 'Test123!@#',
    stripecustomerid: 'stripe_123'
  };

  beforeEach(async () => {
    // Spies pour les services
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['processLogin', 'processGoogleLogin']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const logininfoServiceSpy = jasmine.createSpyObj('LogininfoService', ['setLoginInfo', 'getLoginInfo', 'getBouticId', 'setIdentifiant']);
    const pushNotifServiceSpy = jasmine.createSpyObj('PushNotificationService', ['_getDeviceToken']);
    const headerServiceSpy = jasmine.createSpyObj('HeaderService', ['buildHttpOptions', 'setToken']);

    // Mock SocialAuthService avec authState observable
    socialAuthService = {
      authState: new BehaviorSubject(null),
      signIn: jasmine.createSpy('signIn'),
      signOut: jasmine.createSpy('signOut')
    } as any;

    routerSpy.events = of({});

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [LoginComponent, GoogleSigninButtonStubDirective],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: SocialAuthService, useValue: socialAuthService },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: LogininfoService, useValue: logininfoServiceSpy },
        { provide: PushNotificationService, useValue: pushNotifServiceSpy },
        { provide: HeaderService, useValue: headerServiceSpy },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    logininfoService = TestBed.inject(LogininfoService) as jasmine.SpyObj<LogininfoService>;
    pushNotifService = TestBed.inject(PushNotificationService) as jasmine.SpyObj<PushNotificationService>;
    headerService = TestBed.inject(HeaderService) as jasmine.SpyObj<HeaderService>;
    httpTestingController = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Mocks généraux utilisés dans la plupart des tests
    headerService.buildHttpOptions.and.returnValue(Promise.resolve({ headers: new HttpHeaders() }));
    pushNotifService._getDeviceToken.and.returnValue(Promise.resolve('device-token-123'));
    logininfoService.getBouticId.and.returnValue(123);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Exemples de tests ---
  describe('ngOnInit', () => {
    it('should initialize login form', () => {
      component.ngOnInit();
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('identifiant')).toBeDefined();
      expect(component.loginForm.get('motdepasse')).toBeDefined();
    });
  });

  describe('onSubmitLogin', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should call processLogin with valid credentials', async () => {
      authService.processLogin.and.returnValue(Promise.resolve(of(mockLoginInfo)));


      component.loginForm.patchValue({
        identifiant: 'test@example.com',
        motdepasse: 'Test123!@#'
      });

      component.onSubmitLogin(new Event('submit'));
      await fixture.whenStable();

      expect(authService.processLogin).toHaveBeenCalledWith('test@example.com', 'Test123!@#');
    });
  });

  describe('logWithGoogle', () => {
    it('should return early if token is null', () => {
      component.logWithGoogle(null);
      expect(authService.processGoogleLogin).not.toHaveBeenCalled();
    });

    it('should call processGoogleLogin with valid token', async () => {
      const googleToken = { email: 'test@gmail.com', idToken: 'token' };
      authService.processGoogleLogin.and.returnValue(Promise.resolve(of(mockLoginInfo)));

      component.logWithGoogle(googleToken);
      await fixture.whenStable();

      expect(authService.processGoogleLogin).toHaveBeenCalledWith('test@gmail.com');
    });
  });

  // Tu peux ajouter ici tous tes autres tests (submitId, navigation, etc.)
});
