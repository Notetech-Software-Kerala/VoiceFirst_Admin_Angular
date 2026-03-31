export const apiConfig = {

    // Auth Endpoints
    login: '/auth/login',
    refresh: '/auth/refresh-token',
    logout: '/auth/logout',

    // Program Action Endpoints
    programAction: '/program-action',
    getProgramActionLookup: '/program-action/lookup',
    programActionRestore: '/program-action/recover',

    // Business Activity Endpoints
    businessActivity: '/activity',
    getBusinessActivityLookup: '/activity/lookup',
    businessActivityRestore: '/activity/recover',

    // Post Office Endpoints
    postOffice: '/post-office',
    getPostOfficeLookup: '/post-office/lookup',
    postOfficeRestore: '/post-office/recover',

    // Zipcode
    zipcode: '/zipcode',
    zipcodeRestore: '/zipcode/recover',
    getZipcodeLookupByPostOfficeId: '/zipcodes/lookup/post-office-ids',

    //Country
    country: '/country',
    divisionOne: '/division/one',
    divisionTwo: '/division/two',
    divisionThree: '/division/three',

    getCountryLookup: '/country/lookup',
    getDivisionOneLookup: '/division/one/lookup',
    getDivisionTwoLookup: '/division/two/lookup',
    getDivisionThreeLookup: '/division/three/lookup',
    getDialCodeLookup: '/dialCode/lookup',

    //Program
    program: '/program',
    getProgramLookup: '/program/lookup',
    programRestore: '/program/recover',
    getProgramForPlan: '/program/for-plan',

    // Company
    getCompanyLookup: '/company/lookup',

    // Platform
    getPlatformLookup: '/platform/lookup',

    //Role
    role: '/role',
    getRoleLookup: '/role/lookup',
    roleRestore: '/role/recover',

    //Plan
    plan: '/plan',
    getPlanLookup: '/plan/lookup',
    planRestore: '/plan/recover',
    getProgramDetailsByPlanId: '/plan/program-details',

    //Menu
    menu: '/menu',
    menuMaster: '/menu/master',
    menuMasterRestore: '/menu/master/recover',
    menuWeb: '/menu/web',
    menuApp: '/menu/app',
    webMenuBulkUpdate: '/menu/web/bulk',
    appMenuBulkUpdate: '/menu/app/bulk',

    //Place
    place: '/place',
    getPlaceLookup: '/place/lookup',
    placeRestore: '/place/recover',


    //Employee
    employee: '/employee',
    getEmployeeLookup: '/employee/lookup',
    employeeRestore: '/employee/recover',

    //Issue Character Type
    issueCharacterType: '/issue-character-type',
    getIssueCharacterTypeLookup: '/issue-character-type/lookup',
    issueCharacterTypeRestore: '/issue-character-type/recover',

    //Issue Media Format
    issueMediaFormat: '/issue-media-format',
    getIssueMediaFormatLookup: '/issue-media-format/lookup',
    issueMediaFormatRestore: '/issue-media-format/recover',

    //Issue Media Type
    issueMediaType: '/issue-media-type',
    getIssueMediaTypeLookup: '/issue-media-type/lookup',
    issueMediaTypeRestore: '/issue-media-type/recover',

    //Issue Status
    issueStatus: '/issue-status',
    getIssueStatusLookup: '/issue-status/lookup',
    issueStatusRestore: '/issue-status/recover',

    //Issue Type
    issueType: '/issue-type',
    getIssueTypeLookup: '/issue-type/lookup',
    issueTypeRestore: '/issue-type/recover',

    //password reset
    forgotPassword: '/password/forgot',
    resetPassword: '/password/reset',
    validateResetToken: '/password/validate-reset-token',
    changePassword: '/password/change',

    //custom-field
    customField: '/user-custom-field',
    getCustomFieldLookup: '/user-custom-field/lookup',
    customFieldRestore: '/user-custom-field/recover',
    customFieldDataType: '/user-custom-field/lookup/datatype',
    customFieldValidationRule: '/user-custom-field/lookup/validation-rule',

};
