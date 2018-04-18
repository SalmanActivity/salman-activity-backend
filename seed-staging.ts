import { UserMongoAccessor, User } from './user'
import { DivisionMongoAccessor, Division } from './division'
import { LocationMongoAccessor, Location } from './location'
import { RequestMongoAccessor, Request, RequestStatus } from './request'
import { generate } from 'password-hash'

let division1: Division = {
  id: '5aa9359a2b21732a73d54068',
  name: 'Bidang Rumah Amal',
  enabled: true
}

let division2: Division = {
  id: '5aa9359a2b21732a73d54069',
  name: 'Bidang LPP',
  enabled: true
}


let division3: Division = {
  id: '5aa9359a2b21732a73d5406a',
  name: 'Bidang Mahasiswa & Kaderisasi',
  enabled: true
}


let division4: Division = {
  id: '5aa9359a2b21732a73d5406b',
  name: 'Bidang Dakwah',
  enabled: true
}


let division5: Division = {
  id: '5aa9359a2b21732a73d5406c',
  name: 'Bidang Pelayanan & Pemberdayaan',
  enabled: true
}


let division6: Division = {
  id: '5aa9359a2b21732a73d5406d',
  name: 'Bidang Sumberdaya',
  enabled: true
}


let division7: Division = {
  id: '5aa9359a2b21732a73d5406e',
  name: 'Bidang Pengkajian & Penerbitan',
  enabled: true
}


let user1: User = {
  id: '5aa9359a2b21732a73d54080',
  name: 'Bidang Rumah Amal',
  username: 'rumah_amal',
  email: 'rumah_amal@test.com',
  password: generate('rumah_amal'),
  division: division1,
  enabled: true,
  admin: false
}

let user2: User = {
  id: '5aa9359a2b21732a73d54081',
  name: 'Bidang LPP',
  username: 'lpp',
  email: 'lpp@test.com',
  password: generate('lpp'),
  division: division2,
  enabled: true,
  admin: false
}

let user3: User = {
  id: '5aa9359a2b21732a73d54082',
  name: 'Bidang Mahasiswa & Kaderisasi',
  username: 'bmk',
  email: 'bmk@test.com',
  password: generate('bmk'),
  division: division3,
  enabled: true,
  admin: false
}

let user4: User = {
  id: '5aa9359a2b21732a73d54083',
  name: 'Bidang Dakwah',
  username: 'dakwah',
  email: 'dakwah@test.com',
  password: generate('dakwah'),
  division: division4,
  enabled: true,
  admin: false
}

let user5: User = {
  id: '5aa9359a2b21732a73d54084',
  name: 'Bidang Pelayanan & Pemberdayaan',
  username: 'pelayanan_pemberdayaan',
  email: 'pelayanan_pemberdayaan@test.com',
  password: generate('pelayanan_pemberdayaan'),
  division: division5,
  enabled: true,
  admin: false
}

let user6: User = {
  id: '5aa9359a2b21732a73d54085',
  name: 'Bidang Sumberdaya',
  username: 'sumberdaya',
  email: 'sumberdaya@test.com',
  password: generate('sumberdaya'),
  division: division6,
  enabled: true,
  admin: false
}

let user7: User = {
  id: '5aa9359a2b21732a73d54086',
  name: 'Bidang Pengkajian & Penerbitan',
  username: 'pengkajian_penerbitan',
  email: 'pengkajian_penerbitan@test.com',
  password: generate('pengkajian_penerbitan'),
  division: division7,
  enabled: true,
  admin: false
}

let admin1: User = {
  id: '5aa9359a2b21732a73d54090',
  name: 'admin',
  username: 'admin',
  email: 'admin@test.com',
  password: generate('admin'),
  division: null,
  enabled: true,
  admin: true
}

let location1: Location = {
  id: '5aaa89e2a892471e3cdc84d8',
  name: 'Ruang Utama Masjid',
  enabled: true
}

let location2: Location = {
  id: '5aaa89e2a892471e3cdc84d9',
  name: 'Balkon Masjid',
  enabled: true
}


let location3: Location = {
  id: '5aaa89e2a892471e3cdc84da',
  name: 'Selasar Utara Masjid',
  enabled: true
}


let location4: Location = {
  id: '5aaa89e2a892471e3cdc84db',
  name: 'Selasar Timur Masjid',
  enabled: true
}

let location5: Location = {
  id: '5aaa89e2a892471e3cdc84dc',
  name: 'Selasar Selatan Masjid',
  enabled: true
}

let location6: Location = {
  id: '5aaa89e2a892471e3cdc84dd',
  name: 'GSG',
  enabled: true
}


let location7: Location = {
  id: '5aaa89e2a892471e3cdc84de',
  name: 'GSS A',
  enabled: true
}


let location8: Location = {
  id: '5aaa89e2a892471e3cdc84df',
  name: 'GSS B',
  enabled: true
}

let location9: Location = {
  id: '5aaa89e2a892471e3cdc84e0',
  name: 'GSS C',
  enabled: true
}


let location10: Location = {
  id: '5aaa89e2a892471e3cdc84e1',
  name: 'GSS D',
  enabled: true
}


let location11: Location = {
  id: '5aaa89e2a892471e3cdc84e2',
  name: 'GSS E',
  enabled: true
}


let location12: Location = {
  id: '5aaa89e2a892471e3cdc84e3',
  name: 'Lapangan Rumput Timur',
  enabled: true
}


let location13: Location = {
  id: '5aaa89e2a892471e3cdc84e4',
  name: 'Lapangan Rumput Utara',
  enabled: true
}


let location14: Location = {
  id: '5aaa89e2a892471e3cdc84e5',
  name: 'Pavling Block',
  enabled: true
}


let location15: Location = {
  id: '5aaa89e2a892471e3cdc84e6',
  name: 'Lapangan Futsal',
  enabled: true
}


let location16: Location = {
  id: '5aaa89e2a892471e3cdc84e7',
  name: 'Ruang Rapat FO',
  enabled: true
}


let location17: Location = {
  id: '5aaa89e2a892471e3cdc84e8',
  name: 'Ruang Rapat BO',
  enabled: true
}


let location18: Location = {
  id: '5aaa89e2a892471e3cdc84e9',
  name: 'Ruang Rapat VIP',
  enabled: true
}


let location19: Location = {
  id: '5aaa89e2a892471e3cdc84ea',
  name: 'Mihrob Lt 1',
  enabled: true
}

let location20: Location = {
  id: '5aaa89e2a892471e3cdc84eb',
  name: 'Mihrob Lt 2',
  enabled: true
}


let location21: Location = {
  id: '5aaa89e2a892471e3cdc84ec',
  name: 'Kamar Tamu Putra',
  enabled: true
}

let location22: Location = {
  id: '5aaa89e2a892471e3cdc84ed',
  name: 'Kamar Tamu Putri',
  enabled: true
}

export let divisions = {
  accessor: new DivisionMongoAccessor(),
  documents: [division1, division2, division3, division4, division5, division6, division7]
}

export let users = {
  accessor: new UserMongoAccessor(),
  documents: [user1, user2, user3, user4, user5, user6, user7, admin1]
}

export let locations = {
  accessor: new LocationMongoAccessor(),
  documents: [location1, location2, location3, location4, location5, location6, location7, location8, location9, location10,
     location11, location12, location13, location14, location15, location16, location17, location18, location19, location20, location21, location22]
}
