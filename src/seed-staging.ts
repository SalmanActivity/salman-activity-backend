import { UserMongoAccessor, User } from './user';
import { DivisionMongoAccessor, Division } from './division';
import { LocationMongoAccessor, Location } from './location';
import { RequestMongoAccessor, Request, RequestStatus } from './request';
import { generate } from 'password-hash';

const division1: Division = {
  id: '5aa9359a2b21732a73d54068',
  name: 'Bidang Rumah Amal',
  enabled: true
};

const division2: Division = {
  id: '5aa9359a2b21732a73d54069',
  name: 'Bidang LPP',
  enabled: true
};


const division3: Division = {
  id: '5aa9359a2b21732a73d5406a',
  name: 'Bidang Mahasiswa & Kaderisasi',
  enabled: true
};


const division4: Division = {
  id: '5aa9359a2b21732a73d5406b',
  name: 'Bidang Dakwah',
  enabled: true
};


const division5: Division = {
  id: '5aa9359a2b21732a73d5406c',
  name: 'Bidang Pelayanan & Pemberdayaan',
  enabled: true
};


const division6: Division = {
  id: '5aa9359a2b21732a73d5406d',
  name: 'Bidang Sumberdaya',
  enabled: true
};


const division7: Division = {
  id: '5aa9359a2b21732a73d5406e',
  name: 'Bidang Pengkajian & Penerbitan',
  enabled: true
};


const user1: User = {
  id: '5aa9359a2b21732a73d54080',
  name: 'Bidang Rumah Amal',
  username: 'rumah_amal',
  email: 'rumah_amal@test.com',
  password: generate('rumah_amal'),
  division: division1,
  enabled: true,
  admin: false
};

const user2: User = {
  id: '5aa9359a2b21732a73d54081',
  name: 'Bidang LPP',
  username: 'lpp',
  email: 'lpp@test.com',
  password: generate('lpp'),
  division: division2,
  enabled: true,
  admin: false
};

const user3: User = {
  id: '5aa9359a2b21732a73d54082',
  name: 'Bidang Mahasiswa & Kaderisasi',
  username: 'bmk',
  email: 'bmk@test.com',
  password: generate('bmk'),
  division: division3,
  enabled: true,
  admin: false
};

const user4: User = {
  id: '5aa9359a2b21732a73d54083',
  name: 'Bidang Dakwah',
  username: 'dakwah',
  email: 'dakwah@test.com',
  password: generate('dakwah'),
  division: division4,
  enabled: true,
  admin: false
};

const user5: User = {
  id: '5aa9359a2b21732a73d54084',
  name: 'Bidang Pelayanan & Pemberdayaan',
  username: 'pelayanan_pemberdayaan',
  email: 'pelayanan_pemberdayaan@test.com',
  password: generate('pelayanan_pemberdayaan'),
  division: division5,
  enabled: true,
  admin: false
};

const user6: User = {
  id: '5aa9359a2b21732a73d54085',
  name: 'Bidang Sumberdaya',
  username: 'sumberdaya',
  email: 'sumberdaya@test.com',
  password: generate('sumberdaya'),
  division: division6,
  enabled: true,
  admin: false
};

const user7: User = {
  id: '5aa9359a2b21732a73d54086',
  name: 'Bidang Pengkajian & Penerbitan',
  username: 'pengkajian_penerbitan',
  email: 'pengkajian_penerbitan@test.com',
  password: generate('pengkajian_penerbitan'),
  division: division7,
  enabled: true,
  admin: false
};

const admin1: User = {
  id: '5aa9359a2b21732a73d54090',
  name: 'admin',
  username: 'admin',
  email: 'admin@test.com',
  password: generate('admin'),
  division: null,
  enabled: true,
  admin: true
};

const location1: Location = {
  id: '5aaa89e2a892471e3cdc84d8',
  name: 'Ruang Utama Masjid',
  enabled: true
};

const location2: Location = {
  id: '5aaa89e2a892471e3cdc84d9',
  name: 'Balkon Masjid',
  enabled: true
};


const location3: Location = {
  id: '5aaa89e2a892471e3cdc84da',
  name: 'Selasar Utara Masjid',
  enabled: true
};


const location4: Location = {
  id: '5aaa89e2a892471e3cdc84db',
  name: 'Selasar Timur Masjid',
  enabled: true
};

const location5: Location = {
  id: '5aaa89e2a892471e3cdc84dc',
  name: 'Selasar Selatan Masjid',
  enabled: true
};

const location6: Location = {
  id: '5aaa89e2a892471e3cdc84dd',
  name: 'GSG',
  enabled: true
};


const location7: Location = {
  id: '5aaa89e2a892471e3cdc84de',
  name: 'GSS A',
  enabled: true
};


const location8: Location = {
  id: '5aaa89e2a892471e3cdc84df',
  name: 'GSS B',
  enabled: true
};

const location9: Location = {
  id: '5aaa89e2a892471e3cdc84e0',
  name: 'GSS C',
  enabled: true
};


const location10: Location = {
  id: '5aaa89e2a892471e3cdc84e1',
  name: 'GSS D',
  enabled: true
};


const location11: Location = {
  id: '5aaa89e2a892471e3cdc84e2',
  name: 'GSS E',
  enabled: true
};


const location12: Location = {
  id: '5aaa89e2a892471e3cdc84e3',
  name: 'Lapangan Rumput Timur',
  enabled: true
};


const location13: Location = {
  id: '5aaa89e2a892471e3cdc84e4',
  name: 'Lapangan Rumput Utara',
  enabled: true
};


const location14: Location = {
  id: '5aaa89e2a892471e3cdc84e5',
  name: 'Pavling Block',
  enabled: true
};


const location15: Location = {
  id: '5aaa89e2a892471e3cdc84e6',
  name: 'Lapangan Futsal',
  enabled: true
};


const location16: Location = {
  id: '5aaa89e2a892471e3cdc84e7',
  name: 'Ruang Rapat FO',
  enabled: true
};


const location17: Location = {
  id: '5aaa89e2a892471e3cdc84e8',
  name: 'Ruang Rapat BO',
  enabled: true
};


const location18: Location = {
  id: '5aaa89e2a892471e3cdc84e9',
  name: 'Ruang Rapat VIP',
  enabled: true
};


const location19: Location = {
  id: '5aaa89e2a892471e3cdc84ea',
  name: 'Mihrob Lt 1',
  enabled: true
};

const location20: Location = {
  id: '5aaa89e2a892471e3cdc84eb',
  name: 'Mihrob Lt 2',
  enabled: true
};


const location21: Location = {
  id: '5aaa89e2a892471e3cdc84ec',
  name: 'Kamar Tamu Putra',
  enabled: true
};

const location22: Location = {
  id: '5aaa89e2a892471e3cdc84ed',
  name: 'Kamar Tamu Putri',
  enabled: true
};

export let divisions = {
  accessor: new DivisionMongoAccessor(),
  documents: [division1, division2, division3, division4, division5, division6, division7]
};

export let users = {
  accessor: new UserMongoAccessor(),
  documents: [user1, user2, user3, user4, user5, user6, user7, admin1]
};

export let locations = {
  accessor: new LocationMongoAccessor(),
  documents: [location1, location2, location3, location4, location5, location6, location7, location8, location9, location10,
     location11, location12, location13, location14, location15, location16, location17, location18, location19, location20, location21, location22]
};
