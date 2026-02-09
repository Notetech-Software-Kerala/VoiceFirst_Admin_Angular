export const apiConfig = {

    // Auth Endpoints
    login: '/Auth/login',
    refresh: '/Auth/refresh',
    logout: '/Auth/logout',

    // Program Action Endpoints
    programAction: '/program-action',
    getProgramActionLookup: '/program-action/lookup',
    programActionRestore: '/program-action/recover',

    // Business Activity Endpoints
    businessActivity: '/business-activity',
    getBusinessActivityLookup: '/business-activity/lookup',
    businessActivityRestore: '/business-activity/recover',

    // Post Office Endpoints
    postOffice: '/post-office',
    getPostOfficeLookup: '/post-office/lookup',
    postOfficeRestore: '/post-office/recover',

    // Zipcode
    zipcode: '/zipcode',
    zipcodeRestore: '/zipcode/recover',

    //Country
    country: '/country',
    divisionOne: '/division-one',
    divisionTwo: '/division-two',
    divisionThree: '/division-three',

    getCountryLookup: '/country/lookup',
    getDivisionOneLookup: '/division-one/lookup',
    getDivisionTwoLookup: '/division-two/lookup',
    getDivisionThreeLookup: '/division-three/lookup',

    //Program
    program: '/program',
    getProgramLookup: '/program/lookup',
    programRestore: '/program/recover',

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
    menuWeb: '/menu/web',
    menuApp: '/menu/app',
    menuBulkUpdate: '/menu/web/bulk',
};