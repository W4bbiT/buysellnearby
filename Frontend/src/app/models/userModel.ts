export interface User {
    _id: string,
    fName: string,
    lName: string,
    dob: Date,
    email: string,
    password: string,
    profileImage: string,
    admin: string,
    phone: string,
    address: {
        streetAddress: string,
        city: string,
        state: string,
        zipcode: string,
    }
}