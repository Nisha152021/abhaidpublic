import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {ApiRequestService} from '../../shared/api-request-service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastsManager} from 'ng2-toastr';

@Component({
    selector: 'app-create-abha-id',
    templateUrl: './create-abha-id.component.html',
    styleUrls: ['./create-abha-id.component.css']
})
export class CreateAbhaIdComponent implements OnInit {

    qrCode: any = null;

    aadharNumber: any;
    mobileNumber: any;
    abhaAddress: any;
    mstPatient: any;

    aadharOtpModel: boolean = false;
    isQRreadonly: boolean = false;
    isChecked: boolean = true;
    aadharVerificationOTP: any;
    mobileVerificationOTP: any;
    txnId: any;
    mobileOtpModel: boolean = false;
    isAadharVerified: boolean = false;
    isMobileVerified: boolean = false;
    fetchAbhaOtpModel: boolean = false;
    showConsent: boolean = false;
    showOldPatient: boolean = false;
    abhaDoesNotExists: boolean = false;
    showAbhaExistsOfPatient: boolean = false;
    patientAbhaConsentGiven: boolean = false;
    showPatientAlreadyHasAbhaIdAndHeIsRegisteredWithUs: boolean = false;
    isAbhaAddressNull: boolean = false;
    validJson: boolean = false;
    isAbhaIdNull: boolean = false;
    activateDownload: boolean = false;
    fetchAbhaOtp: any;
    xToken: any;
    healthId: any = null;
    healthIdNumber: any = null;
    ScanAbhaDetails: any = {};
    AddForm: FormGroup;
    currentUser: any;
    numberOfLinkedAccounts: any = null;
    selectedPatient: any = null;
    patientName: any = null;
    oldPatientList: any = [];
    abhaOption: any = 1;
    mstgenderlist: Array<any> = [];


    constructor(private apiRequestService: ApiRequestService,
                private router: Router,
                private fb: FormBuilder,
                public toastr: ToastsManager,
                vRef: ViewContainerRef
    ) {
        this.currentUser = JSON.parse(sessionStorage.getItem('userdetail'));
        this.toastr.setRootViewContainerRef(vRef);
        this.AddForm = fb.group({
            'patientMrNo': [null],
            'createdBy': [this.currentUser.staffUserId.userFullname],
            'patientUserId': fb.group({
                'userHealthIdNumber': [null],
                'userHealthId': [null],
                'userAbhaPassword': [null],
                'userFirstname': [null],
                'userMiddlename': [null],
                'userLastname': [null],
                'userMobile': [this.mobileNumber],
                'userFullname': [null],
                'userGenderId': fb.group({
                    'genderId': [null]
                }),
                'userDob': [null],
                'userAge': [null],
                'userUid': [this.aadharNumber],
                'userAddress': [null],
                'userEmail': [null],
                'userPincode': [null],
                'userGender': [null],
                'userDistrictName': [null],
                'userStateName': [null],
                'patientAbhaConsentGiven': [null, Validators.required],
                'createdBy': [this.currentUser.staffUserId.userFullname],
                'userUnitId': fb.group({
                    'unitId': [sessionStorage.getItem('unitId')]
                })
            })
        });
    }

    ngOnInit() {
        this.apiRequestService.get('mst_gender/list').subscribe(resp => {
            console.log(resp);
            this.mstgenderlist = resp.content;
        });
    }


    fetchAbhaDetailsByAbhaAddress() {
        if (this.healthId != null) {
            this.checkIfPatientExistsInDatabase('address');
        } else {
            alert('Enter ABHA Address');
        }
    }

    fetchAbhaDetailsByAbhaId() {
        if (this.healthIdNumber != null) {
            this.checkIfPatientExistsInDatabase('id');
        } else {
            alert('Enter ABHA ID');
        }

    }

    createPatientAbhaId() {
        console.log(this.aadharNumber);
        console.log(this.mobileNumber);
        if (this.aadharNumber.length < 12 || this.aadharNumber.length > 12) {
            alert('Please enter valid Aadhar Number');
        } else if (this.mobileNumber.length < 10 || this.mobileNumber.length > 10) {
            alert('Please enter valid Mobile Number');
        } else {
            this.checkIfPatientExistsInDatabase();
        }

    }

    checkIfPatientExistsInDatabase(type?: any) {
        if (type == 'id') {
            this.apiRequestService.get('mst_patient/getPatientListByHealthIdNumber?qString=' + this.healthIdNumber).subscribe(resp => {
                console.log(resp);
                this.oldPatientList = resp;
                if (this.oldPatientList.length > 0) {
                    this.showOldPatient = true;
                } else {
                    console.log('im getPatientListByHealthIdNumber called');
                    this.checkIfAbhaIdExistsOfThePatientByHealthId();
                }
            });
        } else if (type == 'address') {
            this.apiRequestService.get('mst_patient/getPatientListByHealthId?qString=' + this.healthId).subscribe(resp => {
                this.oldPatientList = resp;
                console.log(resp);
                if (this.oldPatientList.length > 0) {
                    this.showOldPatient = true;
                } else {
                    console.log('im getPatientListByHealthId called');
                    this.checkIfAbhaIdExistsOfThePatientByHealthId();
                }
            });
        } else {
            this.apiRequestService.get('mst_patient/getrecordservicebynationalid?qString=' + this.aadharNumber).subscribe(resp => {
                this.oldPatientList = resp;
                console.log(resp);
                if (this.oldPatientList.length > 0) {
                    this.showOldPatient = true;
                } else {
                    console.log('im  getrecordservicebynationalid called');
                    this.checkIfAbhaIdExistsOfThePatient();
                }
            });
        }

    }

    selectPatient(patient: any) {
        console.log(patient);
        this.selectedPatient = patient;
        this.showOldPatient = false;
        this.patientName = this.selectedPatient.patientUserId.userFirstname + ' ' + this.selectedPatient.patientUserId.userLastname;
        this.mobileNumber = this.selectedPatient.patientUserId.userMobile;
        if (this.mobileNumber != null && this.mobileNumber.length == 10) {
            if (this.selectedPatient.patientUserId.userHealthIdNumber == null) {
                this.checkIfAbhaIdExistsOfThePatient();
            } else {
                this.patientAbhaConsentGiven = false;
                this.showPatientAlreadyHasAbhaIdAndHeIsRegisteredWithUs = true;
            }
        }
    }

    onclose() {
        this.showOldPatient = false;
    }

    checkIfAbhaIdExistsOfThePatient() {
        console.log(this.mobileNumber.length);
        if (this.mobileNumber != null && this.mobileNumber != undefined && this.mobileNumber.length == 10) {
            let model = {
                mobile: this.mobileNumber
            };
            this.apiRequestService.post('abdm/api/searchByMobile', model).subscribe(resp => {
                console.log(resp);
                if (resp.status == 'true') {
                    let response = JSON.parse(resp.response);
                    this.showAbhaExistsOfPatient = true;
                    if (response.hasOwnProperty('healthIdNumber')) {
                        console.log('healthIdNumber', response.healthIdNumber);
                        this.healthIdNumber = response.healthIdNumber;
                    } else if (response.hasOwnProperty('numberOfLinkedAccounts')) {
                        console.log('numberOfLinkedAccounts', response.numberOfLinkedAccounts);
                        this.numberOfLinkedAccounts = response.numberOfLinkedAccounts;
                    } else {

                    }
                    // this.router.navigate(['/abha-module/fetch-abha-details/abhaId/', response.healthIdNumber]);
                } else {
                    if (resp.statusCode == 422) {
                        this.toastr.error('Patient Does not have ABHA ID', 'ABHA Server Response');
                        this.createPatientAbhaHealthAddress();
                    } else if (resp.statusCode == 400) {
                        this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                    } else if (resp.statusCode == 401) {
                        this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                    } else if (resp.statusCode == 403) {
                        this.toastr.error('Forbidden', 'ABHA Server Response');
                    } else if (resp.statusCode == 404) {
                        this.toastr.error('Not Found', 'ABHA Server Response');
                    } else if (resp.statusCode == 500) {
                        this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                    } else {
                        this.createPatientAbhaHealthAddress();
                    }

                }
            });
        } else {
            console.log('invalid', this.mobileNumber);
        }
    }

    checkIfAbhaIdExistsOfThePatientByHealthId() {
        if (this.healthId != null) {
            let model = {
                healthId: this.healthId
            };
            this.apiRequestService.post('abdm/api/searchByHealthId', model).subscribe(resp => {
                console.log(resp);
                if (resp.status == 'true') {
                    let response = JSON.parse(resp.response);
                    this.showAbhaExistsOfPatient = true;
                    if (response.hasOwnProperty('healthIdNumber')) {
                        console.log('healthIdNumber', response.healthIdNumber);
                        this.healthIdNumber = response.healthIdNumber;
                    } else if (response.hasOwnProperty('numberOfLinkedAccounts')) {
                        console.log('numberOfLinkedAccounts', response.numberOfLinkedAccounts);
                        this.numberOfLinkedAccounts = response.numberOfLinkedAccounts;
                    } else {

                    }
                    // this.router.navigate(['/abha-module/fetch-abha-details/abhaId/', response.healthIdNumber]);
                } else {
                    if (resp.statusCode == 422) {
                        this.toastr.error('Could Not Find Details', 'ABHA Server Response');
                        this.checkNabhAbdmId();
                    } else if (resp.statusCode == 400) {
                        this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                    } else if (resp.statusCode == 401) {
                        this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                    } else if (resp.statusCode == 403) {
                        this.toastr.error('Forbidden', 'ABHA Server Response');
                    } else if (resp.statusCode == 404) {
                        this.toastr.error('Not Found', 'ABHA Server Response');
                    } else if (resp.statusCode == 500) {
                        this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                    } else {
                        this.checkNabhAbdmId();
                    }

                }
            });
        } else if (this.healthIdNumber != null) {
            let model = {
                healthId: this.healthIdNumber
            };
            this.apiRequestService.post('abdm/api/searchByHealthId', model).subscribe(resp => {
                console.log(resp);
                if (resp.status == 'true') {
                    let response = JSON.parse(resp.response);
                    this.showAbhaExistsOfPatient = true;
                    if (response.hasOwnProperty('healthIdNumber')) {
                        console.log('healthIdNumber', response.healthIdNumber);
                        this.healthIdNumber = response.healthIdNumber;
                    } else if (response.hasOwnProperty('numberOfLinkedAccounts')) {
                        console.log('numberOfLinkedAccounts', response.numberOfLinkedAccounts);
                        this.numberOfLinkedAccounts = response.numberOfLinkedAccounts;
                    } else {

                    }
                    // this.router.navigate(['/abha-module/fetch-abha-details/abhaId/', response.healthIdNumber]);
                } else {
                    if (resp.statusCode == 422) {
                        this.toastr.error('Could Not Find Details', 'ABHA Server Response');
                        this.checkNabhAbdmId();
                    } else if (resp.statusCode == 400) {
                        this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                    } else if (resp.statusCode == 401) {
                        this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                    } else if (resp.statusCode == 403) {
                        this.toastr.error('Forbidden', 'ABHA Server Response');
                    } else if (resp.statusCode == 404) {
                        this.toastr.error('Not Found', 'ABHA Server Response');
                    } else if (resp.statusCode == 500) {
                        this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                    } else {
                        this.checkNabhAbdmId();
                    }

                }
            });
        }
    }

    createPatientAbhaHealthAddress() {
        this.apiRequestService.get('abdm/api/sendAadharOtp/' + this.aadharNumber).subscribe(resp => {
            console.log(resp);
            if (resp.status == 'true') {
                this.toastr.success('OTP Sent', 'Success');
                this.txnId = resp.txnId;
                this.aadharOtpModel = true;
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('OTP Not Sent', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('OTP Not Sent', 'ABHA Server Response');
                }
            }
        });
    }

    resendAadharOTP() {
        this.apiRequestService.get('abdm/api/resendAadhaarOtp/' + this.txnId).subscribe(resp => {
            console.log(resp);
            if (resp.status == 'true') {
                this.toastr.success('OTP Resent', 'Success');
                this.txnId = resp.txnId;
                this.aadharOtpModel = true;
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                }
            }
        });
    }

    verifyAadharOtpForAbhaRegistration() {
        this.apiRequestService.get('abdm/api/verifyAadharOtp/' + this.txnId + '/' + this.aadharVerificationOTP).subscribe(resp => {
            if (resp.status == 'true') {
                console.log('SMS ' + resp);
                this.aadharVerificationOTP = null;
                this.txnId = resp.txnId;
                this.aadharOtpModel = false;
                this.isAadharVerified = true;
                this.sendOTPForMobileRegistration();
                this.toastr.success('Aadhar OTP Verification is Successful', 'Success');
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('OTP Expired or No transaction found for given OTP.', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                }
            }

        });
    }


    sendOTPForMobileRegistration() {
        this.apiRequestService.get('abdm/api/sendMobileOtp/' + this.txnId + '/' + this.mobileNumber).subscribe(resp => {
            if (resp.status == 'true') {
                console.log('SMS ' + resp);
                this.txnId = resp.txnId;
                this.mobileOtpModel = true;
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('Mobile number may not Registered', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('Failed', 'ABHA Server Response');
                }
            }

        });
    }

    verifyMobileOtpForAbhaRegistration() {
        this.apiRequestService.get('abdm/api/verifyMobileOtp/' + this.txnId + '/' + this.mobileVerificationOTP).subscribe(resp => {
            if (resp.status == 'true') {
                console.log('SMS ' + resp);
                this.txnId = resp.txnId;
                this.mobileVerificationOTP = null;
                this.isMobileVerified = true;
                this.mobileOtpModel = false;
                this.createAbhdProfile();
                this.toastr.success('Mobile OTP Verification is Successful', 'Success');
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                }
            }

        });
    }

    createAbhdProfile() {
        let patient = this.AddForm.value;
        let model = {
            'txnId': this.txnId,
            'healthId': patient.patientUserId.userHealthId
        };
        this.apiRequestService.post('abdm/api/createHealthIdWithPreVerified', model).subscribe(resp => {
            if (resp.status == 'true') {
                console.log('Profile ' + resp);
                let resp2 = JSON.parse(resp.response);
                // console.log(resp2);
                let password = resp.abhaPassword;
                this.healthIdNumber = resp2.healthIdNumber;
                this.xToken = resp2.token;
                this.activateDownload = true;
                if (this.selectedPatient == null) {
                    this.AddForm.get('patientUserId.userHealthIdNumber').setValue(resp2.healthIdNumber);
                    this.AddForm.get('patientUserId.userHealthId').setValue(resp2.healthId);
                    this.AddForm.get('patientUserId.userAbhaPassword').setValue(password);
                    this.AddForm.get('patientUserId.userFirstname').setValue(resp2.firstName);
                    this.AddForm.get('patientUserId.userMiddlename').setValue(resp2.middleName);
                    this.AddForm.get('patientUserId.userLastname').setValue(resp2.lastName);
                    this.AddForm.get('patientUserId.userMobile').setValue(resp2.mobile);
                    if (resp2.gender == 'F') {
                        this.AddForm.get('patientUserId.userGenderId.genderId').setValue(2);
                        this.AddForm.get('patientUserId.userGender').setValue('Female');
                    } else {
                        this.AddForm.get('patientUserId.userGenderId.genderId').setValue(1);
                        this.AddForm.get('patientUserId.userGender').setValue('Male');
                    }
                    this.AddForm.get('patientUserId.userAddress').setValue(resp2.districtName + ' ' + resp2.stateName);
                    this.AddForm.get('patientUserId.userEmail').setValue(resp2.email);
                    this.AddForm.get('patientUserId.userPincode').setValue(resp2.pincode);
                    this.AddForm.get('patientUserId.userDistrictName').setValue(resp2.districtName);
                    this.AddForm.get('patientUserId.userStateName').setValue(resp2.stateName);
                    this.AddForm.get('patientUserId.userUid').setValue(this.aadharNumber);
                    this.AddForm.get('patientUserId.userDob').setValue(resp2.monthOfBirth + '/' + resp2.dayOfBirth + '/' + resp2.yearOfBirth);
                    this.apiRequestService.post('mst_patient/createAbhaPatient', this.AddForm.value).subscribe(resp3 => {
                        console.log(resp3);
                        this.toastr.success('Abha Profile Created', 'Success');
                    });
                } else {
                    this.AddForm.get('patientUserId.userHealthIdNumber').setValue(resp2.healthIdNumber);
                    this.AddForm.get('patientUserId.userHealthId').setValue(resp2.healthId);
                    this.AddForm.get('patientUserId.userAbhaPassword').setValue(password);
                    this.AddForm.get('patientUserId.userFirstname').setValue(resp2.firstName);
                    this.AddForm.get('patientUserId.userMiddlename').setValue(resp2.middleName);
                    this.AddForm.get('patientUserId.userLastname').setValue(resp2.lastName);
                    this.AddForm.get('patientUserId.userMobile').setValue(resp2.mobile);
                    if (resp2.gender == 'F') {
                        this.AddForm.get('patientUserId.userGenderId.genderId').setValue(2);
                        this.AddForm.get('patientUserId.userGender').setValue('Female');
                    } else {
                        this.AddForm.get('patientUserId.userGenderId.genderId').setValue(1);
                        this.AddForm.get('patientUserId.userGender').setValue('Male');
                    }
                    this.AddForm.get('patientUserId.userAddress').setValue(resp2.districtName + ' ' + resp2.stateName);
                    this.AddForm.get('patientUserId.userEmail').setValue(resp2.email);
                    this.AddForm.get('patientUserId.userPincode').setValue(resp2.pincode);
                    this.AddForm.get('patientUserId.userDistrictName').setValue(resp2.districtName);
                    this.AddForm.get('patientUserId.userStateName').setValue(resp2.stateName);
                    this.AddForm.get('patientUserId.userUid').setValue(this.aadharNumber);
                    this.AddForm.get('patientUserId.userDob').setValue(resp2.monthOfBirth + '/' + resp2.dayOfBirth + '/' + resp2.yearOfBirth);
                    this.selectedPatient.patientUserId.userHealthIdNumber = resp2.healthIdNumber;
                    this.selectedPatient.patientUserId.userHealthId = resp2.healthId;
                    this.selectedPatient.patientUserId.userAbhaPassword = password;
                    this.selectedPatient.patientUserId.userFirstname = resp2.firstName;
                    this.selectedPatient.patientUserId.userMiddlename = resp2.middleName;
                    this.selectedPatient.patientUserId.userLastname = resp2.lastName;
                    this.selectedPatient.patientUserId.userMobile = resp2.mobile;
                    if (resp2.gender == 'F') {
                        this.selectedPatient.patientUserId.userGenderId.genderId = 2;
                    } else {
                        this.selectedPatient.patientUserId.userGenderId.genderId = 1;
                    }
                    this.selectedPatient.patientUserId.userAddress = resp2.districtName + ' ' + resp2.stateName;
                    this.selectedPatient.patientUserId.userEmail = resp2.email;
                    this.selectedPatient.patientUserId.userPincode = resp2.pincode;
                    this.selectedPatient.patientUserId.userDistrictName = resp2.districtName;
                    this.selectedPatient.patientUserId.userStateName = resp2.stateName;
                    this.selectedPatient.patientUserId.userDob = resp2.monthOfBirth + '/' + resp2.dayOfBirth + '/' + resp2.yearOfBirth;
                    this.apiRequestService.post('mst_patient/update', this.selectedPatient).subscribe(resp3 => {
                        console.log(resp3);
                        this.toastr.success('Patient Profile Updated', 'Success');
                    });
                }
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('Could not find Account for given Aadhaar/Mobile.', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                }
            }

        });
    }

    searchPatientByAbhaAdress(abhaAddress) {
        // alert(userNabhAbdmId);
        this.apiRequestService.get('abdm/api/searchByHealthId/' + abhaAddress).subscribe(resp => {
            if (resp.status == 'true') {
                console.log(resp.response);
            } else {
                console.log('Patient not found');
            }

        });
    }


    checkNabhAbdmId() {
        this.apiRequestService.get('abdm/api/authInitByHealthIdNumberAndAadharOtp/' + this.healthIdNumber).subscribe(resp => {
            if (resp.status == 'true') {
                let resp1 = JSON.parse(resp.response);
                this.txnId = resp1.txnId;
                this.showAbhaExistsOfPatient = false;
                this.fetchAbhaOtpModel = true;
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('Something Went Wrong, Please Try Again Later', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                }
            }
        });
    }


    verifyfetchAbhaOtp() {
        this.apiRequestService.get('abdm/api/authConfirmWithAadhaarOtp/' + this.txnId + '/' + this.fetchAbhaOtp).subscribe(resp => {
            if (resp.status == 'true') {
                let resp1 = JSON.parse(resp.response);
                this.xToken = resp1.token;
                this.activateDownload = true;
                let body = {
                    'token': resp1.token
                };
                this.apiRequestService.post('abdm/api/accountProfileDetailsByXtoken/', body).subscribe(response => {
                    console.log('accountProfileDetailsByXtoken ', response);
                    this.fetchAbhaOtp = null;
                    this.fetchAbhaOtpModel = false;
                    let resp2 = JSON.parse(response.response);
                    if (this.selectedPatient == null) {
                        this.AddForm.get('patientUserId.userHealthIdNumber').setValue(resp2.healthIdNumber);
                        this.AddForm.get('patientUserId.userHealthId').setValue(resp2.healthId);
                        this.AddForm.get('patientUserId.userFirstname').setValue(resp2.firstName);
                        this.AddForm.get('patientUserId.userMiddlename').setValue(resp2.middleName);
                        this.AddForm.get('patientUserId.userLastname').setValue(resp2.lastName);
                        this.AddForm.get('patientUserId.userMobile').setValue(resp2.mobile);
                        if (resp2.gender == 'F') {
                            this.AddForm.get('patientUserId.userGenderId.genderId').setValue(2);
                            this.AddForm.get('patientUserId.userGender').setValue('Female');
                        } else {
                            this.AddForm.get('patientUserId.userGenderId.genderId').setValue(1);
                            this.AddForm.get('patientUserId.userGender').setValue('Male');
                        }
                        this.AddForm.get('patientUserId.userAddress').setValue(resp2.address);
                        this.AddForm.get('patientUserId.userEmail').setValue(resp2.email);
                        this.AddForm.get('patientUserId.userPincode').setValue(resp2.pincode);
                        this.AddForm.get('patientUserId.userUid').setValue(this.aadharNumber);
                        this.AddForm.get('patientUserId.userDistrictName').setValue(resp2.districtName);
                        this.AddForm.get('patientUserId.userStateName').setValue(resp2.stateName);
                        this.AddForm.get('patientUserId.userDob').setValue(resp2.monthOfBirth + '/' + resp2.dayOfBirth + '/' + resp2.yearOfBirth);
                        this.apiRequestService.post('mst_patient/createAbhaPatient', this.AddForm.value).subscribe(resp3 => {
                            console.log(resp3);
                            this.toastr.success('Abha Profile Created', 'Success');
                        });
                    } else {
                        this.AddForm.get('patientUserId.userHealthIdNumber').setValue(resp2.healthIdNumber);
                        this.AddForm.get('patientUserId.userHealthId').setValue(resp2.healthId);
                        this.AddForm.get('patientUserId.userFirstname').setValue(resp2.firstName);
                        this.AddForm.get('patientUserId.userMiddlename').setValue(resp2.middleName);
                        this.AddForm.get('patientUserId.userLastname').setValue(resp2.lastName);
                        this.AddForm.get('patientUserId.userMobile').setValue(resp2.mobile);
                        if (resp2.gender == 'F') {
                            this.AddForm.get('patientUserId.userGenderId.genderId').setValue(2);
                            this.AddForm.get('patientUserId.userGender').setValue('Female');
                        } else {
                            this.AddForm.get('patientUserId.userGenderId.genderId').setValue(1);
                            this.AddForm.get('patientUserId.userGender').setValue('Male');
                        }
                        this.AddForm.get('patientUserId.userAddress').setValue(resp2.address);
                        this.AddForm.get('patientUserId.userEmail').setValue(resp2.email);
                        this.AddForm.get('patientUserId.userPincode').setValue(resp2.pincode);
                        this.AddForm.get('patientUserId.userUid').setValue(this.aadharNumber);
                        this.AddForm.get('patientUserId.userDistrictName').setValue(resp2.districtName);
                        this.AddForm.get('patientUserId.userStateName').setValue(resp2.stateName);
                        this.AddForm.get('patientUserId.userDob').setValue(resp2.monthOfBirth + '/' + resp2.dayOfBirth + '/' + resp2.yearOfBirth);

                        this.selectedPatient.patientUserId.userHealthIdNumber = resp2.healthIdNumber;
                        this.selectedPatient.patientUserId.userHealthId = resp2.healthId;
                        this.selectedPatient.patientUserId.userFirstname = resp2.firstName;
                        this.selectedPatient.patientUserId.userMiddlename = resp2.middleName;
                        this.selectedPatient.patientUserId.userLastname = resp2.lastName;
                        this.selectedPatient.patientUserId.userMobile = resp2.mobile;
                        if (resp2.gender == 'F') {
                            this.selectedPatient.patientUserId.userGenderId.genderId = 2;
                        } else {
                            this.selectedPatient.patientUserId.userGenderId.genderId = 1;
                        }

                        this.selectedPatient.patientUserId.userAddress = resp2.districtName + ' ' + resp2.stateName;
                        this.selectedPatient.patientUserId.userEmail = resp2.email;
                        this.selectedPatient.patientUserId.userPincode = resp2.pincode;
                        this.selectedPatient.patientUserId.userDistrictName = resp2.districtName;
                        this.selectedPatient.patientUserId.userStateName = resp2.stateName;
                        this.selectedPatient.patientUserId.userDob = resp2.monthOfBirth + '/' + resp2.dayOfBirth + '/' + resp2.yearOfBirth;
                        this.apiRequestService.post('mst_patient/update', this.selectedPatient).subscribe(resp3 => {
                            console.log(resp3);
                            this.selectedPatient = null;
                            this.toastr.success('Patient Profile Updated', 'Success');
                        });
                    }
                });
            } else {
                if (resp.statusCode == 422) {
                    this.toastr.error('Please Enter Valid OTP.', 'ABHA Server Response');
                } else if (resp.statusCode == 400) {
                    this.toastr.error('Bad request, check request before retrying', 'ABHA Server Response');
                } else if (resp.statusCode == 401) {
                    this.toastr.error('Unauthorized Access.', 'ABHA Server Response');
                } else if (resp.statusCode == 403) {
                    this.toastr.error('Forbidden', 'ABHA Server Response');
                } else if (resp.statusCode == 404) {
                    this.toastr.error('Not Found', 'ABHA Server Response');
                } else if (resp.statusCode == 500) {
                    this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Response');
                } else {
                    this.toastr.error('OTP Resent Failed', 'ABHA Server Response');
                }
            }
            // console.log(resp);

        });
    }

    getCard() {
        let body = {
            'healthIdNumber': this.healthIdNumber,
            'token': this.xToken
        };
        this.apiRequestService.postImage('abdm/api/getCard/', body).subscribe(response => {
            console.log(response);
            this.aadharNumber = null;
            this.mobileNumber = null;
            this.saveByteArray(this.healthIdNumber, response);
        });
    }

    // downloadFile(filename: String = null): void {
    //
    //     let baseUrl = webapi + 'abdm/api/getCard/';
    //     const token = sessionStorage.getItem('token');
    //
    //     let headers = new HttpHeaders();
    //     headers = headers.append('X-Token', this.xToken);
    //
    //
    //     this.http.get(baseUrl, {headers, responseType: 'blob' as 'json'}).subscribe(
    //         (response: any) => {
    //             let dataType = response.type;
    //             let binaryData = [];
    //             binaryData.push(response);
    //             let downloadLink = document.createElement('a');
    //             downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
    //             if (filename)
    //                 downloadLink.setAttribute('download', 'download_card');
    //             document.body.appendChild(downloadLink);
    //             downloadLink.click();
    //         }
    //     );
    // }

    getPngCard() {
        let body = {
            'healthIdNumber': this.healthIdNumber,
            'token': this.xToken
        };
        this.apiRequestService.postImage('abdm/api/getPngCard/', body).subscribe(response => {
            console.log(response);
            this.aadharNumber = null;
            this.mobileNumber = null;
            this.saveByteArrayPng(this.healthIdNumber, response);
        });
    }

    getSvgCard() {
        let body = {
            'healthIdNumber': this.healthIdNumber,
            'token': this.xToken
        };
        this.apiRequestService.postImage('abdm/api/getSvgCard/', body).subscribe(response => {
            console.log(response);
            this.aadharNumber = null;
            this.mobileNumber = null;
            this.saveByteArraySVG(this.healthIdNumber, response);
        });
    }

    onGetAbhaDetails() {

        this.ScanAbhaDetails = JSON.parse(this.qrCode);
        console.log('value ABHA', this.ScanAbhaDetails);

        if (this.ScanAbhaDetails.hasOwnProperty('hidn')) {
            this.AddForm.get('patientUserId.userHealthIdNumber').setValue(this.ScanAbhaDetails.hidn);
            this.createQRPatient(this.AddForm.value);
            this.isQRreadonly = false;
        }
        // if (this.ScanAbhaDetails.hasOwnProperty('mobile')) {
        //     this.AddForm.get('patientUserId.userMobile').setValue(this.ScanAbhaDetails.mobile);
        // }
        // if (this.ScanAbhaDetails.hasOwnProperty('name')) {
        //     let stringToSplit = this.ScanAbhaDetails.name;
        //     this.AddForm.get('patientUserId.userFirstname').setValue(stringToSplit.split(' ')[0]);
        //     this.AddForm.get('patientUserId.userMiddlename').setValue(stringToSplit.split(' ')[1]);
        //     this.AddForm.get('patientUserId.userLastname').setValue(stringToSplit.split(' ')[2]);
        //     this.AddForm.get('patientUserId.userFullname').setValue(stringToSplit.split(' ')[0] + ' ' + stringToSplit.split(' ')[2]);
        // }
        //
        // if (this.ScanAbhaDetails.hasOwnProperty('gender')) {
        //     if (this.ScanAbhaDetails.gender == 'F') {
        //         this.AddForm.get('patientUserId.userGenderId.genderId').setValue(2);
        //     } else {
        //         this.AddForm.get('patientUserId.userGenderId.genderId').setValue(1);
        //     }
        // }
        // if (this.ScanAbhaDetails.hasOwnProperty('address')) {
        //     this.AddForm.get('patientUserId.userAddress').setValue(this.ScanAbhaDetails.address);
        // }
        // if (this.ScanAbhaDetails.hasOwnProperty('dist name')) {
        //     this.AddForm.get('patientUserId.userDistrictName').setValue(this.ScanAbhaDetails['dist name']);
        // }
        // if (this.ScanAbhaDetails.hasOwnProperty('state name')) {
        //     this.AddForm.get('patientUserId.userStateName').setValue(this.ScanAbhaDetails['state name']);
        // }
        // if (this.ScanAbhaDetails.hasOwnProperty('dob')) {
        //     let dob = this.ScanAbhaDetails.dob.trim().split('/');
        //     let day, month, year;
        //     if (dob[0].length == 1) {
        //         day = '0' + dob[0];
        //     } else {
        //         day = dob[0];
        //     }
        //     if (dob[1].length == 1) {
        //         month = '0' + dob[1];
        //     } else {
        //         month = dob[1];
        //     }
        //     year = dob[2];
        //
        //     this.AddForm.get('patientUserId.userDob').setValue(year + '-' + month + '-' + day);
        // }
        // console.log('my new form', this.AddForm.value);
        this.qrCode = null;

    }

    createQRPatient(patient: any) {
        console.log(patient.patientUserId.userHealthIdNumber);
        this.healthIdNumber = patient.patientUserId.userHealthIdNumber;
        this.checkIfPatientExistsInDatabase('id');
    }

    saveByteArray(reportName: any, byte: any) {
        var blob = new Blob([byte], {type: 'application/pdf'});
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        var fileName = reportName;
        link.download = fileName;
        link.click();
    }

    saveByteArrayPng(reportName: any, byte: any) {
        var blob = new Blob([byte], {type: 'image/png'});
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        var fileName = reportName;
        link.download = fileName;
        link.click();
    }

    saveByteArraySVG(reportName: any, byte: any) {
        var blob = new Blob([byte], {type: 'image/svg'});
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        var fileName = reportName;
        link.download = fileName;
        link.click();
    }

    showConsentDialog(event: any) {
        let form = this.AddForm.value;
        console.log(form.patientUserId.userHealthId);
        if (this.aadharNumber == undefined || this.aadharNumber.length < 12 || this.aadharNumber.length > 12) {
            alert('Please enter valid Aadhar Number');
        } else if (this.mobileNumber == undefined || this.mobileNumber.length < 10 || this.mobileNumber.length > 10) {
            alert('Please enter valid Mobile Number');
        } else if (form.patientUserId.userHealthId == null || form.patientUserId.userHealthId == '') {
            alert('Please enter valid ABHA Address');
        } else {
            if (event.target.checked == true) {
                this.showConsent = true;
            } else {
                this.showConsent = false;
            }
        }

    }


    patientHasGivenHisConsent() {
        if (this.patientName != null) {
            this.patientAbhaConsentGiven = true;
            this.AddForm.get('patientUserId.patientAbhaConsentGiven').setValue(this.patientAbhaConsentGiven);
            this.showConsent = false;
        } else {
            alert('Enter Patient Name for Consent');
        }

    }

    abhaErrorHandler(statusCode: any) {
        switch (statusCode) {
            case 400:
                this.toastr.error('Bad request, check request before retrying', 'ABHA Server Error');
                return false;
            case 401:
                this.toastr.error('Unauthorized Access.', 'ABHA Server Error');
                return false;
            case 403:
                this.toastr.error('Forbidden', 'ABHA Server Error');
                return false;
            case 404:
                this.toastr.error('Not Found', 'ABHA Server Error');
                return false;
            case 422:
                this.toastr.error('Could Not Find Details', 'ABHA Server Error');
                return false;
            case 500:
                this.toastr.error('Downstream system(s) is down. Please try again later.', 'ABHA Server Error');
                return false;
            default:
                return true;
        }
    }

    onClick(e) {
        e.preventDefault();
        this.isChecked = true;
    }

    changeAbhaOption(event: any) {
        console.log(event.target.value);
        this.abhaOption = event.target.value;
    }


    sethealthIdNumberToNull() {
        this.healthIdNumber = null;
    }

    sethealthIdToNull() {
        this.healthId = null;
    }

    validateButtons() {
        if (this.healthId != null && this.healthId != '' && this.healthId != undefined) {
            this.isAbhaAddressNull = true;
        } else {
            this.isAbhaAddressNull = false;
        }

        if (this.healthIdNumber != null && this.healthIdNumber != '' && this.healthIdNumber != undefined) {
            this.isAbhaIdNull = true;
        } else {
            this.isAbhaIdNull = false;
        }
    }

    checkIfJsonIsValid(value: any) {
        this.qrCode = value.trim();
        if (this.qrCode != null) {
            if (this.qrCode.charAt(0) == '{' && this.qrCode.charAt(this.qrCode.length - 1) == '}') {
                this.validJson = true;
                this.isQRreadonly = true;
            } else {
                this.validJson = false;
                console.log('Invalid');
            }
        }

    }
}
