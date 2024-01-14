export interface UserApi {
  fName: string;
  lName: string;
  email: string;
  password: string;
  profileImage: string;
  role: string;
  phone: string;
  address: Address;
  _id: string;
  createdOn: Date;
}

interface Address {
  city: string;
  zipcode: string;
  country: string;
  location: Location;
}

interface Location {
  type: string;
  coordinates: number[];
}