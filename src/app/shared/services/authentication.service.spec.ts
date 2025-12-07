import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogininfoService } from './logininfo.service';
import { HeaderService } from './header.service';
import { environment } from 'src/environments/environment';
import {HttpHeaders} from "@angular/common/http";

interface Logininfo {
  bouticId: number;
  customer: string;
  email: string;
  password: string;
  stripecustomerid: string;
}

interface AuthResponse {
  token: string;
  bouticid: number;
  customer: string;
  stripecustomerid: string;
  password?: string;
  status?: string;
}

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let loginInfoServiceMock: Partial<LogininfoService>;
  let headerServiceMock: Partial<HeaderService>;

  beforeEach(() => {
    loginInfoServiceMock = {
      setLoginInfo: jasmine.createSpy('setLoginInfo'),
      getLoginInfo: jasmine.createSpy('getLoginInfo').and.returnValue({
        bouticId: 1,
        customer: 'Test Customer',
        email: 'test@example.com',
        password: 'password',
        stripecustomerid: 'stripe123'
      } as Logininfo)
    };

    headerServiceMock = {
      buildHttpOptions: jasmine.createSpy('buildHttpOptions').and.returnValue(
        Promise.resolve({ headers: new HttpHeaders() })
      ),
      setToken: jasmine.createSpy('setToken')
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticationService,
        { provide: LogininfoService, useValue: loginInfoServiceMock },
        { provide: HeaderService, useValue: headerServiceMock }
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should process login successfully', async () => {
    const mockResponse: AuthResponse = {
      token: 'abc123',
      bouticid: 1,
      customer: 'Test Customer',
      stripecustomerid: 'stripe123'
    };

    const promise = await service.processLogin('test@example.com', 'password');

    const req = httpMock.expectOne(environment.apiroot + 'authorize');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const result = await promise.toPromise();

    expect(headerServiceMock.setToken).toHaveBeenCalledWith('abc123');
    expect(loginInfoServiceMock.setLoginInfo).toHaveBeenCalledWith(
      1,
      'Test Customer',
      'test@example.com',
      'password',
      'stripe123'
    );
    expect(result).toEqual(loginInfoServiceMock.getLoginInfo?.());
  });

  it('should process Google login successfully', async () => {
    const mockResponse: AuthResponse = {
      token: 'googleToken',
      bouticid: 2,
      customer: 'Google Customer',
      password: 'googlePass',
      stripecustomerid: 'stripeGoogle',
      status: 'OK'
    };

    const promise = await service.processGoogleLogin('google@example.com');

    const req = httpMock.expectOne(environment.apiroot + 'google-signin');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const result = await promise.toPromise();

    expect(headerServiceMock.setToken).toHaveBeenCalledWith('googleToken');
    expect(loginInfoServiceMock.setLoginInfo).toHaveBeenCalledWith(
      2,
      'Google Customer',
      'google@example.com',
      'googlePass',
      'stripeGoogle'
    );
    expect(result).toEqual(loginInfoServiceMock.getLoginInfo?.());
  });

  it('should handle Google login failure', async () => {
    const mockResponse: AuthResponse = {
      bouticid: 0, customer: "", stripecustomerid: "",
      token: 'failToken',
      status: 'FAIL'
    };

    const promise = await service.processGoogleLogin('fail@example.com');

    const req = httpMock.expectOne(environment.apiroot + 'google-signin');
    req.flush(mockResponse);

    const result = await promise.toPromise();

    expect(loginInfoServiceMock.setLoginInfo).toHaveBeenCalledWith(
      0,
      '',
      'fail@example.com',
      '',
      ''
    );
    expect(result).toEqual(loginInfoServiceMock.getLoginInfo?.());
  });
});
