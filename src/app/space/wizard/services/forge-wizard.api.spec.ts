import {async, TestBed} from '@angular/core/testing';
const Pact = require('pact-web');

import { step_1_1_response,
  step_1_2_input,
  step_1_2_response,
  step_1_3_input,
  step_1_3_response
} from './forge-wizard.api.mock';
import {HttpModule} from "@angular/http";
import {Fabric8ForgeService} from "./fabric8-forge.service";
import {LoggerFactory} from "../common/logger";
import {AuthenticationService} from "ngx-login-client";
import {ApiLocatorService} from "../../../shared/api-locator.service";

describe('Forge API tests:', () => {
  let mockLog: any;
  let fabric8ForgeService: Fabric8ForgeService;
  let mockAuthService: any;
  let mockApiLocatorService: any;
  let provider = Pact({ consumer: 'AppGeneratorWizard', provider: 'ForgeGenerator', web: true });

  afterAll(done => {
    provider.finalize()
      .then(function() { done(); }, function(err) { console.log('failed'); done.fail(err); });
  });


  beforeEach(function() {
    mockLog = jasmine.createSpyObj('Logger', ['createLoggerDelegate']);
    mockAuthService = jasmine.createSpyObj('AuthenticationService', ['getToken', 'isLoggedIn']);
    mockApiLocatorService = jasmine.createSpyObj('ApiLocatorService', ['forgeApiUrl']);
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        {
          provide: LoggerFactory, useValue: mockLog
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService
        },
        {
          provide: ApiLocatorService,
          useValue: mockApiLocatorService
        },
        Fabric8ForgeService
      ]
    });
    fabric8ForgeService = TestBed.get(Fabric8ForgeService);
  });

  it('Step_1_1 - init - import wizard: GET command successfully', done => {
    // given
    provider.addInteraction({
      state: 'step1.1.init',
      uponReceiving: 'step1.1',
      withRequest: {
        method: 'GET',
        path: '/forge/commands/fabric8-import-git'
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: step_1_1_response
      }
    }).then(() => done(), function(err) { console.log('failed'); done.fail(err); });
    const log = () => { };
    mockLog.createLoggerDelegate.and.returnValue(log);
    mockAuthService.getToken.and.returnValue('SSO_TOKEN');
    mockAuthService.isLoggedIn.and.returnValue(true);
    // when
    fabric8ForgeService.GetCommand('http://localhost:1234/forge/commands/fabric8-import-git').subscribe((data: any) => {
      // then
      const response = data.payload.data;
      expect(response.metadata.name).toEqual('io.fabric8.forge.generator.github.GithubImportPickOrganisationStep');
      expect(response.state.valid).toEqual(true);
      expect(response.state.canMoveToNextStep).toEqual(true);
      expect(response.state.canMoveToPreviousStep).toEqual(false);
      expect(response.state.steps).toContain('io.fabric8.forge.generator.github.GithubImportPickOrganisationStep');
      expect(response.state.steps).toContain('io.fabric8.forge.generator.github.GithubImportPickRepositoriesStep');
      done();
    });
  });

  it('Step_1_2 - validate - import wizard: POST command successfully', done => {
    // given
    provider.addInteraction({
      state: 'step1.2.validate',
      uponReceiving: 'step1.2',
      withRequest: {
        method: 'POST',
        path: '/forge/commands/fabric8-import-git/validate'
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: step_1_2_response
      }
    }).then(() => done(), function(err) { console.log('failed'); done.fail(err); });
    const log = () => { };
    mockLog.createLoggerDelegate.and.returnValue(log);
    mockAuthService.getToken.and.returnValue('SSO_TOKEN');
    mockAuthService.isLoggedIn.and.returnValue(true);
    // when
    fabric8ForgeService.PostCommand('http://localhost:1234/forge/commands/fabric8-import-git/validate', step_1_2_input)
      .subscribe((data: any) => {
      // then
      const response = data.payload.data;
      expect(response.state.valid).toEqual(true);
      expect(response.state.canMoveToNextStep).toEqual(true);
      expect(response.state.canMoveToPreviousStep).toEqual(false);
      expect(response.state.steps).toContain('io.fabric8.forge.generator.github.GithubImportPickOrganisationStep');
      expect(response.state.steps).toContain('io.fabric8.forge.generator.github.GithubImportPickRepositoriesStep');
      expect(response.messages.length).toEqual(0);
      done();
    });
  });

  it('Step_1_3 - next - import wizard: POST command successfully', done => {
    // given
    provider.addInteraction({
      state: 'step1.3.next',
      uponReceiving: 'step1.3',
      withRequest: {
        method: 'POST',
        path: '/forge/commands/fabric8-import-git/next'
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: step_1_3_response
      }
    }).then(() => done(), function(err) { console.log('failed'); done.fail(err); });
    const log = () => { };
    mockLog.createLoggerDelegate.and.returnValue(log);
    mockAuthService.getToken.and.returnValue('SSO_TOKEN');
    mockAuthService.isLoggedIn.and.returnValue(true);
    // when
    fabric8ForgeService.PostCommand('http://localhost:1234/forge/commands/fabric8-import-git/next', step_1_3_input)
      .subscribe((data: any) => {
        // then
        const response = data.payload.data;
        expect(response.metadata.name).toEqual('io.fabric8.forge.generator.github.GithubImportPickRepositoriesStep');
        expect(response.state.valid).toEqual(false); // bug in the forge api
        expect(response.state.canMoveToNextStep).toEqual(false);
        expect(response.state.canMoveToPreviousStep).toEqual(true);
        expect(response.state.steps).toContain('io.fabric8.forge.generator.github.GithubImportPickOrganisationStep');
        expect(response.state.steps).toContain('io.fabric8.forge.generator.github.GithubImportPickRepositoriesStep');
        expect(response.inputs[0].class).toEqual('UISelectMany');
        done();
      });
  });
});

