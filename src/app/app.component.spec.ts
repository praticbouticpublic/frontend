import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Directive } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import {Logininfo} from "./shared/models/logininfo";
import {LoginComponent} from "./main/components/login/login.component";
import {PushNotificationService} from "./shared/services/pushnotif.service";
import {AuthenticationService} from "./shared/services/authentication.service";

// --- Fake Google Signin Button Directive ---
@Directive({
  selector: '[google-signin-button]'
})
class FakeGoogleSigninButtonDirective {}

// --- Fake SocialAuthService ---
class FakeSocialAuthService {
  authState = of({
    id: '123',
    email: 'test@test.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: '',
    authToken: '',
    idToken: '',
    provider: 'GOOGLE',
    response: {}
  } as SocialUser);

  signIn(): Promise<SocialUser> {
    // on retourne une valeur non undefined pour TS
    return this.authState.toPromise() as Promise<SocialUser>;
  }

  signOut(): Promise<void> {
    return Promise.resolve();
  }
}

// --- Mocks pour les services ---
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
const pushSpy = jasmine.createSpyObj('PushNotificationService', ['requestPermission', 'subscribeToNotifications']);
const authSpy = jasmine.createSpyObj('AuthenticationService', ['processLogin', 'processGoogleLogin']);

// --- Fake LoginInfo ---
const fakeLoginInfo: Logininfo = {
  bouticid: 1,
  alias: 'John Doe',
  identifiant: 'john@doe.com',
  motdepasse: '1234',
  stripecustomerid: 'cus_123'
};

// --- Wrapper pour le LoginComponent ---
@Component({
  selector: 'test-wrapper',
  template: '<app-login></app-login>',
  standalone: true,
  imports: [LoginComponent, FakeGoogleSigninButtonDirective] // ← utilise le fake ici
})
class TestWrapperComponent {}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<TestWrapperComponent>;
  let component: LoginComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TestWrapperComponent
      ],
      providers: [
        { provide: SocialAuthService, useClass: FakeSocialAuthService },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PushNotificationService, useValue: pushSpy },
        { provide: AuthenticationService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    fixture.detectChanges();

    // Récupération du LoginComponent à partir du wrapper
    const loginDebug = fixture.debugElement.children[0];
    component = loginDebug.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.valid).toBeFalse();

    component.loginForm.controls['identifiant'].setValue('test@test.com');
    component.loginForm.controls['motdepasse'].setValue('Abc12345!');
    expect(component.loginForm.valid).toBeTrue();
  });
});
